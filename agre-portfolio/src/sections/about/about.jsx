import "../../style/about.css";

const pillars = ["Design Systems", "Creative Development", "Accessible UI"];

export default function About() {
  return (
    <section id="about" className="about">
      <div className="about-inner">
        <header className="about-head">
          <div>
            <p className="about-label">
              <b>01</b> About me
            </p>
            <h2 className="about-title">
              Clarity in code. Character in every detail.
            </h2>
          </div>
          <p className="about-sub">
            I build interfaces that do more than function—they communicate.
          </p>
        </header>

        <div className="about-body">
          <blockquote className="about-quote">
            <span className="quote-mark" aria-hidden="true">“</span>
            <p>
              I’m a frontend developer who treats every screen as a
              conversation between technology and the person using it.
            </p>
          </blockquote>

          <div className="about-text">
            <p>
              My journey started with curiosity: changing a few lines of HTML
              and watching a page transform. That immediate connection between
              code and experience became an obsession with building digital
              products that feel intuitive, purposeful, and unmistakably
              polished.
            </p>
            <p>
              I work across JavaScript, HTML, and CSS, while using Java and
              Python to bring broader technical thinking to every challenge. My
              goal is simple: turn complex requirements into interfaces that
              feel effortless.
            </p>

            <ul className="pillars">
              {pillars.map((p, i) => (
                <li key={p}>
                  <b>{String(i + 1).padStart(2, "0")}</b> / {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}