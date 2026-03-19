const { existsSync } = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const buildIdPath = path.join(repoRoot, '.next', 'BUILD_ID');
const useDevServer = process.env.PW_USE_DEV_SERVER === '1';

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: true,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });

    child.on('error', reject);
  });
}

async function main() {
  if (useDevServer) {
    await run('npm', ['run', 'dev:turbo']);
    return;
  }

  if (!existsSync(buildIdPath) || process.env.PW_FORCE_BUILD === '1') {
    await run('npm', ['run', 'build']);
  }

  await run('npx', ['next', 'start', '-p', '3000']);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
