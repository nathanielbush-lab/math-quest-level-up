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
      <h1>Welcome to Level Up! 🧭</h1>
      <p>This is your path through middle school math: Grades 6, 7 and 8. You'll explore new ideas, use them in real problems, and explain how they work.</p>
      <p>Move fast through what you know. Take your time on what's new. Every mistake is a chance to learn!</p>
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
