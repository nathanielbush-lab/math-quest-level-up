// The star shop catalog: avatars, color themes and power-ups.
// Prices are set from the star economy: a daily quest earns roughly 150–300 stars.

export type ShopKind = "avatar" | "theme" | "powerup";
export type ShopTier = "free" | "starter" | "nice" | "legendary";

export interface ShopItem {
  id: string;
  kind: ShopKind;
  name: string;
  /** Emoji shown on the card (and as the avatar). */
  icon: string;
  /** Price in stars. 0 = free and owned from the start. */
  price: number;
  tier: ShopTier;
  blurb?: string;
  /** Themes: two colors for the card's little preview swatch (light mode). */
  swatch?: [string, string];
}

/** Using no avatar shows the first letter of her name. */
export const DEFAULT_AVATAR = "avatar-letter";
/** The built-in purple look. Equipping it clears `equipped.theme`. */
export const DEFAULT_THEME = "theme-grape";
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
  // Starter: affordable after the first quest or two.
  avatar("kitty", "🐱", "Kitty", 50),
  avatar("puppy", "🐶", "Puppy", 50),
  avatar("frog", "🐸", "Frog", 75),
  avatar("pizza", "🍕", "Pizza", 80),
  avatar("soccer", "⚽", "Soccer ball", 90),
  avatar("turtle", "🐢", "Turtle", 100),
  avatar("cupcake", "🧁", "Cupcake", 100),
  avatar("penguin", "🐧", "Penguin", 120),
  avatar("happy-cat", "🐾", "Cat paws", 150), // id kept from the old 😺 “Happy cat” so anyone who bought it keeps it
  // Nice: a few days of quests.
  avatar("butterfly", "🦋", "Butterfly", 200),
  avatar("cat", "🐈", "Cat", 200),
  avatar("fox", "🦊", "Fox", 250),
  avatar("panda", "🐼", "Panda", 250),
  avatar("black-cat", "🐈‍⬛", "Black cat", 300),
  avatar("owl", "🦉", "Owl", 300),
  avatar("heart-cat", "😻", "Heart-eyes cat", 350),
  avatar("rocket", "🚀", "Rocket", 350),
  avatar("leopard", "🐆", "Leopard", 350),
  avatar("tiger", "🐯", "Tiger", 400),
  avatar("robot", "🤖", "Robot", 400),
  avatar("trex", "🦖", "T. rex", 400),
  // Legendary: a few weeks of work.
  avatar("unicorn", "🦄", "Unicorn", 1500, "A legendary friend."),
  avatar("lion", "🦁", "Royal lion", 1800, "The king of all cats."),
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
  theme("grape", "🍇", "Grape", 0, ["#5b4bd6", "#8a5cf0"], "The classic purple."),
  theme("ocean", "🌊", "Ocean", 400, ["#1d67a8", "#0e7c86"], "Cool blues and sea green."),
  theme("forest", "🌲", "Forest", 500, ["#2b7a4b", "#1d6b5a"], "Leafy greens."),
  theme("sunset", "🌅", "Sunset", 600, ["#bf4310", "#c2335f"], "Warm orange and pink."),
  theme("berry", "🍓", "Berry", 700, ["#b8246f", "#7f2db0"], "Bright pink and plum."),
  theme("midnight", "🌙", "Midnight", 900, ["#2b3a8c", "#10173f"], "Deep night-sky blue."),
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
