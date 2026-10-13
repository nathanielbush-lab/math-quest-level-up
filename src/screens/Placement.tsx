import { COURSE_BY_ID } from "../content/topics";
import { FamilyIcon } from "../components/Icon";
import { useMemo, useRef, useState } from "react";
import { SKILL_BY_ID, TOPICS, skillsInTopic } from "../content";
import { ProblemCard } from "../components/ProblemCard";
import { makeRng } from "../lib/rng";
import { placementAnswer, placementProblem, startPlacement, type PlacementCtx } from "../engine/placement";
import { logEvent, type AppState } from "../engine/state";

export function Placement({ state, mutate, topicId, onExit, go }: {
  state: AppState;
  mutate: (fn: (s: AppState) => void) => void;
  topicId?: string;
  onExit: () => void;
  go: (topicId?: string) => void;
}) {
  if (!topicId) return <TopicChooser state={state} mutate={mutate} onPick={go} onExit={onExit} />;
  return <PlacementRun key={topicId} state={state} mutate={mutate} topicId={topicId} onNext={() => go(undefined)} onExit={onExit} />;
}

function TopicChooser({ state, mutate, onPick, onExit }: { state: AppState; mutate: (fn: (s: AppState) => void) => void; onPick: (id: string) => void; onExit: () => void }) {
  const next = TOPICS.find((t) => t.course === (state.settings.course ?? "m1") && !state.placement[t.id]);
  return (
    <div>
      <div className="card">
        <h1>🧭 Find your starting point</h1>
        <p>Each check is about 4–8 questions. It starts in the middle of a topic and moves up or down depending on your answers, so you can skip what you already know.</p>
        <p className="muted small">It's fine to miss questions here: that just shows where to begin. Try a few topics per day; you don't have to do them all at once.</p>
        {next && <button className="btn primary big" onClick={() => onPick(next.id)}>Check: {next.title} →</button>}
      </div>
      {[COURSE_BY_ID[state.settings.course ?? "m1"]].map((c) => (
        <div key={c.id}>
          <div className="grade-label">{c.name}</div>
          {TOPICS.filter((t) => t.course === c.id).map((t) => {
            const status = state.placement[t.id];
            const known = skillsInTopic(t.id).filter((s) => state.skills[s.id]?.ready).length;
            return (
              <div key={t.id} className="card tight row">
                <span className={`fam-badge fam-${t.family}`}><FamilyIcon family={t.family} size={22} /></span>
                <div className="grow">
                  <strong>{t.title}</strong>
                  <div className="small muted">{status === "done" ? `Checked ✓ · ${known} of ${skillsInTopic(t.id).length} skills already known` : status === "skipped" ? "Skipped: starting from the beginning" : "Not checked yet"}</div>
                </div>
                <button className="btn" onClick={() => onPick(t.id)}>{status ? "Re-check" : "Check"}</button>
                {!status && <button className="btn ghost" onClick={() => mutate((s) => { s.placement[t.id] = "skipped"; })}>Skip</button>}
              </div>
            );
          })}
        </div>
      ))}
      <button className="btn" onClick={onExit}>← Back home</button>
    </div>
  );
}

function PlacementRun({ state, mutate, topicId, onNext, onExit }: { state: AppState; mutate: (fn: (s: AppState) => void) => void; topicId: string; onNext: () => void; onExit: () => void }) {
  const ctxRef = useRef<PlacementCtx>(startPlacement(topicId));
  const [n, setN] = useState(0);
  const ctx = ctxRef.current;
  const item = useMemo(() => (ctx.done ? null : placementProblem(ctx)), [n, ctx]);
  const problem = useMemo(() => (item ? SKILL_BY_ID[item.skillId].generate(makeRng(item.seed), item.level) : null), [item]);
  const topic = TOPICS.find((t) => t.id === topicId)!;

  if (!item || !problem) {
    const known = ctx.passedUpTo + 1;
    const startAt = ctx.skills[ctx.passedUpTo + 1];
    return (
      <div className="card hero celebrate">
        <h1>{topic.title}: checked</h1>
        <p>{known ? `You already know ${known} of the ${ctx.skills.length} skills in this topic. 🎉` : "This topic is new territory, which means lots to explore!"}</p>
        {startAt && <p>Your starting point: <strong>{SKILL_BY_ID[startAt].title}</strong></p>}
        <p className="muted small">Skills you showed you know will pop up in warm-ups over the next few days to confirm they stick.</p>
        <div className="row">
          <button className="btn primary big" autoFocus onClick={onNext}>Check another topic →</button>
          <button className="btn" onClick={onExit}>Done for now</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <span className="chip grow" style={{ flex: "none" }}>{topic.title}</span>
        <span className="muted small grow">Question {ctx.asked + 1}</span>
        <button className="btn ghost" onClick={onExit}>✕</button>
      </div>
      <ProblemCard
        key={n}
        problem={problem}
        placement
        readAloud={state.settings.readAloud}
        header={<div className="small muted" style={{ marginBottom: 6 }}>🧭 {SKILL_BY_ID[item.skillId].title} · no hints in a starting-point check, just do your best!</div>}
        onFinish={(r) => {
          mutate((s) => {
            placementAnswer(s, ctx, r.ok);
            logEvent(s, { skill: item.skillId, level: item.level, mode: "placement", ok: r.ok, assisted: r.assisted, tries: r.tries, hints: r.hints, secs: r.secs, tutor: r.tutor || undefined });
          });
          setN((x) => x + 1);
        }}
      />
      <button className="btn link small" onClick={() => { mutate((s) => { s.placement[topicId] = "skipped"; }); onNext(); }}>This is all new to me, skip this check</button>
    </div>
  );
}
