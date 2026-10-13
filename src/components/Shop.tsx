// The star shop: spend stars on avatars, color themes and streak freezes.
import { useEffect, useRef, useState } from "react";
import { AVATARS, DEFAULT_AVATAR, FREEZE_ID, POWERUPS, SHOP_BY_ID, THEMES, themeAttr, type ShopItem } from "../content/shop";
import { MAX_FREEZES, FREEZE_EVERY } from "../engine/mastery";
import { buy, checkBuy, equip, equippedAvatar, isEquipped, isOwned } from "../engine/shop";
import { starBalance, type AppState } from "../engine/state";
import "./shop.css";

type Mutate = (fn: (s: AppState) => void) => void;

const fmt = (n: number) => n.toLocaleString("en-US");

function initial(name: string): string {
  const ch = [...name.trim()][0] ?? "";
  return ch.toUpperCase();
}

/** Her chosen avatar (or a default), shown in the greeting and the top bar. */
export function Avatar({ state, size = "sm" }: { state: AppState; size?: "sm" | "lg" }) {
  const name = state.settings.studentName.trim();
  if (!name) return null;
  const item = equippedAvatar(state);
  return (
    <span className={`mq-avatar ${size} ${item ? "" : "letter"}`} role="img" aria-label={item ? `Avatar: ${item.name}` : `Avatar: the letter ${initial(name)}`} title={item?.name}>
      <span aria-hidden="true">{item ? item.icon : initial(name)}</span>
    </span>
  );
}

interface Cheer {
  item: ShopItem;
  freezes: number;
  key: number;
}

export function ShopTab({ state, mutate }: { state: AppState; mutate: Mutate }) {
  const balance = starBalance(state);
  const [preview, setPreview] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [cheer, setCheer] = useState<Cheer | null>(null);
  const [focusAfter, setFocusAfter] = useState<string | null>(null);

  // Trying on a theme: apply it to the page, and put the real one back when she stops or leaves the tab.
  const equippedTheme = useRef(state.equipped.theme);
  equippedTheme.current = state.equipped.theme;
  useEffect(() => {
    if (!preview) return;
    const root = document.documentElement;
    root.dataset.mqTheme = themeAttr(preview);
    return () => {
      root.dataset.mqTheme = themeAttr(equippedTheme.current);
    };
  }, [preview]);

  // Escape stops a preview (when no dialog is open).
  useEffect(() => {
    if (!preview || confirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFocusAfter(preview);
        setPreview(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview, confirm]);

  useEffect(() => {
    if (!cheer) return;
    const id = setTimeout(() => setCheer(null), 4500);
    return () => clearTimeout(id);
  }, [cheer]);

  // Put keyboard focus back on the item's card after the dialog closes or the preview ends.
  useEffect(() => {
    if (!focusAfter) return;
    const card = document.getElementById(`shop-${focusAfter}`);
    const target = card?.querySelector<HTMLElement>("button:not(:disabled)") ?? card;
    target?.focus();
    setFocusAfter(null);
  }, [focusAfter]);

  const askBuy = (id: string) => setConfirm(id);
  const closeConfirm = () => {
    if (confirm) setFocusAfter(confirm);
    setConfirm(null);
  };
  const doBuy = (id: string) => {
    const check = checkBuy(state, id);
    if (!check.ok) return;
    mutate((s) => {
      buy(s, id);
    });
    setConfirm(null);
    setPreview(null);
    setFocusAfter(id);
    setCheer({ item: check.item, freezes: (state.streak.freezes ?? 0) + (check.item.kind === "powerup" ? 1 : 0), key: Date.now() });
  };
  const use = (id: string) =>
    mutate((s) => {
      equip(s, id);
    });
  const togglePreview = (id: string) => {
    setPreview((p) => (p === id ? null : id));
  };

  const previewItem = preview ? SHOP_BY_ID[preview] : undefined;
  const legendary = AVATARS.filter((a) => a.tier === "legendary");

  return (
    <div className="shop">
      {previewItem && <PreviewBar item={previewItem} state={state} onBuy={() => askBuy(previewItem.id)} onStop={() => { setFocusAfter(previewItem.id); setPreview(null); }} />}

      <div className="card shop-balance">
        <div className="grow">
          <div>
            <span className="big-num">⭐ {fmt(balance)}</span> <strong>stars to spend</strong>
            <span className="muted"> · {fmt(state.xp)} earned in all</span>
          </div>
          <div className="muted small">Earn stars by answering questions, doing challenges and finishing your daily quest. Spending stars never changes your progress.</div>
        </div>
      </div>

      <div className="shop-section">
        <h2>Avatars</h2>
        <span className="muted small">Your buddy shows up next to your name. ✨ Legendary ones take a few weeks of stars!</span>
      </div>
      <div className="shop-grid" role="list" aria-label="Avatars">
        {AVATARS.map((it) => (
          <ItemCard key={it.id} item={it} state={state} letter={initial(state.settings.studentName)} onBuy={askBuy} onUse={use} justBought={cheer?.item.id === it.id} />
        ))}
      </div>
      {legendary.every((l) => !isOwned(state, l.id)) && balance < legendary[0].price && (
        <p className="muted small" style={{ marginTop: 8 }}>
          Saving up for {legendary[0].icon} {legendary[0].name}? You're {Math.floor((balance / legendary[0].price) * 100)}% of the way there.
        </p>
      )}

      <div className="shop-section">
        <h2>Color themes</h2>
        <span className="muted small">Changes the colors of the whole app. Press “Try it” to see it first.</span>
      </div>
      <div className="shop-grid wide" role="list" aria-label="Color themes">
        {THEMES.map((it) => (
          <ItemCard key={it.id} item={it} state={state} onBuy={askBuy} onUse={use} previewing={preview === it.id} onPreview={togglePreview} justBought={cheer?.item.id === it.id} />
        ))}
      </div>

      <div className="shop-section">
        <h2>Power-ups</h2>
      </div>
      <div className="shop-grid powerups" role="list" aria-label="Power-ups">
        {POWERUPS.map((it) => (
          <ItemCard key={it.id} item={it} state={state} onBuy={askBuy} onUse={use} justBought={cheer?.item.id === it.id} />
        ))}
      </div>

      {confirm && SHOP_BY_ID[confirm] && <ConfirmBuy item={SHOP_BY_ID[confirm]} state={state} onBuy={() => doBuy(confirm)} onCancel={closeConfirm} />}
      {cheer && <CheerToast key={cheer.key} cheer={cheer} />}
    </div>
  );
}

function ItemCard({
  item,
  state,
  letter,
  onBuy,
  onUse,
  previewing,
  onPreview,
  justBought,
}: {
  item: ShopItem;
  state: AppState;
  letter?: string;
  onBuy: (id: string) => void;
  onUse: (id: string) => void;
  previewing?: boolean;
  onPreview?: (id: string) => void;
  justBought?: boolean;
}) {
  const owned = isOwned(state, item.id);
  const using = isEquipped(state, item.id);
  const check = checkBuy(state, item.id);
  const isLetter = item.id === DEFAULT_AVATAR;
  const freezes = state.streak.freezes ?? 0;

  const cls = ["shop-card", `${item.kind}-card`, item.kind === "powerup" ? "powerup" : "", using ? "equipped" : "", item.tier === "legendary" ? "legendary" : "", justBought ? "just-bought" : ""].filter(Boolean).join(" ");

  const icon = isLetter ? (
    <span className="icon letter" aria-hidden="true">{letter || "A"}</span>
  ) : (
    <span className="icon" aria-hidden="true">{item.icon}</span>
  );

  let action;
  if (using) action = <span className="using">✓ Using</span>;
  else if (owned)
    action = (
      <button className="btn primary" aria-label={`Use ${item.name}`} onClick={() => onUse(item.id)}>
        Use
      </button>
    );
  else if (check.ok)
    action = (
      <button className="btn primary" aria-label={`Buy ${item.name} for ${item.price} stars`} onClick={() => onBuy(item.id)}>
        Buy
      </button>
    );
  else if (check.reason === "max")
    action = (
      <button className="btn short" disabled>
        You already have the most ({MAX_FREEZES})
      </button>
    );
  else if (check.reason === "short")
    action = (
      <button className="btn short" disabled aria-label={`${item.name} costs ${item.price} stars. You need ${check.need} more.`}>
        Need {fmt(check.need)} more ⭐
      </button>
    );

  const price = owned ? (item.price === 0 ? <span className="price muted">Free</span> : <span className="price muted">Yours</span>) : <span className="price">⭐ {fmt(item.price)}</span>;

  if (item.kind === "powerup") {
    return (
      <div className={cls} id={`shop-${item.id}`} role="listitem" tabIndex={-1}>
        <span className="icon" aria-hidden="true">{item.icon}</span>
        <div className="info">
          <div className="name">{item.name}</div>
          <div className="blurb">{item.blurb} You also get one free for every {FREEZE_EVERY} days in a row.</div>
          <div className="small">
            You have{" "}
            <span className="freeze-dots" aria-hidden="true">
              {Array.from({ length: MAX_FREEZES }, (_, i) => (
                <span key={i} className={i < freezes ? "" : "off"}>🧊</span>
              ))}
            </span>{" "}
            <strong>{freezes} of {MAX_FREEZES}</strong>
          </div>
          {price}
        </div>
        <div className="actions">{action}</div>
      </div>
    );
  }

  if (item.kind === "theme") {
    return (
      <div className={cls} id={`shop-${item.id}`} role="listitem" tabIndex={-1}>
        <div className="swatch" style={{ background: `linear-gradient(135deg, ${item.swatch![0]}, ${item.swatch![1]})` }} aria-hidden="true">
          <span />
        </div>
        <div className="head">
          <span className="icon" aria-hidden="true" style={{ fontSize: "1.8rem" }}>{item.icon}</span>
          <div className="grow">
            <div className="name">{item.name}</div>
            <div className="blurb">{item.blurb}</div>
          </div>
          {price}
        </div>
        <div className="actions">
          {!owned && onPreview && (
            <button className={`btn ${previewing ? "primary" : "ghost"}`} aria-pressed={previewing} aria-label={previewing ? `Stop trying ${item.name}` : `Try the ${item.name} colors`} onClick={() => onPreview(item.id)}>
              {previewing ? "Stop trying" : "Try it"}
            </button>
          )}
          {action}
        </div>
      </div>
    );
  }

  return (
    <div className={cls} id={`shop-${item.id}`} role="listitem" tabIndex={-1}>
      {item.tier === "legendary" && <span className="tag">✨ Legendary</span>}
      {icon}
      <div className="name">{item.name}</div>
      {item.blurb && item.tier === "legendary" && <div className="blurb">{item.blurb}</div>}
      {price}
      <div className="actions">{action}</div>
    </div>
  );
}

function PreviewBar({ item, state, onBuy, onStop }: { item: ShopItem; state: AppState; onBuy: () => void; onStop: () => void }) {
  const check = checkBuy(state, item.id);
  return (
    <div className="card hero shop-preview" role="region" aria-label={`Trying the ${item.name} colors`}>
      <div className="row">
        <div className="grow">
          <h3 style={{ margin: 0 }}>
            {item.icon} Trying on {item.name}
          </h3>
          <div className="muted small">Look around! Your colors go back when you stop or leave the shop.</div>
        </div>
      </div>
      <div className="sample">
        {check.ok ? (
          <button className="btn primary" onClick={onBuy}>
            Buy for {fmt(item.price)} ⭐
          </button>
        ) : check.reason === "short" ? (
          <span className="small" style={{ fontWeight: 700 }}>Need {fmt(check.need)} more ⭐</span>
        ) : null}
        <button className="btn on-hero" onClick={onStop}>
          Stop trying
        </button>
      </div>
    </div>
  );
}

function ConfirmBuy({ item, state, onBuy, onCancel }: { item: ShopItem; state: AppState; onBuy: () => void; onCancel: () => void }) {
  const check = checkBuy(state, item.id);
  const left = starBalance(state) - item.price;
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    dialog.current?.querySelector<HTMLElement>("button:not(:disabled)")?.focus();
  }, []);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCancel();
    } else if (e.key === "Tab") {
      // Keep focus inside the dialog.
      const btns = [...(dialog.current?.querySelectorAll<HTMLElement>("button:not(:disabled)") ?? [])];
      if (!btns.length) return;
      const i = btns.indexOf(document.activeElement as HTMLElement);
      const j = e.shiftKey ? (i <= 0 ? btns.length - 1 : i - 1) : i === btns.length - 1 ? 0 : i + 1;
      e.preventDefault();
      btns[j].focus();
    }
  };
  const what = item.kind === "avatar" ? "It will be your new avatar." : item.kind === "theme" ? "The app will switch to these colors." : "It keeps your streak safe if you miss a day.";
  return (
    <div className="shop-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="shop-dialog" role="dialog" aria-modal="true" aria-labelledby="shop-confirm-title" aria-describedby="shop-confirm-desc" ref={dialog} onKeyDown={onKey}>
        <div className="icon" aria-hidden="true">{item.icon}</div>
        <h2 id="shop-confirm-title">
          Spend {fmt(item.price)} ⭐ on {item.icon} {item.name}?
        </h2>
        <p className="muted" id="shop-confirm-desc">
          {what} You'll have {fmt(Math.max(0, left))} ⭐ left.
        </p>
        <div className="row">
          <button className="btn primary big" onClick={onBuy} disabled={!check.ok}>
            Buy
          </button>
          <button className="btn ghost big" onClick={onCancel}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

function CheerToast({ cheer }: { cheer: Cheer }) {
  const { item } = cheer;
  const text =
    item.kind === "avatar"
      ? `${item.name} is your new avatar!`
      : item.kind === "theme"
        ? `Your ${item.name} colors are on!`
        : item.id === FREEZE_ID
          ? `Streak freeze saved! You have ${cheer.freezes}.`
          : `You got ${item.name}!`;
  const sparkles = ["✨", "⭐", "🎉", "✨", "⭐", "💫"];
  return (
    <div className="shop-cheer" role="status">
      <span className="sparkles" aria-hidden="true">
        {sparkles.map((s, i) => (
          <span key={i} style={{ left: `${8 + i * 17}%`, top: i % 2 ? "0" : "70%", animationDelay: `${i * 0.08}s` }}>{s}</span>
        ))}
      </span>
      <span className="icon" aria-hidden="true">{item.icon}</span>
      <span>Yay! 🎉 {text}</span>
    </div>
  );
}
