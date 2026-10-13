import type { AppState } from "../engine/state";
import type { Route } from "../App";
import { checkpointDue, eocCourseFor, scoreOf } from "../engine/assess";
import { COURSE_BY_ID } from "../content/topics";
import { fmtDate } from "../ui";
import "../screens/assess.css";
import { Icon } from "./Icon";

/** One card on the Today tab: the monthly checkpoint when it's due, otherwise EOC readiness. */
export function AssessCards({ state, go }: { state: AppState; go: (r: Route) => void }) {
  if (checkpointDue(state)) {
    return (
      <div className="card assess-card due">
        <div className="grow">
          <h3><Icon name="calendar" /> Monthly checkpoint ready (about 15 min)</h3>
          <p className="muted small" style={{ margin: 0 }}>One question from each unit, no timer. See how far you've come.</p>
        </div>
        <button className="btn primary" onClick={() => go({ name: "assess", kind: "checkpoint" })}>Start</button>
      </div>
    );
  }
  const eoc = eocCourseFor(state.settings.course ?? "m1");
  const tests = state.assessments.filter((a) => a.kind !== "checkpoint" && (a.course ?? "m1") === eoc);
  const last = tests[tests.length - 1];
  const s = last && scoreOf(last);
  const pct = s?.pct ?? 0;
  const C = 2 * Math.PI * 22;
  return (
    <div className="card tight assess-card eoc-card">
      <svg width="56" height="56" viewBox="0 0 52 52" role="img" aria-label={s ? `${pct}% on the last practice` : "No practice test yet"}>
        <circle cx="26" cy="26" r="22" fill="none" stroke="var(--line)" strokeWidth="6" />
        {s && <circle cx="26" cy="26" r="22" fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${((C * pct) / 100).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 26 26)" />}
        <text x="26" y="30" textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-mono)" fontWeight="700" fontSize="12">{s ? `${pct}%` : "–"}</text>
      </svg>
      <div className="grow">
        <h3>{COURSE_BY_ID[eoc].short} EOC readiness</h3>
        <p className="muted small" style={{ margin: 0 }}>{s ? `Last practice test (${fmtDate(last.date)}): ${s.right} of ${s.total} right.` : "Take a practice test in the EOC's format to see where you stand."}</p>
      </div>
      <button className="btn" onClick={() => go({ name: "assess" })}>{s ? "Practice tests" : "Take a look"}</button>
    </div>
  );
}
