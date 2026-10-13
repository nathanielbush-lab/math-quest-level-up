import { useEffect, useMemo, useRef } from "react";
import type { AppState } from "../engine/state";
import { BADGES, nextBadge, type Badge } from "../store";
import { Icon } from "./Icon";

const COLORS = ["#5b4bd6", "#f0715b", "#1f9d68", "#f6b35b", "#8b7cf6", "#3aa0e8"];

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 1.8 + Math.random() * 1.6,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 8,
        spin: Math.random() * 720 - 360,
        round: Math.random() < 0.35,
      })),
    [],
  );
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.round ? b.size : b.size * 0.45,
            background: b.color,
            borderRadius: b.round ? "50%" : 2,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            ["--spin" as string]: `${b.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}

/** Full-screen "you earned a badge!" moment. Enter, Escape or the button closes it. */
export function BadgeCelebration({ badge, more, onClose }: { badge: Badge; more: number; onClose: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    btn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [badge.id, onClose]);
  return (
    <div className="badge-overlay" role="dialog" aria-modal="true" aria-labelledby="badge-title" onClick={onClose}>
      <Confetti />
      <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="small muted" style={{ fontWeight: 800, letterSpacing: 1 }}>NEW BADGE!</div>
        <div className="badge-big">{badge.icon}</div>
        <h2 id="badge-title" style={{ margin: "4px 0" }}>{badge.name}</h2>
        <p className="muted" style={{ marginTop: 4 }}>You earned it: {badge.how.charAt(0).toLowerCase() + badge.how.slice(1)}.</p>
        <p className="small muted">It's on your trophy shelf (the Trophies tab on the home page).</p>
        <button ref={btn} className="btn primary big" onClick={onClose}>{more > 0 ? `Awesome! (${more} more) →` : "Awesome! 🎉"}</button>
      </div>
    </div>
  );
}

function NextBadgeRow({ state }: { state: AppState }) {
  const next = nextBadge(state);
  if (!next) return <div className="small muted">You've earned every badge! 🎉</div>;
  return (
    <div className="next-badge">
      <span className="shelf-badge locked">{next.badge.icon}</span>
      <div className="grow">
        <div className="small"><strong>Next badge: {next.badge.name}</strong> · {next.badge.how}</div>
        <div className="progressbar" style={{ marginTop: 4 }}><div style={{ width: `${(next.done / next.goal) * 100}%` }} /></div>
      </div>
      <span className="small muted">{next.done}/{next.goal}</span>
    </div>
  );
}

/** Compact version for the Today tab: latest badges plus the next one to aim for. */
export function TrophyPeek({ state, onOpen }: { state: AppState; onOpen: () => void }) {
  const earned = BADGES.filter((b) => state.badges.includes(b.id));
  return (
    <div className="card trophy" data-tour="nextbadge">
      <div className="row">
        <h3 className="grow" style={{ margin: 0 }}><Icon name="trophy" /> Badges</h3>
        <span className="shelf mini">{earned.slice(-6).map((b) => <span key={b.id} className="shelf-badge sm" title={b.name}>{b.icon}</span>)}</span>
        <button className="btn ghost" onClick={onOpen}>{earned.length ? `All ${earned.length} →` : "See them →"}</button>
      </div>
      <NextBadgeRow state={state} />
    </div>
  );
}

/** The Trophies tab: every earned badge, the next one, and every locked badge with how to earn it. */
export function TrophyRoom({ state }: { state: AppState }) {
  const earned = BADGES.filter((b) => state.badges.includes(b.id));
  return (
    <div>
      <div className="card trophy">
        <div className="row">
          <h2 className="grow" style={{ margin: 0 }}><Icon name="trophy" /> Trophy shelf</h2>
          <span className="small muted">{earned.length} of {BADGES.length} badges</span>
        </div>
        <div className="shelf">
          {earned.length ? earned.map((b) => <span key={b.id} className="shelf-badge" title={b.name}>{b.icon}</span>) : <span className="small muted">No badges yet. Answer your first question to earn one!</span>}
        </div>
        <NextBadgeRow state={state} />
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>All badges</h3>
        <div className="badge-grid">
          {BADGES.map((b) => {
            const has = state.badges.includes(b.id);
            const [done, goal] = b.progress(state);
            return (
              <div key={b.id} className={`badge-cell ${has ? "" : "locked"}`}>
                <span className="shelf-badge">{b.icon}</span>
                <div>
                  <div className="small"><strong>{b.name}</strong>{has ? " ✅" : ""}</div>
                  <div className="small muted">{has ? "Earned!" : `🔒 ${b.how}${goal > 1 ? ` (${done}/${goal})` : ""}`}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
