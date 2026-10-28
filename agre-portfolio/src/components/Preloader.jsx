import { useEffect, useState } from "react";
import robot from "../assets/images/robot.png";
import "../style/preloader.css";

const LOADER_DURATION = 3900;
const COUNTER_START = 1800;
const RAMP_TO_90_DURATION = 450;
const HOLD_AT_90_END = COUNTER_START + RAMP_TO_90_DURATION + 600;
const RAMP_TO_100_DURATION = 350;
const LAUNCH_START = 3200;

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let frameId;
    let startTime;

    const update = (now) => {
      if (startTime === undefined) startTime = now;
      const elapsed = now - startTime;
      let count = 0;
      if (elapsed >= COUNTER_START + RAMP_TO_90_DURATION) {
        count =
          elapsed < HOLD_AT_90_END
            ? 90
            : Math.min(
                100,
                90 +
                  Math.round(
                    ((elapsed - HOLD_AT_90_END) / RAMP_TO_100_DURATION) * 10
                  )
              );
      } else if (elapsed > COUNTER_START) {
        count = Math.round(((elapsed - COUNTER_START) / RAMP_TO_90_DURATION) * 90);
      }

      setProgress(count);
      if (elapsed >= LAUNCH_START) setLaunching(true);

      if (elapsed >= LOADER_DURATION) {
        setVisible(false);
        return;
      }

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`preloader${launching ? " preloader--launch" : ""}`}
      role="status"
      aria-label="Loading portfolio"
      aria-live="polite"
    >
      <div className="preloader-grid" aria-hidden="true" />
      <div className="preloader-scanlines" aria-hidden="true" />

      <div className="preloader-scene" aria-hidden="true">
        <div className="preloader-orbit preloader-orbit--one" />
        <div className="preloader-orbit preloader-orbit--two" />
        <div className="preloader-thruster" />
        <div className="preloader-particles">
          {Array.from({ length: 18 }, (_, index) => (
            <i key={index} style={{ "--particle-index": index }} />
          ))}
        </div>
        <img className="preloader-character" src={robot} alt="" />
      </div>

      <div className="preloader-status">
        <p className="preloader-kicker">SYSTEM INITIALIZATION</p>
        <p className="preloader-counter">
          {progress === 100 ? "100% READY" : `${progress}%`}
        </p>
        <div
          className="preloader-progress"
          role="progressbar"
          aria-label="Loading portfolio"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="preloader-caption">Preparing your experience</p>
      </div>
    </div>
  );
}
