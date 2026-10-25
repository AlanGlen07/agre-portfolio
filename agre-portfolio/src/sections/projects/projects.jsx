import { useState } from "react";
import { GitBranch, ExternalLink } from "lucide-react";
import { projects } from "../../data/projects";
import "../../style/project.css";

// Layout numbers for the SVG graph (viewBox 620 x 450)
const W = 620;
const H = 450;
const START = { x: 190, y: H / 2 };
const END_X = 440;

function techY(i, n) {
  if (n === 1) return H / 2;
  const top = 70;
  const bottom = H - 70;
  return top + (i * (bottom - top)) / (n - 1);
}

export default function Projects() {
  const [activeId, setActiveId] = useState(projects[0].id);
  const [hover, setHover] = useState(null);

  const index = projects.findIndex((p) => p.id === activeId);
  const project = projects[index];
  const n = project.tech.length;

  return (
    <section id="projects" className="projects">
      <div className="projects-inner">
        <header className="projects-head">
          <div>
            <p className="projects-label">
              <b>03</b> Selected projects
            </p>
            <h2 className="projects-title">Built to solve. Designed to last.</h2>
          </div>
          <p className="projects-sub">
            A selection of product experiences combining engineering with
            visual precision.
          </p>
        </header>

        <div className="project-tabs" role="tablist" aria-label="Projects">
          {projects.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={p.id === activeId}
              className={p.id === activeId ? "tab active" : "tab"}
              onClick={() => {
                setActiveId(p.id);
                setHover(null);
              }}
            >
              <b>{String(i + 1).padStart(2, "0")}</b> {p.short}
            </button>
          ))}
        </div>

        <article className="project-card">
          <div className="project-media">
            <span className="project-count">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(projects.length).padStart(2, "0")}
            </span>

            {/* key restarts the line animations whenever the project changes */}
            <svg
              key={project.id}
              className="graph"
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={`${project.title} is built with ${project.tech.join(", ")}`}
            >
              {project.tech.map((t, i) => {
                const y = techY(i, n);
                const mid = (START.x + END_X) / 2;
                const d = `M ${START.x} ${START.y} C ${mid} ${START.y}, ${mid} ${y}, ${END_X} ${y}`;
                const dim = hover !== null && hover !== i;
                return (
                  <g
                    key={t}
                    className={dim ? "link dim" : "link"}
                    style={{ "--i": i }}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <path className="wire" d={d} pathLength="1" />
                    <path className="pulse" d={d} pathLength="1" />
                    <circle className="end-dot" cx={END_X} cy={y} r="3.5" />
                    <g className="tech-node">
                      <rect x={END_X + 10} y={y - 18} width="130" height="36" />
                      <text x={END_X + 75} y={y + 3.5} textAnchor="middle">
                        {t}
                      </text>
                    </g>
                  </g>
                );
              })}

              <g className="root-node">
                <circle cx={START.x} cy={START.y} r="4.5" className="root-dot" />
                <rect x="24" y={START.y - 30} width="152" height="60" />
                <text x="100" y={START.y - 5} textAnchor="middle" className="root-kicker">
                  PROJECT
                </text>
                <text x="100" y={START.y + 14} textAnchor="middle" className="root-name">
                  {project.short}
                </text>
              </g>
            </svg>
          </div>

          <div className="project-info">
            <p className="project-category">{project.category}</p>
            <h3 className="project-name">{project.title}</h3>
            <p className="project-desc">{project.desc}</p>

            <ul className="project-tags">
              {project.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <div className="project-links">
              <a href={project.source} target="_blank" rel="noreferrer">
                <GitBranch size={14} /> Source code
              </a>
              <a href={project.live} target="_blank" rel="noreferrer">
                <ExternalLink size={14} /> Live preview
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}