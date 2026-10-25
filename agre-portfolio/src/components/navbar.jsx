import { useEffect, useState } from "react";
import { Home, User, Code2, Folder, Award, Mail, Terminal } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import "../style/navbar.css";

const links = [
  { id: "home", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "cli", label: "CLI", icon: Terminal },
];

export default function Navbar() {
  const [active, setActive] = useState("home");

  // Highlight the nav item for the section currently on screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    links.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className="site-header">
      <div className="topbar">
       
        <div className="topbar-right">
          <span className="availability">
            <i className="dot" /> Available for work
          </span>
          <ThemeToggle />
        </div>
      </div>

      <nav className="nav" aria-label="Primary">
        <ul>
          {links.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={active === id ? "active" : ""}
                aria-current={active === id ? "page" : undefined}
              >
                <Icon size={14} />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}