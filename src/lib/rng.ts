// Small seeded random number generator so a problem can be re-created from its seed
// (used by the mistake journal and to keep tests reproducible).
export interface Rng {
  seed: number;
  next(): number;
  int(min: number, max: number): number;
  nonzero(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
  chance(p: number): boolean;
  sign(): 1 | -1;
}

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  return {
    seed,
    next,
    int,
    nonzero(min, max) {
      let v = 0;
      while (v === 0) v = int(min, max);
      return v;
    },
    pick: (items) => items[Math.floor(next() * items.length)],
    shuffle(items) {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    chance: (p) => next() < p,
    sign: () => (next() < 0.5 ? -1 : 1),
  };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
