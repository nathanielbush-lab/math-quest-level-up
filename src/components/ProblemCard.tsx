import { useEffect, useMemo, useRef, useState } from "react";
import type { Problem } from "../content/types";
import { answerText, canonicalResponse, check, type Response } from "../engine/check";
import { AnswerInput } from "./AnswerInput";
import { MathText, speak } from "./MathText";
import { SolutionSteps, scaffoldSteps } from "./SolutionSteps";
import { StuckButton } from "./Tutor";
import { FamilyIcon, Icon } from "./Icon";
import { CoachSays } from "./Coach";
import type { TopicFamily } from "../content/types";
import { Visual } from "./Visual";

export interface ProblemResult {
  ok: boolean;
  assisted: boolean;
  given: string;
  correct: string;
  /** Wrong tries before the end (0 = right first time). */
  tries: number;
  hints: number;
  secs: number;
  /** She asked the "I'm stuck" tutor. */
  tutor: boolean;
}

const PRAISE = ["Correct.", "Nailed it.", "That's it.", "Clean work.", "Exactly right.", "Got it.", "Yes. Locked in."];
const NUDGE = ["Not quite. Take another look.", "Close. Check your work and try again.", "Not yet. One more try."];

function describe(problem: Problem, r: Response): string {
  switch (r.kind) {
    case "number":
      return r.text;
    case "multi":
      return r.texts.join(" , ");
    case "choice":
      return problem.answer.kind === "choice" ? problem.answer.choices[r.index] : String(r.index);
    case "expr":
      return r.text;
    case "point":
      return `(${r.x}, ${r.y})`;
  }
}

/** One question with hints, two tries, targeted feedback and a worked solution. */
export function ProblemCard({
  problem,
  guided = false,
  placement = false,
  readAloud,
  onFinish,
  header,
  skillId,
  banner,
}: {
  problem: Problem;
  guided?: boolean;
  placement?: boolean;
  readAloud: boolean;
  onFinish: (r: ProblemResult) => void;
  header?: React.ReactNode;
  /** For labelling tutor chats. */
  skillId?: string;
  /** Topic-colored strip across the top of the card (the focused practice screen). */
  banner?: { family: TopicFamily; title: string; mode?: string };
}) {
  const [tries, setTries] = useState(0);
  const [hints, setHints] = useState(0);
  const [struck, setStruck] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ tone: "good" | "bad" | "warn" | "info"; text: string } | null>(null);
  const [result, setResult] = useState<ProblemResult | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [stepsDone, setStepsDone] = useState(false);
  const [mark, setMark] = useState<{ x: number; y: number; ok: boolean } | null>(null);
  const [tutorUsed, setTutorUsed] = useState(false);
  const [wrongs, setWrongs] = useState<string[]>([]);
  const shownAt = useRef(Date.now());
  const contRef = useRef<HTMLButtonElement>(null);
  const correctText = useMemo(() => answerText(problem.answer), [problem]);
  const scaffold = useMemo(() => (guided ? scaffoldSteps(problem.steps, problem.hints) : []), [guided, problem]);

  // While the solution is being stepped through, its "Next step" button keeps focus; Continue gets it afterwards.
  useEffect(() => {
    if (result && (!showSteps || stepsDone)) contRef.current?.focus();
  }, [result, showSteps, stepsDone]);

  const submit = (r: Response) => {
    const v = check(problem, r);
    if (r.kind === "point") setMark({ x: r.x, y: r.y, ok: v.verdict === "correct" });
    if (v.verdict === "invalid") {
      setFeedback({ tone: "warn", text: v.message ?? "Try entering a number." });
      return;
    }
    if (v.verdict === "almost") {
      setFeedback({ tone: "warn", text: v.message ?? "Almost!" });
      return;
    }
    const given = describe(problem, r);
    if (v.verdict === "correct") {
      const assisted = guided || hints > 0 || tries > 0 || tutorUsed;
      setFeedback({ tone: "good", text: placement ? "Got it!" : PRAISE[Math.floor(Math.random() * PRAISE.length)] + (tries > 0 ? " Fixing a mistake is how brains grow." : "") });
      setResult({ ok: true, assisted, given, correct: correctText, tries, hints, secs: Math.round((Date.now() - shownAt.current) / 1000), tutor: tutorUsed });
      return;
    }
    const n = tries + 1;
    setTries(n);
    setWrongs((w) => [...w, given]);
    if (r.kind === "choice") setStruck((s) => [...s, r.index]);
    const speedy = Date.now() - shownAt.current < 3500 && problem.prompt.length > 60 ? " Whoa, speedy! Read it once more, slowly." : "";
    if (placement || n >= 2) {
      setFeedback({ tone: "bad", text: placement ? "Not this time. That's OK, this just helps find your starting point!" : `${v.message ? v.message + " " : ""}The answer is ${correctText}. Let's look at how it works.` });
      setShowSteps(!placement);
      setResult({ ok: false, assisted: true, given, correct: correctText, tries: n, hints, secs: Math.round((Date.now() - shownAt.current) / 1000), tutor: tutorUsed });
      return;
    }
    setFeedback({ tone: "bad", text: (v.message ?? NUDGE[Math.floor(Math.random() * NUDGE.length)]) + speedy });
    if (r.kind === "point") setTimeout(() => setMark(null), 1200);
  };

  const done = !!result;
  return (
    <div className={`card ${banner ? `q-card fam-${banner.family}` : ""}`} data-test-answer={import.meta.env.DEV ? JSON.stringify(canonicalResponse(problem.answer)) : undefined} data-range={import.meta.env.DEV && problem.answer.kind === "point" ? JSON.stringify({ min: problem.answer.min, max: problem.answer.max }) : undefined}>
      {banner && (
        <div className="q-banner">
          <FamilyIcon family={banner.family} />
          <span>{banner.title}</span>
          {banner.mode && <span className="mode">{banner.mode}</span>}
        </div>
      )}
      <div className={banner ? "q-body" : undefined}>
      {header}
      <div className="row" style={{ alignItems: "flex-start" }}>
        <MathText text={problem.prompt} as="div" className="prompt grow" />
        {readAloud && <button className="btn ghost" aria-label="read aloud" onClick={() => speak(problem.prompt)}><Icon name="speaker" /></button>}
      </div>
      {problem.estimate && !done && <div className="estimate">🤔 <strong>Estimate first:</strong> <MathText text={problem.estimate} /></div>}
      {problem.visual && <Visual v={problem.visual} />}
      {scaffold.length > 0 && (
        <div className="hintbox">
          <strong>Let's do this one together. Here's the start:</strong>
          <ol className="steps">{scaffold.map((s, i) => <li key={i}><MathText text={s} /></li>)}</ol>
          <span className="small">Now finish it!</span>
        </div>
      )}
      <AnswerInput key={tries} answer={problem.answer} disabled={done} struck={struck} reveal={done} onSubmit={submit} pointMark={mark} />
      {hints > 0 && (
        <CoachSays className="hint">
          {problem.hints.slice(0, hints).map((h, i) => (
            <div key={i} className={i < hints - 1 ? "muted" : undefined} style={{ marginTop: i ? 6 : 0 }}>
              {i === hints - 1 && <strong>{hints === 1 ? "Hint: " : "Another hint: "}</strong>}
              <MathText text={h} />
            </div>
          ))}
        </CoachSays>
      )}
      {feedback && (
        <div className={`feedback ${feedback.tone} ${feedback.tone === "good" ? "celebrate" : ""}`} style={{ position: "relative" }}>
          <MathText text={feedback.text} />
          {feedback.tone === "good" && !placement && <StarBurst />}
        </div>
      )}
      <div className="row">
        {!done && !placement && hints < problem.hints.length && (
          <button className="btn ghost" onClick={() => setHints((h) => h + 1)}><Icon name="bulb" /> {hints ? "Another hint" : "Hint"}</button>
        )}
        {done && !placement && !showSteps && <button className="btn ghost" onClick={() => setShowSteps(true)}>See the solution</button>}
        {!done && !placement && <StuckButton problem={problem} skillId={skillId} wrongAnswers={wrongs} hintsShown={hints} onUsed={() => setTutorUsed(true)} />}
        <span className="grow" />
        {done && (
          <button ref={contRef} className="btn primary" onClick={() => onFinish(result!)}>Continue <Icon name="arrow" /></button>
        )}
      </div>
      {showSteps && <SolutionSteps steps={problem.steps} onAllShown={() => setStepsDone(true)} />}
      </div>
    </div>
  );
}

/** A little shower of stars when an answer is right. */
function StarBurst() {
  const stars = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const angle = -Math.PI / 2 + ((i - 4) / 4) * 1.1 + (Math.random() - 0.5) * 0.3;
        const dist = 70 + Math.random() * 60;
        return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, delay: Math.random() * 0.15, size: 16 + Math.random() * 12 };
      }),
    [],
  );
  return (
    <span className="star-burst" aria-hidden="true" style={{ position: "absolute", left: "50%", top: 10 }}>
      {stars.map((st, i) => (
        <span key={i} style={{ position: "absolute", ["--dx" as string]: `${st.dx}px`, ["--dy" as string]: `${st.dy}px` }}>
          <Icon name="star" size={st.size} className="burst" />
        </span>
      ))}
    </span>
  );
}
