import { rankFor } from "./engine/rank";
import { useCallback, useEffect, useState } from "react";
import { SKILL_BY_ID } from "./content";
import { HOME_TOUR, Tour } from "./components/Tour";
import type { SessionType } from "./engine/session";
import { BadgeCelebration } from "./components/Badges";
import { BADGE_BY_ID, useAppState } from "./store";
import { Home, type HomeTab } from "./screens/Home";
import { Assessment, type AssessKind } from "./screens/Assessment";
import { Avatar } from "./components/Shop";
import { TutorProvider } from "./components/Tutor";
import { Icon } from "./components/Icon";
import { SkinContext } from "./skin";
import { SyncProvider } from "./sync/useSync";
import { currentStreak } from "./engine/mastery";
import { starBalance } from "./engine/state";
import { MissionScreen } from "./screens/Mission";
import { Parent } from "./screens/Parent";
import { Placement } from "./screens/Placement";
import { Session } from "./screens/Session";
import { Topic } from "./screens/Topic";
import { Welcome } from "./screens/Welcome";

export type Route =
  | { name: "home"; tab?: HomeTab }
  | { name: "session"; type: SessionType; skillId?: string }
  | { name: "placement"; topicId?: string }
  | { name: "topic"; topicId: string }
  | { name: "mission"; id: string }
  | { name: "parent" }
  | { name: "assess"; kind?: AssessKind };

/** The hexagon-and-chevron mark from the Night Run mockup. */
function LogoMark() {
  return (
    <svg className="logo-mark" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 21 7v10l-9 5-9-5V7z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 14l4-5 4 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const { state, mutate, replace, saveFailed, newBadges, popBadge } = useAppState();
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [toastText, setToastText] = useState<string | null>(null);
  const [touring, setTouring] = useState(false);
  const go = (r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0 });
  };
  const toast = (t: string) => setToastText(t);

  useEffect(() => {
    if (!toastText) return;
    const id = setTimeout(() => setToastText(null), 2800 + toastText.length * 25);
    return () => clearTimeout(id);
  }, [toastText]);

  const celebrating = newBadges.length ? BADGE_BY_ID[newBadges[0]] : undefined;
  useEffect(() => {
    if (newBadges.length && !BADGE_BY_ID[newBadges[0]]) popBadge();
  }, [newBadges, popBadge]);

  const streakNow = currentStreak(state);
  const rank = rankFor(state.xp);
  useEffect(() => {
    document.documentElement.dataset.mqTheme = state.equipped.theme ?? "";
  }, [state.equipped.theme]);
  const skin = state.settings.skin ?? "studio";
  useEffect(() => {
    document.documentElement.dataset.skin = skin;
  }, [skin]);
  // Night Run is always dark; Studio follows the Light / Dark / Match setting.
  const appearance = skin === "night" ? "dark" : state.settings.appearance ?? "auto";
  useEffect(() => {
    if (appearance === "auto") delete document.documentElement.dataset.appearance;
    else document.documentElement.dataset.appearance = appearance;
  }, [appearance]);

  const onHome = route.name === "home" && !!state.settings.studentName;
  // First visit to the home page: walk her through it once.
  const showTour = onHome && !celebrating && (touring || !state.settings.tourDone);
  const endTour = useCallback(() => {
    setTouring(false);
    mutate((s) => {
      s.settings.tourDone = true;
    });
  }, [mutate]);

  const inActivity = (route.name === "assess" && !!route.kind) || route.name === "session" || route.name === "mission" || (route.name === "placement" && !!route.topicId);
  const home = () => go({ name: "home" });

  let body;
  if (!state.settings.studentName && route.name === "home") {
    body = <Welcome mutate={mutate} onDone={(next) => go(next === "placement" ? { name: "placement" } : { name: "home" })} />;
  } else {
    switch (route.name) {
      case "home":
        body = <Home state={state} go={go} tab={route.tab} mutate={mutate} />;
        break;
      case "session":
        body = <Session key={JSON.stringify(route)} state={state} mutate={mutate} type={route.type} skillId={route.skillId} onExit={route.type === "topic" && route.skillId ? () => go({ name: "topic", topicId: SKILL_BY_ID[route.skillId!].topic }) : home} toast={toast} />;
        break;
      case "placement":
        body = <Placement state={state} mutate={mutate} topicId={route.topicId} onExit={home} go={(topicId) => go({ name: "placement", topicId })} />;
        break;
      case "topic":
        body = <Topic state={state} topicId={route.topicId} go={go} />;
        break;
      case "mission":
        body = <MissionScreen state={state} mutate={mutate} id={route.id} onExit={() => go({ name: "home" })} />;
        break;
      case "assess":
        body = <Assessment key={route.kind ?? "hub"} state={state} mutate={mutate} kind={route.kind} onExit={home} go={(kind) => go({ name: "assess", kind })} openTopic={(topicId) => go({ name: "topic", topicId })} />;
        break;
      case "parent":
        body = <Parent state={state} mutate={mutate} replace={replace} onExit={home} />;
        break;
    }
  }

  return (
    <SkinContext.Provider value={skin}>
    <SyncProvider state={state} replace={replace} busy={inActivity}>
    <TutorProvider state={state} mutate={mutate}>
    <div className="app">
      {!inActivity && (
        <div className="topbar">
          <div className="brand" onClick={home} role="link"><LogoMark /> <span><span className="brand-full">Math Quest </span><span className="brand-up">Level Up</span></span></div>
          <Avatar state={state} size="sm" />
          <span className="spacer" />
          <span className="row" style={{ gap: 8 }} data-tour="stats">
            {streakNow > 0 && <span className="chip" title="days in a row"><Icon name="flame" /> {streakNow}</span>}
            {(state.streak.freezes ?? 0) > 0 && <span className="chip" title="streak freezes: each one covers a missed day"><Icon name="snow" className="icon-snow" /> {state.streak.freezes}</span>}
            <span className="chip xp-counter" title={`XP to spend (${state.xp.toLocaleString()} earned in all). Rank ${rank.level}: ${rank.name}.`}><span className="rank-badge">{String(rank.level).padStart(2, "0")}</span> <Icon name="bolt" /> {starBalance(state).toLocaleString()} XP</span>
          </span>
          {onHome && <button className="btn ghost" title="Show me around" aria-label="Show me around" onClick={() => { go({ name: "home", tab: "today" }); setTouring(true); }}><Icon name="help" /></button>}
          {route.name !== "parent" && <button className="btn ghost" data-tour="parent" aria-label="Teacher corner" onClick={() => go({ name: "parent" })}><Icon name="apple" /> <span className="hide-narrow">Teacher</span></button>}
        </div>
      )}
      {saveFailed && <div className="feedback warn">Progress couldn't be saved in this browser (private window or storage blocked?). Use Teacher corner → Settings → Download progress file to keep it.</div>}
      <div key={JSON.stringify(route)} className="screen-in">{body}</div>
      {toastText && !celebrating && <div className="toast" role="status">{toastText}</div>}
      {showTour && (route.tab ?? "today") === "today" && <Tour steps={HOME_TOUR} onDone={endTour} />}
      {celebrating && <BadgeCelebration badge={celebrating} more={newBadges.length - 1} onClose={popBadge} />}
    </div>
    </TutorProvider>
    </SyncProvider>
    </SkinContext.Provider>
  );
}
