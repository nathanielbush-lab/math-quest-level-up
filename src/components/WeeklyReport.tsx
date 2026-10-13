import { useEffect, useMemo, useState } from "react";
import { buildReport, reportStats, weekOptions, type AttentionItem, type WeekRange, type WeeklyReportData } from "../engine/report";
import type { AppState } from "../engine/state";
import { writeSummary, type ReportSummary } from "../grading/report-summary";
import { BADGE_BY_ID } from "../store";
import { LevelBadge, fmtDate } from "../ui";
import "./report.css";

const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;

function rangeText(wk: WeekRange): string {
  const [y1, m1, d1] = wk.start.split("-").map(Number);
  const [y2, m2, d2] = wk.end.split("-").map(Number);
  const a = new Date(y1, m1 - 1, d1);
  const b = new Date(y2, m2 - 1, d2);
  const md: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `Mon ${a.toLocaleDateString(undefined, md)} – Sun ${b.toLocaleDateString(undefined, { ...md, year: "numeric" })}`;
}

function weekName(wk: WeekRange): string {
  return wk.offset === 0 ? "This week" : wk.offset === 1 ? "Last week" : `${wk.offset} weeks ago`;
}

/** Open every <details> while printing so transcripts and drafts show up on paper. */
function useOpenDetailsForPrint() {
  useEffect(() => {
    let opened: HTMLDetailsElement[] = [];
    const before = () => {
      opened = [...document.querySelectorAll<HTMLDetailsElement>(".wr details:not([open])")];
      opened.forEach((d) => (d.open = true));
    };
    const after = () => {
      opened.forEach((d) => (d.open = false));
      opened = [];
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);
}

export function WeeklyReport({ state }: { state: AppState; mutate: (fn: (s: AppState) => void) => void }) {
  const [offset, setOffset] = useState(0);
  const weeks = useMemo(() => weekOptions(), []);
  const r = useMemo(() => buildReport(state, offset), [state, offset]);
  const [summaries, setSummaries] = useState<Record<string, ReportSummary>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useOpenDetailsForPrint();

  const summary = summaries[r.week.start];
  const apiKey = state.settings.apiKey;
  const summarize = async () => {
    if (!apiKey) return;
    setBusy(true);
    setError(null);
    const wk = r.week.start;
    const out = await writeSummary(apiKey, state.settings.model, reportStats(r));
    if (out.summary) setSummaries((s) => ({ ...s, [wk]: out.summary! }));
    else setError(out.error ?? "Couldn't write a summary right now.");
    setBusy(false);
  };
  const pick = (n: number) => {
    setOffset(n);
    setError(null);
  };

  const detailNote = !r.eventsSince
    ? "Question-by-question details (first-try rates, hints, timing) are recorded from this update onward, so they'll fill in as the student practices."
    : r.eventsSince > r.week.start
      ? `Question-by-question details are recorded from ${fmtDate(r.eventsSince)} onward${r.eventsSince > r.week.end ? ", so this week shows sessions and levels only" : ""}.`
      : null;

  return (
    <div className="wr">
      <div className="card tight wr-head">
        <div className="wr-title">
          <div>
            <h2>📋 Weekly report{state.settings.studentName ? <span className="muted"> · {state.settings.studentName}</span> : null}</h2>
            <div className="wr-range">{weekName(r.week)}: <span>{rangeText(r.week)}</span></div>
          </div>
          <div className="wr-actions">
            <button className="btn" onClick={() => window.print()}>🖨️ Print / save as PDF</button>
            {apiKey && (
              <button className="btn primary" disabled={busy} onClick={summarize}>
                {busy ? "Writing…" : summary ? "✨ Write it again" : "✨ Write a summary with Claude"}
              </button>
            )}
          </div>
        </div>
        <div className="wr-picker" role="group" aria-label="Choose a week">
          <button className={offset === 0 ? "on" : ""} aria-pressed={offset === 0} onClick={() => pick(0)}>This week</button>
          <button className={offset === 1 ? "on" : ""} aria-pressed={offset === 1} onClick={() => pick(1)}>Last week</button>
          <label className="wr-earlier">
            <span className="small muted">Earlier:</span>
            <select value={offset >= 2 ? offset : ""} onChange={(e) => e.target.value && pick(Number(e.target.value))} aria-label="Earlier weeks">
              <option value="">Choose a week…</option>
              {weeks.slice(2).map((w) => (
                <option key={w.start} value={w.offset}>{rangeText(w)}</option>
              ))}
            </select>
          </label>
        </div>
        {detailNote && <p className="small muted wr-note">{detailNote}</p>}
      </div>

      {error && <div className="feedback warn" role="alert">{error}</div>}
      {summary && <SummaryCard summary={summary} />}

      {!r.hasActivity ? (
        <div className="card wr-empty">
          <h3>A quiet week</h3>
          <p className="muted" style={{ margin: 0 }}>No practice was recorded {r.isCurrent ? "yet this week" : "this week"}. {r.isCurrent ? "The report fills in as soon as the student finishes a quest." : "Try another week above."}</p>
        </div>
      ) : (
        <>
          <Glance r={r} />
          <Progress r={r} />
          <Practiced r={r} />
          <Attention items={r.attention} />
          <Wins r={r} />
          <Tests r={r} />
          <Explanations r={r} />
          <Chats r={r} />
        </>
      )}
      <p className="small muted wr-foot">Made by Level Up on {new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}. “First try” means right on the first attempt with no hint, worked steps or tutor.</p>
    </div>
  );
}

function SummaryCard({ summary }: { summary: ReportSummary }) {
  return (
    <section className="card wr-section wr-summary" aria-live="polite">
      <h3>✨ Claude's summary</h3>
      <p>{summary.summary}</p>
      {summary.suggestions.length > 0 && (
        <>
          <strong className="small">Ideas for next week</strong>
          <ul>{summary.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </>
      )}
      <p className="small muted" style={{ margin: 0 }}>Written by Claude from this week's numbers only (no names or student writing were sent). Double-check anything that matters.</p>
    </section>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "warn" }) {
  return (
    <div className={`wr-stat${tone ? " " + tone : ""}`}>
      <div className="wr-stat-label">{label}</div>
      <div className="wr-stat-value">{value}</div>
      {sub && <div className="wr-stat-sub">{sub}</div>}
    </div>
  );
}

function Glance({ r }: { r: WeeklyReportData }) {
  const g = r.glance;
  return (
    <section className="card wr-section">
      <h3>At a glance</h3>
      <div className="wr-stats">
        <Stat label="Daily quests" value={`${g.quests} of ${g.goal}${g.goalMet ? " ✓" : ""}`} sub={g.goalMet ? "Weekly goal met" : r.isCurrent ? `${Math.max(0, g.goal - g.quests)} more to reach the goal` : "Weekly goal"} tone={g.goalMet ? "good" : undefined} />
        <Stat label="Time practicing" value={`${g.minutes} min`} sub={`${plural(g.sessions, "session")} on ${plural(g.activeDays, "day")}`} />
        <Stat label="Questions answered" value={String(g.answered)} sub={g.firstTryPct !== null ? `${g.firstTryPct}% right first try without help` : "First-try data not recorded yet"} />
        <Stat label="Hints used" value={String(g.hints)} sub={g.answered && r.hasDetail ? `${(g.hints / g.answered).toFixed(1)} per question` : undefined} />
        <Stat label="Tutor" value={g.tutorMessages ? plural(g.tutorMessages, "message") : "None"} sub={g.tutorQuestions ? `on ${plural(g.tutorQuestions, "question")}` : undefined} />
        <Stat label={r.isCurrent ? "Streak" : "Streak (today)"} value={`🔥 ${plural(g.streak, "day")}`} sub={`${g.freezes ? `🧊 ${plural(g.freezes, "freeze")} saved · ` : ""}best ${g.bestStreak}`} />
      </div>
    </section>
  );
}

const PACE_TEXT: Record<string, string> = {
  "on-track": "On track",
  close: "Nearly on pace",
  behind: "Behind pace",
  done: "Every skill is ready",
  past: "Target date reached",
  starting: "Just getting started",
};

function Progress({ r }: { r: WeeklyReportData }) {
  const learned = r.levelUps.filter((u) => !u.placed);
  const placed = r.levelUps.filter((u) => u.placed);
  const p = r.pace;
  const paceTone = p.status === "on-track" || p.status === "done" ? "good" : p.status === "behind" ? "warn" : "";
  return (
    <section className="card wr-section">
      <h3>Progress</h3>
      {learned.length > 0 ? (
        <>
          <p className="small muted">{plural(learned.length, "skill")} reached a new level this week:</p>
          <ul className="wr-levels">
            {learned.map((u) => (
              <li key={u.skillId}>
                <span className="wr-icon" aria-hidden>{u.icon}</span>
                <span className="grow"><strong>{u.title}</strong>{u.topic && <span className="small muted"> · {u.topic}</span>}</span>
                <LevelBadge level={u.level} />
                <span className="small muted wr-date">{fmtDate(u.date)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="small muted">No skill moved up a level this week{r.practiced.length ? ", which is normal while practice builds up" : ""}.</p>
      )}
      {placed.length > 0 && <p className="small muted">The starting-point check also marked {plural(placed.length, "skill")} as already known; quick reviews over the next week confirm them.</p>}
      <div className="wr-pace">
        <div>
          <div className="small muted">Ready to build on</div>
          <strong>{p.ready} of {p.total} skills</strong>
          {r.readyPracticed > 0 && <div className="small muted">{r.readyPracticed} of this week's practiced skills are ready</div>}
        </div>
        <div>
          <div className="small muted">Pace toward {fmtDate(p.target)}{p.daysLeft > 0 ? ` (${plural(p.daysLeft, "day")} left)` : ""}</div>
          <strong className={paceTone ? `wr-${paceTone}` : undefined}>{PACE_TEXT[p.status]}</strong>
          <div className="small muted">
            {p.status === "done" || p.status === "past"
              ? "Focus on review, retention and explaining."
              : `Needs about ${plural(p.needPerWeek, "new skill")} per week; lately about ${p.recentPerWeek} per week. Depth matters more than coverage.`}
          </div>
        </div>
      </div>
    </section>
  );
}

function Practiced({ r }: { r: WeeklyReportData }) {
  if (!r.practiced.length) return null;
  return (
    <section className="card wr-section">
      <h3>What was practiced</h3>
      <div className="wr-table">
        <table className="data">
          <thead>
            <tr><th>Skill</th><th className="num">Questions</th><th className="num">First try</th><th className="num">Hints</th><th className="num">Avg time</th></tr>
          </thead>
          <tbody>
            {r.practiced.map((s) => (
              <tr key={s.id}>
                <td><span className="wr-icon" aria-hidden>{s.icon}</span> {s.title}</td>
                <td className="num">{s.questions}</td>
                <td className="num"><span className={s.firstTryPct >= 75 ? "wr-good" : s.firstTryPct < 50 && s.questions >= 4 ? "wr-warn" : undefined}>{s.firstTryPct}%</span></td>
                <td className="num">{s.hints}</td>
                <td className="num">{s.avgSecs < 60 ? `${s.avgSecs}s` : `${Math.floor(s.avgSecs / 60)}m ${s.avgSecs % 60}s`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Attention({ items }: { items: AttentionItem[] }) {
  if (!items.length) return null;
  return (
    <section className="card wr-section">
      <h3>Worth a closer look</h3>
      <div className="wr-list">
        {items.map((a) => (
          <div key={a.id} className="wr-item">
            <div className="wr-item-head"><span className="wr-icon" aria-hidden>{a.icon}</span><strong>{a.title}</strong></div>
            <p className="small">{a.detail}</p>
            {a.examples && (
              <table className="data wr-examples">
                <thead><tr><th>Question</th><th>Their answer</th><th>Correct</th></tr></thead>
                <tbody>{a.examples.map((e, i) => <tr key={i}><td>{e.prompt}</td><td>{e.given}</td><td>{e.correct}</td></tr>)}</tbody>
              </table>
            )}
            <p className="small wr-tip"><strong>Try this:</strong> {a.suggestion}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Wins({ r }: { r: WeeklyReportData }) {
  const badges = r.badges.map((id) => BADGE_BY_ID[id]).filter(Boolean);
  if (!r.wins.length && !badges.length) return null;
  return (
    <section className="card wr-section wr-wins">
      <h3>Wins to celebrate</h3>
      <ul>
        {r.wins.map((w, i) => <li key={i}><span className="wr-icon" aria-hidden>{w.icon}</span> {w.text}</li>)}
        {badges.map((b) => <li key={b.id}><span className="wr-icon" aria-hidden>{b.icon}</span> Earned the “{b.name}” badge.</li>)}
      </ul>
    </section>
  );
}

function Tests({ r }: { r: WeeklyReportData }) {
  if (!r.tests.length) return null;
  return (
    <section className="card wr-section">
      <h3>Tests</h3>
      {r.tests.map((t) => (
        <div key={t.id} className="wr-item">
          <div className="wr-item-head">
            <strong className="grow">{t.label}</strong>
            <span className="small muted">{fmtDate(t.date)} · {t.minutes} min</span>
          </div>
          <p className="small" style={{ marginBottom: 4 }}>
            <strong>{t.right} of {t.total}</strong> right ({t.pct}%){t.skipped ? `, ${t.skipped} skipped` : ""}
            {t.change !== undefined && (
              <span className={t.change > 0 ? "wr-good" : t.change < 0 ? "wr-warn" : "muted"}>
                {" · "}{t.change > 0 ? `up ${t.change} points from last time` : t.change < 0 ? `down ${-t.change} points from last time` : "same as last time"}
              </span>
            )}
          </p>
          {t.weakest.length > 0 && (
            <p className="small muted" style={{ margin: 0 }}>Most misses: {t.weakest.map((w) => `${w.icon} ${w.title} (${w.right}/${w.total})`).join(", ")}</p>
          )}
        </div>
      ))}
    </section>
  );
}

const STATUS_TEXT = { pending: "⏳ Waiting for review", pass: "✅ Got it", revise: "✏️ Needs revision" } as const;

function Explanations({ r }: { r: WeeklyReportData }) {
  if (!r.explanations.length) return null;
  return (
    <section className="card wr-section">
      <h3>Written explanations</h3>
      <div className="wr-table">
        <table className="data">
          <thead><tr><th>Skill</th><th>Date</th><th>Status</th><th className="num">Drafts</th></tr></thead>
          <tbody>
            {r.explanations.map((e) => (
              <tr key={e.id}>
                <td>{e.skillTitle}</td>
                <td>{fmtDate(e.date)}</td>
                <td>{STATUS_TEXT[e.status]}{e.gradedBy ? <span className="small muted"> · {e.gradedBy === "parent" ? "teacher" : "Claude"}</span> : null}</td>
                <td className="num">{e.rounds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted" style={{ margin: "8px 0 0" }}>The full drafts and feedback are on the Explanations tab.</p>
    </section>
  );
}

function Chats({ r }: { r: WeeklyReportData }) {
  if (!r.chats.length) return null;
  return (
    <section className="card wr-section">
      <h3>Tutor chats</h3>
      <p className="small muted">What the student asked the “I'm stuck” tutor. Their own words are a good window into what feels confusing.</p>
      {r.chats.map((c) => (
        <details key={c.id} className="wr-chat">
          <summary>
            <span className="grow">{c.skillTitle ?? "Practice question"}</span>
            <span className="small muted">{fmtDate(c.date)} · {plural(c.studentMessages, "message")}</span>
          </summary>
          <p className="small muted wr-chat-q">Question: {c.prompt.replace(/\{([^{}/]+)\/([^{}]+)\}/g, "$1/$2").replace(/\*\*/g, "")}</p>
          <div className="wr-transcript">
            {c.messages.map((m, i) => (
              <div key={i} className={`wr-msg ${m.role}`}>
                <span className="wr-who">{m.role === "student" ? "Student" : "Tutor"}</span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        </details>
      ))}
    </section>
  );
}
