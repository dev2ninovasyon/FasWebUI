import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const port = Number(process.env.LOAD_PORT || 3100);
const baseUrl = process.env.LOAD_BASE_URL || `http://127.0.0.1:${port}`;
const inspectPort = Number(process.env.INSPECT_PORT || 9230);
const durationSec = Number(process.env.LOAD_DURATION_SEC || 60);
const scenarios = [10, 25, 50];
const outputDir = 'ram-metrics';

mkdirSync(outputDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const outJson = join(outputDir, `prod-load-${timestamp}.json`);
const serverOut = join(outputDir, `prod-server-${timestamp}.out.log`);
const serverErr = join(outputDir, `prod-server-${timestamp}.err.log`);

let server = null;
let inspector = null;
let serverStdout = '';
let serverStderr = '';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHttp(url, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status > 0) return true;
    } catch {}
    await sleep(1000);
  }
  return false;
}

async function getInspectorWsUrl(portNum) {
  const res = await fetch(`http://127.0.0.1:${portNum}/json/list`);
  const data = await res.json();
  const nodeTarget = data.find((t) => t.webSocketDebuggerUrl);
  if (!nodeTarget) throw new Error('Inspector websocket URL not found');
  return nodeTarget.webSocketDebuggerUrl;
}

function createInspectorClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();

  return new Promise((resolve, reject) => {
    ws.onopen = () => {
      ws.onmessage = (event) => {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }

        if (msg.id && pending.has(msg.id)) {
          const { ok, fail } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) fail(new Error(msg.error.message || 'Inspector error'));
          else ok(msg.result);
        }
      };

      ws.onclose = () => {
        for (const [, p] of pending) p.fail(new Error('Inspector socket closed'));
        pending.clear();
      };

      const call = (method, params = {}) => {
        const reqId = ++id;
        ws.send(JSON.stringify({ id: reqId, method, params }));
        return new Promise((ok, fail) => pending.set(reqId, { ok, fail }));
      };

      resolve({
        async memoryUsage() {
          const result = await call('Runtime.evaluate', {
            expression: 'JSON.stringify(process.memoryUsage())',
            returnByValue: true,
          });
          const raw = result?.result?.value || '{}';
          return JSON.parse(raw);
        },
        close() {
          ws.close();
        },
      });
    };

    ws.onerror = (e) => reject(new Error(`Inspector websocket error: ${e?.message || 'unknown'}`));
  });
}

function runCommand(command, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: false, ...opts });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

function estimateP95(latencyObj) {
  if (!latencyObj) return null;
  if (typeof latencyObj.p95 === 'number') return latencyObj.p95;
  const p90 = latencyObj.p90;
  const p975 = latencyObj.p97_5;
  if (typeof p90 === 'number' && typeof p975 === 'number') {
    const ratio = (95 - 90) / (97.5 - 90);
    return Number((p90 + ratio * (p975 - p90)).toFixed(2));
  }
  return null;
}

async function cleanup() {
  try {
    if (inspector) inspector.close();
  } catch {}

  try {
    if (server && server.pid) {
      await runCommand('cmd.exe', ['/c', `taskkill /PID ${server.pid} /T /F`]);
    }
  } catch {}

  try {
    await runCommand('cmd.exe', ['/c', 'for /f "tokens=5" %a in (\'netstat -aon ^| findstr :3100\') do taskkill /F /PID %a >nul 2>nul']);
  } catch {}

  try {
    await runCommand('cmd.exe', ['/c', 'for /f "tokens=5" %a in (\'netstat -aon ^| findstr :9230\') do taskkill /F /PID %a >nul 2>nul']);
  } catch {}

  writeFileSync(serverOut, serverStdout, 'utf8');
  writeFileSync(serverErr, serverStderr, 'utf8');
}

(async () => {
  console.log('[1/4] Production build running...');
  const build = await runCommand('cmd.exe', ['/c', 'npm run build'], { cwd: process.cwd() });
  if (build.code !== 0) {
    console.error(build.stdout);
    console.error(build.stderr);
    process.exit(build.code || 1);
  }

  console.log('[2/4] next start running...');
  server = spawn('cmd.exe', ['/c', `node --max_old_space_size=4096 --inspect=${inspectPort} ./node_modules/next/dist/bin/next start -p ${port}`], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  server.stdout.on('data', (d) => {
    serverStdout += d.toString();
  });
  server.stderr.on('data', (d) => {
    serverStderr += d.toString();
  });

  const ready = await waitForHttp(baseUrl, 120000);
  if (!ready) {
    throw new Error('next start not ready on test port');
  }

  await sleep(1200);
  const wsUrl = await getInspectorWsUrl(inspectPort);
  inspector = await createInspectorClient(wsUrl);

  console.log('[3/4] Running load tests 10/25/50...');
  const results = [];

  for (const c of scenarios) {
    const samples = [];
    let samplerStopped = false;

    const sampler = (async () => {
      while (!samplerStopped) {
        try {
          const m = await inspector.memoryUsage();
          samples.push({
            at: new Date().toISOString(),
            rssMB: Number((m.rss / 1024 / 1024).toFixed(2)),
            heapUsedMB: Number((m.heapUsed / 1024 / 1024).toFixed(2)),
          });
        } catch {}
        await sleep(1000);
      }
    })();

    const load = await runCommand('cmd.exe', [
      '/c',
      `npx --yes autocannon -j -c ${c} -d ${durationSec} ${baseUrl}`,
    ]);

    samplerStopped = true;
    await sampler;

    let loadJson = {};
    try {
      loadJson = JSON.parse(load.stdout.trim());
    } catch {
      loadJson = { parseError: true, raw: load.stdout.slice(-1500) };
    }

    const rssValues = samples.map((s) => s.rssMB);
    const heapValues = samples.map((s) => s.heapUsedMB);

    const rssAvgMB = rssValues.length ? Number((rssValues.reduce((a, b) => a + b, 0) / rssValues.length).toFixed(2)) : null;
    const rssPeakMB = rssValues.length ? Math.max(...rssValues) : null;
    const heapUsedAvgMB = heapValues.length ? Number((heapValues.reduce((a, b) => a + b, 0) / heapValues.length).toFixed(2)) : null;
    const heapUsedPeakMB = heapValues.length ? Math.max(...heapValues) : null;

    const p95LatencyMs = estimateP95(loadJson?.latency);
    const oomByLog = /heap out of memory/i.test(serverStderr) || /allocation failed/i.test(serverStderr);

    results.push({
      concurrency: c,
      durationSec,
      requests: loadJson?.requests?.total ?? null,
      p95LatencyMs,
      rssAvgMB,
      rssPeakMB,
      heapUsedAvgMB,
      heapUsedPeakMB,
      oom: oomByLog || (server.exitCode !== null && server.exitCode !== 0),
      errors: loadJson?.errors ?? null,
      timeouts: loadJson?.timeouts ?? null,
      sampleCount: samples.length,
    });
  }

  const summary = {
    finishedAt: new Date().toISOString(),
    baseUrl,
    durationSec,
    scenarios,
    results,
    serverExitCode: server.exitCode,
  };

  writeFileSync(outJson, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`Report: ${outJson}`);
  console.log(JSON.stringify(results, null, 2));
})()
  .catch((err) => {
    console.error(err?.stack || err?.message || String(err));
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
  });
