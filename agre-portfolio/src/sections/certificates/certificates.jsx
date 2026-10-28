import { useEffect, useState } from "react";
import { Award, ExternalLink, X } from "lucide-react";
import { certificates } from "../../data/certificates";
import "../../style/certificates.css";

export default function Certificates() {
  const [selected, setSelected] = useState(null);
  const [broken, setBroken] = useState({}); // ids whose image failed to load

  // Close on Esc and lock page scroll while the viewer is open
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected]);

  return (
    <section id="certificates" className="certs">
      <div className="certs-inner">
        <header className="certs-head">
          <p className="certs-label">
            <b>04</b> Certifications
          </p>
          <h2 className="certs-title">
            Validated <span className="accent-text">knowledge</span>.
            <br />
            Constant growth.
          </h2>
        </header>

        <ul className="certs-grid">
          {certificates.map((c) => (
            <li key={c.id}>
              <div
                className="cert-card"
                role="button"
                tabIndex={0}
                aria-label={`View ${c.title} certificate`}
                onClick={() => setSelected(c)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(c);
                  }
                }}
              >
                <div className="cert-top">
                  <Award size={24} className="cert-award" />
                  <span className="cert-code">{c.code}</span>
                </div>

                <div className="cert-bottom">
                  <p className="cert-meta">{c.year} / Verified</p>
                  <h3>{c.title}</h3>
                  <div className="cert-issuer">
                    <span>Issued by {c.issuer}</span>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Verify ${c.title}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onClick={() => setSelected(null)}
        >
          <div className="lightbox-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close neon-btn neon-btn--icon neon-btn--sm"
              aria-label="Close"
              onClick={() => setSelected(null)}
              autoFocus
            >
              <X size={18} />
            </button>

            {broken[selected.id] ? (
              <div className="cert-fallback">
                <Award size={34} />
                <p>Certificate of Completion</p>
                <h4>{selected.title}</h4>
                <span>{selected.issuer} / {selected.year}</span>
              </div>
            ) : (
              <img
                src={selected.image}
                alt={`${selected.title} certificate from ${selected.issuer}`}
                onError={() => setBroken((b) => ({ ...b, [selected.id]: true }))}
              />
            )}

            <div className="lightbox-caption">
              <div>
                <strong>{selected.title}</strong>
                <span>Issued by {selected.issuer} / {selected.year}</span>
              </div>
              <a href={selected.url} target="_blank" rel="noreferrer">
                Verify <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}