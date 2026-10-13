import { useEffect, useMemo, useRef, useState } from "react";
import { CHALLENGES } from "../content/challenges";
import { SKILL_BY_ID } from "../content";
import { ExplainCard, LessonCard, MultiPart, WhyCard, WorkedExample } from "../components/Cards";
import { Calculator } from "../components/Calculator";
import { MathText } from "../components/MathText";
import { ProblemCard } from "../components/ProblemCard";
import { Icon } from "../components/Icon";
import { familyOf } from "../content/topics";
import { makeRng } from "../lib/rng";
import { WEEK_BONUS, bumpStreak, checkWeeklyGoal, recordWhyChoice, setWrittenStatus } from "../engine/mastery";
import { afterAnswer, nextItem, startSession, type Item, type SessionCtx, type SessionType } from "../engine/session";
import { LEVEL_NAMES, logEvent, newSkillState, today, type AppState } from "../engine/state";
import type { WhyWritten } from "../content/types";
import { LevelBadge } from "../ui";

const MODE_LABEL: Record<string, string> = {
  review: "Warm-up review",
  mistake: "Try again with new numbers",
  free: "Practice",
  learn: "Practice",
  probe: "Building-block check",
  challenge: "Stretch problem",
  placement: "Starting-point check",
};

let lastChallenge: string | undefined;

export function Session({ state, mutate, type, skillId, onExit, toast }: {
  state: AppState;
  mutate: (fn: (s: AppState) => void) => void;
  type: SessionType;
  skillId?: string;
  onExit: () => void;
  toast: (t: string) => void;
}) {
  const ctxRef = useRef<SessionCtx | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [calc, setCalc] = useState(false);
  const [xpStart] = useState(state.xp);
  const startLevels = useRef<Record<string, number>>({});
  const logged = useRef(false);

  // Start lazily so the first item sees the current state.
  if (!ctxRef.current) {
    ctxRef.current = startSession(state, type, { skillId, lastChallenge });
    for (const [id, ss] of Object.entries(state.skills)) startLevels.current[id] = ss.level;
  }
  const ctx = ctxRef.current;

  const advance = () => {
    let next: Item = { kind: "done" };
    mutate((s) => {
      next = nextItem(s, ctx);
    });
    lastChallenge = ctx.lastChallenge;
    if (next.kind === "done" && !logged.current) {
      logged.current = true;
      const notes: string[] = [];
      mutate((s) => {
        const st = bumpStreak(s);
        s.sessions.push({ date: today(), minutes: Math.max(1, Math.round((Date.now() - ctx.startedAt) / 60000)), answered: ctx.answered, correct: ctx.correct, skills: ctx.touched, kind: type });
        if (st.usedFreezes) notes.push(`🧊 ${st.usedFreezes === 1 ? "A streak freeze" : `${st.usedFreezes} streak freezes`} saved your ${s.streak.count}-day streak!`);
        if (st.earnedFreeze) notes.push(`🧊 ${s.streak.count} days in a row! You earned a streak freeze.`);
        if (type === "daily" && checkWeeklyGoal(s)) notes.push(`🎯 Weekly goal reached! +${WEEK_BONUS} ⭐`);
      });
      if (notes.length) toast(notes.join("  "));
    }
    setItem(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!item) return null;

  const phases = type === "daily" ? (["warmup", "learn", "challenge"] as const) : type === "mistakes" ? (["warmup"] as const) : (["learn"] as const);
  const phaseName = { warmup: type === "mistakes" ? "Mistake journal" : "Warm-up", learn: "Learn", challenge: "Challenge", done: "Done" };

  return (
    <div>
      <div className="session-head">
        <div className="stage" style={{ margin: 0 }}>
          {phases.map((p, i) => {
            const cur = ctx.phase === "done" ? phases.length : (phases as readonly string[]).indexOf(ctx.phase);
            return <span key={p} className={i === cur ? "on" : i < cur ? "past" : ""}>{i < cur ? "✓ " : ""}{phaseName[p]}</span>;
          })}
        </div>
        <div className="session-dots" role="img" aria-label={`${ctx.correct} of ${ctx.answered} right without help`}>
          {(ctx.marks ?? []).slice(-14).map((m, i) => <span key={i} className={m} />)}
          {item.kind !== "done" && <span className="cur" />}
        </div>
        {state.settings.calculator && <button className="btn ghost" onClick={() => setCalc((c) => !c)} aria-label="calculator"><Icon name="calc" /></button>}
        <button className="btn ghost" aria-label="Stop for now" onClick={() => (item.kind === "done" || confirm("Stop for now? Your progress so far is saved.") ? onExit() : null)}><Icon name="x" /></button>
      </div>
      {calc && <Calculator onClose={() => setCalc(false)} />}
      <div className="focus screen-in" key={keyOf(item)}>
        <ItemView item={item} state={state} mutate={mutate} ctx={ctx} advance={advance} toast={toast} onExit={onExit} xpGained={state.xp - xpStart} startLevels={startLevels.current} />
      </div>
    </div>
  );
}

function keyOf(item: Item): string {
  return JSON.stringify(item);
}

function ItemView({ item, state, mutate, ctx, advance, toast, onExit, xpGained, startLevels }: {
  item: Item;
  state: AppState;
  mutate: (fn: (s: AppState) => void) => void;
  ctx: SessionCtx;
  advance: () => void;
  toast: (t: string) => void;
  onExit: () => void;
  xpGained: number;
  startLevels: Record<string, number>;
}) {
  const readAloud = state.settings.readAloud;
  const problem = useMemo(() => (item.kind === "problem" ? SKILL_BY_ID[item.skillId].generate(makeRng(item.seed), item.level) : null), [item]);
  const challenge = useMemo(() => {
    if (item.kind !== "challenge") return null;
    const c = CHALLENGES.find((x) => x.id === item.challengeId)!;
    return { c, ...c.build(makeRng(item.seed)) };
  }, [item]);

  switch (item.kind) {
    case "message":
      return (
        <div className={`card ${item.tone === "celebrate" ? "celebrate" : ""}`}>
          <h2>{item.title}</h2>
          <p>{item.text}</p>
          <div className="row"><span className="grow" /><button className="btn primary" autoFocus onClick={advance}>Continue →</button></div>
        </div>
      );
    case "lesson":
      return <LessonCard skill={SKILL_BY_ID[item.skillId]} recap={item.recap} readAloud={readAloud} onDone={() => { mutate((s) => { const ss = s.skills[item.skillId]; if (ss) ss.lessonSeen = true; else s.skills[item.skillId] = { ...newSkillState(), lessonSeen: true }; }); advance(); }} />;
    case "worked":
      return <WorkedExample skill={SKILL_BY_ID[item.skillId]} seed={item.seed} level={item.level} onDone={advance} />;
    case "problem": {
      const skill = SKILL_BY_ID[item.skillId];
      return (
        <ProblemCard
          problem={problem!}
          skillId={item.skillId}
          guided={item.guided}
          readAloud={readAloud}
          banner={{ family: familyOf(skill.topic), title: skill.title, mode: item.guided ? "Let's do it together" : MODE_LABEL[item.mode] }}
          onFinish={(r) => {
            let msg = "";
            (ctx.marks ??= []).push(r.ok && !r.assisted ? "ok" : r.ok ? "help" : "miss");
            mutate((s) => {
              const out = afterAnswer(s, ctx, item, { ok: r.ok, assisted: r.assisted, given: r.given, correct: r.correct, prompt: problem!.prompt });
              logEvent(s, { skill: item.skillId, level: item.level, mode: item.guided ? "guided" : item.mode, ok: r.ok, assisted: r.assisted, tries: r.tries, hints: r.hints, secs: r.secs, tutor: r.tutor || undefined });
              if (out.levelUp && out.levelUp >= 2) msg = `⭐ ${skill.title}: ${LEVEL_NAMES[out.levelUp]}!`;
              else if (out.becameReady) msg = `🔓 ${skill.title} is solid. New skills unlocked!`;
            });
            if (msg) toast(msg);
            advance();
          }}
        />
      );
    }
    case "why":
      return <WhyCard skill={SKILL_BY_ID[item.skillId]} onDone={(ok) => { mutate((s) => recordWhyChoice(s, item.skillId, ok)); advance(); }} />;
    case "explain":
      return (
        <ExplainCard
          skill={SKILL_BY_ID[item.skillId]}
          apiKey={state.settings.apiKey}
          model={state.settings.model}
          onDone={(r) => {
            if (r) {
              const skill = SKILL_BY_ID[item.skillId];
              const why = skill.why.find((w): w is WhyWritten => w.kind === "written")!;
              const status = r.grade ? (r.grade.verdict === "got_it" ? "pass" : "revise") : "pending";
              mutate((s) => {
                s.explanations.push({
                  id: `${Date.now().toString(36)}`,
                  skillId: item.skillId,
                  prompt: why.prompt,
                  keyIdeas: why.keyIdeas,
                  exemplar: why.exemplar,
                  response: r.response,
                  date: today(),
                  status,
                  feedback: r.grade?.feedbackForStudent,
                  parentNote: r.grade?.noteForParent,
                  gradedBy: r.grade ? "claude" : undefined,
                  rounds: r.rounds.length > 1 ? r.rounds : undefined,
                  howToImprove: r.grade?.howToImprove,
                  modelExplanation: r.grade?.modelExplanation,
                });
                setWrittenStatus(s, item.skillId, status);
                s.xp += 15;
              });
              if (status === "pass") toast("🎤 Great explaining!");
            }
            advance();
          }}
        />
      );
    case "challenge":
      return (
        <MultiPart
          title={challenge!.c.title}
          intro={challenge!.intro}
          parts={challenge!.parts}
          readAloud={readAloud}
          onDone={(results) => {
            mutate((s) => {
              const right = results.filter((x) => x.ok).length;
              s.xp += right * 8;
              for (const x of results) logEvent(s, { skill: challenge!.c.id, level: undefined, mode: "challenge", ok: x.ok, assisted: x.assisted, tries: x.tries, hints: x.hints, secs: x.secs, tutor: x.tutor || undefined });
              ctx.answered += results.length;
              ctx.correct += results.filter((x) => x.ok && !x.assisted).length;
            });
            advance();
          }}
        />
      );
    case "done": {
      const changed = Object.entries(state.skills).filter(([id, ss]) => ss.level > (startLevels[id] ?? 0) && SKILL_BY_ID[id]);
      return (
        <div className="card hero celebrate">
          <h1>Quest complete! 🎉</h1>
          <p>You answered {ctx.answered} question{ctx.answered === 1 ? "" : "s"} and earned {xpGained} XP. {state.streak.count > 1 ? `That's a ${state.streak.count}-day streak! 🔥` : ""}</p>
          {changed.length > 0 && (
            <div className="card tight" style={{ color: "var(--ink)" }}>
              <strong>Level-ups today</strong>
              {changed.map(([id, ss]) => (
                <div key={id} className="row" style={{ marginTop: 6 }}><span className="grow">{SKILL_BY_ID[id].title}</span><LevelBadge level={ss.level} /></div>
              ))}
            </div>
          )}
          <MathText as="p" text={ctx.answered ? "Remember: a skill is truly yours when you can do it again a few days later. That's what the warm-up checks!" : "See you next time!"} />
          <button className="btn primary big" autoFocus onClick={onExit}>Back home</button>
        </div>
      );
    }
  }
}
