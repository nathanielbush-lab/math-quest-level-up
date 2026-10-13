// Exact fractions. Every answer is stored as a fraction so 0.5, 1/2 and 2/4 compare equal.
export interface Frac {
  n: number;
  d: number;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export function frac(n: number, d = 1): Frac {
  if (d === 0) throw new Error("zero denominator");
  if (!Number.isInteger(n) || !Number.isInteger(d)) return fromDecimal(n / d);
  const g = gcd(n, d);
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g, d: (s * d) / g };
}

/** Converts a finite decimal such as 2.35 to an exact fraction. */
export function fromDecimal(x: number): Frac {
  if (Number.isInteger(x)) return { n: x, d: 1 };
  const s = x.toFixed(10).replace(/0+$/, "");
  const places = s.split(".")[1]?.length ?? 0;
  const d = 10 ** places;
  return frac(Math.round(x * d), d);
}

export const add = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Frac, b: Frac) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d);
export const div = (a: Frac, b: Frac) => frac(a.n * b.d, a.d * b.n);
export const eq = (a: Frac, b: Frac) => a.n * b.d === b.n * a.d;
export const toNum = (a: Frac) => a.n / a.d;
export const isInt = (a: Frac) => a.d === 1;
export const neg = (a: Frac) => frac(-a.n, a.d);

/** "3/4", "-5/2" or, with mixed, "-2 1/2". Plain integers print without a slash. */
export function fmtFrac(a: Frac, mixed = false): string {
  if (a.d === 1) return fmtInt(a.n);
  if (!mixed || Math.abs(a.n) < a.d) return `${a.n < 0 ? "-" : ""}${Math.abs(a.n)}/${a.d}`;
  const whole = Math.trunc(Math.abs(a.n) / a.d);
  const rem = Math.abs(a.n) % a.d;
  return `${a.n < 0 ? "-" : ""}${whole} ${rem}/${a.d}`;
}

function fmtInt(n: number): string {
  return String(n);
}

/** Display a number with at most `places` decimals and no trailing zeros. */
export function fmtNum(x: number, places = 4): string {
  const r = Number(x.toFixed(places));
  return Object.is(r, -0) ? "0" : String(r);
}

/** Display a fraction as a decimal when it terminates, otherwise as a fraction. */
export function fmtExact(a: Frac): string {
  let d = a.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1 ? fmtNum(toNum(a), 8) : fmtFrac(a);
}

export interface ParsedNumber {
  value: Frac;
  /** True when typed as a fraction (a/b), so "simplest form" can be checked. */
  typedFraction: boolean;
  /** True when a typed fraction was already in lowest terms. */
  simplest: boolean;
}

/**
 * Reads what a student typed: "3/4", "1 1/2", "-0.75", "$4.50", "25%", "1,200", "−3".
 * Returns null when it isn't a number.
 */
export function parseNumber(raw: string): ParsedNumber | null {
  let s = raw
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/[$%]/g, "")
    .replace(/(\d),(\d{3})/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return null;
  let sign = 1;
  if (s.startsWith("-")) {
    sign = -1;
    s = s.slice(1).trim();
  } else if (s.startsWith("+")) {
    s = s.slice(1).trim();
  }
  const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const [w, n, d] = [Number(mixed[1]), Number(mixed[2]), Number(mixed[3])];
    if (d === 0) return null;
    return { value: frac(sign * (w * d + n), d), typedFraction: true, simplest: gcd(n, d) === 1 && n < d };
  }
  const fr = s.match(/^(\d*\.?\d+)\s*\/\s*(\d*\.?\d+)$/);
  if (fr) {
    const n = Number(fr[1]);
    const d = Number(fr[2]);
    if (d === 0) return null;
    const integers = Number.isInteger(n) && Number.isInteger(d);
    return {
      value: frac(sign * n, d),
      typedFraction: true,
      simplest: integers ? gcd(n, d) === 1 && d !== 1 : false,
    };
  }
  if (/^(\d+\.?\d*|\.\d+)$/.test(s)) {
    return { value: fromDecimal(sign * Number(s)), typedFraction: false, simplest: true };
  }
  return null;
}
