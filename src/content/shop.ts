// The shop catalog: avatars, accent colors and power-ups, bought with XP.
// Prices are set from the XP economy: a daily run earns roughly 150–300 XP.

export type ShopKind = "avatar" | "theme" | "powerup";
export type ShopTier = "free" | "starter" | "nice" | "legendary";

export interface ShopItem {
  id: string;
  kind: ShopKind;
  name: string;
  /** Emoji shown on the card (and as the avatar). */
  icon: string;
  /** Price in XP. 0 = free and owned from the start. */
  price: number;
  tier: ShopTier;
  blurb?: string;
  /** Themes: two colors for the card's little preview swatch (light mode). */
  swatch?: [string, string];
}/** Using no avatar shows the first letter of the student's name. */
export const DEFAULT_AVATAR = "avatar-letter";
/** The skin's own accent. Equipping it clears `equipped.theme`. */
export const DEFAULT_THEME = "theme-default";
export const FREEZE_ID = "powerup-freeze";

const avatar = (id: string, icon: string, name: string, price: number, blurb?: string): ShopItem => ({
  id: `avatar-${id}`,
  kind: "avatar",
  name,
  icon,
  price,
  tier: price === 0 ? "free" : price <= 150 ? "starter" : price < 1000 ? "nice" : "legendary",
  blurb,
});

export const AVATARS: ShopItem[] = [
  { id: DEFAULT_AVATAR, kind: "avatar", name: "My letter", icon: "", price: 0, tier: "free", blurb: "The first letter of your name." },
  // Starter: affordable after a run or two.
  avatar("pi", "π", "Pi", 50),
  avatar("sigma", "Σ", "Sigma", 60),
  avatar("root", "√", "Root", 75),
  avatar("delta", "Δ", "Delta", 90),
  avatar("theta", "θ", "Theta", 100),
  avatar("bolt", "⚡", "Bolt", 120),
  avatar("headphones", "🎧", "Headphones", 120),
  avatar("controller", "🎮", "Controller", 150),
  // Nice: a few days of runs.
  avatar("infinity", "∞", "Infinity", 200),
  avatar("lambda", "λ", "Lambda", 220),
  avatar("phi", "φ", "Golden ratio", 250, "φ ≈ 1.618"),
  avatar("integral", "∫", "Integral", 300, "A preview of calculus."),
  avatar("basketball", "🏀", "Hoops", 300),
  avatar("skateboard", "🛹", "Skate", 300),
  avatar("guitar", "🎸", "Guitar", 350),
  avatar("wolf", "🐺", "Wolf", 350),
  avatar("shark", "🦈", "Shark", 400),
  avatar("rocket", "🚀", "Rocket", 400),
  avatar("euler", "e", "Euler's e", 450, "e ≈ 2.718"),
  // Legendary: a few weeks of work.
  avatar("aleph", "ℵ", "Aleph", 1500, "For infinities bigger than infinity."),
  avatar("imaginary", "𝑖", "Imaginary unit", 1800, "i² = −1."),
  avatar("dragon", "🐉", "Dragon", 2200, "The rarest of them all."),
];

const theme = (id: string, icon: string, name: string, price: number, swatch: [string, string], blurb: string): ShopItem => ({
  id: `theme-${id}`,
  kind: "theme",
  name,
  icon,
  price,
  tier: price === 0 ? "free" : "nice",
  swatch,
  blurb,
});

export const THEMES: ShopItem[] = [
  theme("default", "◆", "Skin default", 0, ["#2448e8", "#c8ff4d"], "Studio blue or Night Run lime."),
  theme("cyan", "◆", "Cyan", 400, ["#0e7490", "#4dd6ff"], "Cool and electric."),
  theme("violet", "◆", "Violet", 500, ["#6d28d9", "#b794ff"], "Deep purple."),
  theme("coral", "◆", "Coral", 600, ["#c2410c", "#ff8a65"], "Warm orange-red."),
  theme("magenta", "◆", "Magenta", 700, ["#be185d", "#ff6fb5"], "Hot pink."),
  theme("gold", "◆", "Gold", 900, ["#a16207", "#ffc94d"], "For a Legend."),
];

export const POWERUPS: ShopItem[] = [
  { id: FREEZE_ID, kind: "powerup", name: "Streak freeze", icon: "🧊", price: 250, tier: "nice", blurb: "Keeps your streak safe if you miss a day." },
];



export const SHOP_ITEMS: ShopItem[] = [...AVATARS, ...THEMES, ...POWERUPS];
export const SHOP_BY_ID: Record<string, ShopItem> = Object.fromEntries(SHOP_ITEMS.map((x) => [x.id, x]));

/** The value for `<html data-mq-theme>`: the theme's id, or "" for the default look (same as App.tsx sets). */
export function themeAttr(id: string | undefined): string {
  return !id || id === DEFAULT_THEME ? "" : id;
}
