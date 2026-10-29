import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Download, ExternalLink, FileText, X } from "lucide-react";
import { contact } from "../../data/contact";
import "../../style/contacts.css";


const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function Contacts() {
  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeStatus, setResumeStatus] = useState("loading"); // loading | ok | missing
  const [sent, setSent] = useState(false);

  // Resume viewer: Esc to close, lock page scroll, and check the PDF really exists
  useEffect(() => {
    if (!resumeOpen) return;
    let cancelled = false;
    setResumeStatus("loading");
    fetch(contact.resume, { method: "HEAD" })
      .then((r) => {
        const type = r.headers.get("content-type") || "";
        if (!cancelled) setResumeStatus(r.ok && type.includes("pdf") ? "ok" : "missing");
      })
      .catch(() => !cancelled && setResumeStatus("missing"));

    const onKey = (e) => e.key === "Escape" && setResumeOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [resumeOpen]);

  // No backend needed: opens the visitor's email app with the message filled in
  const onSubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = `Portfolio inquiry from ${f.get("name")}`;
    const body = `${f.get("message")}\n\n- ${f.get("name")} (${f.get("email")})`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
    e.currentTarget.reset();
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-inner">
        <header className="contact-head">
          <div>
            <p className="contact-label">
              <b>05</b> Contact
            </p>
            <h2 className="contact-title">
              Let’s build <span className="accent-text">something</span> exceptional.
            </h2>
          </div>
          <p className="contact-sub">
            Have an idea, an opportunity, or just want to talk about the web?
            My channel is open.
          </p>
        </header>

        <div className="contact-body">
          <div className="contact-left">
            <p className="field-label">Direct channel</p>
            <a className="contact-email" href={`mailto:${contact.email}`}>
              <span>alanglenescobarjr07</span>
              <wbr />
              <span>@gmail.com</span>
              <ArrowRight size={16} />
            </a>
            <p className="contact-place">
              Based in the Philippines
              <br />
              Available worldwide
            </p>

            <p className="field-label elsewhere">Elsewhere</p>
            <div className="glass-links">
              <a className="glass-link" href={contact.github} target="_blank" rel="noreferrer">
                <ArrowUpRight size={14} className="glass-go" />
                <GithubIcon />
                <span className="glass-name">GitHub</span>
                <small>View my code</small>
              </a>

              <a className="glass-link" href={contact.linkedin} target="_blank" rel="noreferrer">
                <ArrowUpRight size={14} className="glass-go" />
                <LinkedinIcon />
                <span className="glass-name">LinkedIn</span>
                <small>Let’s connect</small>
              </a>

              <button type="button" className="glass-link" onClick={() => setResumeOpen(true)}>
                <ArrowUpRight size={14} className="glass-go" />
                <FileText size={28} />
                <span className="glass-name">Resume</span>
                <small>View &amp; download</small>
              </button>
            </div>
          </div>

          <form className="contact-form" onSubmit={onSubmit}>
            <label>
              <span className="field-label">Your name</span>
              <input name="name" type="text" placeholder="How should I address you?" required />
            </label>
            <label>
              <span className="field-label">Email address</span>
              <input name="email" type="email" placeholder="you@company.com" required />
            </label>
            <label>
              <span className="field-label">Tell me about the project</span>
              <textarea
                name="message"
                rows="4"
                placeholder="A few details about your idea, goals, and timeline…"
                required
              />
            </label>

            <button type="submit" className="neon-btn send-btn">
              Send transmission <ArrowRight size={16} />
            </button>
            {sent && (
              <p className="form-note" role="status">
                Your email app should open with the message ready to send.
              </p>
            )}
          </form>
        </div>
      </div>

      {resumeOpen && (
        <div
          className="resume-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Resume"
          onClick={() => setResumeOpen(false)}
        >
          <div className="resume-panel" onClick={(e) => e.stopPropagation()}>
            <div className="resume-bar">
              <span>Resume.pdf</span>
              <div className="resume-actions">
                <a href={contact.resume} download={contact.resumeName} className="neon-btn neon-btn--sm">
                  <Download size={14} /> Download PDF
                </a>
                <a href={contact.resume} target="_blank" rel="noreferrer" className="neon-btn neon-btn--sm">
                  <ExternalLink size={14} /> Open
                </a>
                <button
                  type="button"
                  className="neon-btn neon-btn--icon neon-btn--sm"
                  aria-label="Close"
                  onClick={() => setResumeOpen(false)}
                  autoFocus
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="resume-view">
              {resumeStatus === "ok" && (
                <iframe title="Resume" src={`${contact.resume}#view=FitH`} />
              )}
              {resumeStatus === "loading" && <p className="resume-msg">Loading resume…</p>}
              {resumeStatus === "missing" && (
                <div className="resume-msg">
                  <FileText size={32} />
                  <p>Resume file not found.</p>
                  <small>
                    Save your PDF as <code>public/resume.pdf</code>, then reopen this window.
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}