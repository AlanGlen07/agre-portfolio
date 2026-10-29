import { useEffect, useRef, useState } from "react";
import { Home, User, Code2, Folder, Award, Mail, Terminal as TerminalIcon } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Terminal from "./terminal";
import "../style/navbar.css";

const links = [
  { id: "home", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "cli", label: "CLI", icon: TerminalIcon },
];

export default function Navbar() {
  const [active, setActive] = useState("home");
  const [termOpen, setTermOpen] = useState(false);
  const [bump, setBump] = useState(0); 
  const lockUntil = useRef(0); 

  
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

        <nav className="nav" aria-label="Primary">
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
                    {}
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

      {}
      {termOpen && <Terminal onClose={() => setTermOpen(false)} />}
    </>
  );
}