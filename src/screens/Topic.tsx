import { COURSE_BY_ID } from "../content/topics";
import { useState } from "react";
import { SKILL_BY_ID, TOPIC_BY_ID, skillsInTopic } from "../content";
import { LessonCard } from "../components/Cards";
import { skillState, type AppState } from "../engine/state";
import { LevelBadge, fmtDate } from "../ui";
import type { Route } from "../App";
import { FamilyIcon, Icon } from "../components/Icon";

export function Topic({ state, topicId, go }: { state: AppState; topicId: string; go: (r: Route) => void }) {
  const topic = TOPIC_BY_ID[topicId];
  const skills = skillsInTopic(topicId);
  const [lesson, setLesson] = useState<string | null>(null);
  if (lesson) return <LessonCard skill={SKILL_BY_ID[lesson]} recap readAloud={state.settings.readAloud} onDone={() => setLesson(null)} />;
  return (
    <div>
      <div className="card">
        <div className="row">
          <span className={`fam-badge big fam-${topic.family}`}><FamilyIcon family={topic.family} size={28} /></span>
          <div className="grow">
            <h1 style={{ margin: 0 }}>{topic.title}</h1>
            <div className="muted small">{COURSE_BY_ID[topic.course].name} · Unit {topic.unit} · {topic.standards}</div>
          </div>
        </div>
        <p style={{ marginTop: 12 }}>{topic.blurb}</p>
        <button className="btn" onClick={() => go({ name: "placement", topicId })}>🧭 {state.placement[topicId] === "done" ? "Re-check" : "Check"} what I already know</button>
      </div>
      {skills.map((s) => {
        const ss = skillState(state, s.id);
        const missing = s.prereqs.filter((p) => !skillState(state, p).ready);
        const open = missing.length === 0;
        return (
          <div key={s.id} className={`card tight ${open ? "" : "locked"}`}>
            <div className="row">
              <strong className="grow">{s.title}</strong>
              <LevelBadge level={ss.level} />
            </div>
            <div className="small muted" style={{ margin: "4px 0 8px" }}>
              {s.standards.join(", ")}
              {ss.dates.independent && ` · Independent since ${fmtDate(ss.dates.independent)}`}
              {ss.nextReview && ` · next check ${fmtDate(ss.nextReview)}`}
              {ss.placed && " · from starting-point check"}
            </div>
            {open ? (
              <div className="row">
                <button className="btn primary" onClick={() => go({ name: "session", type: "topic", skillId: s.id })}>{ss.attempts ? "Practice" : "Start"}</button>
                <button className="btn ghost" onClick={() => setLesson(s.id)}><Icon name="book" /> Lesson</button>
              </div>
            ) : (
              <div className="small">🔒 First: {missing.map((m) => SKILL_BY_ID[m].title).join(", ")}</div>
            )}
          </div>
        );
      })}
      <button className="btn" onClick={() => go({ name: "home", tab: "units" })}>← Back to units</button>
    </div>
  );
}
