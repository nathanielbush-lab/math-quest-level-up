import { useEffect, useRef, useState } from "react";
import type { Answer } from "../content/types";
import type { Response } from "../engine/check";
import { MathText } from "./MathText";
import { parseExpr, prettyExpr } from "../lib/expr";
import { Grid } from "./Visual";

interface Props {
  answer: Answer;
  disabled: boolean;
  /** Choice indexes already ruled out (wrong first tries). */
  struck: number[];
  /** Shows right/wrong styling once the problem is finished. */
  reveal: boolean;
  onSubmit: (r: Response) => void;
  pointMark?: { x: number; y: number; ok: boolean } | null;
}

export function AnswerInput({ answer, disabled, struck, reveal, onSubmit, pointMark }: Props) {
  switch (answer.kind) {
    case "number":
      return <NumberInput pre={answer.pre} unit={answer.unit} disabled={disabled} onSubmit={(text) => onSubmit({ kind: "number", text })} />;
    case "multi":
      return <MultiInput fields={answer.fields} disabled={disabled} onSubmit={(texts) => onSubmit({ kind: "multi", texts })} />;
    case "choice":
      return <ChoiceInput choices={answer.choices} correct={answer.correct} struck={struck} reveal={reveal} disabled={disabled} onPick={(index) => onSubmit({ kind: "choice", index })} />;
    case "expr":
      return <ExprInput a={answer} disabled={disabled} onSubmit={(text) => onSubmit({ kind: "expr", text })} />;
    case "point":
      return <PointInput a={answer} disabled={disabled} mark={pointMark ?? null} onSubmit={(x, y) => onSubmit({ kind: "point", x, y })} />;
  }
}

function NumberInput({ pre, unit, disabled, onSubmit }: { pre?: string; unit?: string; disabled: boolean; onSubmit: (t: string) => void }) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);
  return (
    <form className="answer-row" onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSubmit(text); }}>
      {pre && <strong>{pre}</strong>}
      <input ref={ref} className="answer-input" value={text} onChange={(e) => setText(e.target.value)} disabled={disabled} inputMode="text" autoComplete="off" aria-label="your answer" placeholder="answer" />
      {unit && <strong>{unit}</strong>}
      <button className="btn primary" disabled={disabled || !text.trim()}>Check</button>
      <span className="kbd">Fractions like 3/4 or 1 1/2 are OK</span>
    </form>
  );
}

function MultiInput({ fields, disabled, onSubmit }: { fields: { pre?: string; post?: string }[]; disabled: boolean; onSubmit: (t: string[]) => void }) {
  const [texts, setTexts] = useState(() => fields.map(() => ""));
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!disabled) first.current?.focus();
  }, [disabled]);
  const ready = texts.every((t) => t.trim());
  return (
    <form className="answer-row" onSubmit={(e) => { e.preventDefault(); if (ready) onSubmit(texts); }}>
      {fields.map((f, i) => {
        const sup = f.pre?.endsWith("^");
        const input = (
          <input
            ref={i === 0 ? first : undefined}
            className="answer-input sm"
            style={sup ? { width: 64, fontSize: "0.95rem", padding: "4px 8px", transform: "translateY(-12px)" } : undefined}
            value={texts[i]}
            disabled={disabled}
            aria-label={`answer box ${i + 1}`}
            onChange={(e) => setTexts((t) => t.map((x, k) => (k === i ? e.target.value : x)))}
          />
        );
        return (
          <span key={i} className="row" style={{ gap: 4 }}>
            {f.pre && <strong>{sup ? f.pre.slice(0, -1) : f.pre}</strong>}
            {input}
            {f.post && <strong>{f.post}</strong>}
          </span>
        );
      })}
      <button className="btn primary" disabled={disabled || !ready}>Check</button>
      <span className="kbd">Use − or - for negatives</span>
    </form>
  );
}

/** Typed expression with a live "reads as" preview so students can see how their input was understood. */
function ExprInput({ a, disabled, onSubmit }: { a: Extract<Answer, { kind: "expr" }>; disabled: boolean; onSubmit: (t: string) => void }) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);
  let preview: string | null = null;
  let problem: string | null = null;
  if (text.trim()) {
    const body = text.includes("=") ? text.slice(text.indexOf("=") + 1) : text;
    try {
      parseExpr(body, a.vars);
      preview = prettyExpr(text);
    } catch (e) {
      problem = (e as Error).message;
    }
  }
  const constant = !a.vars.length;
  const insert = (t: string) => {
    const el = ref.current;
    if (!el) return setText((x) => x + t);
    const start = el.selectionStart ?? text.length, end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + t + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + (t.endsWith("()") ? t.length - 1 : t.length);
      el.setSelectionRange(pos, pos);
    });
  };
  const keys = constant ? ["√()", "π", "^", "/"] : ["^", "√()", "( )", "/", ...(a.vars.length > 1 ? a.vars : [])];
  return (
    <form className="answer-row expr-row" onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSubmit(text); }}>
      {a.lhs && <strong className="expr-lhs">{a.lhs} =</strong>}
      {a.pre && <strong>{a.pre}</strong>}
      <input ref={ref} className="answer-input expr-input" value={text} onChange={(e) => setText(e.target.value)} disabled={disabled} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="your answer" aria-describedby="expr-help" placeholder={constant ? "e.g. 3√2 or 4π" : a.form === "factored" ? "e.g. (x+2)(x−3)" : "e.g. 2x^2 − 3x + 1"} />
      {a.post && <strong>{a.post}</strong>}
      <button className="btn primary" disabled={disabled || !text.trim()}>Check</button>
      <div className="expr-keys" aria-label="Insert symbols">
        {keys.map((k) => (
          <button key={k} type="button" className="key-btn" disabled={disabled} onClick={() => insert(k === "√()" ? "sqrt()" : k === "( )" ? "()" : k === "π" ? "pi" : k)}>{k}</button>
        ))}
      </div>
      <div id="expr-help" className="expr-preview" aria-live="polite">
        {problem ? <span className="muted">{problem}</span> : preview ? <>Reads as: <MathText text={preview} /></> : <span className="kbd">Use ^ for powers (x^2), sqrt( ) for roots, and parentheses for groups.</span>}
      </div>
    </form>
  );
}

function ChoiceInput({ choices, correct, struck, reveal, disabled, onPick }: { choices: string[]; correct: number; struck: number[]; reveal: boolean; disabled: boolean; onPick: (i: number) => void }) {
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= choices.length && !struck.includes(n - 1) && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) onPick(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choices.length, disabled, struck, onPick]);
  return (
    <div className="choices">
      {choices.map((c, i) => {
        const cls = reveal && i === correct ? "right" : struck.includes(i) ? "wrong" : "";
        return (
          <button key={i} className={`choice ${cls}`} disabled={disabled || struck.includes(i)} onClick={() => onPick(i)}>
            <span className="key">{i + 1}</span>
            <MathText text={c} />
          </button>
        );
      })}
    </div>
  );
}

function PointInput({ a, disabled, mark, onSubmit }: { a: Extract<Answer, { kind: "point" }>; disabled: boolean; mark: { x: number; y: number; ok: boolean } | null; onSubmit: (x: number, y: number) => void }) {
  const [sel, setSel] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!disabled) setSel(null);
  }, [disabled]);
  return (
    <div>
      <div className="visual">
        <Grid min={a.min} max={a.max} points={a.extraPoints} polygon={a.polygon} lines={a.lines} selected={sel} onPick={disabled ? undefined : setSel} mark={mark} />
      </div>
      <div className="answer-row">
        <span className="muted">{sel ? `You picked (${sel.x}, ${sel.y})` : "Click a point on the grid"}</span>
        <button className="btn primary" disabled={disabled || !sel} onClick={() => sel && onSubmit(sel.x, sel.y)}>Check</button>
      </div>
    </div>
  );
}
