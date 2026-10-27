import { useEffect, useRef, useState } from "react";
import { Home, User, Code2, Folder, Award, Mail, Terminal as TerminalIcon } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Terminal from "./terminal";
import "../style/navbar.css";

// `color` tints the whole bar + the popped-up icon when that item is active
const links = [
  { id: "home", label: "Home", icon: Home, color: "#1e90ff" },
  { id: "about", label: "About", icon: User, color: "#8b5cf6" },
  { id: "skills", label: "Skills", icon: Code2, color: "#06b6d4" },
  { id: "projects", label: "Projects", icon: Folder, color: "#22c55e" },
  { id: "certificates", label: "Certificates", icon: Award, color: "#eab308" },
  { id: "contact", label: "Contact", icon: Mail, color: "#ec4899" },
  { id: "cli", label: "CLI", icon: TerminalIcon, color: "#f97316" },
];

export default function Navbar() {
  const [active, setActive] = useState("home");
  const [termOpen, setTermOpen] = useState(false);
  const [bump, setBump] = useState(0); // changes on every click so the bounce replays
  const lockUntil = useRef(0); // after a click, ignore scroll-spy while the page scrolls there

  // Highlight the nav item for the section currently on screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && Date.now() > lockUntil.current && setActive(e.target.id)
        ),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    links.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const current = termOpen ? "cli" : active;
  const currentColor = links.find((l) => l.id === current)?.color;

  return (
    <>
      <header className="site-header">
        <div className="topbar">
          <div className="topbar-right" style={{ marginLeft: "auto" }}>
            <span className="availability">
              <i className="dot" /> Available for work
            </span>
            <ThemeToggle />
          </div>
        </div>

        <nav className="nav" aria-label="Primary" style={{ "--nav-accent": currentColor }}>
          <ul>
            {links.map(({ id, label, icon: Icon }) => {
              const isActive = current === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={isActive ? "active" : ""}
                    aria-label={label}
                    aria-current={active === id ? "page" : undefined}
                    onClick={(e) => {
                      setBump((b) => b + 1);
                      lockUntil.current = Date.now() + 900;
                      if (id === "cli") {
                        e.preventDefault();
                        setTermOpen(true);
                      } else {
                        setActive(id);
                      }
                    }}
                  >
                    {/* new key on click = bounce animation restarts */}
                    <span className="nav-icon" key={isActive ? `on-${bump}` : "off"}>
                      <Icon size={16} />
                    </span>
                    <span className="nav-label">{label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Rendered outside the header so the overlay covers the whole screen */}
      {termOpen && <Terminal onClose={() => setTermOpen(false)} />}
    </>
  );
}