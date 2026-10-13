import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Problem } from "../content/types";
import { today, type AppState } from "../engine/state";
import { askTutor, ERROR_TEXT, MAX_CHATS, MAX_PER_PROBLEM, tutorUsedToday, type TutorTurn } from "../grading/tutor";
import { MathText } from "./MathText";
import "./tutor.css";
import { Icon } from "./Icon";
import { CoachMark } from "./Coach";

interface TutorCtx {
  state: AppState;
  mutate: (fn: (s: AppState) => void) => void;
}

const Ctx = createContext<TutorCtx | null>(null);

/** Gives the tutor (deep inside ProblemCard) access to settings and a way to save chats. Wraps the whole app. */
export function TutorProvider({ state, mutate, children }: { state: AppState; mutate: (fn: (s: AppState) => void) => void; children: ReactNode }) {
  const value = useMemo(() => ({ state, mutate }), [state, mutate]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const RESTING = "The tutor is resting until tomorrow. Try a hint!";
const CAP_TEXT = "Let's try it now! You can also use a hint or check the solution after you answer.";

// Each problem object gets its own chat, even if two problems happen to share a prompt.
const problemIds = new WeakMap<Problem, number>();
let nextProblemId = 1;
function problemKey(p: Problem): number {
  let id = problemIds.get(p);
  if (!id) problemIds.set(p, (id = nextProblemId++));
  return id;
}

/** Shown next to the Hint button. Opens a short Socratic chat with Claude about this problem. */
export function StuckButton(props: { problem: Problem; wrongAnswers: string[]; hintsShown: number; onUsed: () => void; skillId?: string }) {
  const ctx = useContext(Ctx);
  if (!ctx) return null;
  const { settings } = ctx.state;
  if (!settings.apiKey || !settings.tutorEnabled) return null;
  return <TutorChatBox key={problemKey(props.problem)} {...props} ctx={ctx} />;
}

function newChatId(): string {
  return `tc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function TutorChatBox({ problem, wrongAnswers, hintsShown, onUsed, skillId, ctx }: { problem: Problem; wrongAnswers: string[]; hintsShown: number; onUsed: () => void; skillId?: string; ctx: TutorCtx }) {
  const { state, mutate } = ctx;
  const [open, setOpen] = useState(false);
  const [restNote, setRestNote] = useState(false);
  const [turns, setTurns] = useState<TutorTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const chatId = useRef<string | null>(null);
  const usedOnce = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const limit = state.settings.tutorDailyLimit ?? 20;
  const usedToday = tutorUsedToday(state.tutorChats ?? [], today());
  const resting = usedToday >= limit;
  const sent = turns.filter((t) => t.role === "student").length;
  const capped = sent >= MAX_PER_PROBLEM;
  const canSend = !busy && !capped && !resting;

  useEffect(() => {
    if (open && canSend) inputRef.current?.focus();
  }, [open, canSend, turns.length]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, busy, error]);

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, 500);
    if (!text || !canSend) return;
    const history = [...turns, { role: "student" as const, text }];
    setTurns(history);
    setInput("");
    setError(null);
    setBusy(true);
    if (!usedOnce.current) {
      usedOnce.current = true;
      onUsed();
    }
    const reply = await askTutor({ apiKey: state.settings.apiKey ?? "", model: state.settings.model, problem, wrongAnswers, hintsShown, turns: history });
    setBusy(false);
    if (reply.error) {
      // A failed call isn't counted: take the message back so it can be sent again.
      setTurns(turns);
      setInput(text);
      setError(reply.error || ERROR_TEXT);
      setDetail(reply.detail ?? null);
      return;
    }
    setTurns([...history, { role: "tutor", text: reply.text }]);
    const id = chatId.current ?? (chatId.current = newChatId());
    mutate((s) => {
      if (!s.tutorChats) s.tutorChats = [];
      let chat = s.tutorChats.find((c) => c.id === id);
      if (!chat) {
        chat = { id, date: today(), ...(skillId ? { skillId } : {}), prompt: problem.prompt, messages: [] };
        s.tutorChats.push(chat);
      }
      chat.messages.push({ role: "student", text }, { role: "tutor", text: reply.text });
      if (s.tutorChats.length > MAX_CHATS) s.tutorChats.splice(0, s.tutorChats.length - MAX_CHATS);
    });
  };

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  if (resting && !open) {
    return (
      <>
        <button className="btn ghost tutor-btn tutor-resting" aria-disabled="true" title={RESTING} onClick={() => setRestNote((v) => !v)}>
          <Icon name="chat" /> I'm stuck
        </button>
        {restNote && <div className="tutor-note small muted" role="status">😴 {RESTING}</div>}
      </>
    );
  }

  const chips = ["I don't know how to start", "I don't understand a word", "Can you explain the idea?", ...(wrongAnswers.length ? ["Why is my answer wrong?"] : [])];

  return (
    <>
      <button ref={toggleRef} className={`btn ghost tutor-btn${open ? " on" : ""}`} aria-expanded={open} aria-controls="tutor-panel" onClick={() => (open ? close() : setOpen(true))}>
        <Icon name="chat" /> I'm stuck
      </button>
      {open && (
        <section id="tutor-panel" className="tutor-panel" aria-label="Math tutor chat" onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } }}>
          <header className="tutor-head">
            <span className="tutor-avatar" aria-hidden="true"><CoachMark size={34} /></span>
            <strong className="grow">Tutor</strong>
            {!capped && <span className="small muted">{MAX_PER_PROBLEM - sent} question{MAX_PER_PROBLEM - sent === 1 ? "" : "s"} left here</span>}
            <button className="btn ghost tutor-close" aria-label="Close the tutor" title="Close" onClick={close}>✕</button>
          </header>
          <div className="tutor-log" ref={logRef} aria-live="polite">
            {turns.length === 0 && (
              <div className="tutor-msg tutor">
                <p>Hi! I won't tell you the answer, but I'll help you figure it out. What's tricky?</p>
              </div>
            )}
            {turns.map((t, i) => (
              <div key={i} className={`tutor-msg ${t.role}`}>
                {t.role === "tutor" ? t.text.split(/\n+/).filter(Boolean).map((p, k) => <MathText key={k} as="p" text={p} />) : <p>{t.text}</p>}
              </div>
            ))}
            {busy && (
              <div className="tutor-msg tutor typing" aria-label="The tutor is typing">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            )}
          </div>
          {error && (
            <div className="feedback warn tutor-error" role="alert">
              {error}
              {detail && <details className="small" style={{ marginTop: 4 }}><summary>Technical details</summary>{detail}</details>}
            </div>
          )}
          {capped && !busy && <div className="feedback info tutor-cap">{CAP_TEXT}</div>}
          {resting && !capped && !busy && <div className="feedback info tutor-cap">😴 {RESTING}</div>}
          {canSend && turns.length === 0 && (
            <div className="tutor-chips">
              {chips.map((c) => (
                <button key={c} className="btn ghost tutor-chip" onClick={() => send(c)}>{c}</button>
              ))}
            </div>
          )}
          {!capped && !resting && (
            <form className="tutor-form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
              <input
                ref={inputRef}
                className="tutor-input"
                value={input}
                maxLength={500}
                disabled={busy}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                aria-label="Your question for the tutor"
                autoComplete="off"
              />
              <button className="btn primary" disabled={!canSend || !input.trim()}>Send</button>
            </form>
          )}
        </section>
      )}
    </>
  );
}
