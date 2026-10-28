import { useEffect, useRef, useState } from "react";
import "../../style/about.css";

const REDUCED = "(prefers-reduced-motion: reduce)";

const pillars = [
  { name: "Design Systems", note: "Consistent, reusable UI that scales." },
  { name: "Creative Development", note: "Motion and detail with a purpose." },
  { name: "Accessible UI", note: "Fast, readable and usable by everyone." },
];

// "a {b} c" -> [{ text, hl }]  ({braces} = gradient highlight)
const parse = (str) =>
  str
    .split(/(\{[^}]+\})/)
    .filter(Boolean)
    .map((p) => (p.startsWith("{") ? { text: p.slice(1, -1), hl: true } : { text: p, hl: false }));

const slice = (segs, n) => {
  const out = [];
  let left = n;
  for (const s of segs) {
    if (left <= 0) break;
    out.push({ ...s, text: s.text.slice(0, left) });
    left -= s.text.length;
  }
  return out;
};

// turns true the first time the element scrolls into view, then stays true
function useInViewOnce(ref, threshold = 0.2) {
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

// types the text once when `start` becomes true
function TypeOnce({ text, start, delay = 450, speed = 28 }) {
  const segs = parse(text);
  const plain = segs.map((s) => s.text).join("");
  const [reduce] = useState(() => window.matchMedia(REDUCED).matches);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce || !start || n >= plain.length) return;
    const prev = plain[n - 1];
    const pause = prev === "." || prev === "," ? 140 : 0;
    const t = setTimeout(
      () => setN((c) => c + 1),
      n === 0 ? delay : speed + Math.random() * 16 + pause
    );
    return () => clearTimeout(t);
  }, [reduce, start, n, plain, delay, speed]);

  const done = n >= plain.length;
  const shown = reduce ? segs : slice(segs, n);

  return (
    <>
      <span className="sr-only">{plain}</span>
      <span className="type-stage" aria-hidden="true">
        {/* invisible copy reserves the final height so nothing jumps */}
        <span className="type-ghost">{plain}</span>
        <span className="type-live">
          {shown.map((s, i) => (
            <span key={i} className={s.hl ? "grad-text" : undefined}>{s.text}</span>
          ))}
          {!reduce && start && <span className={`type-caret${done ? " done" : ""}`} />}
        </span>
      </span>
    </>
  );
}

export default function About() {
  const ref = useRef(null);
  const seen = useInViewOnce(ref, 0.2);

  return (
    <section id="about" ref={ref} className={`about${seen ? " is-in" : ""}`}>
      <div className="about-inner">
        <header className="about-head">
          <div>
            <p className="about-label rv" style={{ "--d": 0 }}>
              <b>01</b> About me
            </p>
            <h2 className="about-title">
              <span className="rv" style={{ "--d": 120 }}>Clarity in code.</span>
              <span className="rv grad-text" style={{ "--d": 260 }}>
                Character in every detail.
              </span>
            </h2>
          </div>
          <p className="about-sub rv" style={{ "--d": 420 }}>
            Interfaces that don’t just work. They communicate.
          </p>
        </header>

        <div className="about-body">
          <blockquote className="about-quote">
            <span className="quote-mark grad-text rv" style={{ "--d": 300 }} aria-hidden="true">
              “
            </span>
            <p>
              <TypeOnce
                start={seen}
                text="I treat every screen as {a conversation} between technology and {the person using it}."
              />
            </p>
          </blockquote>

          <div className="about-text">
            <p className="rv" style={{ "--d": 500 }}>
              It started with curiosity: a few lines of HTML and a page that
              changed. That spark became a habit of building products that feel{" "}
              <strong>intuitive, purposeful and polished</strong>.
            </p>
            <p className="rv" style={{ "--d": 640 }}>
              I work in <strong>JavaScript, HTML and CSS</strong>, with{" "}
              <strong>Java and Python</strong> for broader problem-solving. My
              goal is simple: turn complex requirements into interfaces that feel
              effortless.
            </p>

            <ul className="pillars">
              {pillars.map((p, i) => (
                <li key={p.name} className="rv" style={{ "--d": 800 + i * 140 }}>
                  <span className="pillar-name">
                    <b>{String(i + 1).padStart(2, "0")}</b> / {p.name}
                  </span>
                  <span className="pillar-note">{p.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}