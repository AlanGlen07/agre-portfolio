import { useEffect, useRef } from "react";
import "../../style/background.css";


const PHI = (1 + Math.sqrt(5)) / 2;

const edgesFrom = (verts, len) => {
  const e = [];
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(
        verts[i][0] - verts[j][0],
        verts[i][1] - verts[j][1],
        verts[i][2] - verts[j][2]
      );
      if (Math.abs(d - len) < 0.01) e.push([i, j]);
    }
  return e;
};
const normalize = (verts) => {
  const r = Math.max(...verts.map((v) => Math.hypot(...v)));
  return verts.map((v) => v.map((c) => c / r));
};
const solid = (raw, len) => ({ v: normalize(raw), e: edgesFrom(raw, len) });

const ico = [];
[-1, 1].forEach((a) =>
  [-PHI, PHI].forEach((b) => ico.push([0, a, b], [a, b, 0], [b, 0, a]))
);
const cubeRaw = [];
[-1, 1].forEach((x) => [-1, 1].forEach((y) => [-1, 1].forEach((z) => cubeRaw.push([x, y, z]))));


const gyro = (() => {
  const N = 44, v = [], e = [];
  for (let k = 0; k < 3; k++) {
    const base = v.length;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      v.push(k === 0 ? [c, s, 0] : k === 1 ? [c, 0, s] : [0, c, s]);
      e.push([base + i, base + ((i + 1) % N)]);
    }
  }
  return { v, e };
})();

const TYPES = [
  solid(ico, 2),
  solid(cubeRaw, 2),
  solid([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], Math.SQRT2),
  gyro,
  solid([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], 2 * Math.SQRT2),
];

const rotate = ([x, y, z], ax, ay, az) => {
  let c = Math.cos(ax), s = Math.sin(ax);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ay); s = Math.sin(ay);
  [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(az); s = Math.sin(az);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
};

const seeded = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const parseColor = (str) => {
  const h = str.trim().replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(f.slice(0, 2), 16) || 30, parseInt(f.slice(2, 4), 16) || 144, parseInt(f.slice(4, 6), 16) || 255];
};

export default function Background3D() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, docH = 0, dpr = 1;
    let color = [30, 144, 255];
    let light = false;
    let sy = window.scrollY;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;

    // floating solids: each one lives at a point along the page ("anchor")
    const rnd = seeded(7);
    const COUNT = 15;
    const shapes = Array.from({ length: COUNT }, (_, i) => {
      const d = 0.45 + rnd() * 0.55;
      const left = i % 2 === 0;
      return {
        type: TYPES[i % TYPES.length],
        fx: left ? 0.04 + rnd() * 0.16 : 0.8 + rnd() * 0.16,
        fy: 0.2 + rnd() * 0.6,
        anchor: i / (COUNT - 1),
        d,
        size: 34 + d * 62,
        rx: rnd() * 6, ry: rnd() * 6, rz: rnd() * 6,
        sx: (rnd() - 0.5) * 0.5, sy: 0.15 + rnd() * 0.4, sz: (rnd() - 0.5) * 0.3,
      };
    });
    const dots = Array.from({ length: 70 }, () => ({
      x: rnd(), y: rnd(), d: 0.2 + rnd() * 0.8, ph: rnd() * 6.28, sp: 0.2 + rnd() * 0.5,
    }));

    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      color = parseColor(cs.getPropertyValue("--accent"));
      light = document.documentElement.getAttribute("data-theme") === "light";
    };
    const rgba = (a) => `rgba(${color[0]},${color[1]},${color[2]},${a})`;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      docH = Math.max(document.documentElement.scrollHeight, H * 2);
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      sy += (window.scrollY - sy) * 0.12;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const boost = light ? 1.5 : 1;
      const maxScroll = Math.max(docH - H, 1);

      /* 1. perspective grid floor that flows toward you as you scroll */
      const horizon = H * 0.66 + mouse.y * 14;
      const vp = W / 2 + mouse.x * 40;
      const fade = ctx.createLinearGradient(0, horizon, 0, H);
      fade.addColorStop(0, rgba(0));
      fade.addColorStop(1, rgba(0.3 * boost));
      ctx.strokeStyle = fade;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -16; i <= 16; i++) {
        ctx.moveTo(vp, horizon);
        ctx.lineTo(W / 2 + i * (W / 9), H);
      }
      const flow = (sy * 0.0016 + t * 0.045) % 1;
      for (let k = 0; k < 14; k++) {
        const z = ((k + flow) / 14);
        const y = horizon + (H - horizon) * Math.pow(z, 2.3);
        ctx.moveTo(0, y); ctx.lineTo(W, y);
      }
      ctx.stroke();
      const glow = ctx.createRadialGradient(vp, horizon, 0, vp, horizon, W * 0.5);
      glow.addColorStop(0, rgba(0.1 * boost));
      glow.addColorStop(1, rgba(0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizon - W * 0.25, W, W * 0.5);

      /* 2. constellation of floating points */
      const pts = dots.map((p) => {
        const x = p.x * W + Math.sin(t * p.sp + p.ph) * 14 + mouse.x * 22 * p.d;
        let y = (p.y * (H + 120) - sy * p.d * 0.5 - t * 6 * p.d) % (H + 120);
        if (y < 0) y += H + 120;
        return [x, y - 60, p.d, p.ph];
      });
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.strokeStyle = rgba((1 - dist / 120) * 0.2 * boost);
            ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke();
          }
        }
      }
      pts.forEach(([x, y, d, ph]) => {
        ctx.fillStyle = rgba((0.25 + 0.35 * d + 0.15 * Math.sin(t * 2 + ph)) * boost);
        ctx.beginPath(); ctx.arc(x, y, 0.8 + d * 1.5, 0, 6.283); ctx.fill();
      });

      /* 3. rotating wireframe solids with parallax */
      shapes.forEach((s) => {
        const anchorScroll = s.anchor * maxScroll;
        const cy = H * s.fy + (anchorScroll - sy) * s.d + mouse.y * 18 * s.d;
        if (cy < -s.size * 2 || cy > H + s.size * 2) return;
        const cx = W * s.fx + mouse.x * 30 * s.d;
        const ax = s.rx + t * s.sx + sy * 0.0016;
        const ay = s.ry + t * s.sy + sy * 0.0024;
        const az = s.rz + t * s.sz;
        const proj = s.type.v.map((v) => {
          const [x, y, z] = rotate(v, ax, ay, az);
          const k = 1 / (1 + z * 0.28);
          return [cx + x * s.size * k, cy + y * s.size * k];
        });
        ctx.strokeStyle = rgba((0.12 + s.d * 0.3) * boost);
        ctx.lineWidth = 0.8 + s.d * 0.7;
        ctx.beginPath();
        s.type.e.forEach(([a, b]) => { ctx.moveTo(proj[a][0], proj[a][1]); ctx.lineTo(proj[b][0], proj[b][1]); });
        ctx.stroke();
        if (s.type !== gyro) {
          ctx.fillStyle = rgba((0.3 + s.d * 0.4) * boost);
          proj.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 1.2 + s.d, 0, 6.283); ctx.fill(); });
        }
      });
    };

    const loop = (now) => { draw(now / 1000); raf = requestAnimationFrame(loop); };
    const renderOnce = () => draw(performance.now() / 1000);

    const onMove = (e) => {
      mouse.tx = (e.clientX / W - 0.5) * 2;
      mouse.ty = (e.clientY / H - 0.5) * 2;
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };

    readTheme(); resize();
    const themeObserver = new MutationObserver(() => { readTheme(); if (reduced) renderOnce(); });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const sizeObserver = new ResizeObserver(() => { docH = Math.max(document.documentElement.scrollHeight, H * 2); });
    sizeObserver.observe(document.body);

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    if (reduced) {
      window.addEventListener("scroll", renderOnce, { passive: true });
      renderOnce();
    } else {
      window.addEventListener("mousemove", onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", renderOnce);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="bg3d" aria-hidden="true" />;
}