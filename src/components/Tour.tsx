import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface TourStep {
  /** CSS selector of the thing to highlight; omit for a centered message. */
  target?: string;
  title: string;
  text: string;
}

export const HOME_TOUR: TourStep[] = [
  { title: "Welcome to Level Up! 🧭", text: "Here's a quick look around. It takes 30 seconds. (Press Enter or click Next.)" },
  { target: "[data-tour=quest]", title: "Today's quest", text: "Every day has three parts: a warm-up, something new to learn, and a challenge. Press the big button to start. About 30 minutes in all." },
  { target: "[data-tour=nextbadge]", title: "Badges", text: "You earn badges as you go. This shows the one you're closest to next." },
  { target: "[data-tour=tabs]", title: "Tabs", text: "My Map shows every topic and how far you've come. Trophies has all your badges. Missions has big real-world projects that unlock as you learn." },
  { target: "[data-tour=stats]", title: "Stars and streaks", text: "⭐ Stars add up for everything you do. 🔥 shows how many days in a row you've done a quest." },
  { target: "[data-tour=parent]", title: "For your teacher or grown-up", text: "The Teacher button is for your teacher or grown-up, to see your progress and change settings." },
  { title: "You're ready! 🚀", text: "Mistakes are part of learning. Hints and step-by-step solutions are always there to help. You can see this tour again with the ❓ button at the top." },
];

/** A spotlight walk-through: dims the page, highlights one element, and explains it. */
export function Tour({ steps, onDone }: { steps: TourStep[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const step = steps[i];
  const last = i === steps.length - 1;

  const measure = useCallback(() => {
    const el = step.target ? document.querySelector(step.target) : null;
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useLayoutEffect(() => {
    const el = step.target ? document.querySelector(step.target) : null;
    if (el) el.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    measure();
    nextRef.current?.focus();
  }, [step, measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone();
      if (e.key === "ArrowRight") setI((n) => Math.min(n + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setI((n) => Math.max(n - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [measure, onDone, steps.length]);

  const pad = 8;
  const W = Math.min(400, window.innerWidth - 32);
  let pop: React.CSSProperties = { left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: W };
  if (rect) {
    const below = rect.bottom + pad + 12;
    const fitsBelow = below + 190 < window.innerHeight;
    const left = Math.max(16, Math.min(rect.left + rect.width / 2 - W / 2, window.innerWidth - W - 16));
    pop = fitsBelow ? { left, top: below, width: W } : { left, top: Math.max(16, rect.top - pad - 12), transform: "translateY(-100%)", width: W };
  }

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {rect ? (
        <div className="tour-spot" style={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }} />
      ) : (
        <div className="tour-dim" />
      )}
      <div className="tour-pop" style={pop}>
        <div className="small muted">{i + 1} of {steps.length}</div>
        <h3 id="tour-title" style={{ margin: "4px 0 6px" }}>{step.title}</h3>
        <p style={{ margin: "0 0 12px" }}>{step.text}</p>
        <div className="row">
          {!last && <button className="btn ghost" onClick={onDone}>Skip tour</button>}
          <span className="grow" />
          {i > 0 && <button className="btn" onClick={() => setI(i - 1)}>← Back</button>}
          <button ref={nextRef} className="btn primary" onClick={() => (last ? onDone() : setI(i + 1))}>{last ? "Let's go!" : "Next →"}</button>
        </div>
      </div>
    </div>
  );
}
