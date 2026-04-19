/**
 * Self-hosted animated FasAI icon — 3D orbital rings + glowing sphere on canvas.
 * Canvas 2× resolution, shadowBlur bloom, front/back Z-depth split.
 */

const SIZE    = 80;   // render at ~2.67× (displayed at 30×30)
const CX      = SIZE / 2;
const CY      = SIZE / 2;
const SPHERE_R = SIZE * 0.24;
const ORBIT_R  = SIZE * 0.41;

const RINGS = [
  { tX: 0.35, tZ: 0.0,  speed:  0.014, rgb: [160, 220, 255] as const },
  { tX: 1.1,  tZ: 0.5,  speed: -0.010, rgb: [100, 180, 255] as const },
  { tX: 1.62, tZ: 1.05, speed:  0.008, rgb: [200, 230, 255] as const },
];

type Pt3 = { x: number; y: number; z: number };

function getPoints(ring: typeof RINGS[number], t: number): Pt3[] {
  const N    = 80;
  const cosX = Math.cos(ring.tX), sinX = Math.sin(ring.tX);
  const cosZ = Math.cos(ring.tZ), sinZ = Math.sin(ring.tZ);
  const pts: Pt3[] = [];
  for (let i = 0; i <= N; i++) {
    const theta = (i / N) * Math.PI * 2 + t * ring.speed;
    let x = ORBIT_R * Math.cos(theta);
    let y = ORBIT_R * Math.sin(theta);
    let z = 0;
    const y1 = y * cosX - z * sinX, z1 = y * sinX + z * cosX;
    y = y1; z = z1;
    const x2 = x * cosZ - y * sinZ, y2 = x * sinZ + y * cosZ;
    x = x2; y = y2;
    pts.push({ x, y, z });
  }
  return pts;
}

function drawRingSegments(
  ctx: CanvasRenderingContext2D,
  pts: Pt3[],
  rgb: readonly [number, number, number],
  frontOnly: boolean
): void {
  const [r, g, b] = rgb;
  const baseAlpha = frontOnly ? 1.0 : 0.28;

  let i = 0;
  while (i < pts.length - 1) {
    if ((pts[i].z >= 0) !== frontOnly) { i++; continue; }

    const seg: [number, number][] = [];
    while (i < pts.length - 1 && (pts[i].z >= 0) === frontOnly) {
      seg.push([CX + pts[i].x, CY - pts[i].y]);
      i++;
    }
    if (seg.length < 2) continue;

    const path = () => {
      ctx.beginPath();
      ctx.moveTo(seg[0][0], seg[0][1]);
      for (let j = 1; j < seg.length; j++) ctx.lineTo(seg[j][0], seg[j][1]);
    };

    ctx.save();
    ctx.lineCap = "round";

    // Layer 1 — wide diffuse glow
    path();
    ctx.shadowColor = `rgba(${r},${g},${b},1)`;
    ctx.shadowBlur  = 18;
    ctx.strokeStyle = `rgba(${r},${g},${b},${baseAlpha * 0.35})`;
    ctx.lineWidth   = 9;
    ctx.stroke();

    // Layer 2 — mid glow
    path();
    ctx.shadowBlur  = 10;
    ctx.strokeStyle = `rgba(${r},${g},${b},${baseAlpha * 0.55})`;
    ctx.lineWidth   = 4;
    ctx.stroke();

    // Layer 3 — bright core
    path();
    ctx.shadowBlur  = 5;
    ctx.strokeStyle = `rgba(220,240,255,${baseAlpha * 0.95})`;
    ctx.lineWidth   = 1.2;
    ctx.stroke();

    ctx.restore();
  }
}

function drawFrame(ctx: CanvasRenderingContext2D, t: number): void {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.globalAlpha = 1;

  // Background
  ctx.beginPath();
  ctx.arc(CX, CY, SIZE / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#030610";
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, SIZE / 2 - 0.5, 0, Math.PI * 2);
  ctx.clip();

  const allPts = RINGS.map((ring) => getPoints(ring, t));

  // ── Back ring segments ─────────────────────────────────────────────────────
  allPts.forEach((pts, i) => drawRingSegments(ctx, pts, RINGS[i].rgb, false));

  // ── Sphere ─────────────────────────────────────────────────────────────────
  // Outer glow halo
  const halo = ctx.createRadialGradient(CX, CY, SPHERE_R * 0.85, CX, CY, SPHERE_R * 1.7);
  halo.addColorStop(0, "rgba(80,160,255,0.22)");
  halo.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.arc(CX, CY, SPHERE_R * 1.7, 0, Math.PI * 2);
  ctx.fillStyle = halo;
  ctx.fill();

  // Sphere body
  const hiX = CX - SPHERE_R * 0.28;
  const hiY = CY - SPHERE_R * 0.32;
  const sg = ctx.createRadialGradient(hiX, hiY, SPHERE_R * 0.01, CX, CY, SPHERE_R);
  sg.addColorStop(0,    "rgba(255,255,255,1)");
  sg.addColorStop(0.07, "rgba(220,242,255,0.98)");
  sg.addColorStop(0.22, "rgba(130,190,255,0.95)");
  sg.addColorStop(0.50, "rgba(40,100,210,0.96)");
  sg.addColorStop(0.80, "rgba(10,40,130,0.97)");
  sg.addColorStop(1,    "rgba(2,6,22,1)");
  ctx.beginPath();
  ctx.arc(CX, CY, SPHERE_R, 0, Math.PI * 2);
  ctx.fillStyle = sg;
  ctx.fill();

  // Specular highlight
  const spec = ctx.createRadialGradient(hiX - 2, hiY - 2, 0, hiX, hiY, SPHERE_R * 0.45);
  spec.addColorStop(0, "rgba(255,255,255,0.55)");
  spec.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.arc(CX, CY, SPHERE_R, 0, Math.PI * 2);
  ctx.fillStyle = spec;
  ctx.fill();

  // ── Front ring segments ────────────────────────────────────────────────────
  allPts.forEach((pts, i) => drawRingSegments(ctx, pts, RINGS[i].rgb, true));

  ctx.restore();
}

export function createFasAiIconElement(): HTMLElement {
  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  });

  const canvas = document.createElement("canvas");
  canvas.width  = SIZE;
  canvas.height = SIZE;
  Object.assign(canvas.style, {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "block",
  });

  const ctx = canvas.getContext("2d");
  if (!ctx) { wrapper.appendChild(canvas); return wrapper; }

  let t = 0;
  let frameId: number;
  function animate() {
    drawFrame(ctx!, t++);
    frameId = requestAnimationFrame(animate);
  }
  animate();

  const mo = new MutationObserver(() => {
    if (!document.body.contains(wrapper)) {
      cancelAnimationFrame(frameId);
      mo.disconnect();
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  wrapper.appendChild(canvas);
  return wrapper;
}
