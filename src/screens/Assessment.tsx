import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TOPICS, TOPIC_BY_ID } from "../content";
import { COURSE_BY_ID } from "../content/topics";
import type { Answer, Problem } from "../content/types";
import { Calculator } from "../components/Calculator";
import { MathText } from "../components/MathText";
import { SolutionSteps } from "../components/SolutionSteps";
import { Grid, Visual } from "../components/Visual";
import {
  ASSESS_SPEC,
  WARN_SECS,
  checkpointDue,
  checkpointEligible,
  eocCourseFor,
  checkpoints,
  compareCheckpoints,
  fmtClock,
  lastCheckpoint,
  nextCheckpointDate,
  pickItems,
  problemFor,
  readinessBand,
  saveTest,
  scoreOf,
  scoreTest,
  secondsLeft,
  strongWeak,
  topicScores,
  unreadable,
  type AssessKind,
  type Change,
  type ScoredItem,
  type TestItem,
} from "../engine/assess";
import { canonicalResponse, type Response } from "../engine/check";
import { daysBetween, today, type AppState, type AssessmentResult } from "../engine/state";
import { randomSeed } from "../lib/rng";
import { fmtDate } from "../ui";
import "./assess.css";
import { Icon } from "../components/Icon";

export type { AssessKind };

type Mutate = (fn: (s: AppState) => void) => void;

const HONEST = "This is practice in the EOC's format (multiple choice and typed answers, weighted by topic the way the state test is), not a real EOC.";

/** With no kind: the hub (choose a test, see past results). With a kind: take that test. */
export function Assessment({ state, mutate, kind, onExit, go, openTopic }: {
  state: AppState;
  mutate: Mutate;
  kind?: AssessKind;
  onExit: () => void;
  go: (kind?: AssessKind) => void;
  /** Optional: open a topic page (for "Practice this topic" on the results). */
  openTopic?: (topicId: string) => void;
}) {
  if (!kind) return <Hub state={state} go={go} onExit={onExit} />;
  return <TestFlow state={state} mutate={mutate} kind={kind} onExit={onExit} go={go} openTopic={openTopic} />;
}

// ====================================================================
// Hub
// ====================================================================

const KIND_LABEL: Record<AssessKind, string> = { "screener-full": "Full practice", "screener-quick": "Quick practice", checkpoint: "Checkpoint" };

function Hub({ state, go, onExit }: { state: AppState; go: (k?: AssessKind) => void; onExit: () => void }) {
  const screeners = state.assessments.filter((a) => a.kind !== "checkpoint");
  const eoc = eocCourseFor(state.settings.course ?? "m1");
  const unitCount = TOPICS.filter((t) => t.course === (state.settings.course ?? "m1")).length;
  const cps = checkpoints(state);
  const due = checkpointDue(state);
  const next = nextCheckpointDate(state);
  const target = state.settings.targetDate;
  const daysToGo = target ? daysBetween(today(), target) : undefined;

  return (
    <div className="assess-hub">
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="btn ghost" onClick={onExit}>← Home</button>
      </div>
      <div className="card">
        <h1><Icon name="clipboard" /> Test practice</h1>
        <p>Practice for the <strong>{COURSE_BY_ID[eoc].name} End-of-Course test</strong>. No hints, no "right" or "wrong" until the end, just like the real thing.{eoc !== (state.settings.course ?? "m1") ? ` (${COURSE_BY_ID[state.settings.course ?? "m1"].short} has no EOC of its own, so this practices the nearest one.)` : ""}</p>
        <p className="feedback info small" style={{ margin: 0 }}>ℹ️ {HONEST}</p>
        {daysToGo !== undefined && daysToGo > 0 && <p className="muted small" style={{ margin: "10px 0 0" }}>🎯 Goal date: {fmtDate(target)} ({daysToGo} days to go)</p>}
      </div>

      <div className="grid2">
        <div className="card assess-option">
          <h2>⚡ Quick practice</h2>
          <p className="muted">{ASSESS_SPEC["screener-quick"].count} questions · about {ASSESS_SPEC["screener-quick"].minutes} minutes</p>
          <p className="small">A shorter mix with the same balance of topics. Good for a busy week.</p>
          <button className="btn primary" onClick={() => go("screener-quick")} autoFocus={!due}>Start quick practice</button>
        </div>
        <div className="card assess-option">
          <h2><Icon name="clipboard" /> Full practice</h2>
          <p className="muted">{ASSESS_SPEC["screener-full"].count} questions · {ASSESS_SPEC["screener-full"].minutes / 60} hours</p>
          <p className="small">Full length, like the real test{eoc === "m1" ? ", including the calculator-off section at the start" : ""}.</p>
          <button className="btn" onClick={() => go("screener-full")}>Start full practice</button>
        </div>
      </div>

      <div className="card">
        <h2>Your practice tests</h2>
        {screeners.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>No practice tests yet. Your scores will show up here so you can see your progress.</p>
        ) : (
          <>
            <TrendChart results={screeners.slice(-10)} />
            <HistoryList results={[...screeners].reverse()} />
          </>
        )}
      </div>

      <div className={`card ${due ? "assess-due" : ""}`}>
        <h2><Icon name="calendar" /> Monthly checkpoint</h2>
        <p className="small">One question from each of the {unitCount} units of {COURSE_BY_ID[state.settings.course ?? "m1"].name}, no timer. Once a month, so you can see how much you've grown.</p>
        {due ? (
          <div className="row">
            <strong className="grow">Your checkpoint is ready! (about 15 min)</strong>
            <button className="btn primary" onClick={() => go("checkpoint")} autoFocus>Start checkpoint</button>
          </div>
        ) : next ? (
          <p className="muted" style={{ margin: 0 }}>Next checkpoint opens on <strong>{fmtDate(next)}</strong>.</p>
        ) : !checkpointEligible(state) ? (
          <p className="muted" style={{ margin: 0 }}>Your first checkpoint opens after 3 runs (or a skip-ahead check).</p>
        ) : null}
        {cps.length > 0 && (
          <>
            <h3 style={{ marginTop: 14 }}>Past checkpoints</h3>
            <HistoryList results={[...cps].reverse()} />
          </>
        )}
      </div>
    </div>
  );
}

function TrendChart({ results }: { results: AssessmentResult[] }) {
  const W = 30, gap = 10, H = 90;
  const width = results.length * (W + gap) + gap + 28;
  return (
    <figure className="assess-trend" aria-label="practice test scores, oldest to newest">
      <svg viewBox={`0 0 ${width} ${H + 34}`} width={width} height={H + 34} role="img">
        {[0, 60, 80, 100].map((p) => (
          <g key={p}>
            <line x1={26} x2={width} y1={10 + H - (p / 100) * H} y2={10 + H - (p / 100) * H} className={p === 80 ? "goal" : "gridline"} />
            <text x={22} y={14 + H - (p / 100) * H} textAnchor="end" className="axis">{p}</text>
          </g>
        ))}
        {results.map((r, i) => {
          const { pct } = scoreOf(r);
          const h = Math.max(2, (pct / 100) * H);
          const x = 28 + gap + i * (W + gap);
          return (
            <g key={r.id}>
              <title>{`${fmtDate(r.date)} · ${KIND_LABEL[r.kind]} · ${pct}%`}</title>
              <rect x={x} y={10 + H - h} width={W} height={h} rx={5} className={`bar ${readinessBand(pct).id}`} />
              <text x={x + W / 2} y={6 + H - h} textAnchor="middle" className="val">{pct}</text>
              <text x={x + W / 2} y={H + 28} textAnchor="middle" className="axis">{r.kind === "screener-full" ? "F" : "Q"}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="small muted">Scores in %, oldest to newest (F = full, Q = quick). The dashed line is 80%.</figcaption>
    </figure>
  );
}

function HistoryList({ results }: { results: AssessmentResult[] }) {
  return (
    <ul className="assess-history">
      {results.map((r) => {
        const { right, total, pct } = scoreOf(r);
        const missed = r.items.filter((i) => !i.ok);
        return (
          <li key={r.id}>
            <details>
              <summary>
                <span className="date">{fmtDate(r.date)}</span>
                <span className="grow">{KIND_LABEL[r.kind]}</span>
                <span className="score">{right}/{total} · {pct}%</span>
                <span className="muted small">{r.minutes} min</span>
              </summary>
              <div className="small">
                {topicScores(r.items).map((t) => (
                  <div key={t.topic.id} className="hist-topic">{t.topic.title}: <strong>{t.right}/{t.total}</strong></div>
                ))}
                {missed.length > 0 && <p className="muted" style={{ margin: "6px 0 0" }}>{missed.length} question{missed.length === 1 ? "" : "s"} to learn from{r.kind === "checkpoint" ? "" : " (the missed ones went into your mistake journal)"}.</p>}
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}

// ====================================================================
// Taking a test
// ====================================================================

type Phase = "intro" | "test" | "finish" | "results";

interface Finished {
  scored: ScoredItem[];
  secsUsed: number;
  timeUp: boolean;
  stars: number;
  result: AssessmentResult;
  prev?: AssessmentResult;
}

/** DEV only: `?assessSecs=20` shortens the timer so the time-up path can be tried quickly. */
function devLimitSecs(): number | null {
  if (!import.meta.env.DEV) return null;
  const v = Number(new URLSearchParams(window.location.search).get("assessSecs"));
  return v > 0 ? v : null;
}

const sameResponse = (a: Response | null, b: Response | null) => JSON.stringify(a) === JSON.stringify(b);

function TestFlow({ state, mutate, kind, onExit, go, openTopic }: {
  state: AppState;
  mutate: Mutate;
  kind: AssessKind;
  onExit: () => void;
  go: (k?: AssessKind) => void;
  openTopic?: (topicId: string) => void;
}) {
  const spec = ASSESS_SPEC[kind];
  const timed = spec.minutes > 0;
  const [phase, setPhase] = useState<Phase>("intro");
  const [useTimer, setUseTimer] = useState(timed);
  const [items, setItems] = useState<TestItem[]>([]);
  const [responses, setResponses] = useState<(Response | null)[]>([]);
  const [flags, setFlags] = useState<boolean[]>([]);
  const [idx, setIdx] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [warned, setWarned] = useState<"no" | "showing" | "closed">("no");
  const [quitting, setQuitting] = useState(false);
  const [calc, setCalc] = useState(false);
  const [done, setDone] = useState<Finished | null>(null);
  const secsRef = useRef<number[]>([]);
  const enteredAt = useRef(0);
  /** What's typed in the current question's boxes but not saved yet. */
  const draftRef = useRef<Response | null>(null);
  const limitSecs = devLimitSecs() ?? spec.minutes * 60;
  const timerOn = timed && useTimer;
  const problems = useMemo(() => items.map(problemFor), [items]);

  const start = () => {
    const picked = pickItems(state, kind, randomSeed());
    setItems(picked);
    setResponses(picked.map(() => null));
    setFlags(picked.map(() => false));
    secsRef.current = picked.map(() => 0);
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    enteredAt.current = t;
    setIdx(0);
    setPhase("test");
    window.scrollTo({ top: 0 });
  };

  /** Add the time spent on the current screen, and keep anything typed but not saved. */
  const leaveCurrent = useCallback((): (Response | null)[] => {
    const t = Date.now();
    if (phase === "test") secsRef.current[idx] = (secsRef.current[idx] ?? 0) + (t - enteredAt.current) / 1000;
    enteredAt.current = t;
    let next = responses;
    const d = draftRef.current;
    if (phase === "test" && d && !sameResponse(d, responses[idx])) {
      next = responses.map((r, i) => (i === idx ? d : r));
      setResponses(next);
    }
    draftRef.current = null;
    return next;
  }, [phase, idx, responses]);

  const goTo = (i: number) => {
    leaveCurrent();
    setIdx(Math.max(0, Math.min(items.length - 1, i)));
    setPhase("test");
    setQuitting(false);
    window.scrollTo({ top: 0 });
  };

  const finish = useCallback((timeUp: boolean) => {
    const final = leaveCurrent();
    const scored = scoreTest(items, items.map((_, i) => ({ response: final[i], flagged: flags[i], secs: secsRef.current[i] ?? 0 })));
    const secsUsed = Math.min(timerOn ? limitSecs : Infinity, Math.round((Date.now() - startedAt) / 1000));
    let out: Finished | null = null;
    mutate((s) => {
      const prev = kind === "checkpoint" ? lastCheckpoint(s) : undefined;
      const { result, stars } = saveTest(s, kind, scored, secsUsed);
      out = { scored, secsUsed, timeUp, stars, result, prev };
    });
    setDone(out);
    setCalc(false);
    setPhase("results");
    window.scrollTo({ top: 0 });
  }, [leaveCurrent, items, flags, timerOn, limitSecs, startedAt, mutate, kind]);

  // Clock.
  const running = phase === "test" || phase === "finish";
  useEffect(() => {
    if (!running || !timerOn) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [running, timerOn]);
  const left = timerOn ? secondsLeft(limitSecs, startedAt, now) : Infinity;
  useEffect(() => {
    if (!running || !timerOn) return;
    if (left <= 0) finish(true);
    else if (left <= WARN_SECS && limitSecs > WARN_SECS && warned === "no") setWarned("showing");
  }, [left, running, timerOn, finish, warned, limitSecs]);

  if (phase === "intro") return <Intro kind={kind} useTimer={useTimer} setUseTimer={setUseTimer} onStart={start} onBack={() => go()} />;
  if (phase === "results" && done) return <Results kind={kind} done={done} timed={timerOn} go={go} onExit={onExit} openTopic={openTopic} />;

  const answered = responses.filter(Boolean).length;
  const problem = problems[idx];
  const item = items[idx];
  const topic = TOPIC_BY_ID[item.topic];
  const last = idx === items.length - 1;

  return (
    <div className="assess-test">
      <div className="assess-head">
        <strong className="assess-title">{spec.icon} {kind === "checkpoint" ? spec.title : "Practice test"}</strong>
        <span className="muted small">{answered} of {items.length} answered</span>
        <span className="grow" />
        {timerOn && (
          <span className={`chip assess-clock ${left <= WARN_SECS ? "warn" : ""}`} role="timer" aria-label={`${fmtClock(left)} left`} title="time left">⏱️ {fmtClock(left)}</span>
        )}
        {items[idx]?.noCalc ? (
          <span className="chip" title="Like the real Math 1 EOC, the first section is calculator-off.">Calculator off</span>
        ) : (
          <>
            <button className="btn ghost" onClick={() => setCalc((c) => !c)} aria-label="calculator" aria-pressed={calc}><Icon name="calc" /></button>
            <a className="btn ghost" href="https://www.desmos.com/calculator" target="_blank" rel="noreferrer">Graphing calculator</a>
          </>
        )}
        <button className="btn ghost" aria-label="quit test" onClick={() => setQuitting(true)}>✕</button>
      </div>

      {quitting && (
        <div className="card assess-confirm" role="alertdialog" aria-label="Leave the test?">
          <strong>Leave this test?</strong>
          <p className="small" style={{ margin: "4px 0 10px" }}>Your answers won't be saved and this test won't count. You can start a new one any time.</p>
          <div className="row">
            <button className="btn primary" autoFocus onClick={() => setQuitting(false)}>Keep going</button>
            <button className="btn ghost" onClick={() => go()}>Leave test</button>
          </div>
        </div>
      )}

      {warned === "showing" && (
        <div className="feedback warn row assess-warn" role="status">
          <span className="grow">⏰ 5 minutes left. Take a breath. Answer what you can, then check your 🚩 flagged ones.</span>
          <button className="btn ghost" onClick={() => setWarned("closed")}>OK</button>
        </div>
      )}

      <nav className="assess-nav" aria-label="questions">
        {items.map((_, i) => {
          const cls = [responses[i] ? "answered" : "open", flags[i] ? "flagged" : "", i === idx && phase === "test" ? "current" : ""].join(" ");
          return (
            <button key={i} className={`qnum ${cls}`} onClick={() => goTo(i)} aria-current={i === idx && phase === "test" ? "step" : undefined}
              aria-label={`Question ${i + 1}${responses[i] ? ", answered" : ", not answered"}${flags[i] ? ", flagged" : ""}`}>
              {i + 1}
              {flags[i] && <span className="flag" aria-hidden>🚩</span>}
            </button>
          );
        })}
        <span className="assess-legend small muted"><span className="dot answered" /> answered <span className="dot open" /> not yet 🚩 flagged</span>
      </nav>

      {phase === "finish" ? (
        <FinishReview responses={responses} flags={flags} onGo={goTo} onBack={() => setPhase("test")} onFinish={() => finish(false)} />
      ) : (
        <div className="card assess-q" data-test-answer={import.meta.env.DEV ? JSON.stringify(canonicalResponse(problem.answer)) : undefined} data-range={import.meta.env.DEV && problem.answer.kind === "point" ? JSON.stringify({ min: problem.answer.min, max: problem.answer.max }) : undefined}>
          <div className="row assess-qhead">
            <span className="chip">Question {idx + 1} of {items.length}</span>
            {kind === "checkpoint" && <span className="muted small">{topic.title}</span>}
            <span className="grow" />
            {flags[idx] && <span className="small flagged-note">🚩 Flagged for review</span>}
          </div>
          <MathText text={problem.prompt} as="div" className="prompt assess-prompt" />
          {problem.visual && <Visual v={problem.visual} />}
          <TestAnswer
            key={`${idx}`}
            problem={problem}
            saved={responses[idx]}
            onDraft={(d) => (draftRef.current = d)}
            onSave={(r) => {
              draftRef.current = null;
              setResponses((all) => all.map((x, i) => (i === idx ? r : x)));
            }}
            nextLabel={last ? "Finish" : "Next"}
          />
          <div className="row assess-actions">
            <button className="btn ghost" disabled={idx === 0} onClick={() => goTo(idx - 1)}>← Previous</button>
            <button className={`btn ghost ${flags[idx] ? "on" : ""}`} aria-pressed={flags[idx]} onClick={() => setFlags((f) => f.map((x, i) => (i === idx ? !x : x)))}>
              🚩 {flags[idx] ? "Unflag" : "Flag for review"}
            </button>
            <span className="grow" />
            {!responses[idx] && !last && <button className="btn ghost" onClick={() => { draftRef.current = null; goTo(idx + 1); }}>Skip</button>}
            {last ? (
              <button className="btn primary assess-next" onClick={() => { leaveCurrent(); setPhase("finish"); }}>Finish test →</button>
            ) : (
              <button className="btn primary assess-next" onClick={() => goTo(idx + 1)}>Next →</button>
            )}
          </div>
          {!last && (
            <div className="assess-finish-link">
              <button className="btn link small" onClick={() => { leaveCurrent(); setPhase("finish"); }}>I'm done, finish the test</button>
            </div>
          )}
        </div>
      )}
      {calc && <Calculator onClose={() => setCalc(false)} />}
    </div>
  );
}

function Intro({ kind, useTimer, setUseTimer, onStart, onBack }: { kind: AssessKind; useTimer: boolean; setUseTimer: (v: boolean) => void; onStart: () => void; onBack: () => void }) {
  const spec = ASSESS_SPEC[kind];
  const timed = spec.minutes > 0;
  return (
    <div className="card assess-intro">
      <h1>{spec.icon} {spec.title}</h1>
      {kind === "checkpoint" ? (
        <>
          <p><strong>One question from each unit</strong> of your course. No timer. Take your time.</p>
          <p>Some topics might be new to you. That's fine! Give it your best try, or skip it. Next month you can see how much you've grown.</p>
        </>
      ) : (
        <>
          <p><strong>{spec.count} questions</strong>{timed && useTimer ? <>, <strong>{spec.minutes} minutes</strong></> : ""}. On the Math 1 practice, the first questions are calculator-off, like the real EOC.</p>
          <p className="feedback info small">ℹ️ {HONEST}</p>
        </>
      )}
      <ul className="assess-tips">
        <li>No hints and no "right or wrong" until the end, just like a real test.</li>
        <li>Stuck? <strong>Skip</strong> it and come back later. Unsure? <strong>🚩 Flag</strong> it to check again.</li>
        <li>You can change any answer before you finish.</li>
        <li>Some questions may be about things you haven't learned yet. That's normal on a test like this.</li>
      </ul>
      {timed && (
        <label className="assess-toggle">
          <input type="checkbox" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} />
          Use a timer ({spec.minutes} minutes)
        </label>
      )}
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn ghost" onClick={onBack}>← Back</button>
        <span className="grow" />
        <button className="btn primary big" autoFocus onClick={onStart}>Start →</button>
      </div>
    </div>
  );
}

function FinishReview({ responses, flags, onGo, onBack, onFinish }: { responses: (Response | null)[]; flags: boolean[]; onGo: (i: number) => void; onBack: () => void; onFinish: () => void }) {
  const open = responses.map((r, i) => (r ? -1 : i)).filter((i) => i >= 0);
  const flagged = flags.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
  const list = (ix: number[]) => ix.map((i) => <button key={i} className="qnum small-q" onClick={() => onGo(i)}>{i + 1}</button>);
  return (
    <div className="card assess-finish" role="region" aria-label="finish the test">
      <h2>Ready to finish?</h2>
      <p>You answered <strong>{responses.length - open.length} of {responses.length}</strong> questions.</p>
      {open.length > 0 && (
        <div className="feedback warn">
          <div>{open.length} not answered yet. They'll count as skipped.</div>
          <div className="row" style={{ gap: 6, marginTop: 6 }}>{list(open)}</div>
        </div>
      )}
      {flagged.length > 0 && (
        <div className="feedback info">
          <div>🚩 {flagged.length} flagged for review.</div>
          <div className="row" style={{ gap: 6, marginTop: 6 }}>{list(flagged)}</div>
        </div>
      )}
      {open.length === 0 && flagged.length === 0 && <p className="muted">Every question has an answer. Nice!</p>}
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn ghost" onClick={onBack}>← Go back</button>
        <span className="grow" />
        <button className="btn primary big" autoFocus onClick={onFinish}>Finish and see my score</button>
      </div>
    </div>
  );
}

// ---------- Answer boxes that save without checking ----------

function responseToTexts(answer: Answer, saved: Response | null): string[] {
  if (answer.kind === "number") return [saved?.kind === "number" ? saved.text : ""];
  if (answer.kind === "expr") return [saved?.kind === "expr" ? saved.text : ""];
  if (answer.kind === "multi") return saved?.kind === "multi" ? saved.texts : answer.fields.map(() => "");
  return [];
}

function TestAnswer({ problem, saved, onSave, onDraft, nextLabel }: {
  problem: Problem;
  saved: Response | null;
  onSave: (r: Response | null) => void;
  onDraft: (r: Response | null) => void;
  nextLabel: string;
}) {
  const a = problem.answer;
  const [texts, setTexts] = useState(() => responseToTexts(a, saved));
  const [msg, setMsg] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const textResponse = (t: string[]): Response | null => {
    if (a.kind === "number") return t[0].trim() ? { kind: "number", text: t[0] } : null;
    if (a.kind === "expr") return t[0].trim() ? { kind: "expr", text: t[0] } : null;
    if (a.kind === "multi") return t.every((x) => x.trim()) ? { kind: "multi", texts: t } : null;
    return null;
  };
  const draft = textResponse(texts);
  const dirty = (a.kind === "number" || a.kind === "multi" || a.kind === "expr") && !!draft && !sameResponse(draft, saved);

  const change = (t: string[]) => {
    setTexts(t);
    setMsg(null);
    const r = textResponse(t);
    onDraft(r && !sameResponse(r, saved) ? r : null);
  };

  const saveTyped = () => {
    if (!draft) return;
    const bad = unreadable(problem, draft);
    if (bad) {
      setMsg(bad);
      return;
    }
    onSave(draft);
    // Enter again moves on.
    setTimeout(() => (document.querySelector(".assess-next") as HTMLButtonElement | null)?.focus(), 0);
  };

  const pick = useCallback((r: Response) => {
    onSave(r);
    setMsg(null);
  }, [onSave]);

  // Number keys pick a choice, as in practice.
  useEffect(() => {
    if (a.kind !== "choice") return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= a.choices.length && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) pick({ kind: "choice", index: n - 1 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [a, pick]);

  const status = saved ? (
    <span className="assess-saved" role="status">Saved ✓</span>
  ) : null;
  const clear = saved ? (
    <button className="btn link small" onClick={() => { onSave(null); setTexts(responseToTexts(a, null)); onDraft(null); }}>Clear my answer</button>
  ) : null;

  switch (a.kind) {
    case "number":
    case "expr":
    case "multi": {
      const fields = a.kind === "number" ? [{ pre: a.pre, post: a.unit }] : a.kind === "expr" ? [{ pre: a.lhs ? `${a.lhs} =` : a.pre, post: a.post }] : a.fields;
      return (
        <div>
          <form className="answer-row" onSubmit={(e) => { e.preventDefault(); saveTyped(); }}>
            {fields.map((f, i) => {
              const sup = f.pre?.endsWith("^");
              return (
                <span key={i} className="row" style={{ gap: 4 }}>
                  {f.pre && <strong>{sup ? f.pre.slice(0, -1) : f.pre}</strong>}
                  <input
                    ref={i === 0 ? firstRef : undefined}
                    className={`answer-input ${a.kind === "multi" ? "sm" : ""}`}
                    style={sup ? { width: 64, fontSize: "0.95rem", padding: "4px 8px", transform: "translateY(-12px)" } : undefined}
                    value={texts[i]}
                    onChange={(e) => change(texts.map((x, k) => (k === i ? e.target.value : x)))}
                    autoComplete="off"
                    aria-label={fields.length === 1 ? "your answer" : `answer box ${i + 1}`}
                    placeholder={fields.length === 1 ? "answer" : undefined}
                  />
                  {f.post && <strong>{f.post}</strong>}
                </span>
              );
            })}
            <button className="btn" disabled={!draft || !dirty}>Save answer</button>
            {!dirty && status}
          </form>
          <div className="row small assess-under">
            {dirty ? <span className="muted">Not saved yet: press Enter or Save. (Going to {nextLabel === "Next" ? "the next question" : "finish"} saves it too.)</span> : <span className="kbd">{a.kind === "expr" ? "Use ^ for powers (x^2), sqrt( ) for roots, and parentheses for groups." : "Fractions like 3/4 or 1 1/2 are OK. Use − or - for negatives."}</span>}
            {clear}
          </div>
          {msg && <div className="feedback warn">{msg}</div>}
        </div>
      );
    }
    case "choice": {
      const picked = saved?.kind === "choice" ? saved.index : -1;
      return (
        <div>
          <div className="choices" role="radiogroup" aria-label="choices">
            {a.choices.map((c, i) => (
              <button key={i} role="radio" aria-checked={picked === i} className={`choice ${picked === i ? "picked" : ""}`} onClick={() => pick({ kind: "choice", index: i })}>
                <span className="key">{i + 1}</span>
                <MathText text={c} />
              </button>
            ))}
          </div>
          <div className="row small assess-under">{status ?? <span className="kbd">Click a choice or press its number key.</span>}{clear}</div>
        </div>
      );
    }
    case "point": {
      const sel = saved?.kind === "point" ? { x: saved.x, y: saved.y } : null;
      return (
        <div>
          <div className="visual">
            <Grid min={a.min} max={a.max} points={a.extraPoints} polygon={a.polygon} lines={a.lines} selected={sel} onPick={(p) => pick({ kind: "point", x: p.x, y: p.y })} />
          </div>
          <div className="row small assess-under">
            <span className="muted">{sel ? `You picked (${sel.x}, ${sel.y})`.replace(/-/g, "−") : "Click a point on the grid."}</span>
            {status}
            {clear}
          </div>
        </div>
      );
    }
  }
}

// ====================================================================
// Results
// ====================================================================

const CHANGE_MARK: Record<Change, { sym: string; label: string }> = {
  up: { sym: "↑", label: "newly right" },
  down: { sym: "↓", label: "missed this time" },
  same: { sym: "=", label: "same as last time" },
};

function Results({ kind, done, timed, go, onExit, openTopic }: {
  kind: AssessKind;
  done: Finished;
  timed: boolean;
  go: (k?: AssessKind) => void;
  onExit: () => void;
  openTopic?: (topicId: string) => void;
}) {
  const { scored, secsUsed, timeUp, stars, result, prev } = done;
  const { right, total, pct } = scoreOf(result);
  const band = readinessBand(pct);
  const [reviewing, setReviewing] = useState(false);
  const cmp = kind === "checkpoint" ? compareCheckpoints(prev, result) : null;
  const { strongest, weakest } = strongWeak(result.items);
  const toReview = scored.map((x, i) => ({ ...x, n: i + 1 })).filter((x) => !x.ok);
  const skipped = scored.filter((x) => x.skipped).length;
  const units = TOPICS.filter((t) => scored.some((x) => x.item.topic === t.id));

  return (
    <div className="assess-results">
      {timeUp && <div className="feedback warn" role="status">⏰ Time's up! Questions you didn't get to count as skipped.</div>}
      <div className={`card assess-score ${kind === "checkpoint" ? "" : band.id}`}>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <div className="grow">
            <h1 style={{ marginBottom: 4 }}><Icon name={kind === "checkpoint" ? "calendar" : "clipboard"} size={30} /> {kind === "checkpoint" ? "Checkpoint done!" : "Practice test done!"}</h1>
            {kind === "checkpoint" ? (
              cmp?.before !== undefined ? (
                <p className="assess-compare">Last time {cmp.before}/{total} → now <strong>{cmp.after}/{total}</strong>{cmp.after > cmp.before ? " 🎉" : ""}</p>
              ) : (
                <p className="assess-compare">This is your starting line. Next month you'll see how far you've come.</p>
              )
            ) : (
              <p className="assess-band"><strong>{band.label}.</strong> {band.text}</p>
            )}
          </div>
          <div className="assess-big" aria-label={`${right} out of ${total} right`}>
            <div className="num">{right}/{total}</div>
            <div className="pct">{pct}%</div>
          </div>
        </div>
        <div className="row small muted">
          <span>⏱️ {fmtClock(secsUsed)} {timed ? `of ${fmtClock(ASSESS_SPEC[kind].minutes * 60)}` : ""} used</span>
          {skipped > 0 && <span>· {skipped} skipped</span>}
          <span className="chip mono">+{stars} XP</span>
        </div>
        {kind !== "checkpoint" && <p className="small muted" style={{ margin: "8px 0 0" }}>Remember: this is practice, not the real EOC. The score shows what to practice next, nothing more.</p>}
      </div>

      {(strongest.length > 0 || weakest.length > 0) && (
        <div className="grid2">
          {strongest.length > 0 && (
            <div className="card tight">
              <div className="small muted">💪 Strongest</div>
              {strongest.map((t) => (
                <div key={t.topic.id} className="assess-sw"><strong>{t.topic.title}</strong> <span className="small muted">{t.right} of {t.total} right</span></div>
              ))}
            </div>
          )}
          {weakest.length > 0 && (
            <div className="card tight">
              <div className="small muted">🌱 Most room to grow</div>
              {weakest.map((t) => (
                <div key={t.topic.id} className="assess-sw row">
                  <span className="grow"><strong>{t.topic.title}</strong> <span className="small muted">{t.right} of {t.total} right</span></span>
                  {openTopic && <button className="btn ghost" onClick={() => openTopic(t.topic.id)}>Practice this topic</button>}
                </div>
              ))}
              {!openTopic && <div className="small muted" style={{ marginTop: 6 }}>Find {weakest.length === 1 ? "it" : "them"} on <strong>My Map</strong> to practice.</div>}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>By topic</h2>
        {[COURSE_BY_ID[TOPIC_BY_ID[units[0]?.id]?.course ?? "m1"].name].map((g) => (
          <div key={g} className="assess-grade">
            <h3>{g}</h3>
            {units.map((t) => {
              const mine = scored.map((x, i) => ({ ...x, n: i + 1 })).filter((x) => x.item.topic === t.id);
              const ch = cmp?.topics[t.id];
              return (
                <div key={t.id} className="assess-topic-row">
                  <span className="grow">Unit {t.unit} · {t.title}</span>
                  <span className="marks">
                    {mine.map((x) => (
                      <span key={x.n} className={`mark ${x.ok ? "ok" : x.skipped ? "skip" : "miss"}`} title={`Question ${x.n}: ${x.ok ? "right" : x.skipped ? "skipped" : "missed"}`}>
                        {x.ok ? "✓" : x.skipped ? "–" : "✗"}
                      </span>
                    ))}
                  </span>
                  {ch && <span className={`change ${ch}`} title={CHANGE_MARK[ch].label} aria-label={CHANGE_MARK[ch].label}>{CHANGE_MARK[ch].sym}</span>}
                </div>
              );
            })}
          </div>
        ))}
        <p className="small muted" style={{ margin: "8px 0 0" }}>✓ right · ✗ missed · – skipped{cmp?.before !== undefined ? " · ↑ newly right · ↓ missed this time · = same as last time" : ""}</p>
      </div>

      {toReview.length > 0 && (
        <div className="card">
          <div className="row">
            <h2 className="grow" style={{ margin: 0 }}>Learn from the tricky ones</h2>
            <button className="btn" aria-expanded={reviewing} onClick={() => setReviewing((r) => !r)}>{reviewing ? "Hide" : "Review my answers"} ({toReview.length})</button>
          </div>
          {reviewing && (
            <div className="assess-review">
              {toReview.map((x) => (
                <div key={x.n} className="assess-review-item">
                  <div className="small muted">Question {x.n} · {TOPIC_BY_ID[x.item.topic].title}</div>
                  <MathText text={x.problem.prompt} as="div" className="prompt" />
                  {x.problem.visual && <Visual v={x.problem.visual} />}
                  <div className="row small">
                    <span className="given">{x.skipped ? "You skipped this one." : <>Your answer: <MathText text={x.given} /></>}</span>
                    <span className="right-ans">Correct answer: <strong><MathText text={x.correct} /></strong></span>
                  </div>
                  <SolutionSteps steps={x.problem.steps} stepwise={false} />
                </div>
              ))}
              {kind !== "checkpoint" && <p className="small muted">The ones you missed are in your 🛠️ mistake journal, so you'll get to try them again with new numbers.</p>}
              {kind === "checkpoint" && <p className="small muted">Missed ones are in your 🛠️ mistake journal too.</p>}
            </div>
          )}
        </div>
      )}

      <div className="row">
        <button className="btn ghost" onClick={() => go()}><Icon name="clipboard" /> Test practice</button>
        <span className="grow" />
        <button className="btn primary big" autoFocus onClick={onExit}>Back home</button>
      </div>
    </div>
  );
}
