import { ArrowRight } from "lucide-react";
import photo from "../../assets/images/myphoto.png";
import cartoon from "../../assets/images/pixilated.png";
import TypedText from "../../components/TypedText";
import { leadVariants } from "../../data/hero";
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
          <TypedText variants={leadVariants} />

          <div className="cta">
            <a href="#projects" className="neon-btn">
              Explore my work <ArrowRight size={16} />
            </a>
            <a href="#contact" className="neon-btn">
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
            
          </div>

          <div className="frame">
            <img
              className="shot photo"
              src={photo}
              alt="Portrait of Alan Glen R. Escobar Jr."
            />
            <img
              className="shot cartoon"
              src={cartoon}
              alt="Cartoon avatar of Alan waving hello"
            />
            <span className="scan" aria-hidden="true" />
            <span className="corner tr" aria-hidden="true" />
            <span className="corner bl" aria-hidden="true" />
          </div>
         

          <div className="portrait-meta bottom">
           
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