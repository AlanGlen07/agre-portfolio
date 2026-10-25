import { useEffect, useRef, useState } from "react";
import { skills } from "../../data/skills";
import "../../style/skills.css";

export default function Skills() {
  const gridRef = useRef(null);
  const [visible, setVisible] = useState(false);

  // Fill the proficiency bars when the grid scrolls into view
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" className="skills">
      <div className="skills-inner">
        <header className="skills-head">
          <div>
            <p className="skills-label">
              <b>02</b> Capabilities
            </p>
            <h2 className="skills-title">A focused technical arsenal.</h2>
          </div>
          <p className="skills-sub">
            Tools selected for performance, flexibility, and lasting quality.
          </p>
        </header>

        <ul className="skills-grid" ref={gridRef}>
          {skills.map((s, i) => (
            <li key={s.id} className="skill-card">
              <div className="skill-top">
                <span className="skill-icon">{s.icon}</span>
                <span className="skill-index">{String(i + 1).padStart(2, "0")}</span>
              </div>

              <div className="skill-info">
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
              </div>

              <div className="skill-meter">
                <div className="meter-row">
                  <span>Proficiency</span>
                  <b>{s.level}%</b>
                </div>
                <div className="meter-track">
                  <i
                    className="meter-fill"
                    style={{ width: visible ? `${s.level}%` : "0%" }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}