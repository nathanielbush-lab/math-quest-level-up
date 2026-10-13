import { useEffect, useRef, useState } from "react";
import { MathText } from "./MathText";

/** Drop consecutive duplicate steps (some generators repeat a line for emphasis). */
export function cleanSteps(steps: string[]): string[] {
  return steps.filter((s, i, all) => s !== all[i - 1]);
}

/** The opening steps of a solution, used to start a guided problem without giving the answer away. */
export function scaffoldSteps(steps: string[], hints: string[]): string[] {
  const all = cleanSteps(steps);
  if (all.length <= 1) return hints.slice(0, 1);
  const stop = all.findIndex((s) => /^\*\*(Answer|Check)/.test(s));
  const limit = stop === -1 ? all.length - 1 : stop;
  return all.slice(0, Math.max(1, Math.min(limit, Math.floor(all.length / 2))));
}

/**
 * A worked solution revealed one step at a time, so she can try to predict the next move
 * before seeing it. "Show all" is there for when she just wants to read it through.
 */
export function SolutionSteps({ steps, stepwise = true, onAllShown }: { steps: string[]; stepwise?: boolean; onAllShown?: () => void }) {
  const list = cleanSteps(steps);
  const [shown, setShown] = useState(stepwise ? 1 : list.length);
  const all = shown >= list.length;
  const nextRef = useRef<HTMLButtonElement>(null);
  const reported = useRef(false);

  useEffect(() => {
    if (all) {
      if (!reported.current) {
        reported.current = true;
        onAllShown?.();
      }
    } else nextRef.current?.focus();
  }, [all, onAllShown]);

  return (
    <div className="solution">
      <div className="row" style={{ alignItems: "baseline" }}>
        <strong>Solution</strong>
        <span className="muted small grow">{all ? `${list.length} step${list.length === 1 ? "" : "s"}` : `Step ${shown} of ${list.length}`}</span>
      </div>
      <ol className="steps">
        {list.slice(0, shown).map((s, i) => (
          <li key={i} className={stepwise && i > 0 ? "celebrate" : undefined}><MathText text={s} /></li>
        ))}
      </ol>
      {!all && (
        <div className="row">
          <span className="small muted grow">Can you guess the next step before you look?</span>
          <button className="btn ghost" onClick={() => setShown(list.length)}>Show all</button>
          <button ref={nextRef} className="btn" onClick={() => setShown((n) => n + 1)}>Next step ▸</button>
        </div>
      )}
    </div>
  );
}
