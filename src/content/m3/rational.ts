// Unit 4: Rational expressions, functions and equations.
import { cst, expr, money, ms, num, poly, sn, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { binU, fromRoots, uni, xm, xmT } from "./util";

const T = "m3-rational";

/** Distinct nonzero integers. */
function pickDistinct(r: { int(a: number, b: number): number }, n: number, lo: number, hi: number, avoid: number[] = []): number[] {
  const out: number[] = [];
  while (out.length < n) {
    const v = r.int(lo, hi);
    if (v === 0 || out.includes(v) || avoid.includes(v)) continue;
    out.push(v);
  }
  return out;
}

/** "(x + a)" with a the constant (not the root). */
const P = (a: number) => binU(-a);
/** Typed "(x+a)". */
const PT = (a: number) => `(${xmT(-a)})`;
/** Expanded (x + a)(x + b) with unicode squares, for use inside stacked fractions. */
const Q = (a: number, b: number) => uni(poly(fromRoots([-a, -b])));

// ---------------------------------------------------------------------------
const multiply: Skill = {
  id: "m3.rat.multiply",
  title: "Multiply and divide rational expressions",
  topic: T,
  standards: ["NC.M3.A-APR.7", "NC.M3.A-APR.7b", "NC.M3.A-SSE.2"],
  prereqs: [],
  lesson: {
    bigIdea: "Rational expressions multiply and divide like fractions: factor everything, multiply across (flip the second one to divide), then cancel common factors.",
    explain: [
      "{x² − 9/x + 2} · {x + 2/x − 3}: factor x^2 − 9 = (x − 3)(x + 3).",
      "Multiply across: {(x − 3)(x + 3)(x + 2)/(x + 2)(x − 3)}. Cancel (x − 3) and (x + 2): the product is **x + 3** (for x ≠ −2 and x ≠ 3).",
      "To divide, multiply by the reciprocal: {A/B} ÷ {C/D} = {A/B} · {D/C}.",
    ],
    tip: "You can only cancel factors (things multiplied), never terms (things added). {x + 3/x} is not 3.",
  },
  why: [
    { kind: "choice", prompt: "Why can you cancel (x + 2) from the top and bottom of {(x + 3)(x + 2)/(x + 2)}?", choices: ["{x + 2/x + 2} = 1 whenever x ≠ −2, and multiplying by 1 changes nothing.", "Because they are next to each other.", "You can cancel any matching numbers, even in sums."], correct: 0, explain: "Canceling is dividing a common factor out of the top and bottom, which is the same as multiplying by 1." },
    { kind: "written", prompt: "Explain why {x² + 5x/x} can be simplified to x + 5, but {x² + 5/x} can't be simplified to x + 5.", keyIdeas: ["x^2 + 5x factors as x(x + 5), so x is a common factor", "x^2 + 5 has no factor of x", "you can only cancel factors, not parts of a sum"], exemplar: "x^2 + 5x = x(x + 5), so x is a factor of the whole numerator and cancels with the denominator, leaving x + 5 (for x ≠ 0). In x^2 + 5, the 5 isn't multiplied by x, so x isn't a factor of the numerator and nothing cancels." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const p = r.int(1, 7);
      const c = pickDistinct(r, 1, -6, 6, [p, -p])[0];
      const shown = `{x² − ${p * p}/${P(c).slice(1, -1)}} · {${P(c).slice(1, -1)}/${xm(p)}}`;
      return {
        prompt: `Multiply and simplify: ${shown}`,
        answer: expr(`x+${p}`, { display: `x + ${p}` }),
        hints: [`Factor x^2 − ${p * p} as a difference of squares.`, `(x − ${p})(x + ${p}). Now cancel the factors that appear on both top and bottom.`],
        steps: [
          st("Factor.", `x^2 − ${p * p} = (x − ${p})(x + ${p})`),
          st("Multiply across.", `{(x − ${p})(x + ${p})${P(c)}/${P(c)}(x − ${p})}`),
          st("Cancel common factors.", `x + ${p}  (for x ≠ ${ms(-c)} and x ≠ ${p})`),
        ],
      };
    }
    if (lv === 2) {
      const [a, b, c, d] = pickDistinct(r, 4, -6, 6);
      // {(x+a)(x+b) / (x+c)(x+d)} · {(x+d)/(x+b)} = (x+a)/(x+c)
      const shown = `{${Q(a, b)}/${Q(c, d)}} · {${P(d).slice(1, -1)}/${P(b).slice(1, -1)}}`;
      return {
        prompt: `Multiply and simplify: ${shown}`,
        answer: expr(`${PT(a)}/${PT(c)}`, { display: `{${P(a).slice(1, -1)}/${P(c).slice(1, -1)}}` }),
        hints: ["Factor both quadratics first.", `${uni(poly(fromRoots([-a, -b])))} = ${P(a)}${P(b)} and ${uni(poly(fromRoots([-c, -d])))} = ${P(c)}${P(d)}.`],
        steps: [
          st("Factor.", `${Q(a, b)} = ${P(a)}${P(b)}; ${Q(c, d)} = ${P(c)}${P(d)}`),
          st("Multiply across.", `{${P(a)}${P(b)}${P(d)}/${P(c)}${P(d)}${P(b)}}`),
          st("Cancel common factors.", `{${P(a).slice(1, -1)}/${P(c).slice(1, -1)}}  (for x ≠ ${[-b, -c, -d].map(ms).join(", ")})`),
        ],
      };
    }
    const [a, b, c, d] = pickDistinct(r, 4, -6, 6);
    // {(x+a)(x+b)/(x+c)} ÷ {(x+b)/(x+c)(x+d)} = (x+a)(x+d)
    const shown = `{${Q(a, b)}/${P(c).slice(1, -1)}} ÷ {${P(b).slice(1, -1)}/${Q(c, d)}}`;
    const res = fromRoots([-a, -d]);
    return {
      prompt: `Divide and simplify. Give your answer in standard form: ${shown}`,
      answer: expr(poly(res).replace(/−/g, "-").replace(/\s/g, ""), { display: poly(res) }),
      hints: ["Dividing means multiplying by the reciprocal: flip the second fraction.", `Factor: ${Q(a, b)} = ${P(a)}${P(b)} and ${Q(c, d)} = ${P(c)}${P(d)}.`],
      steps: [
        st("Multiply by the reciprocal.", `{${Q(a, b)}/${P(c).slice(1, -1)}} · {${Q(c, d)}/${P(b).slice(1, -1)}}`),
        st("Factor.", `{${P(a)}${P(b)}/${P(c)}} · {${P(c)}${P(d)}/${P(b)}}`),
        st("Cancel.", `${P(a)}${P(d)}`),
        st("Multiply out.", poly(res)),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const add: Skill = {
  id: "m3.rat.add",
  title: "Add and subtract rational expressions",
  topic: T,
  standards: ["NC.M3.A-APR.7", "NC.M3.A-APR.7a"],
  prereqs: [],
  lesson: {
    bigIdea: "Just like fractions: rewrite both with a common denominator, then combine the numerators.",
    explain: [
      "{3/x + 1} + {2/x − 4}: the common denominator is (x + 1)(x − 4).",
      "Rewrite: {3(x − 4)/(x + 1)(x − 4)} + {2(x + 1)/(x + 1)(x − 4)}.",
      "Combine the tops: 3x − 12 + 2x + 2 = 5x − 10. So the sum is **{5x − 10/(x + 1)(x − 4)}**.",
    ],
    tip: "When subtracting, put the second numerator in parentheses so the minus sign hits every term.",
  },
  why: [
    { kind: "choice", prompt: "Why is {1/x} + {1/x + 2} NOT equal to {2/2x + 2}?", choices: ["You can't add denominators; you need a common denominator, like with {1/2} + {1/3}.", "Because x can't be 0.", "It is equal."], correct: 0, explain: "Fractions add by combining equal-size parts: {1/2} + {1/3} = {5/6}, not {2/5}." },
    { kind: "written", prompt: "Explain the most common mistake in {5/x − 2} − {x + 1/x − 2}, and the correct answer.", keyIdeas: ["the minus applies to the whole second numerator", "5 − (x + 1) = 5 − x − 1 = 4 − x", "result {4 − x/x − 2}"], exemplar: "The denominators already match, so subtract the numerators: 5 − (x + 1). The mistake is writing 5 − x + 1. The minus sign applies to both terms, so it's 5 − x − 1 = 4 − x, and the answer is {4 − x/x − 2}." },
  ],
  generate(r, lv) {
    const [p, q] = pickDistinct(r, 2, -7, 7);
    const den = `${P(p)}${P(q)}`;
    if (lv < 3) {
      const minus = lv === 2;
      let a = r.int(1, 6), b = r.int(1, 6);
      if (minus && a === b) b = a + 1;
      const m = minus ? a - b : a + b;
      const n = minus ? a * q - b * p : a * q + b * p;
      const op = minus ? "−" : "+";
      return {
        prompt: `${minus ? "Subtract" : "Add"}: {${a}/${P(p).slice(1, -1)}} ${op} {${b}/${P(q).slice(1, -1)}}. Write the result as {mx + n/${den}}.`,
        answer: { kind: "multi", fields: [{ value: frac(m), pre: "m =" }, { value: frac(n), pre: "n =" }] },
        hints: [`Common denominator: ${den}. Multiply the first fraction's top and bottom by ${P(q)}, and the second's by ${P(p)}.`, `Numerator: ${cf(a)}${P(q)} ${op} ${cf(b)}${P(p)}. Distribute${minus ? " (the minus hits both terms)" : ""} and combine.`],
        steps: [
          st("Rewrite with the common denominator.", `{${cf(a)}${P(q)}/${den}} ${op} {${cf(b)}${P(p)}/${den}}`),
          st("Distribute.", `${cf(a)}x${cst(a * q)} ${op} (${cf(b)}x${cst(b * p)})`),
          st("Combine like terms.", `${minus ? `${cf(a)}x${cst(a * q)} − ${cf(b)}x${cst(-b * p)}` : `${cf(a)}x${cst(a * q)} + ${cf(b)}x${cst(b * p)}`} = ${poly([m, n])}`),
          st("Result.", `{${poly([m, n])}/${den}}, so m = ${ms(m)} and n = ${ms(n)}`),
        ],
      };
    }
    const a = r.int(2, 4), b = r.int(1, 6);
    // a·x/(x+p) − b/(x+q) = (a x (x+q) − b (x+p)) / den = a x^2 + (a q − b) x − b p
    const c2 = a, c1 = a * q - b, c0 = -b * p;
    return {
      prompt: `Subtract: {${a}x/${P(p).slice(1, -1)}} − {${b}/${P(q).slice(1, -1)}}. Write the result as {Ax² + Bx + C/${den}}.`,
      answer: { kind: "multi", fields: [{ value: frac(c2), pre: "A =" }, { value: frac(c1), pre: "B =" }, { value: frac(c0), pre: "C =" }] },
      hints: [`Common denominator ${den}. The new numerator is ${a}x${P(q)} − ${b}${P(p)}.`, `${a}x${P(q)} = ${poly([a, a * q, 0])}. Subtract all of ${b}x${cst(b * p)}.`],
      steps: [
        st("Rewrite with the common denominator.", `{${a}x${P(q)} − ${b}${P(p)}/${den}}`),
        st("Distribute.", `${poly([a, a * q, 0])} − ${b}x${cst(-b * p)}`),
        st("Combine like terms.", `${poly([c2, c1, c0])}`),
        st("Read off A, B, C.", `A = ${c2}, B = ${ms(c1)}, C = ${ms(c0)}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const rewrite: Skill = {
  id: "m3.rat.rewrite",
  title: "Rewrite rational expressions: q(x) + r/b(x)",
  topic: T,
  standards: ["NC.M3.A-APR.6", "NC.M3.A-SSE.2", "NC.M3.F-IF.7"],
  prereqs: ["m3.poly.divide"],
  lesson: {
    bigIdea: "Dividing the numerator by the denominator rewrites {a(x)/b(x)} as q(x) + {r/b(x)}. The quotient shows the long-run behavior of the function.",
    explain: [
      "{2x + 7/x + 3}: 2x + 7 = 2(x + 3) + 1, so {2x + 7/x + 3} = **2 + {1/x + 3}**.",
      "This form shows the graph is y = {1/x} shifted 3 left and 2 up, with horizontal asymptote y = 2 (because {1/x + 3} → 0 for large |x|).",
      "Same idea with a quadratic on top: {x² + 5x + 9/x + 2} = x + 3 + {3/x + 2}, since (x + 2)(x + 3) = x^2 + 5x + 6, and 9 − 6 = 3 is left over.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does 3 + {5/x − 1} get closer and closer to 3 when x is large?", choices: ["{5/x − 1} gets close to 0 as the denominator grows.", "Because 5 is less than 3.", "It gets closer to 5."], correct: 0, explain: "A fixed number over a huge number is nearly 0, so only the 3 is left." },
    { kind: "written", prompt: "Explain how you know that {4x − 1/x + 2} = 4 − {9/x + 2}.", keyIdeas: ["4(x + 2) = 4x + 8", "4x − 1 = 4(x + 2) − 9", "divide each part by x + 2"], exemplar: "4 copies of (x + 2) make 4x + 8, which is 9 more than 4x − 1. So 4x − 1 = 4(x + 2) − 9. Dividing by x + 2 gives 4 − {9/x + 2}." },
  ],
  generate(r, lv) {
    const c = r.nonzero(-6, 6);
    if (lv < 3) {
      const a = lv === 1 ? r.int(1, 5) : r.pick([2, 3, 4, 5, -2, -3]);
      let rem = r.nonzero(-9, 9);
      const b = a * c + rem;
      if (b === 0) rem += 1;
      const bb = a * c + rem;
      return {
        prompt: `Rewrite {${a === 1 ? "" : a === -1 ? "−" : ms(a)}x${cst(bb)}/${xm(-c)}} in the form q + {r/${xm(-c)}}.`,
        answer: { kind: "multi", fields: [{ value: frac(a), pre: "q =" }, { value: frac(rem), pre: "r =" }] },
        hints: [`How many copies of (${xm(-c)}) fit in ${a === 1 ? "" : ms(a)}x${cst(bb)}? Match the x-terms.`, `${ms(a)}(${xm(-c)}) = ${poly([a, a * c])}. What's left over?`],
        steps: [
          st("Match the x-term.", `${ms(a)}(${xm(-c)}) = ${poly([a, a * c])}`),
          st("Find the leftover.", `${poly([a, bb])} − (${poly([a, a * c])}) = ${ms(rem)}`),
          st("Rewrite.", `{${poly([a, bb])}/${xm(-c)}} = ${ms(a)} ${rem < 0 ? "−" : "+"} {${Math.abs(rem)}/${xm(-c)}}`),
          st("So the horizontal asymptote is", `y = ${ms(a)}.`),
        ],
        traps: undefined,
      };
    }
    const e = r.nonzero(-5, 5), rem = r.nonzero(-8, 8);
    // (x + c)(x + e) + rem
    const top = fromRoots([-c, -e]);
    top[2] += rem;
    return {
      prompt: `Rewrite {${uni(poly(top))}/${xm(-c)}} in the form x + k + {r/${xm(-c)}}.`,
      answer: { kind: "multi", fields: [{ value: frac(e), pre: "k =" }, { value: frac(rem), pre: "r =" }] },
      hints: [`Find a linear factor (x + k) so that (${xm(-c)})(x + k) matches the first two terms ${uni(poly([1, top[1], 0]))}.`, `(${xm(-c)})(x${cst(e)}) = ${poly(fromRoots([-c, -e]))}. Compare constants for the remainder.`],
      steps: [
        st("Match the first two terms.", `(${xm(-c)})(x${cst(e)}) = ${poly(fromRoots([-c, -e]))}`),
        st("Find the remainder.", `${ms(top[2])} − ${sn(c * e)} = ${ms(rem)}`),
        st("Rewrite.", `x${cst(e)} ${rem < 0 ? "−" : "+"} {${Math.abs(rem)}/${xm(-c)}}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const features: Skill = {
  id: "m3.rat.features",
  title: "Asymptotes and holes of rational functions",
  topic: T,
  standards: ["NC.M3.F-IF.7", "NC.M3.F-IF.4", "NC.M3.A-APR.7"],
  prereqs: ["m3.rat.multiply"],
  lesson: {
    bigIdea: "Factor first. A factor that cancels leaves a hole; a factor left in the denominator gives a vertical asymptote. The horizontal asymptote comes from the end behavior.",
    explain: [
      "f(x) = {x² − 1/x² − x − 2} = {(x − 1)(x + 1)/(x − 2)(x + 1)}.",
      "(x + 1) cancels: there's a **hole at x = −1**. (x − 2) stays in the denominator: **vertical asymptote x = 2**.",
      "The top and bottom have the same degree with leading coefficients 1 and 1, so the **horizontal asymptote is y = {1/1} = 1**. (If the bottom's degree is bigger, it's y = 0.)",
    ],
    visual: { type: "plot", xMin: -5, xMax: 7, yMin: -6, yMax: 8, curves: [{ expr: "(x-1)/(x-2)" }], vlines: [{ x: 2, dashed: true, label: "x = 2" }], hlines: [{ y: 1, dashed: true, label: "y = 1" }], points: [{ x: -1, y: 2 / 3, open: true, label: "hole" }] },
    tip: "A discontinuity is a hole if the graph could be fixed by filling in one point, and an asymptote if the graph shoots off to ±∞.",
  },
  why: [
    { kind: "choice", prompt: "Why does f(x) = {x − 3/x − 3} have a hole at x = 3 instead of an asymptote?", choices: ["f(x) = 1 everywhere except x = 3, where it is not defined; nothing blows up near 3.", "Because 3 − 3 = 0 on top.", "It has an asymptote at x = 3."], correct: 0, explain: "The factor cancels, so the values stay at 1 near x = 3; just one point is missing." },
    { kind: "written", prompt: "Explain why {2x + 1/x − 4} has horizontal asymptote y = 2.", keyIdeas: ["for large |x|, the +1 and −4 barely matter", "the function acts like 2x/x = 2", "it gets closer and closer to 2"], exemplar: "When x is huge, the +1 and the −4 hardly change anything, so the function behaves like {2x/x} = 2. The graph gets closer and closer to y = 2 as x → ±∞." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.pick([1, 2, 3, -1, -2, -4]), h = r.nonzero(-5, 5), k = r.nonzero(-5, 5);
      return {
        prompt: `f(x) = ${a < 0 ? "−" : ""}{${Math.abs(a)}/${xm(h)}}${cst(k)}. Find the vertical asymptote x = h and the horizontal asymptote y = k.`,
        answer: { kind: "multi", fields: [{ value: frac(h), pre: "vertical: x =" }, { value: frac(k), pre: "horizontal: y =" }] },
        hints: ["The denominator can't be 0: where is it 0?", `As |x| grows, ${a < 0 ? "−" : ""}{${Math.abs(a)}/${xm(h)}} shrinks to 0, so f(x) approaches ${ms(k)}.`],
        steps: [
          st("Vertical asymptote.", `${xm(h)} = 0 when x = ${ms(h)}.`),
          st("Horizontal asymptote.", `${a < 0 ? "−" : ""}{${Math.abs(a)}/${xm(h)}} → 0 for large |x|, so y = ${ms(k)}.`),
        ],
      };
    }
    if (lv === 2) {
      const p = r.pick([1, 2, 3, -2, 4]), h = r.nonzero(-5, 5);
      let q = r.nonzero(-8, 8);
      if (q === -p * h) q += 1;
      return {
        prompt: `f(x) = {${p === 1 ? "" : ms(p)}x${cst(q)}/${xm(h)}}. Find the vertical asymptote and the horizontal asymptote.`,
        answer: { kind: "multi", fields: [{ value: frac(h), pre: "vertical: x =" }, { value: frac(p), pre: "horizontal: y =" }] },
        hints: [`Set the denominator equal to 0.`, `Top and bottom are both degree 1, so the horizontal asymptote is the ratio of the leading coefficients: {${p}/1}.`],
        steps: [
          st("Check for common factors.", `${poly([p, q])} isn't a multiple of ${xm(h)}, so nothing cancels.`),
          st("Vertical asymptote.", `x = ${ms(h)}`),
          st("Horizontal asymptote.", `Same degree: y = {${p}/1} = ${ms(p)}`),
        ],
      };
    }
    const [z, s, v] = pickDistinct(r, 3, -5, 5);
    const lead = r.pick([1, 2, 3]);
    const top = fromRoots([z, s], lead), bot = fromRoots([s, v]);
    return {
      prompt: `f(x) = {${uni(poly(top))}/${uni(poly(bot))}}. Find the x-coordinate of the hole, the vertical asymptote, and the horizontal asymptote.`,
      answer: { kind: "multi", fields: [{ value: frac(s), pre: "hole: x =" }, { value: frac(v), pre: "vertical: x =" }, { value: frac(lead), pre: "horizontal: y =" }] },
      hints: ["Factor the top and the bottom.", `Top: ${lead === 1 ? "" : lead}${binU(z)}${binU(s)}. Bottom: ${binU(s)}${binU(v)}. Which factor cancels?`],
      steps: [
        st("Factor.", `{${lead === 1 ? "" : lead}${binU(z)}${binU(s)}/${binU(s)}${binU(v)}}`),
        st("Canceling factor → hole.", `${binU(s)} cancels, so there's a hole at x = ${ms(s)}.`),
        st("Remaining denominator → vertical asymptote.", `x = ${ms(v)}`),
        st("Horizontal asymptote.", `Degrees match (2 and 2): y = {${lead}/1} = ${lead}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const write: Skill = {
  id: "m3.rat.write",
  title: "Write a rational function from its graph",
  topic: T,
  standards: ["NC.M3.A-CED.2", "NC.M3.F-BF.3", "NC.M3.F-IF.7"],
  prereqs: ["m3.rat.features"],
  lesson: {
    bigIdea: "f(x) = {a/x − h} + k is y = {1/x} shifted h right and k up, and stretched by a. The asymptotes give h and k; one point gives a.",
    explain: [
      "A graph has asymptotes x = 2 and y = −1 and passes through (3, 2).",
      "So f(x) = {a/x − 2} − 1. Use the point: 2 = {a/3 − 2} − 1 = a − 1, so a = 3.",
      "**f(x) = {3/x − 2} − 1**. If a is negative, the branches sit in the opposite corners (top-left and bottom-right).",
    ],
    visual: { type: "plot", xMin: -4, xMax: 8, yMin: -7, yMax: 5, curves: [{ expr: "3/(x-2)-1" }], vlines: [{ x: 2, dashed: true }], hlines: [{ y: -1, dashed: true }], points: [{ x: 3, y: 2, label: "(3, 2)" }] },
  },
  why: [
    { kind: "choice", prompt: "In f(x) = {a/x − 2} + 5, why is the vertical asymptote x = 2?", choices: ["At x = 2 the denominator is 0, so f is not defined there and its values blow up nearby.", "Because 2 is subtracted.", "Because the horizontal asymptote is 5."], correct: 0, explain: "Dividing by numbers close to 0 gives huge outputs, so the graph shoots up or down near x = 2." },
    { kind: "written", prompt: "A graph has asymptotes x = −1 and y = 3, and its branches are in the top-left and bottom-right. Explain what you know about a in f(x) = {a/x + 1} + 3.", keyIdeas: ["top-left/bottom-right means a is negative", "for x a bit more than −1, a/(x + 1) is a big negative number", "you need a point to find the exact value of a"], exemplar: "Just to the right of x = −1, x + 1 is a small positive number. For the graph to be below y = 3 there (bottom-right branch), a/(x + 1) must be negative, so a < 0. A point on the graph would tell me the exact value." },
  ],
  generate(r, lv) {
    const h = r.int(-4, 4), k = r.int(-4, 4);
    const a = lv === 1 ? r.pick([1, -1]) : r.pick([2, 3, 4, -2, -3, -4, 6]);
    const d = lv === 3 && Math.abs(a) % 2 === 0 ? r.pick([2, -2]) : r.pick([1, -1]);
    const px = h + d, py = k + a / d;
    const typed = `${a}/(${xmT(h)})${k ? (k > 0 ? `+${k}` : `${k}`) : ""}`;
    const display = `{${a < 0 ? "−" : ""}${Math.abs(a)}/${xm(h)}}${cst(k)}`.replace(/^\{−(\d+)/, "−{$1");
    return {
      prompt: `Write the equation of the rational function f(x) = {a/x − h} + k graphed below. The dashed lines are asymptotes, and the labeled point is on the graph.`,
      visual: { type: "plot", xMin: h - 7, xMax: h + 7, yMin: k - 8, yMax: k + 8, curves: [{ expr: typed }], vlines: [{ x: h, dashed: true, label: `x = ${ms(h)}` }], hlines: [{ y: k, dashed: true, label: `y = ${ms(k)}` }], points: [{ x: px, y: py, label: `(${ms(px)}, ${ms(py)})` }] },
      answer: expr(typed, { lhs: "f(x)", display }),
      hints: [`The vertical asymptote gives h = ${ms(h)} and the horizontal asymptote gives k = ${ms(k)}.`, `Substitute the point: ${ms(py)} = {a/${ms(px)} − ${sn(h)}}${cst(k)}, so {a/${ms(d)}} = ${ms(py - k)}.`],
      steps: [
        st("Read the asymptotes.", `x = ${ms(h)} and y = ${ms(k)}, so f(x) = {a/${xm(h)}}${cst(k)}.`),
        st("Use the point.", `${ms(py)} = {a/${ms(px)}${cst(-h)}}${cst(k)} = {a/${ms(d)}}${cst(k)}`),
        st("Solve for a.", `{a/${ms(d)}} = ${ms(py - k)}, so a = ${ms(a)}.`),
        st("Answer.", `f(x) = ${display}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const solve: Skill = {
  id: "m3.rat.solve",
  title: "Solve rational equations (and spot extraneous solutions)",
  topic: T,
  standards: ["NC.M3.A-REI.2", "NC.M3.A-REI.1", "NC.M3.A-CED.1"],
  prereqs: ["m3.rat.add"],
  lesson: {
    bigIdea: "Multiply both sides by the common denominator to clear fractions, solve, then check every answer. Any value that makes a denominator 0 is extraneous and must be thrown out.",
    explain: [
      "Solve {x²/x − 3} = {5x − 6/x − 3}. Multiply both sides by (x − 3): x^2 = 5x − 6.",
      "So x^2 − 5x + 6 = 0, (x − 2)(x − 3) = 0, x = 2 or x = 3.",
      "But x = 3 makes the denominators 0, so it's **extraneous**. The only solution is **x = 2**. Check: {4/−1} = −4 and {10 − 6/−1} = −4 ✓.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can multiplying both sides by (x − 3) create a fake solution?", choices: ["If x = 3, you multiplied by 0, which can make unequal things look equal.", "Because multiplication always changes the answer.", "It can't; every solution of the new equation works."], correct: 0, explain: "Multiplying by an expression that can be 0 isn't reversible at that value, so check the original equation." },
    { kind: "written", prompt: "Explain how to decide whether a solution to a rational equation is extraneous.", keyIdeas: ["substitute it into the original equation", "if any denominator becomes 0, the value isn't allowed", "keep only values that make the original equation true"], exemplar: "Plug each solution back into the original equation. If it makes any denominator 0, the original equation isn't even defined there, so the solution is extraneous. Keep only the values that make the original equation true." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const [p, s] = pickDistinct(r, 2, -6, 6);
      const k = p + s, c = -p * s;
      return {
        prompt: `Solve {x²/${xm(p)}} = {${poly([k, c])}/${xm(p)}}.`,
        answer: num(s, { pre: "x = " }),
        hints: [`Multiply both sides by (${xm(p)}).`, `You'll get a quadratic with two roots. One of them makes the denominator 0.`],
        steps: [
          st("Clear the denominators.", `x^2 = ${poly([k, c])}`),
          st("Set to 0 and factor.", `${poly([1, -k, -c])} = 0, so ${binU(p)}${binU(s)} = 0`),
          st("Solve.", `x = ${ms(p)} or x = ${ms(s)}`),
          st("Check for extraneous solutions.", `x = ${ms(p)} makes ${xm(p)} = 0, so it's extraneous. The solution is x = ${ms(s)}.`),
        ],
        traps: traps(frac(s), [trap(p, `x = ${ms(p)} makes the denominator 0, so it's extraneous.`)]),
      };
    }
    // {x/(x − p)} + {a/(x + q)} = {N/(x − p)(x + q)}. Clearing gives x(x + q) + a(x − p) = N,
    // that is x^2 + (q + a)x − ap − N = 0, built to have roots s and e (e is extraneous).
    for (;;) {
      const [p, q] = pickDistinct(r, 2, -5, 5);
      if (p === -q) continue;
      const e = r.chance(0.5) ? p : -q;
      const s = r.int(-6, 6);
      if (s === p || s === -q || s === e) continue;
      const a = -(s + e) - q;
      if (a === 0) continue;
      const N = -a * p - s * e;
      const den = lv === 2 ? `${binU(p)}${binU(-q)}` : uni(poly(fromRoots([p, -q])));
      const opA = a < 0 ? "−" : "+";
      return {
        prompt: `Solve {x/${xm(p)}} ${opA} {${Math.abs(a)}/${xm(-q)}} = {${ms(N)}/${den}}.`,
        answer: num(s, { pre: "x = " }),
        hints: [lv === 3 ? `Factor the right-hand denominator: ${binU(p)}${binU(-q)}. That's the common denominator.` : `The common denominator is ${binU(p)}${binU(-q)}. Multiply every term by it.`, `x${binU(-q)} ${opA} ${Math.abs(a)}${binU(p)} = ${ms(N)}. Expand, set to 0, and factor. Then check both answers.`],
        steps: [
          st("Multiply every term by the common denominator.", `x${binU(-q)} ${opA} ${Math.abs(a)}${binU(p)} = ${ms(N)}`),
          st("Expand and set to 0.", `${poly([1, q + a, -a * p - N])} = 0`),
          st("Factor.", `${binU(s)}${binU(e)} = 0, so x = ${ms(s)} or x = ${ms(e)}`),
          st("Check.", `x = ${ms(e)} makes ${binU(e)} = 0 in a denominator, so it's extraneous. The only solution is x = ${ms(s)}.`),
        ],
        traps: traps(frac(s), [trap(e, `x = ${ms(e)} makes a denominator 0, so it's extraneous.`)]),
      };
    }
  },
};

// ---------------------------------------------------------------------------
const context: Skill = {
  id: "m3.rat.context",
  title: "Rational equations in context",
  topic: T,
  standards: ["NC.M3.A-REI.2", "NC.M3.A-CED.1", "NC.M3.A-SSE.1b"],
  prereqs: ["m3.rat.solve"],
  lesson: {
    bigIdea: "Averages, rates and mixtures lead to rational equations. Write the quantity as a fraction, set it equal to the target, and clear the denominator.",
    explain: [
      "**Average cost:** printing hoodies costs $600 to set up plus $8 per hoodie. The average cost is A(n) = {600 + 8n/n}. For an average of $20: 600 + 8n = 20n, so n = **50 hoodies**.",
      "**Work rates:** if Ana mows a lawn in 3 hours and Ben in 6, together they do {1/3} + {1/6} = {1/2} of the lawn per hour, so it takes 2 hours.",
      "**Mixtures:** adding x mL of pure juice to 40 mL of 25% juice gives {10 + x/40 + x} juice. Setting that to 0.5 gives x = 20.",
    ],
  },
  why: [
    { kind: "choice", prompt: "In A(n) = {600 + 8n/n}, why does the average cost get close to $8 when n is large?", choices: ["The $600 setup cost is shared by so many hoodies that it adds almost nothing to each one.", "Because 600 ÷ 8 is large.", "The average cost keeps going down to $0."], correct: 0, explain: "A(n) = 8 + {600/n}, and {600/n} → 0, so the horizontal asymptote is y = 8." },
    { kind: "written", prompt: "Maya can clean the gym in 4 hours and Jonah can in 6 hours. Explain why working together takes less than 4 hours, and how to find the exact time.", keyIdeas: ["their rates add: 1/4 + 1/6 of the gym per hour", "1/4 + 1/6 = 5/12 per hour", "time = 12/5 = 2.4 hours, less than either alone"], exemplar: "Each hour Maya does 1/4 of the gym and Jonah does 1/6, so together they do 1/4 + 1/6 = 5/12 per hour. Solving t · 5/12 = 1 gives t = 12/5 = 2.4 hours, which is less than 4 because Jonah's help only speeds things up." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const F = r.pick([300, 400, 500, 600, 750, 900, 1200]), v = r.pick([4, 5, 6, 8, 10, 12]);
      const n = r.pick([25, 30, 40, 50, 60, 75, 100, 150]);
      const T2 = v + F / n;
      if (!Number.isInteger(T2 * 2)) return context.generate(r, lv);
      const item = r.pick(["custom hoodies", "phone cases", "team shirts", "stickers sheets"]).replace("stickers sheets", "sticker sheets");
      return {
        prompt: `A shop's setup cost for ${item} is $${F}, plus $${v} per item. The average cost per item is A(n) = {${F} + ${v}n/n}. How many items must be made for the average cost to be ${money(T2)}?`,
        answer: num(n, { unit: " items" }),
        hints: [`Set {${F} + ${v}n/n} = ${dn2(T2)} and multiply both sides by n.`, `${F} + ${v}n = ${T2}n, so ${F} = ${T2 - v}n.`],
        steps: [
          st("Set up.", `{${F} + ${v}n/n} = ${T2}`),
          st("Multiply by n.", `${F} + ${v}n = ${T2}n`),
          st(`Subtract ${v}n.`, `${F} = ${T2 - v}n`),
          st("Divide.", `n = ${F} ÷ ${T2 - v} = ${n}`),
          st("Check.", `({${F} + ${v * n}/${n}}) = {${F + v * n}/${n}} = ${T2} ✓`),
        ],
        traps: traps(frac(n), [trap(Math.round((F / T2) * 100) / 100, `That ignores the $${v} per item. Multiply both sides by n first.`), trap(Math.round((F / v) * 100) / 100, `Use the target average ${money(T2)}, not the per-item cost.`)]),
      };
    }
    if (lv === 2) {
      let V = 0, p = 0, q = 0, x = 0;
      for (;;) {
        V = r.pick([20, 30, 40, 50, 60, 80, 100]);
        p = r.pick([10, 20, 25, 30, 40]);
        q = r.pick([40, 50, 60, 75, 80]);
        if (q <= p) continue;
        x = (V * (q - p)) / (100 - q);
        if (Number.isInteger(x) && x > 0 && x <= 200) break;
      }
      const pure = (V * p) / 100;
      return {
        prompt: `A ${V} mL drink is ${p}% fruit juice. How many mL of pure juice must be added to make it ${q}% juice? Use {${dn2(pure)} + x/${V} + x} = ${dn2(q / 100)}.`,
        answer: num(x, { unit: " mL" }),
        hints: [`Multiply both sides by (${V} + x).`, `${dn2(pure)} + x = ${dn2(q / 100)}(${V} + x) = ${dn2((q / 100) * V)} + ${dn2(q / 100)}x.`],
        steps: [
          st("Clear the denominator.", `${dn2(pure)} + x = ${dn2(q / 100)}(${V} + x)`),
          st("Distribute.", `${dn2(pure)} + x = ${dn2((q / 100) * V)} + ${dn2(q / 100)}x`),
          st("Collect x-terms.", `${dn2(1 - q / 100)}x = ${dn2((q / 100) * V - pure)}`),
          st("Divide.", `x = ${x} mL`),
        ],
        traps: traps(frac(x), [trap(Math.round(((q - p) / 100) * V * 100) / 100, "That adds juice without accounting for the drink getting bigger, too.")]),
      };
    }
    const sets: [number, number, number][] = [[3, 6, 2], [4, 12, 3], [6, 3, 2], [10, 15, 6], [12, 4, 3], [20, 30, 12], [6, 12, 4], [5, 20, 4], [9, 18, 6], [8, 24, 6], [12, 6, 4], [15, 10, 6]];
    const [a, b, t] = r.pick(sets);
    const [n1, n2] = r.shuffle(["Ana", "Ben", "Priya", "Leo", "Zoe", "Kai"]).slice(0, 2);
    const task = r.pick(["paint a mural", "clean the gym", "set up the stage", "edit a video"]);
    return {
      prompt: `${n1} can ${task} alone in ${a} hours. Working together, ${n1} and ${n2} take ${t} hours. How many hours would ${n2} take alone? Solve {1/${a}} + {1/b} = {1/${t}}.`,
      answer: num(b, { unit: " hours" }),
      hints: [`Subtract: {1/b} = {1/${t}} − {1/${a}}.`, `{1/${t}} − {1/${a}} = {${a} − ${t}/${a * t}} = {${a - t}/${a * t}}. Flip it.`],
      steps: [
        st("Isolate 1/b.", `{1/b} = {1/${t}} − {1/${a}}`),
        st("Common denominator.", `{1/b} = {${a}/${a * t}} − {${t}/${a * t}} = {${a - t}/${a * t}}`),
        st("Take reciprocals.", `b = {${a * t}/${a - t}} = ${b}`),
        st("Check.", `{1/${a}} + {1/${b}} = {${b + a}/${a * b}} = {1/${t}} ✓`),
      ],
      traps: traps(frac(b), [trap(a - t, "Rates add, not times. Work with 1/time."), trap(frac(a - t, a * t), `That's ${n2}'s rate (jobs per hour). Flip it to get the time.`)]),
    };
  },
};

const cf = (n: number) => (n === 1 ? "" : String(n));

function dn2(x: number): string {
  return String(Number(x.toFixed(4)));
}

const skills: Skill[] = [multiply, add, rewrite, features, write, solve, context];
export default skills;
