import { useState } from "react";
import type { AppState } from "../engine/state";

export function Welcome({ mutate, onDone }: { mutate: (fn: (s: AppState) => void) => void; onDone: (next: "placement" | "home") => void }) {
  const [name, setName] = useState("");
  const save = (next: "placement" | "home") => {
    mutate((s) => {
      s.settings.studentName = name.trim();
    });
    onDone(next);
  };
  return (
    <div className="card hero" style={{ marginTop: 40 }}>
      <h1>Welcome to Math Quest: Level Up</h1>
      <p>Practice for NC Math 1, 2, 3, 4 and Pre-Calculus: short daily runs, instant feedback, and practice tests in the EOC's format.</p>
      <p>Skip what you already know, slow down on what's new, and let the reviews keep it all fresh.</p>
      <div className="field" style={{ maxWidth: 320 }}>
        <label htmlFor="nm">What's your name?</label>
        <input id="nm" type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus style={{ color: "var(--ink)" }} />
      </div>
      <div className="row">
        <button className="btn primary big" disabled={!name.trim()} onClick={() => save("placement")}>Find my starting point →</button>
        <button className="btn" disabled={!name.trim()} onClick={() => save("home")}>Skip, just start</button>
      </div>
    </div>
  );
}
