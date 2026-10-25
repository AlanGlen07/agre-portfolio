import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeContext";
import { skills } from "../data/skills";
import { projects } from "../data/projects";
import { certificates } from "../data/certificates";
import { contact } from "../data/contact";
import "../style/terminal.css";

const USER = "visitor@alan.dev";
const hireLink = `mailto:${contact.email}?subject=${encodeURIComponent(
  "Let’s work together"
)}`;
const bar = (n) => "█".repeat(Math.round(n / 10)) + "░".repeat(10 - Math.round(n / 10));

const HELP = [
  ["/about", "who I am"],
  ["/skills", "technical arsenal"],
  ["/projects", "selected work"],
  ["/certs", "certifications"],
  ["/contact", "how to reach me"],
  ["/hire", "work with me"],
  ["/resume", "open my resume"],
  ["/theme", "switch dark / light"],
  ["/banner", "show the banner again"],
  ["/clear", "clear the screen"],
  ["/exit", "close the terminal"],
];

function Prompt() {
  return (
    <span className="t-prompt">
      <span className="t-user">{USER}</span>
      <span className="t-sep">:~$</span>
    </span>
  );
}

function Banner() {
  return (
    <div className="banner">
      <p className="banner-hi pixel">Hi, I’m</p>
      <h2 className="banner-name pixel">Alan Glen</h2>
      <p className="banner-role">Frontend Developer / UI Engineer</p>
    </div>
  );
}

export default function Terminal({ onClose }) {
  const { theme, toggleTheme } = useTheme();
  const [stage, setStage] = useState(0); // boot sequence 0..3
  const [history, setHistory] = useState([]);
  const [value, setValue] = useState("");
  const idRef = useRef(0);
  const cmdHistory = useRef([]);
  const cursor = useRef(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose; // always the latest, without restarting the boot effect

  // Boot sequence + Esc to close + lock page scroll
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 250),
      setTimeout(() => setStage(2), 950),
      setTimeout(() => setStage(3), 1450),
    ];
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      timers.forEach(clearTimeout);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (stage === 3) inputRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, stage]);

  const add = (...entries) =>
    setHistory((h) => [...h, ...entries.map((e) => ({ id: idRef.current++, ...e }))]);
  const out = (node, tone) => ({ type: "out", node, tone });

  const execute = (raw) => {
    const text = raw.trim();
    add({ type: "cmd", text });
    if (!text) return;
    cmdHistory.current.push(text);
    cursor.current = -1;

    const name = text.replace(/^\//, "").toLowerCase().split(/\s+/)[0];

    switch (name) {
      case "help":
        add(
          out(
            <div className="t-table">
              {HELP.map(([c, d]) => (
                <div key={c}>
                  <button type="button" onClick={() => execute(c)}>{c}</button>
                  <span>{d}</span>
                </div>
              ))}
             
            </div>
          )
        );
        break;
      case "about":
        add(
          out(
            "Alan Glen R. Escobar Jr. - frontend developer and UI engineer from the Philippines. I build fast, refined interfaces where thoughtful systems meet bold visual craft."
          )
        );
        break;
      case "skills":
        add(
          out(
            <div className="t-pre">
              {skills.map((s) => (
                <div key={s.id}>
                  {s.name.padEnd(11)} <span className="t-hl">{bar(s.level)}</span> {s.level}%
                </div>
              ))}
            </div>
          )
        );
        break;
      case "projects":
        add(
          out(
            <div className="t-pre">
              {projects.map((p, i) => (
                <div key={p.id} className="t-gap">
                  <b>{String(i + 1).padStart(2, "0")}</b> {p.title}
                  <div className="t-dim">    {p.tech.join(" · ")}</div>
                </div>
              ))}
            </div>
          )
        );
        break;
      case "certs":
      case "certificates":
        add(
          out(
            <div className="t-pre">
              {certificates.map((c) => (
                <div key={c.id}>
                  {c.year}  {c.title} <span className="t-dim">- {c.issuer}</span>
                </div>
              ))}
            </div>
          )
        );
        break;
      case "contact":
        add(
          out(
            <div className="t-pre">
              <div>email     <a href={`mailto:${contact.email}`}>{contact.email}</a></div>
              <div>github    <a href={contact.github} target="_blank" rel="noreferrer">{contact.github}</a></div>
              <div>linkedin  <a href={contact.linkedin} target="_blank" rel="noreferrer">{contact.linkedin}</a></div>
            </div>
          )
        );
        break;
      case "hire":
        add(
          out(
            <div>
              <div className="t-ok">Available for work - let’s build something exceptional.</div>
              <div>
                Send a message to <a href={hireLink}>{contact.email}</a>
              </div>
            </div>
          )
        );
        break;
      case "resume":
        add(out("Opening resume…", "ok"));
        window.open(contact.resume, "_blank", "noreferrer");
        break;
      case "theme":
        add(out(`Theme switched to ${theme === "dark" ? "light" : "dark"} mode.`, "ok"));
        toggleTheme();
        break;
      case "whoami":
        add(out("visitor - welcome to the portfolio."));
        break;
      case "banner":
        add({ type: "banner" });
        break;
      case "clear":
        setHistory([]);
        break;
      case "exit":
      case "quit":
        onClose();
        break;
      default:
        add(out(`command not found: ${text}. Type /help to list available commands.`, "err"));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    execute(value);
    setValue("");
  };

  // Arrow up / down walks through previous commands
  const onKeyDown = (e) => {
    const list = cmdHistory.current;
    if (e.key === "ArrowUp" && list.length) {
      e.preventDefault();
      cursor.current = cursor.current < 0 ? list.length - 1 : Math.max(0, cursor.current - 1);
      setValue(list[cursor.current]);
    } else if (e.key === "ArrowDown" && cursor.current >= 0) {
      e.preventDefault();
      cursor.current += 1;
      if (cursor.current >= list.length) {
        cursor.current = -1;
        setValue("");
      } else setValue(list[cursor.current]);
    }
  };

  return (
    <div className="term-overlay" role="dialog" aria-modal="true" aria-label="Terminal" onClick={onClose}>
      <div
        className="term"
        onClick={(e) => {
          e.stopPropagation();
          if (!window.getSelection()?.toString()) inputRef.current?.focus();
        }}
      >
        <div className="term-bar">
          <div className="term-dots">
            <button type="button" className="dot-close" aria-label="Close terminal" onClick={onClose} />
            <i />
            <i />
          </div>
          <span className="term-title">alan@portfolio — zsh — 80×24</span>
          <span className="term-secure">
            <i /> Secure session
          </span>
        </div>

        <div className="term-body" ref={bodyRef}>
          {stage >= 1 && (
            <div className="t-line">
              <Prompt /> <span className="t-dim">system.boot()</span>
            </div>
          )}
          {stage >= 2 && (
            <div className="t-line">
              Portfolio OS v2.6 ready. Type <b className="t-cmd">/help</b> to list available commands.
            </div>
          )}
          {stage >= 3 && <Banner />}

          {history.map((h) =>
            h.type === "cmd" ? (
              <div className="t-line" key={h.id}>
                <Prompt /> <span>{h.text}</span>
              </div>
            ) : h.type === "banner" ? (
              <Banner key={h.id} />
            ) : (
              <div className={`t-out ${h.tone || ""}`} key={h.id}>
                {h.node}
              </div>
            )
          )}

          {stage >= 3 && (
            <form className="t-input-row" onSubmit={onSubmit}>
              <Prompt />
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck="false"
                autoComplete="off"
                autoCapitalize="off"
                aria-label="Terminal command"
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}