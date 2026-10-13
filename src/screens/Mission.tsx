import { COURSE_BY_ID } from "../content/topics";
import { useMemo, useState } from "react";
import { MISSIONS } from "../content/challenges";
import { MultiPart } from "../components/Cards";
import { makeRng, randomSeed } from "../lib/rng";
import { logEvent, today, type AppState } from "../engine/state";

export function MissionScreen({ state, mutate, id, onExit }: { state: AppState; mutate: (fn: (s: AppState) => void) => void; id: string; onExit: () => void }) {
  const m = MISSIONS.find((x) => x.id === id)!;
  const [seed] = useState(randomSeed);
  const built = useMemo(() => m.build(makeRng(seed)), [m, seed]);
  const [score, setScore] = useState<number | null>(null);
  if (score !== null) {
    return (
      <div className="card hero celebrate">
        <h1>Mission complete! 🚩</h1>
        <p>You solved {score} of {built.parts.length} parts on your own.</p>
        <p className="muted">Real problems mix lots of skills together, and you just did that!</p>
        <button className="btn primary big" autoFocus onClick={onExit}>Back to missions</button>
      </div>
    );
  }
  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <span className="chip">{COURSE_BY_ID[m.course].short} mission</span>
        <span className="grow" />
        <button className="btn ghost" onClick={onExit}>✕</button>
      </div>
      <MultiPart
        title={m.title}
        intro={built.intro}
        parts={built.parts}
        readAloud={state.settings.readAloud}
        onDone={(results) => {
          const right = results.filter((r) => r.ok && !r.assisted).length;
          mutate((s) => {
            s.missions[m.id] = { done: true, date: today(), score: Math.max(right, s.missions[m.id]?.score ?? 0) };
            s.xp += right * 10 + 25;
            for (const x of results) logEvent(s, { skill: m.id, level: undefined, mode: "mission", ok: x.ok, assisted: x.assisted, tries: x.tries, hints: x.hints, secs: x.secs, tutor: x.tutor || undefined });
          });
          setScore(right);
        }}
      />
    </div>
  );
}
