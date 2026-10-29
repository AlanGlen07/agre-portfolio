import { useEffect, useRef, useState } from "react";
import robot from "../assets/images/robot.png";
import "../style/FloatingAvatar.css";

const FOLLOW_QUERY =
  "(hover: hover) and (pointer: fine) and (min-width: 761px) and (prefers-reduced-motion: no-preference)";

const OFFSET = 28;
const MARGIN = 8;
const HOME_GAP = 24;
const STIFFNESS = 140;
const DAMPING = 13;

const TRAIL_LIFE = 650;
const MAX_PARTICLES = 24;
const PALETTE = [[0, 229, 255], [30, 144, 255], [139, 92, 246]];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const trailColor = (t) => {
  const s = clamp(t, 0, 1) * 2;
  const i = Math.min(1, Math.floor(s));
  const f = s - i;
  const a = PALETTE[i], b = PALETTE[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
};

function useFollowMode() {
  const [follow, setFollow] = useState(() => window.matchMedia(FOLLOW_QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(FOLLOW_QUERY);
    const update = () => setFollow(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return follow;
}

export default function FloatingAvatar() {
  const follow = useFollowMode();
  const rootRef = useRef(null);
  const tiltRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!follow) return;
    const root = rootRef.current;
    const tilt = tiltRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let vw = 0, vh = 0;
    const trail = [];
    const particles = [];

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();

    const drawFx = (now, dt, speed) => {
      const cx = pos.x + w / 2;
      const cy = pos.y + w * 0.6;
      const lastPt = trail[trail.length - 1];
      if (!lastPt || Math.hypot(cx - lastPt.x, cy - lastPt.y) > 3) {
        trail.push({ x: cx, y: cy, t: now, s: clamp(speed / 900, 0.25, 1) });
      }
      while (trail.length && now - trail[0].t > TRAIL_LIFE) trail.shift();

      if (speed > 350 && particles.length < MAX_PARTICLES && Math.random() < 0.5) {
        particles.push({
          x: cx + (Math.random() - 0.5) * 16,
          y: cy + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 30 - vel.x * 0.04,
          vy: (Math.random() - 0.5) * 30 - vel.y * 0.04,
          life: 1,
          size: 1 + Math.random() * 1.6,
          hue: Math.random(),
        });
      }

      const light = document.documentElement.dataset.theme === "light";
      const boost = light ? 1.5 : 1;
      ctx.clearRect(0, 0, vw, vh);
      ctx.globalCompositeOperation = light ? "source-over" : "lighter";
      ctx.lineCap = "round";

      for (let i = 1; i < trail.length; i++) {
        const p0 = trail[i - 1];
        const p1 = trail[i];
        const age = (now - p1.t) / TRAIL_LIFE;
        const life = 1 - age;
        const [r, g, b] = trailColor(age);
        const width = 3 + 13 * life * p1.s;
        const col = `${r | 0},${g | 0},${b | 0}`;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = `rgba(${col},${0.16 * life * boost})`;
        ctx.lineWidth = width * 2.2;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${col},${0.55 * life * boost})`;
        ctx.lineWidth = width * 0.55;
        ctx.stroke();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt * 1.6;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const [r, g, b] = trailColor(p.hue * 0.7);
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${0.8 * p.life * boost})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life + 0.4, 0, 6.283);
        ctx.fill();
      }
    };

    let w = root.offsetWidth;
    let h = root.offsetHeight;
    const home = () => ({ x: window.innerWidth - w - HOME_GAP, y: window.innerHeight - h - HOME_GAP });

    const pos = home();
    const vel = { x: 0, y: 0 };
    const target = { ...pos };
    let lean = 0;
    let last = 0;
    let raf = 0;

    const apply = (squash = 0) => {
      root.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      tilt.style.transform = `rotate(${lean}deg) scale(${1 + squash})`;
    };

    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30); // clamp so tab switches don't explode
      last = now;

      vel.x += (STIFFNESS * (target.x - pos.x) - DAMPING * vel.x) * dt;
      vel.y += (STIFFNESS * (target.y - pos.y) - DAMPING * vel.y) * dt;
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;

      const wantLean = clamp(vel.x * 0.03, -16, 16);
      lean += (wantLean - lean) * Math.min(1, dt * 10);
      const speed = Math.hypot(vel.x, vel.y);
      apply(Math.min(speed / 3000, 0.1));

      drawFx(now, dt, speed);

      const settled =
        Math.abs(target.x - pos.x) < 0.3 &&
        Math.abs(target.y - pos.y) < 0.3 &&
        speed < 2 &&
        Math.abs(lean) < 0.1;

      if (settled) {
        pos.x = target.x;
        pos.y = target.y;
        vel.x = vel.y = lean = 0;
        apply();
      }

      if (settled && trail.length === 0 && particles.length === 0) raf = 0;
      else raf = requestAnimationFrame(step);
    };

    const wake = () => {
      if (raf || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    const moveTarget = (x, y) => {
      target.x = clamp(x, MARGIN, window.innerWidth - w - MARGIN);
      target.y = clamp(y, MARGIN, window.innerHeight - h - MARGIN);
      wake();
    };

    const onMove = (e) => moveTarget(e.clientX + OFFSET, e.clientY + OFFSET);
    const onLeave = () => {
      const p = home();
      moveTarget(p.x, p.y);
    };
    const onResize = () => {
      sizeCanvas();
      w = root.offsetWidth;
      h = root.offsetHeight;
      moveTarget(target.x, target.y);
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else wake();
    };

    apply();
    root.dataset.ready = "1";

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      ctx.clearRect(0, 0, vw, vh);
      root.style.transform = "";
      tilt.style.transform = "";
      delete root.dataset.ready;
    };
  }, [follow]);

  return (
    <>
      {follow && <canvas ref={canvasRef} className="robot-trail" aria-hidden="true" />}

      <div
        ref={rootRef}
        className={`robot-avatar ${follow ? "is-follow" : "is-static"}`}
        aria-hidden="true"
      >
        <div className="robot-stage">
          <span className="robot-aura" />
          <div className="robot-bob">
            <div className="robot-tilt" ref={tiltRef}>
              <img src={robot} alt="" draggable={false} className="robot-image" />
            </div>
          </div>
        </div>

        <div className="robot-label">
          <span className="robot-dot" />
          ALAN.pogi
        </div>
      </div>
    </>
  );
}