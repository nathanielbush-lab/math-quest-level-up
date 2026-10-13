import { useEffect, useRef, useState } from "react";
import { SKILL_BY_ID } from "../content";
import type { Problem, Skill, WhyChoice, WhyWritten } from "../content/types";
import { makeRng } from "../lib/rng";
import type { Level } from "../content/types";
import { answerText } from "../engine/check";
import { MAX_ROUNDS, grade as gradeIt, isFinalRound, type GradeResult, type PriorRound } from "../grading/types";
import { MathText, speak } from "./MathText";
import { ProblemCard, type ProblemResult } from "./ProblemCard";
import { cleanSteps } from "./SolutionSteps";
import { Grid, Visual } from "./Visual";
import { Icon } from "./Icon";
import { CoachMark } from "./Coach";

function useEnterToContinue(fn: () => void, enabled = true) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (enabled) ref.current?.focus();
  }, [enabled]);
  return { ref, onClick: fn };
}

export function LessonCard({ skill, recap, readAloud, onDone }: { skill: Skill; recap: boolean; readAloud: boolean; onDone: () => void }) {
  const btn = useEnterToContinue(onDone);
  const { lesson } = skill;
  return (
    <div className="card">
      <div className="row">
        <span className="chip"><Icon name="book" /> {recap ? "Quick recap" : "New idea"}</span>
        <span className="muted small grow">{skill.title}</span>
        {readAloud && <button className="btn ghost" aria-label="read aloud" onClick={() => speak([lesson.bigIdea, ...lesson.explain].join(" "))}>🔊</button>}
      </div>
      <p className="bigidea" style={{ marginTop: 12 }}><MathText text={lesson.bigIdea} /></p>
      {lesson.explain.map((t, i) => <MathText key={i} as="p" text={t} />)}
      {lesson.visual && <Visual v={lesson.visual} />}
      {lesson.tip && <p className="tip">⭐ <MathText text={lesson.tip} /></p>}
      <div className="row"><span className="grow" /><button className="btn primary big" {...btn}>Show me an example →</button></div>
    </div>
  );
}

export function WorkedExample({ skill, seed, level, onDone }: { skill: Skill; seed: number; level: Level; onDone: () => void }) {
  const [problem] = useState<Problem>(() => skill.generate(makeRng(seed), level));
  const steps = cleanSteps(problem.steps);
  const [shown, setShown] = useState(1);
  const all = shown >= steps.length;
  const btn = useEnterToContinue(all ? onDone : () => setShown((n) => n + 1));
  return (
    <div className="card">
      <span className="chip"><CoachMark size={24} /> Worked example</span>
      <MathText text={problem.prompt} as="div" className="prompt" />
      {problem.visual && problem.answer.kind !== "point" && <Visual v={problem.visual} />}
      {problem.answer.kind === "point" && (
        // Point questions draw their grid inside the answer box, so show it here too, with the answer once it's reached.
        <div className="visual">
          <Grid min={problem.answer.min} max={problem.answer.max} points={problem.answer.extraPoints} polygon={problem.answer.polygon} lines={problem.answer.lines} mark={all ? { x: problem.answer.x, y: problem.answer.y, ok: true } : null} />
        </div>
      )}
      <ol className="steps">{steps.slice(0, shown).map((s, i) => <li key={i} className="celebrate"><MathText text={s} /></li>)}</ol>
      {all && <div className="feedback info">Answer: <MathText text={answerText(problem.answer)} /></div>}
      <div className="row">
        {!all && <span className="small muted">Can you guess the next step?</span>}
        <span className="grow" />
        {!all && <button className="btn ghost" onClick={() => setShown(steps.length)}>Show all</button>}
        <button className="btn primary" {...btn}>{all ? "Your turn →" : "Next step ▸"}</button>
      </div>
    </div>
  );
}

export function WhyCard({ skill, onDone }: { skill: Skill; onDone: (ok: boolean) => void }) {
  const why = skill.why.find((w): w is WhyChoice => w.kind === "choice")!;
  const [pick, setPick] = useState<number | null>(null);
  const ok = pick === why.correct;
  const btn = useEnterToContinue(() => onDone(ok), pick !== null);
  return (
    <div className="card">
      <span className="chip"><Icon name="bulb" /> Why does it work?</span>
      <MathText text={why.prompt} as="div" className="prompt" />
      {why.visual && <Visual v={why.visual} />}
      <div className="choices">
        {why.choices.map((c, i) => (
          <button key={i} className={`choice ${pick !== null && i === why.correct ? "right" : pick === i ? "wrong" : ""}`} disabled={pick !== null} onClick={() => setPick(i)}>
            <span className="key">{i + 1}</span><MathText text={c} />
          </button>
        ))}
      </div>
      {pick !== null && <div className={`feedback ${ok ? "good" : "info"}`}>{ok ? "Exactly! " : "Here's the reason: "}<MathText text={why.explain} /></div>}
      {pick !== null && <div className="row"><span className="grow" /><button className="btn primary" {...btn}>Continue →</button></div>}
    </div>
  );
}

export interface ExplainOutcome {
  response: string;
  grade: GradeResult | null;
  error?: string;
  /** Every graded draft, oldest first. */
  rounds: PriorRound[];
}

const VERDICT_LEAD: Record<GradeResult["verdict"], string> = { got_it: "🌟 Great explanation! ", almost: "Almost there! ", not_yet: "Good start! " };

/**
 * Write → feedback → revise, for as many rounds as it takes (at most MAX_ROUNDS).
 * It ends as soon as Claude says she's got it, or after the last round, with a wrap-up:
 * how to make it stronger and a model explanation.
 */
export function ExplainCard({
  skill,
  apiKey,
  model,
  onDone,
}: {
  skill: Skill;
  apiKey?: string;
  model: string;
  onDone: (r: ExplainOutcome | null) => void;
}) {
  const why = skill.why.find((w): w is WhyWritten => w.kind === "written")!;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [rounds, setRounds] = useState<{ response: string; grade: GradeResult }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false); // no key or grading failed: kept for a grown-up
  const [stopped, setStopped] = useState(false); // she chose to finish before getting it
  const textRef = useRef<HTMLTextAreaElement>(null);

  const last = rounds[rounds.length - 1];
  const finished = saved || stopped || (!!last && isFinalRound(last.grade, rounds.length));
  const revising = !!last && !finished;
  const unchanged = revising && text.trim() === last.response.trim();

  const submit = async () => {
    if (!apiKey) {
      setSaved(true);
      return;
    }
    setBusy(true);
    setError(null);
    const previous: PriorRound[] = rounds.map((r) => ({ response: r.response, verdict: r.grade.verdict, feedback: r.grade.feedbackForStudent, guidingQuestion: r.grade.guidingQuestion }));
    const out = await gradeIt(apiKey, model, { skillTitle: skill.title, prompt: why.prompt, keyIdeas: why.keyIdeas, exemplar: why.exemplar, response: text, previous });
    setBusy(false);
    if (out.grade) setRounds([...rounds, { response: text, grade: out.grade }]);
    else if (rounds.length) setError(out.error ?? "Couldn't reach Claude.");
    else {
      setError(out.error ?? null);
      setSaved(true);
    }
  };

  const finish = () => {
    const all: PriorRound[] = rounds.map((r) => ({ response: r.response, verdict: r.grade.verdict, feedback: r.grade.feedbackForStudent, guidingQuestion: r.grade.guidingQuestion }));
    onDone({ response: last?.response ?? text, grade: last?.grade ?? null, error: error ?? undefined, rounds: all });
  };

  useEffect(() => {
    if (revising) textRef.current?.focus();
  }, [revising, rounds.length]);

  const wrap = last && finished && !saved ? last.grade : null;
  const model_ = wrap?.modelExplanation ?? (stopped || (wrap && wrap.verdict !== "got_it") ? why.exemplar : undefined);

  return (
    <div className="card">
      <div className="row">
        <span className="chip"><Icon name="chat" /> Explain it in your own words</span>
        <span className="grow" />
        {apiKey && rounds.length > 0 && <span className="small muted">Round {Math.min(rounds.length + (finished ? 0 : 1), MAX_ROUNDS)} of up to {MAX_ROUNDS}</span>}
      </div>
      <p className="muted small" style={{ marginTop: 8 }}>{skill.title}</p>
      <MathText text={why.prompt} as="div" className="prompt" />
      {why.visual && <Visual v={why.visual} />}

      {rounds.map((r, i) => {
        const isLast = i === rounds.length - 1;
        return (
          <div key={i} className="round">
            {(!isLast || finished) && <blockquote className="draft"><span className="small muted">{rounds.length > 1 ? `Draft ${i + 1}` : "Your explanation"}</span><br />{r.response}</blockquote>}
            <div className={`feedback ${r.grade.verdict === "got_it" ? "good" : isLast ? "warn" : "info"}`}>
              {VERDICT_LEAD[r.grade.verdict]}
              {r.grade.feedbackForStudent}
              {r.grade.guidingQuestion && !(isLast && finished) && <div style={{ marginTop: 6 }}>🤔 <strong>{r.grade.guidingQuestion}</strong></div>}
            </div>
          </div>
        );
      })}

      {!finished && (
        <>
          {revising && <p className="small" style={{ marginBottom: 4 }}><strong>Your turn:</strong> change your explanation below to answer the question, then send it again.</p>}
          <textarea ref={textRef} value={text} onChange={(e) => setText(e.target.value)} disabled={busy} placeholder="Write like you're teaching a friend. Use words, numbers, or both!" />
          {error && <div className="feedback info">{error}</div>}
          <div className="row" style={{ marginTop: 8 }}>
            {revising ? <button className="btn ghost" onClick={() => setStopped(true)}>I'm done, show me</button> : <button className="btn ghost" onClick={() => onDone(null)}>Skip for now</button>}
            <span className="grow" />
            <button className="btn primary" disabled={busy || text.trim().length < 15 || unchanged} onClick={submit}>
              {busy ? "Reading…" : revising ? "Send my new version" : "Submit"}
            </button>
          </div>
          {busy && <div className="feedback info">Reading your explanation… 🤔</div>}
        </>
      )}

      {wrap && (
        <div className="wrapup">
          {wrap.howToImprove && <p><strong>💡 To make it even stronger:</strong> <MathText text={wrap.howToImprove} /></p>}
          {model_ && <p><strong>Here's one way to say it:</strong> <MathText text={model_} /></p>}
        </div>
      )}
      {!wrap && stopped && model_ && <div className="wrapup"><p><strong>Here's one way to say it:</strong> <MathText text={model_} /></p></div>}
      {saved && <div className="feedback info">{error ? error + " " : ""}Saved! A grown-up will read it and give you feedback.</div>}
      {finished && (
        <div className="row"><span className="grow" /><button className="btn primary" onClick={saved ? () => onDone({ response: text, grade: null, error: error ?? undefined, rounds: [] }) : finish} autoFocus>Continue →</button></div>
      )}
    </div>
  );
}

/** A multi-part "unfamiliar problem" (challenge or mission). */
export function MultiPart({
  title,
  intro,
  parts,
  readAloud,
  onDone,
}: {
  title: string;
  intro: string;
  parts: (Problem & { section?: string })[];
  readAloud: boolean;
  onDone: (results: ProblemResult[]) => void;
}) {
  const [i, setI] = useState(0);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const p = parts[i];
  return (
    <div>
      <div className="card hero">
        <h2>🧩 {title}</h2>
        <MathText text={intro} as="p" />
        <div className="progressbar" style={{ background: "rgba(255,255,255,0.3)" }}><div style={{ width: `${(i / parts.length) * 100}%`, background: "#fff" }} /></div>
      </div>
      <ProblemCard
        key={i}
        problem={p}
        readAloud={readAloud}
        header={<div className="muted small" style={{ marginBottom: 6 }}>Part {i + 1} of {parts.length}{p.section ? ` · ${p.section}` : ""}</div>}
        onFinish={(r) => {
          const all = [...results, r];
          setResults(all);
          if (i + 1 >= parts.length) onDone(all);
          else setI(i + 1);
        }}
      />
    </div>
  );
}

export function skillOf(id: string) {
  return SKILL_BY_ID[id];
}
