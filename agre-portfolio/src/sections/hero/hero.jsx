import { ArrowRight } from "lucide-react";
import photo from "../../assets/images/myphoto.png";
import "../../style/hero.css";
const stats = [
  { value: "05", label: "Core technologies" },
  { value: "03+", label: "Years of building" },
  { value: "100%", label: "Driven by detail" },
];

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="status-chip">
            <i className="dot" /> System online <b>– Baguio, PH</b>
          </span>

          <p className="hello">Hello, I’m</p>
          <h1 className="name">
            Alan Glen R.
            <br />
            Escobar Jr.
          </h1>
          <p className="role">
            <b>Frontend Developer</b> / UI Engineer
          </p>
          <p className="lead">
            I engineer fast, refined digital interfaces where thoughtful systems
            meet bold visual craft. Built for people, polished for the future.
          </p>

          <div className="cta">
            <a href="#projects" className="btn btn-primary">
              Explore my work <ArrowRight size={16} />
            </a>
            <a href="#contact" className="btn btn-ghost">
              Start a conversation
            </a>
          </div>

          <ul className="stats">
            {stats.map((s) => (
              <li key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <figure className="portrait">
          <div className="portrait-meta top">
            <span>ID / AGRE-07</span>
            <b>26.02</b>
          </div>

          <div className="frame">
            <img src={photo} alt="Portrait of Alan Glen R. Escobar Jr." />
            <span className="scan" aria-hidden="true" />
            <span className="corner tr" aria-hidden="true" />
            <span className="corner bl" aria-hidden="true" />
          </div>
          <span className="tag">&lt;craft /&gt;</span>

          <div className="portrait-meta bottom">
            <span>Profile // Active</span>
            <b>01</b>
          </div>
        </figure>
      </div>

      <a href="#about" className="scroll-hint">
        Scroll to discover
        <i />
      </a>
    </section>
  );
}