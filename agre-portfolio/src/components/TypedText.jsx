import { useEffect, useMemo, useState } from "react";
import "../style/typing.css";

/*
  Typing animation: types a variant, holds, erases, then moves to the next one.
  variants = [{ tone: "blue" | "cyan" | "violet", text: "plain {highlighted} text" }]
*/

const TYPE_MS = 24;     // base delay per typed character
const ERASE_MS = 9;     // delay per erase step (erases 2 chars at a time)
const HOLD_MS = 3200;   // pause once fully typed
const GAP_MS = 380;     // pause before the next variant starts

const REDUCED = "(prefers-reduced-motion: reduce)";

// "a {b} c" -> [{text:"a ",hl:false},{text:"b",hl:true},{text:" c",hl:false}]
const parse = (str) =>
  str
    .split(/(\{[^}]+\})/)
    .filter(Boolean)
    .map((p) => (p.startsWith("{") ? { text: p.slice(1, -1), hl: true } : { text: p, hl: false }));

// first n characters of the segments, keeping highlight info
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

export default function TypedText({ variants }) {
  const parsed = useMemo(() => variants.map((v) => parse(v.text)), [variants]);
  const plain = useMemo(() => parsed.map((p) => p.map((s) => s.text).join("")), [parsed]);

  const [reduce, setReduce] = useState(() => window.matchMedia(REDUCED).matches);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(REDUCED);
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const total = plain[index].length;
    let t;

    if (!erasing) {
      if (count < total) {
        const prev = plain[index][count - 1];
        const pause = prev === "." || prev === "," ? 150 : 0; // tiny breath after punctuation
        t = setTimeout(() => setCount((c) => c + 1), TYPE_MS + Math.random() * 18 + pause);
      } else {
        t = setTimeout(() => setErasing(true), HOLD_MS);
      }
    } else if (count > 0) {
      t = setTimeout(() => setCount((c) => Math.max(0, c - 2)), ERASE_MS);
    } else {
      t = setTimeout(() => {
        setIndex((i) => (i + 1) % plain.length);
        setErasing(false);
      }, GAP_MS);
    }
    return () => clearTimeout(t);
  }, [reduce, plain, index, count, erasing]);

  const current = reduce ? 0 : index;
  const visible = reduce ? parsed[0] : slice(parsed[index], count);
  const holding = !erasing && count >= plain[index].length;

  return (
    <div className="typed" data-tone={variants[current].tone}>
      {/* screen readers get the full sentence, not letter-by-letter typing */}
      <p className="typed-sr">{plain[current]}</p>

      <div className="typed-stage" aria-hidden="true">
        {/* invisible copies reserve the tallest height so the page never jumps */}
        {plain.map((t, i) => (
          <span key={i} className="typed-ghost">{t}</span>
        ))}
        <span className="typed-live">
          {visible.map((s, i) => (
            <span key={i} className={s.hl ? "typed-hl" : undefined}>{s.text}</span>
          ))}
          {!reduce && <span className={`typed-caret${holding ? " blink" : ""}`} />}
        </span>
      </div>
    </div>
  );
}