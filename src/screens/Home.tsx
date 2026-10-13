import { useRef } from "react";
import { SKILLS, SKILL_BY_ID, TOPICS } from "../content";
import { COURSES, COURSE_BY_ID, familyOf } from "../content/topics";
import type { CourseId, TopicFamily } from "../content/types";
import { FamilyIcon, Icon } from "../components/Icon";
import { previewToday } from "../engine/session";
import { daysBetween, today, type AppState } from "../engine/state";
import { rankFor } from "../engine/rank";
import { monthFocus } from "../store";
import { TrophyPeek, TrophyRoom } from "../components/Badges";
import { Avatar, ShopTab } from "../components/Shop";
import { AssessCards } from "../components/AssessCards";
import { questDaysThisWeek } from "../engine/mastery";
import { LevelBar, LevelGuide, LevelLegend, LevelSummary, fmtDate } from "../ui";
import type { Route } from "../App";

export type HomeTab = "today" | "units" | "trophies" | "shop";

export function topicCounts(state: AppState, topicId: string) {
  const skills = SKILLS.filter((s) => s.topic === topicId);
  const counts = [0, 0, 0, 0, 0];
  for (const s of skills) counts[state.skills[s.id]?.level ?? 0]++;
  const ready = skills.filter((s) => state.skills[s.id]?.ready).length;
  return { counts, total: skills.length, ready };
}

export function courseCounts(state: AppState, course: CourseId) {
  const skills = SKILLS.filter((s) => TOPICS.find((t) => t.id === s.topic)?.course === course);
  return { ready: skills.filter((s) => state.skills[s.id]?.ready).length, total: skills.length };
}

/** "Yesterday you worked on Slope and got 8 of 10 right." */
export function lastTimeLine(state: AppState): string | null {
  const last = [...state.sessions].reverse().find((s) => s.answered > 0);
  if (!last) return null;
  const d = daysBetween(last.date, today());
  const [y, m, day] = last.date.split("-").map(Number);
  const when = d <= 0 ? "Earlier today" : d === 1 ? "Yesterday" : d < 7 ? `On ${new Date(y, m - 1, day).toLocaleDateString(undefined, { weekday: "long" })}` : `On ${fmtDate(last.date)}`;
  const titles = [...new Set(last.skills)].map((id) => SKILL_BY_ID[id]?.title).filter(Boolean);
  const what =
    last.kind === "mistakes" ? "you fixed old mistakes" : !titles.length ? "you practiced" : titles.length <= 2 ? `you worked on ${titles.join(", plus ")}` : `you worked on ${titles[0]}, ${titles[1]}, plus ${titles.length - 2} more`;
  return `${when} ${what}, and got ${last.correct} of ${last.answered} right.`;
}

const TABS: { id: HomeTab; label: string; icon: "home" | "map" | "trophy" | "bag" }[] = [
  { id: "today", label: "Today", icon: "home" },
  { id: "units", label: "Units", icon: "map" },
  { id: "trophies", label: "Badges", icon: "trophy" },
  { id: "shop", label: "Shop", icon: "bag" },
];

export function Home({ state, go, tab = "today", mutate }: { state: AppState; go: (r: Route) => void; tab?: HomeTab; mutate: (fn: (s: AppState) => void) => void }) {
  const setTab = (t: HomeTab) => go({ name: "home", tab: t });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const j = (i + d + TABS.length) % TABS.length;
    setTab(TABS[j].id);
    tabRefs.current[j]?.focus();
  };
  const current = TABS.some((t) => t.id === tab) ? tab : "today";
  return (
    <div>
      <div className="tabs" role="tablist" data-tour="tabs">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            aria-selected={current === t.id}
            tabIndex={current === t.id ? 0 : -1}
            className={`tab ${current === t.id ? "on" : ""}`}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            <Icon name={t.icon} size={19} />
            {t.label}
            {t.id === "trophies" && state.badges.length > 0 && <span className="tab-count">{state.badges.length}</span>}
          </button>
        ))}
      </div>
      {current === "today" && <Today state={state} go={go} setTab={setTab} mutate={mutate} />}
      {current === "units" && <UnitsTab state={state} go={go} mutate={mutate} />}
      {current === "trophies" && <TrophyRoom state={state} />}
      {current === "shop" && <ShopTab state={state} mutate={mutate} />}
    </div>
  );
}

/** Math 1 … Pre-Calc pills. Switching changes where new learning comes from; nothing is lost. */
export function CourseSwitcher({ state, mutate }: { state: AppState; mutate: (fn: (s: AppState) => void) => void }) {
  const course = state.settings.course ?? "m1";
  return (
    <nav className="course-switch" aria-label="Course" data-tour="course">
      {COURSES.map((c) => {
        const n = courseCounts(state, c.id);
        return (
          <button key={c.id} type="button" aria-pressed={course === c.id} className={course === c.id ? "on" : ""} title={`${c.name}: ${n.ready} of ${n.total} skills unlocked`} onClick={() => mutate((s) => { s.settings.course = c.id; })}>
            <span className="cs-name">{c.short}</span>
            <span className="cs-bar" aria-hidden="true"><span style={{ width: `${n.total ? (100 * n.ready) / n.total : 0}%` }} /></span>
          </button>
        );
      })}
    </nav>
  );
}

function PlayerCard({ state }: { state: AppState }) {
  const rank = rankFor(state.xp);
  const into = state.xp - rank.from, span = rank.to - rank.from;
  const last = lastTimeLine(state);
  return (
    <section className="card player-card" data-tour="stats">
      <div className="pc-top">
        <span className="rank-tile" aria-label={`Rank ${rank.level}`}>{String(rank.level).padStart(2, "0")}</span>
        <div className="grow">
          <h1>Hey, {state.settings.studentName || "there"}</h1>
          <div className="muted">Rank {rank.level} · {rank.name}</div>
        </div>
        <Avatar state={state} size="lg" />
      </div>
      <div className="xp-row">
        <span className="mono small muted grow">XP to rank {rank.level + 1}</span>
        <span className="mono small"><strong>{state.xp.toLocaleString()}</strong> / {rank.to.toLocaleString()}</span>
      </div>
      <div className="xp-bar" aria-hidden="true"><div style={{ width: `${Math.min(100, (100 * into) / span)}%` }} /></div>
      {last && <p className="small muted" style={{ margin: "10px 0 0" }}>{last}</p>}
    </section>
  );
}

function Today({ state, go, setTab, mutate }: { state: AppState; go: (r: Route) => void; setTab: (t: HomeTab) => void; mutate: (fn: (s: AppState) => void) => void }) {
  const preview = previewToday(state);
  const week = questDaysThisWeek(state);
  const goal = state.settings.weeklyGoal;
  const doneToday = state.sessions.some((s) => s.kind === "daily" && s.date === today());
  const course = COURSE_BY_ID[state.settings.course ?? "m1"];
  const openMistakes = state.mistakes.filter((m) => !m.resolved).length;
  const courseTopics = TOPICS.filter((t) => t.course === course.id);
  const placementDone = courseTopics.filter((t) => state.placement[t.id]).length;
  const showPlacement = courseTopics.length > 0 && placementDone < courseTopics.length && !state.settings.placementHidden;
  const focusFamilies: TopicFamily[] = preview.focus.map((f) => familyOf(f.topic));
  const steps = [
    { n: "01", name: "Warm-up", detail: preview.reviews ? `${preview.reviews} quick review${preview.reviews === 1 ? "" : "s"} to keep skills sharp` : "A few quick questions to get going", fam: "functions" as TopicFamily },
    { n: "02", name: "Main quest", detail: preview.focus.length ? preview.focus.map((f) => f.title).join(", then ") : `Mixed practice from ${course.short}`, fam: focusFamilies[0] ?? ("algebra" as TopicFamily) },
    { n: "03", name: "Boss level", detail: "One multi-step problem that puts it together", fam: "trig" as TopicFamily },
  ];
  return (
    <div>
      <PlayerCard state={state} />
      <CourseSwitcher state={state} mutate={mutate} />

      <section className="card run-card" data-tour="quest">
        <div className="row" style={{ alignItems: "baseline" }}>
          <h2 className="grow" style={{ margin: 0 }}>Today's run</h2>
          <span className="mono small muted">{state.settings.sessionLength === "short" ? "~15 MIN" : "~25 MIN"}</span>
        </div>
        <ol className="run-steps">
          {steps.map((s) => (
            <li key={s.n} className={`fam-${s.fam} ${doneToday ? "done" : ""}`}>
              <span className="run-n mono">{doneToday ? <Icon name="check" size={16} /> : s.n}</span>
              <span className="run-text"><strong>{s.name}</strong><span className="small muted">{s.detail}</span></span>
            </li>
          ))}
        </ol>
        {doneToday && <p className="small" style={{ margin: "0 0 10px", fontWeight: 700 }}>Today's run is done. Come back tomorrow, or go again for bonus XP.</p>}
        <button className="btn primary big run-go" onClick={() => go({ name: "session", type: "daily" })} autoFocus>
          {doneToday ? "Bonus run" : "Start run"} <Icon name="arrow" />
        </button>
        <div className="week-goal" title="Weekly goal (Monday–Sunday)">
          {Array.from({ length: goal }, (_, i) => <span key={i} className={`goal-dot ${i < week ? "on" : ""}`} />)}
          <span className="small" style={{ fontWeight: 700 }}>{week >= goal ? "Weekly goal done" : `${week} of ${goal} runs this week`}</span>
        </div>
      </section>

      <AssessCards state={state} go={go} />

      {showPlacement && (
        <div className="card row">
          <div className="grow">
            <h3><Icon name="compass" /> Skip what you already know</h3>
            <p className="muted small" style={{ margin: 0 }}>Short checks for each {course.short} unit, so practice starts where you are. {placementDone} of {courseTopics.length} units checked.</p>
          </div>
          {placementDone > 0 && <button className="btn ghost" onClick={() => mutate((s) => { s.settings.placementHidden = true; })}>Not now</button>}
          <button className="btn primary" onClick={() => go({ name: "placement" })}>{placementDone ? "Keep going" : "Start"}</button>
        </div>
      )}

      {openMistakes > 0 && (
        <div className="card row">
          <div className="grow">
            <h3><Icon name="target" /> Mistake replay</h3>
            <p className="muted small" style={{ margin: 0 }}>{openMistakes} question{openMistakes === 1 ? "" : "s"} to retry with fresh numbers. Fixing a mistake is the fastest way to lock a skill in.</p>
          </div>
          <button className="btn" onClick={() => go({ name: "session", type: "mistakes" })}>Replay</button>
        </div>
      )}

      <TrophyPeek state={state} onOpen={() => setTab("trophies")} />
    </div>
  );
}

function UnitsTab({ state, go, mutate }: { state: AppState; go: (r: Route) => void; mutate: (fn: (s: AppState) => void) => void }) {
  const course = COURSE_BY_ID[state.settings.course ?? "m1"];
  const topics = TOPICS.filter((t) => t.course === course.id);
  const n = courseCounts(state, course.id);
  const month = monthFocus();
  return (
    <div>
      <CourseSwitcher state={state} mutate={mutate} />
      <div className="row" style={{ marginBottom: 4 }}>
        <h2 className="grow" style={{ margin: 0 }}>{course.name}</h2>
        <span className="small muted">{n.ready} of {n.total} skills unlocked</span>
      </div>
      <p className="muted small" style={{ marginTop: 4 }}>{course.blurb}{course.eoc ? " This course ends with a state EOC test." : ""}</p>
      <CardKey />
      {!topics.length && <div className="card"><p className="muted" style={{ margin: 0 }}>This course's units are on the way.</p></div>}
      <div className="grid2">
        {topics.map((t) => {
          const c = topicCounts(state, t.id);
          const open = () => go({ name: "topic", topicId: t.id });
          return (
            <div key={t.id} className={`card tight topic-tile fam-${t.family}`} onClick={open} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && open()}>
              <div className="row" style={{ marginBottom: 8 }}>
                <span className="fam-badge"><FamilyIcon family={t.family} size={22} /></span>
                <span className="grow">
                  <span className="unit-no mono">UNIT {t.unit}</span>
                  <strong className="unit-title">{t.title}</strong>
                </span>
                {c.total > 0 && c.ready === c.total && <span title="every skill unlocked"><Icon name="star" /></span>}
              </div>
              <div className="progress-box">
                <div className="progress-row"><span className="progress-label">Progress</span><div className="grow"><LevelBar counts={c.counts} total={c.total} /></div></div>
                <div style={{ marginTop: 6 }}><LevelSummary counts={c.counts} total={c.total} /></div>
              </div>
              <div className="small muted">{c.ready} of {c.total} skills unlocked</div>
            </div>
          );
        })}
      </div>
      <div className="card tight" style={{ marginTop: 22 }}>
        <strong>{month.title}</strong>
        <p className="small muted" style={{ margin: 0 }}>{month.text}</p>
      </div>
    </div>
  );
}

const FAMILY_NAMES: [TopicFamily, string][] = [
  ["algebra", "Algebra"],
  ["functions", "Functions"],
  ["geometry", "Geometry"],
  ["stats", "Statistics & probability"],
  ["trig", "Trigonometry"],
  ["number", "Number systems"],
];

/** How to read a unit card: its color is the kind of math; the bar's colors are progress. */
function CardKey() {
  return (
    <details className="card tight card-key">
      <summary><strong>How to read a unit card</strong></summary>
      <div className="key-part">
        <div className="key-head">
          <span className="key-sample-card fam-functions" aria-hidden="true"><span className="fam-badge"><FamilyIcon family="functions" size={16} /></span></span>
          <span><strong>The stripe and icon</strong> show the <strong>kind of math</strong>.</span>
        </div>
        <div className="fam-chips">
          {FAMILY_NAMES.map(([f, name]) => (
            <span key={f} className={`fam-chip fam-${f}`}><FamilyIcon family={f} size={16} />{name}</span>
          ))}
        </div>
      </div>
      <div className="key-part">
        <div className="key-head">
          <span className="key-sample-bar progress-box" aria-hidden="true"><LevelBar counts={[1, 1, 1, 1, 1]} total={5} /></span>
          <span><strong>The progress bar</strong> (in the shaded box) shows <strong>how far you've gotten</strong> in that unit's skills. Its colors are the same for every kind of math.</span>
        </div>
        <LevelLegend />
        <LevelGuide />
      </div>
    </details>
  );
}
