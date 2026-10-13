import { LEVEL_NAMES, type MasteryLevel } from "./engine/state";

export const LEVEL_COLORS = ["var(--lv0)", "var(--lv1)", "var(--lv2)", "var(--lv3)", "var(--lv4)"];

export function LevelBadge({ level }: { level: MasteryLevel }) {
  return <span className="badge-level" style={{ background: LEVEL_COLORS[level], color: level === 0 ? "var(--ink)" : "#fff" }}>{LEVEL_NAMES[level]}</span>;
}

export function LevelBar({ counts, total }: { counts: number[]; total: number }) {
  return (
    <div className="levelbar" aria-label="progress by level">
      {[4, 3, 2, 1].map((l) => (counts[l] ? <div key={l} style={{ width: `${(counts[l] / total) * 100}%`, background: LEVEL_COLORS[l] }} title={`${LEVEL_NAMES[l]}: ${counts[l]}`} /> : null))}
    </div>
  );
}

export function LevelLegend() {
  return (
    <div className="row small muted">
      {[1, 2, 3, 4].map((l) => (
        <span key={l} className="row" style={{ gap: 4 }}><span className="lv-dot" style={{ background: LEVEL_COLORS[l] }} />{LEVEL_NAMES[l]}</span>
      ))}
    </div>
  );
}

/** The colored bar spelled out in words: "2 Exploring · 1 Practicing". */
export function LevelSummary({ counts, total }: { counts: number[]; total: number }) {
  const parts = [4, 3, 2, 1].filter((l) => counts[l]);
  if (!parts.length) return <span className="small muted">Not started yet · {total} skills</span>;
  return (
    <span className="level-summary small">
      {parts.map((l) => (
        <span key={l} className="row" style={{ gap: 4 }}><span className="lv-dot" style={{ background: LEVEL_COLORS[l] }} />{counts[l]} {LEVEL_NAMES[l].toLowerCase()}</span>
      ))}
      {counts[0] ? <span className="muted">{counts[0]} to go</span> : null}
    </span>
  );
}

/** What each level means, in her words. */
export const LEVEL_MEANING = [
  "",
  "You've started learning this skill.",
  "You've solved some on your own. Keep going until it's solid.",
  "You still got it right on a later day, so it's really yours.",
  "You can explain WHY it works, and you still remember it days later.",
];

export function LevelGuide() {
  return (
    <details className="level-guide">
      <summary className="small">What do the progress colors mean?</summary>
      <ul>
        {[1, 2, 3, 4].map((l) => (
          <li key={l} className="small"><span className="lv-dot" style={{ background: LEVEL_COLORS[l] }} /> <strong>{LEVEL_NAMES[l]}:</strong> {LEVEL_MEANING[l]}</li>
        ))}
        <li className="small"><span className="lv-dot" style={{ background: LEVEL_COLORS[0] }} /> <strong>Gray:</strong> not started yet.</li>
      </ul>
    </details>
  );
}

export function fmtDate(d?: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
