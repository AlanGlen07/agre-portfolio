import { useEffect, useRef, useState } from "react";
import robot from "../assets/images/robot.png";
import "../style/FloatingAvatar.css";

/*
  Cursor-following robot.
  - Desktop (mouse + motion allowed): spring physics driven by requestAnimationFrame.
  - Touch / small screens / reduced-motion: no JS loop, the robot rests bottom-right.
  The robot never captures pointer events, so links and buttons underneath stay clickable.
*/

const FOLLOW_QUERY =
  "(hover: hover) and (pointer: fine) and (min-width: 761px) and (prefers-reduced-motion: no-preference)";

const OFFSET = 28;     // gap between the cursor and the robot
const MARGIN = 8;      // keep the robot inside the viewport
const HOME_GAP = 24;   // resting spot (bottom-right) when the cursor leaves the page
const STIFFNESS = 140; // higher = snappier
const DAMPING = 13;    // below 2*sqrt(STIFFNESS) (~23.7) => a little spring overshoot

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

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

  useEffect(() => {
    if (!follow) return;
    const root = rootRef.current;
    const tilt = tiltRef.current;

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

      // damped spring toward the target, per axis
      vel.x += (STIFFNESS * (target.x - pos.x) - DAMPING * vel.x) * dt;
      vel.y += (STIFFNESS * (target.y - pos.y) - DAMPING * vel.y) * dt;
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;

      // lean into the direction of travel, ease back when slowing down
      const wantLean = clamp(vel.x * 0.03, -16, 16);
      lean += (wantLean - lean) * Math.min(1, dt * 10);
      const speed = Math.hypot(vel.x, vel.y);
      apply(Math.min(speed / 3000, 0.1));

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
        raf = 0; // loop sleeps until the next mouse move
      } else {
        raf = requestAnimationFrame(step);
      }
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
      root.style.transform = "";
      tilt.style.transform = "";
      delete root.dataset.ready;
    };
  }, [follow]);

  return (
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
  );
}