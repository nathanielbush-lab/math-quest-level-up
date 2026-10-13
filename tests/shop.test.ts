import { beforeEach, describe, expect, it } from "vitest";
import { AVATARS, DEFAULT_AVATAR, DEFAULT_THEME, FREEZE_ID, SHOP_ITEMS, THEMES, themeAttr } from "../src/content/shop";
import { MAX_FREEZES } from "../src/engine/mastery";
import { buy, canBuy, checkBuy, equip, equippedAvatar, isEquipped, isOwned, unequip } from "../src/engine/shop";
import { newState, starBalance, type AppState } from "../src/engine/state";

let s: AppState;
beforeEach(() => {
  s = newState();
  s.settings.studentName = "Maya";
  s.xp = 1000;
});

describe("shop catalog", () => {
  it("has unique ids, ~20+ avatars, 6 themes and a freeze", () => {
    expect(new Set(SHOP_ITEMS.map((x) => x.id)).size).toBe(SHOP_ITEMS.length);
    expect(AVATARS.length).toBeGreaterThanOrEqual(20);
    expect(THEMES.length).toBe(6);
    expect(SHOP_ITEMS.find((x) => x.id === FREEZE_ID)?.price).toBe(250);
  });
  it("prices follow the economy tiers", () => {
    const paid = AVATARS.filter((a) => a.price > 0);
    expect(Math.min(...paid.map((a) => a.price))).toBeLessThanOrEqual(150);
    const legendary = AVATARS.filter((a) => a.tier === "legendary");
    expect(legendary.length).toBeGreaterThanOrEqual(2);
    for (const l of legendary) expect(l.price).toBeGreaterThanOrEqual(1500);
    for (const t of THEMES.filter((t) => t.price > 0)) expect(t.price).toBeGreaterThanOrEqual(400);
  });
  it("defaults are free and owned from the start", () => {
    expect(isOwned(s, DEFAULT_AVATAR)).toBe(true);
    expect(isOwned(s, DEFAULT_THEME)).toBe(true);
    expect(isEquipped(s, DEFAULT_AVATAR)).toBe(true);
    expect(isEquipped(s, DEFAULT_THEME)).toBe(true);
    expect(themeAttr(undefined)).toBe("");
    expect(themeAttr(DEFAULT_THEME)).toBe("");
    expect(themeAttr("theme-ocean")).toBe("theme-ocean");
  });
});

describe("buy", () => {
  it("spends stars, owns and equips an avatar", () => {
    const r = buy(s, "avatar-fox");
    expect(r.ok).toBe(true);
    expect(s.starsSpent).toBe(250);
    expect(starBalance(s)).toBe(750);
    expect(s.owned).toEqual(["avatar-fox"]);
    expect(s.equipped.avatar).toBe("avatar-fox");
    expect(equippedAvatar(s)?.icon).toBe("🦊");
    expect(isEquipped(s, DEFAULT_AVATAR)).toBe(false);
  });
  it("equips a bought theme", () => {
    buy(s, "theme-ocean");
    expect(s.equipped.theme).toBe("theme-ocean");
    expect(isEquipped(s, "theme-ocean")).toBe(true);
    expect(isEquipped(s, DEFAULT_THEME)).toBe(false);
  });
  it("refuses when short and says how many more", () => {
    s.xp = 300;
    s.starsSpent = 100;
    const c = checkBuy(s, "avatar-fox");
    expect(c).toMatchObject({ ok: false, reason: "short", need: 50 });
    expect(canBuy(s, "avatar-fox")).toBe(false);
    const before = JSON.stringify(s);
    expect(buy(s, "avatar-fox").ok).toBe(false);
    expect(JSON.stringify(s)).toBe(before);
  });
  it("allows spending the exact balance", () => {
    s.xp = 250;
    expect(buy(s, "avatar-fox").ok).toBe(true);
    expect(starBalance(s)).toBe(0);
  });
  it("won't buy twice, or buy free/unknown items", () => {
    buy(s, "avatar-fox");
    expect(checkBuy(s, "avatar-fox")).toMatchObject({ ok: false, reason: "owned" });
    expect(checkBuy(s, DEFAULT_THEME)).toMatchObject({ ok: false, reason: "owned" });
    expect(checkBuy(s, "nope")).toMatchObject({ ok: false, reason: "unknown" });
    expect(s.starsSpent).toBe(250);
  });
  it("streak freezes add to streak.freezes, not owned, up to the max", () => {
    expect(buy(s, FREEZE_ID).ok).toBe(true);
    expect(s.streak.freezes).toBe(1);
    expect(s.owned).toEqual([]);
    expect(buy(s, FREEZE_ID).ok).toBe(true);
    expect(s.streak.freezes).toBe(MAX_FREEZES);
    expect(checkBuy(s, FREEZE_ID)).toMatchObject({ ok: false, reason: "max" });
    expect(buy(s, FREEZE_ID).ok).toBe(false);
    expect(s.starsSpent).toBe(500);
  });
  it("counts freezes earned for free toward the max", () => {
    s.streak.freezes = 2;
    expect(canBuy(s, FREEZE_ID)).toBe(false);
  });
  it("handles old saves without starsSpent / freezes", () => {
    const old = s as unknown as { starsSpent?: number; streak: { freezes?: number } };
    delete old.starsSpent;
    delete old.streak.freezes;
    expect(buy(s, FREEZE_ID).ok).toBe(true);
    expect(s.starsSpent).toBe(250);
    expect(s.streak.freezes).toBe(1);
  });
});

describe("equip", () => {
  it("switches between owned items for free and back to defaults", () => {
    buy(s, "avatar-fox");
    buy(s, "avatar-kitty");
    expect(s.equipped.avatar).toBe("avatar-kitty");
    const spent = s.starsSpent;
    expect(equip(s, "avatar-fox")).toBe(true);
    expect(s.equipped.avatar).toBe("avatar-fox");
    expect(equip(s, DEFAULT_AVATAR)).toBe(true);
    expect(s.equipped.avatar).toBeUndefined();
    expect(equippedAvatar(s)).toBeUndefined();
    buy(s, "theme-forest");
    expect(equip(s, DEFAULT_THEME)).toBe(true);
    expect(s.equipped.theme).toBeUndefined();
    expect(s.starsSpent).toBe(spent + 500);
  });
  it("won't equip what she doesn't own or a power-up", () => {
    expect(equip(s, "avatar-dragon")).toBe(false);
    expect(equip(s, "theme-berry")).toBe(false);
    expect(equip(s, FREEZE_ID)).toBe(false);
    expect(s.equipped).toEqual({});
  });
  it("ignores an equipped avatar she doesn't own (e.g. a hand-edited save)", () => {
    s.equipped.avatar = "avatar-dragon";
    expect(equippedAvatar(s)).toBeUndefined();
    expect(isEquipped(s, DEFAULT_AVATAR)).toBe(true);
  });
  it("unequip goes back to the default", () => {
    buy(s, "theme-sunset");
    unequip(s, "theme");
    expect(isEquipped(s, DEFAULT_THEME)).toBe(true);
  });
});
