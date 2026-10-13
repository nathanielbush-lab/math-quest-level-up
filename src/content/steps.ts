// Building blocks for detailed worked solutions.
// Each step reads "**What we do.** the actual work", so a student can follow the reasoning, not just the arithmetic.
import { frac, gcd, lcm, type Frac } from "../lib/rational";

/** One labelled solution step. */
export function st(head: string, body = ""): string {
  return body ? `**${head}** ${body}` : `**${head}**`;
}

const minus = (x: number) => (x < 0 ? `−${-x}` : String(x));
const num = (x: number) => String(Number(x.toFixed(6))).replace("-", "−");

export function factorsOf(n: number): number[] {
  const out: number[] = [];
  for (let i = 1; i <= Math.abs(n); i++) if (n % i === 0) out.push(i);
  return out;
}

/** "{a/b}" markup without simplifying (keeps the student's intermediate fraction). */
export function raw(n: number, d: number): string {
  if (d === 1) return minus(n);
  return n < 0 ? `−{${-n}/${d}}` : `{${n}/${d}}`;
}

/** Mixed-number markup for a raw fraction. */
export function rawMixed(n: number, d: number): string {
  const f = frac(n, d);
  if (f.d === 1) return minus(f.n);
  if (Math.abs(f.n) < f.d) return raw(f.n, f.d);
  const w = Math.trunc(Math.abs(f.n) / f.d);
  return `${f.n < 0 ? "−" : ""}${w}{${Math.abs(f.n) % f.d}/${f.d}}`;
}

/** Steps to find the GCF of two positive whole numbers. */
export function gcfSteps(a: number, b: number): string[] {
  const g = gcd(a, b);
  if (Math.max(a, b) <= 60) {
    return [
      st("List the factors of each number.", `${a}: ${factorsOf(a).join(", ")}. ${b}: ${factorsOf(b).join(", ")}.`),
      st("Pick the greatest factor they share.", `Common factors: ${factorsOf(g).join(", ")}. The greatest is ${g}.`),
    ];
  }
  const out: string[] = [];
  let x = a, y = b, acc = 1;
  for (const p of [2, 3, 5, 7, 11, 13]) {
    while (x % p === 0 && y % p === 0) {
      out.push(st(`Both are divisible by ${p}.`, `${x} ÷ ${p} = ${x / p} and ${y} ÷ ${p} = ${y / p}.`));
      x /= p;
      y /= p;
      acc *= p;
    }
  }
  out.push(st("Multiply the common factors you took out.", `${acc === g ? "" : "Then "}GCF = ${acc}.`));
  return out;
}

/**
 * Steps to reduce n/d to simplest form (n, d may come from earlier work).
 * Returns no steps if it's already simplest.
 */
export function simplifySteps(n: number, d: number, label = "Simplify."): string[] {
  const an = Math.abs(n);
  const g = gcd(an, d);
  if (g === 1 || n === 0) return [];
  const pf: number[] = [];
  for (let x = g, q = 2; x > 1; ) {
    if (x % q === 0) {
      pf.push(q);
      x /= q;
    } else q++;
  }
  const why = pf.length > 1 ? ` (${g} = ${pf.join(" × ")})` : "";
  return [st(label, `The greatest number that divides both ${an} and ${d} is ${g}${why}. Divide the top and bottom by ${g}: ${raw(n, d)} = {${an} ÷ ${g}/${d} ÷ ${g}} = ${raw(n / g, d / g)}.`)];
}

/** Improper fraction → mixed number, as a step. Empty if not improper. */
export function toMixedStep(n: number, d: number): string[] {
  const f = frac(n, d);
  if (f.d === 1 || Math.abs(f.n) < f.d) return [];
  const w = Math.trunc(Math.abs(f.n) / f.d);
  const r = Math.abs(f.n) % f.d;
  return [st("Change to a mixed number.", `${Math.abs(f.n)} ÷ ${f.d} = ${w} remainder ${r}, so ${raw(f.n, f.d)} = ${rawMixed(f.n, f.d)}.`)];
}

/** Mixed number → improper fraction, as a step. */
export function toImproperStep(f: Frac): string {
  const w = Math.trunc(Math.abs(f.n) / f.d);
  const r = Math.abs(f.n) % f.d;
  return st(`Change ${rawMixed(f.n, f.d)} to an improper fraction.`, `${w} whole${w === 1 ? "" : "s"} = ${raw(w * f.d, f.d)}, plus ${raw(r, f.d)} makes ${raw(Math.abs(f.n), f.d)}. (Shortcut: ${w} × ${f.d} + ${r} = ${Math.abs(f.n)}.)`);
}

/** Simplify then convert to a mixed number: the usual "finish" of a fraction answer. */
export function finishSteps(n: number, d: number): string[] {
  const g = gcd(Math.abs(n), d);
  return [...simplifySteps(n, d), ...toMixedStep(n / g, d / g)];
}

/** Steps to find the least common denominator. */
export function lcdStep(a: number, b: number): string {
  const L = lcm(a, b);
  const big = Math.max(a, b), small = Math.min(a, b);
  if (L === big) return st("Find a common denominator.", `${big} is already a multiple of ${small}, so use ${big}.`);
  const mults = Array.from({ length: L / big }, (_, i) => (i + 1) * big);
  return st("Find a common denominator.", `List multiples of ${big}: ${mults.join(", ")}. The first one ${small} also divides into is ${L}.`);
}

/** Rewrite a/b with denominator L. */
export function rewriteStep(f: Frac, L: number, which = ""): string {
  const k = L / f.d;
  if (k === 1) return st(`${which ? which + " " : ""}${raw(f.n, f.d)} already has denominator ${L}.`);
  return st(`Rewrite ${which ? which + " " : ""}${raw(f.n, f.d)} with ${L} on the bottom.`, `${L} ÷ ${f.d} = ${k}, so multiply the top and bottom by ${k}: {${minus(f.n)} × ${k}/${f.d} × ${k}} = ${raw(f.n * k, L)}.`);
}

/** Partial-products multiplication of two whole numbers, as steps. */
export function multiplySteps(a: number, b: number): string[] {
  if (a < 10 || b < 10) return [st("Multiply.", `${a} × ${b} = ${a * b}`)];
  const [x, y] = a >= b ? [a, b] : [b, a];
  const parts = String(y)
    .split("")
    .reverse()
    .map((digit, i) => Number(digit) * 10 ** i)
    .filter((p) => p > 0)
    .reverse();
  return [
    st("Break the smaller number into place values.", `${y} = ${parts.join(" + ")}`),
    st("Multiply each part.", parts.map((p) => `${x} × ${p} = ${x * p}`).join("; ")),
    st("Add the partial products.", `${parts.map((p) => x * p).join(" + ")} = ${x * y}`),
  ];
}

/** Long division (whole-number quotient), one step per digit. */
export function longDivisionSteps(dividend: number, divisor: number): string[] {
  const digits = String(dividend).split("").map(Number);
  const out: string[] = [];
  let cur = 0;
  let started = false;
  let q = "";
  for (let i = 0; i < digits.length; i++) {
    cur = cur * 10 + digits[i];
    if (!started && cur < divisor) continue;
    started = true;
    const k = Math.floor(cur / divisor);
    const rem = cur - k * divisor;
    q += k;
    const next = i + 1 < digits.length ? ` Bring down the ${digits[i + 1]} to make ${rem * 10 + digits[i + 1]}.` : "";
    out.push(st(`How many ${divisor}s fit in ${cur}?`, `${k} (because ${k} × ${divisor} = ${k * divisor}). ${cur} − ${k * divisor} = ${rem}.${next}`));
    cur = rem;
  }
  out.push(st("Read the answer across the top.", `${dividend} ÷ ${divisor} = ${Number(q)}`));
  return out;
}

/** Number of digits after the decimal point. */
export function places(x: number): number {
  const s = String(Number(x.toFixed(8)));
  return s.includes(".") ? s.split(".")[1].length : 0;
}

/** Multiply two decimals the "ignore the points, then place it" way. */
export function decimalMultiplySteps(a: number, b: number): string[] {
  const pa = places(a), pb = places(b);
  const A = Math.round(a * 10 ** pa), B = Math.round(b * 10 ** pb);
  const prod = A * B;
  const total = pa + pb;
  const ans = Number((a * b).toFixed(8));
  if (total === 0) return multiplySteps(a, b);
  const out: string[] = [];
  if (a >= 1 && b >= 1) out.push(st("Estimate first.", `${num(a)} is about ${Math.round(a)} and ${num(b)} is about ${Math.round(b)}, so the answer should be about ${Math.round(a) * Math.round(b)}.`));
  else out.push(st("Think about the size.", `${a < 1 && b < 1 ? "Both numbers are less than 1, so the answer will be smaller than either one." : "Multiplying by a number less than 1 gives an answer smaller than the other number."}`));
  if (A >= 10 && B >= 10) {
    out.push(st("Multiply as if there were no decimal points.", `${A} × ${B}`));
    out.push(...multiplySteps(A, B));
  } else {
    out.push(st("Multiply as if there were no decimal points.", `${A} × ${B} = ${prod}`));
  }
  out.push(st("Count the decimal places.", `${num(a)} has ${pa} and ${num(b)} has ${pb}, so the answer needs ${total}.`));
  out.push(st("Place the decimal point.", `${prod} with ${total} decimal place${total === 1 ? "" : "s"} is ${num(ans)}.${total > String(prod).length ? " (Add zeros in front to make room.)" : ""}`));
  return out;
}

/** "Find p% of base" with a mental-math route when possible. */
export function percentOfSteps(p: number, base: number): string[] {
  const ans = Number(((p * base) / 100).toFixed(6));
  const ten = base / 10;
  const easy: Record<number, string> = { 50: "half", 25: "a quarter", 75: "three quarters", 20: "a fifth", 10: "a tenth" };
  const out: string[] = [st("Percent means “out of 100”.", `${p}% = {${p}/100} = ${num(p / 100)}`)];
  if (easy[p] && p !== 10) {
    const den = p === 50 ? 2 : p === 20 ? 5 : 4;
    out.push(st(`${p}% is ${easy[p]}.`, p === 75 ? `A quarter of ${num(base)} is ${num(base)} ÷ 4 = ${num(base / 4)}. Three quarters is 3 × ${num(base / 4)} = ${num(ans)}.` : `${num(base)} ÷ ${den} = ${num(ans)}`));
  } else if (p % 5 === 0) {
    const tens = Math.floor(p / 10);
    const five = p % 10 === 5;
    out.push(st("Find 10% first.", `10% of ${num(base)} is ${num(base)} ÷ 10 = ${num(ten)}.`));
    if (tens > 1) out.push(st(`Build up to ${tens * 10}%.`, `${tens} × ${num(ten)} = ${num(tens * ten)}`));
    if (five) out.push(st("Add 5% (half of 10%).", `${num(ten)} ÷ 2 = ${num(ten / 2)}, so ${p}% = ${tens ? `${num(tens * ten)} + ${num(ten / 2)} = ` : ""}${num(ans)}`));
  } else {
    out.push(st("Multiply by the decimal.", `${num(p / 100)} × ${num(base)} = ${num(ans)}`));
  }
  out.push(st("Answer.", `${p}% of ${num(base)} = ${num(ans)}`));
  return out;
}

/** Solve a·x + b = c (a ≠ 0), showing both sides. v is the variable name. */
export function twoStepSolve(a: number, b: number, c: number, v = "x"): string[] {
  const lhs = `${a === 1 ? "" : a === -1 ? "−" : minus(a)}${v}`;
  const out: string[] = [];
  if (b !== 0) {
    out.push(st(`Undo the ${b > 0 ? "+" : "−"} ${Math.abs(b)}: ${b > 0 ? "subtract" : "add"} ${Math.abs(b)} on both sides.`, `${lhs} ${b > 0 ? "+" : "−"} ${Math.abs(b)} ${b > 0 ? "−" : "+"} ${Math.abs(b)} = ${minus(c)} ${b > 0 ? "−" : "+"} ${Math.abs(b)}, so ${lhs} = ${minus(c - b)}`));
  }
  if (a !== 1) {
    out.push(st(`Undo the × ${minus(a)}: divide both sides by ${minus(a)}.`, `${v} = ${minus(c - b)} ÷ ${a < 0 ? `(${minus(a)})` : a} = ${num((c - b) / a)}`));
  }
  out.push(st("Check by substituting.", `${a === 1 ? "" : `${minus(a)} × `}${num((c - b) / a) .replace(/^−/, "(−")}${(c - b) / a < 0 ? ")" : ""}${b ? ` ${b > 0 ? "+" : "−"} ${Math.abs(b)}` : ""} = ${minus(c)} ✔`));
  return out;
}

/** Add or subtract decimals by lining up the points. */
export function decimalAddSubSteps(a: number, b: number, subtract: boolean, money = false): string[] {
  const p = Math.max(places(a), places(b), money ? 2 : 0);
  const A = Math.round(a * 10 ** p), B = Math.round(b * 10 ** p);
  const res = subtract ? A - B : A + B;
  const ans = res / 10 ** p;
  const unit = ["ones", "tenths", "hundredths", "thousandths"][p];
  const op = subtract ? "−" : "+";
  return [
    st("Estimate first.", `${num(a)} is about ${Math.round(a)} and ${num(b)} is about ${Math.round(b)}, so the answer is about ${subtract ? Math.round(a) - Math.round(b) : Math.round(a) + Math.round(b)}.`),
    st("Line up the decimal points.", `Write both with ${p} decimal place${p === 1 ? "" : "s"} (extra zeros don't change the value): ${a.toFixed(p)} ${op} ${b.toFixed(p)}.`),
    st(`${subtract ? "Subtract" : "Add"} like whole numbers.`, `Think of them as ${unit}: ${A} ${op} ${B} = ${res} ${unit}.`),
    st("Put the decimal point back in the same place.", `${res} ${unit} = ${ans.toFixed(p)}`),
    st("Compare with the estimate.", `${ans.toFixed(p)} is close to the estimate ✔`),
  ];
}

/** Divide by a decimal: scale both numbers so the divisor is whole. */
export function decimalDivideSteps(dividend: number, divisor: number): string[] {
  const s = 10 ** places(divisor);
  const D = Number((dividend * s).toFixed(6)), d = Math.round(divisor * s);
  const q = Number((dividend / divisor).toFixed(6));
  const out = [
    st("Make the divisor a whole number.", `Multiply BOTH numbers by ${s} (move each decimal point ${places(divisor)} place${places(divisor) === 1 ? "" : "s"} right): ${num(dividend)} ÷ ${num(divisor)} becomes ${num(D)} ÷ ${d}. The answer doesn't change, just like {${num(dividend)}/${num(divisor)}} = {${num(D)}/${d}}.`),
  ];
  if (Number.isInteger(D) && D >= 100 && d >= 10) out.push(...longDivisionSteps(D, d));
  else out.push(st("Divide.", `${num(D)} ÷ ${d} = ${num(q)} (because ${num(q)} × ${d} = ${num(D)})`));
  out.push(st("Check by multiplying.", `${num(q)} × ${num(divisor)} = ${num(dividend)} ✔`));
  return out;
}

const mix = (f: Frac) => rawMixed(f.n, f.d);

/** "a × b = …" for fractions or whole numbers, showing the fraction multiplication. */
export function fracTimes(a: Frac, b: Frac): string {
  const p = frac(a.n * b.n, a.d * b.d);
  if (a.d === 1 && b.d === 1) return `${minus(a.n)} × ${minus(b.n)} = ${minus(p.n)}`;
  const asFrac = (f: Frac) => (f.d === 1 ? `{${minus(f.n)}/1}` : raw(f.n, f.d));
  return `${mix(a)} × ${mix(b)} = ${asFrac(a)} × ${asFrac(b)} = {${a.n} × ${b.n}/${a.d} × ${b.d}} = ${raw(a.n * b.n, a.d * b.d)}${p.d !== a.d * b.d || Math.abs(p.n) > p.d ? ` = ${mix(p)}` : ""}`;
}

/** "a ÷ b = …" using keep-change-flip. */
export function fracDivide(a: Frac, b: Frac): string {
  const q = frac(a.n * b.d, a.d * b.n);
  if (a.d === 1 && b.d === 1) return `${minus(a.n)} ÷ ${minus(b.n)} = ${mix(q)}`;
  const asFrac = (n: number, d: number) => (d === 1 ? `{${minus(n)}/1}` : raw(n, d));
  return `${mix(a)} ÷ ${mix(b)} = ${asFrac(a.n, a.d)} × ${asFrac(b.d, b.n)} = {${a.n} × ${b.d}/${a.d} × ${b.n}} = ${raw(a.n * b.d, a.d * b.n)}${q.d !== a.d * b.n || Math.abs(q.n) > q.d ? ` = ${mix(q)}` : ""}`;
}

/** 3.14 × n broken into 3 × n + 0.14 × n. */
export function piTimes(n: number): string {
  const a = 3 * n, b = Number((0.14 * n).toFixed(4));
  return `3.14 × ${num(n)} = (3 × ${num(n)}) + (0.14 × ${num(n)}) = ${num(a)} + ${num(b)} = ${num(a + b)}`;
}

/** How to get p% of base in your head (one line). */
export function percentDetail(p: number, base: number, money = false): string {
  const f = (x: number) => (money ? `$${x.toFixed(2)}` : num(x));
  const amt = (p * base) / 100;
  if (p === 50) return `50% is half: ${f(base)} ÷ 2 = ${f(amt)}`;
  if (p === 25) return `25% is a quarter: ${f(base)} ÷ 4 = ${f(amt)}`;
  if (p === 75) return `75% is three quarters: ${f(base)} ÷ 4 = ${f(base / 4)}, × 3 = ${f(amt)}`;
  if (p % 10 === 0) return `10% of ${f(base)} is ${f(base / 10)}, so ${p}% is ${p / 10} × ${f(base / 10)} = ${f(amt)}`;
  if (p % 5 === 0) return `10% of ${f(base)} is ${f(base / 10)} and 5% is half of that, ${f(base / 20)}. So ${p}% = ${Math.floor(p / 10) ? `${Math.floor(p / 10)} × ${f(base / 10)} + ${f(base / 20)}` : f(base / 20)} = ${f(amt)}`;
  return `1% of ${f(base)} is ${f(base)} ÷ 100 = ${money ? "$" + (base / 100).toFixed(4).replace(/0+$/, "") : num(base / 100)}, so ${p}% = ${p} × that = ${f(amt)}`;
}
