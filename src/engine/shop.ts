// Star shop rules: what she can buy, buying, and choosing what to use. Pure functions on AppState.
import { DEFAULT_AVATAR, DEFAULT_THEME, FREEZE_ID, SHOP_BY_ID, type ShopItem } from "../content/shop";
import { MAX_FREEZES } from "./mastery";
import { starBalance, type AppState } from "./state";

export type BuyCheck =
  | { ok: true; item: ShopItem }
  | { ok: false; reason: "unknown" }
  | { ok: false; reason: "owned"; item: ShopItem }
  | { ok: false; reason: "max"; item: ShopItem }
  | { ok: false; reason: "short"; item: ShopItem; need: number };

/** Free items are owned from the start; streak freezes are never "owned" (they get used up). */
export function isOwned(state: AppState, id: string): boolean {
  const item = SHOP_BY_ID[id];
  if (!item || item.kind === "powerup") return false;
  return item.price === 0 || state.owned.includes(id);
}

export function isEquipped(state: AppState, id: string): boolean {
  const item = SHOP_BY_ID[id];
  if (item?.kind === "avatar") return (equippedAvatar(state)?.id ?? DEFAULT_AVATAR) === id;
  if (item?.kind === "theme") return (SHOP_BY_ID[state.equipped.theme ?? ""]?.kind === "theme" ? state.equipped.theme : DEFAULT_THEME) === id;
  return false;
}

/** The avatar she's using, or undefined for the default (her first letter). */
export function equippedAvatar(state: AppState): ShopItem | undefined {
  const item = SHOP_BY_ID[state.equipped.avatar ?? ""];
  return item?.kind === "avatar" && item.id !== DEFAULT_AVATAR && isOwned(state, item.id) ? item : undefined;
}

export function checkBuy(state: AppState, id: string): BuyCheck {
  const item = SHOP_BY_ID[id];
  if (!item) return { ok: false, reason: "unknown" };
  if (isOwned(state, id)) return { ok: false, reason: "owned", item };
  if (id === FREEZE_ID && (state.streak.freezes ?? 0) >= MAX_FREEZES) return { ok: false, reason: "max", item };
  const balance = starBalance(state);
  if (balance < item.price) return { ok: false, reason: "short", item, need: item.price - balance };
  return { ok: true, item };
}

export function canBuy(state: AppState, id: string): boolean {
  return checkBuy(state, id).ok;
}

/**
 * Spend stars on an item (changes `state`). Avatars and themes are added to `owned` and put
 * on right away; a streak freeze just adds one to `streak.freezes`. Nothing changes if she can't buy it.
 */
export function buy(state: AppState, id: string): BuyCheck {
  const check = checkBuy(state, id);
  if (!check.ok) return check;
  const item = check.item;
  state.starsSpent = (state.starsSpent ?? 0) + item.price;
  if (item.kind === "powerup") {
    state.streak.freezes = (state.streak.freezes ?? 0) + 1;
  } else {
    state.owned.push(item.id);
    equip(state, item.id);
  }
  return check;
}

/** Use an owned avatar or theme (free). Returns false if she doesn't own it. */
export function equip(state: AppState, id: string): boolean {
  const item = SHOP_BY_ID[id];
  if (!item || item.kind === "powerup" || !isOwned(state, id)) return false;
  const key = item.kind === "avatar" ? "avatar" : "theme";
  const isDefault = id === DEFAULT_AVATAR || id === DEFAULT_THEME;
  if (isDefault) delete state.equipped[key];
  else state.equipped[key] = id;
  return true;
}

/** Go back to the default avatar or theme. */
export function unequip(state: AppState, kind: "avatar" | "theme") {
  delete state.equipped[kind];
}
