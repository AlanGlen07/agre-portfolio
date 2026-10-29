import { useEffect, useRef, useState } from "react";
import { skills } from "../../data/skills";
import "../../style/skills.css";

const REDUCED = "(prefers-reduced-motion: reduce)";
const FILL_MS = 1500;   
const BASE_DELAY = 150; 
const STAGGER = 140;    


function useInViewOnce(ref, threshold = 0.3) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, threshold]);
  return seen;
}

function SkillCard({ skill, index }) {
  const ref = useRef(null);
  const [reduce] = useState(() => window.matchMedia(REDUCED).matches);
  const [seen, setSeen] = useState(false);
  const [started, setStarted] = useState(false);
  const [value, setValue] = useState(0);
  const [enterDelay, setEnterDelay] = useState(0);

  
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let raf = 0;
    let timer = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        const small = window.matchMedia("(max-width: 1000px)").matches;
        const stagger = small ? 0 : index * STAGGER;
        setEnterDelay(stagger);
        setSeen(true);

        timer = setTimeout(() => {
          setStarted(true);
          const t0 = performance.now();
          const tick = (now) => {
            const p = Math.min((now - t0) / FILL_MS, 1);
            setValue(skill.level * (1 - Math.pow(1 - p, 3))); // ease-out
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }, BASE_DELAY + stagger);
      },
      { threshold: 0.35 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [reduce, index, skill.level]);

  const shown = reduce ? skill.level : value;
  const isSeen = reduce || seen;
  const done = reduce || (started && value >= skill.level - 0.01);
  const filling = started && !done;

  return (
    <li
      ref={ref}
      className={`skill-card${isSeen ? " in" : ""}${filling ? " filling" : ""}${done ? " done" : ""}`}
      style={{ animationDelay: `${enterDelay}ms` }}
    >
      <div className="skill-top">
        <span className="skill-icon">{skill.icon}</span>
        <span className="skill-index">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className="skill-info">
        <h3>{skill.name}</h3>
        <p>{skill.desc}</p>
      </div>

      <div className="skill-meter">
        <div className="meter-row">
          <span>Proficiency</span>
          <b>{Math.round(shown)}%</b>
        </div>
        <div
          className="meter-track"
          role="progressbar"
          aria-label={`${skill.name} proficiency`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={skill.level}
        >
          <i className="meter-fill" style={{ width: `${shown}%` }} />
        </div>
      </div>
    </li>
  );
}

export default function Skills() {
  const headRef = useRef(null);
  const headIn = useInViewOnce(headRef, 0.3);

  return (
    <section id="skills" className="skills">
      <div className="skills-inner">
        <header ref={headRef} className={`skills-head${headIn ? " in" : ""}`}>
          <div>
            <p className="skills-label sk-rv" style={{ "--d": 0 }}>
              <b>02</b> Capabilities
            </p>
            <h2 className="skills-title sk-rv" style={{ "--d": 120 }}>
              A <span className="accent-text">focused</span> technical arsenal.
            </h2>
            <p className="skills-tagline sk-rv" style={{ "--d": 260 }}>
              Modern tools. Clean architecture. Scalable solutions.
            </p>
          </div>
          <p className="skills-sub sk-rv" style={{ "--d": 380 }}>
            Tools selected for performance, flexibility, and lasting quality.
          </p>
        </header>

        <ul className="skills-grid">
          {skills.map((s, i) => (
            <SkillCard key={s.id} skill={s} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}