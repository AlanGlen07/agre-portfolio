import { useEffect, useState } from "react";
import { Award, X } from "lucide-react";
import { certificates } from "../../data/certificates";
import "../../style/certificates.css";

export default function Certificates() {
  const [selected, setSelected] = useState(null);
  const [broken, setBroken] = useState({});

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
          {certificates.map((c) => {
            const isBlank = c.blank || !c.title || !c.image;
            return (
              <li key={c.id}>
                <div
                  className={`cert-card ${isBlank ? "cert-card--blank" : ""}`}
                  role={isBlank ? undefined : "button"}
                  tabIndex={isBlank ? -1 : 0}
                  aria-label={isBlank ? undefined : `View ${c.title} certificate`}
                  onClick={() => !isBlank && setSelected(c)}
                  onKeyDown={(e) => {
                    if (isBlank) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(c);
                    }
                  }}
                >
                  {!isBlank && (
                    <>
                      <div
                        className="cert-image"
                        style={{ backgroundImage: `url(${c.image})` }}
                      />

                      <div className="cert-panel">
                        <div className="cert-panel-top">
                          <span className="cert-code">{c.code}</span>
                          <Award size={18} className="cert-award" />
                        </div>

                        <div className="cert-panel-body">
                          <p className="cert-meta">{c.year} / Verified</p>
                          <h3>{c.title}</h3>
                          <p className="cert-description">Issued by {c.issuer}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
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
            </div>
          </div>
        </div>
      )}
    </section>
  );
}