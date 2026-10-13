// Unit 7: Solving quadratic equations (square roots, completing the square, the quadratic formula,
// the discriminant, non-real solutions, justifying steps, and modeling).
import { binom, choice, exact, ms, num, poly, radical, radText, sn, trap, traps } from "../helpers";
import { frac, gcd } from "../../lib/rational";
import { st } from "../steps";
import type { Answer, Skill } from "../types";

const T = "m2-quadratic-equations";

const both = (x1: number | ReturnType<typeof frac>, x2: number | ReturnType<typeof frac>): Answer => ({
  kind: "multi",
  fields: [{ value: typeof x1 === "number" ? frac(x1) : x1, pre: "x =" }, { value: typeof x2 === "number" ? frac(x2) : x2, pre: "x =" }],
  anyOrder: [0, 1],
});

const fs = (f: ReturnType<typeof frac>) => (f.d === 1 ? ms(f.n) : f.n < 0 ? `−{${-f.n}/${f.d}}` : `{${f.n}/${f.d}}`);

/** "h ± a√b" display. */
function pm(h: number, k: number): string {
  const { a, b } = radical(k);
  const rt = b === 1 ? String(a) : radText(a, b);
  return h === 0 ? `±${rt}` : `${ms(h)} ± ${rt}`;
}

// ---------- 1. Square roots ----------
const squareRoots: Skill = {
  id: "m2.qeq.square-roots",
  title: "Solve quadratics by taking square roots",
  topic: T,
  standards: ["NC.M2.A-REI.4"],
  prereqs: ["m2.quad.vertex-form"],
  lesson: {
    bigIdea: "If the equation is (something)^2 = k with k > 0, then something = ±√k. Don't forget the negative root.",
    explain: [
      "3x^2 − 5 = 70: add 5 (3x^2 = 75), divide by 3 (x^2 = 25), take square roots: **x = ±5**.",
      "(x − 4)^2 = 9: x − 4 = 3 or x − 4 = −3, so x = 7 or x = 1.",
      "(x + 2)^2 = 7: x + 2 = ±√7, so **x = −2 ± √7** (about 0.65 and −4.65). Not every answer is a whole number.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does x^2 = 49 have two solutions?", choices: ["Both 7 and −7 square to 49.", "Because 49 is odd.", "Because every equation has two solutions.", "It only has one: 7."], correct: 0, explain: "Squaring a negative gives a positive, so −7 works too." },
    { kind: "written", prompt: "Explain why (x − 3)^2 = −4 has no real solutions.", keyIdeas: ["a real number squared is never negative", "the left side is ≥ 0 for every real x", "so it can never equal −4"], exemplar: "Any real number squared is zero or positive, so (x − 3)^2 can't be negative. It can never equal −4, so there are no real solutions." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.int(1, 5), s = r.int(1, 9), c = r.int(-20, 20);
      const rhs = a * s * s + c;
      return {
        prompt: `Solve ${a === 1 ? "" : a}x^2${c === 0 ? "" : c < 0 ? ` − ${-c}` : ` + ${c}`} = ${ms(rhs)}.`,
        answer: both(s, -s),
        hints: [`Isolate x^2: ${c !== 0 ? `${c < 0 ? "add" : "subtract"} ${Math.abs(c)}${a !== 1 ? `, then divide by ${a}` : ""}` : `divide by ${a}`}.`, `x^2 = ${s * s}. Take the square root of both sides: two answers.`],
        steps: [...(c !== 0 ? [st(`${c < 0 ? "Add" : "Subtract"} ${Math.abs(c)}.`, `${a === 1 ? "" : a}x^2 = ${rhs - c}`)] : []), ...(a !== 1 ? [st(`Divide by ${a}.`, `x^2 = ${s * s}`)] : []), st("Take square roots.", `x = ±${s}`)],
      };
    }
    const h = r.nonzero(-6, 6);
    if (lv === 2) {
      const s = r.int(1, 8);
      return {
        prompt: `Solve ${binom(h)}^2 = ${s * s}.`,
        answer: both(h + s, h - s),
        hints: [`Take the square root of both sides: x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = ±${s}.`, "Solve the two equations separately (one with +, one with −)."],
        steps: [st("Take square roots.", `x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = ±${s}`), st("Solve both.", `x = ${ms(h)} + ${s} = ${ms(h + s)} or x = ${ms(h)} − ${s} = ${ms(h - s)}`)],
      };
    }
    const k = r.pick([2, 3, 5, 6, 7, 8, 12, 18, 20, 27]);
    const a = r.pick([1, 2, 3]);
    const correct = `x = ${pm(h, k)}`;
    const { a: ra, b: rb } = radical(k);
    return {
      prompt: `Solve ${a === 1 ? "" : a}${binom(h)}^2 = ${a * k}.`,
      answer: choice(r, correct, [[`x = ${pm(-h, k)}`, `Undo ${binom(h).slice(1, -1)} carefully: x = ${ms(h)} ± …`], [`x = ${ms(h)} ± ${k}`, "Take the square root of " + k + ", not " + k + " itself."], [`x = ${ms(h)} + ${radText(ra, rb)} only`, "Square roots give two solutions: + and −."]]),
      hints: [a !== 1 ? `Divide by ${a} first: ${binom(h)}^2 = ${k}.` : `Take the square root of both sides.`, `x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = ±√${k}${ra > 1 ? ` = ±${radText(ra, rb)}` : ""}.`],
      steps: [...(a !== 1 ? [st(`Divide by ${a}.`, `${binom(h)}^2 = ${k}`)] : []), st("Take square roots.", `x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = ±√${k}${ra > 1 ? ` = ±${radText(ra, rb)}` : ""}`), st(`${h > 0 ? "Add" : "Subtract"} ${Math.abs(h)}.`, correct)],
    };
  },
};

// ---------- 2. Completing the square to solve ----------
const completeSolve: Skill = {
  id: "m2.qeq.complete-square",
  title: "Solve by completing the square",
  topic: T,
  standards: ["NC.M2.A-REI.4", "NC.M2.A-REI.4a"],
  prereqs: ["m2.qeq.square-roots", "m2.quad.complete-square"],
  lesson: {
    bigIdea: "Move the constant, add ({b/2})^2 to both sides, write the left side as a square, then take square roots.",
    explain: [
      "x^2 + 6x − 7 = 0 → x^2 + 6x = 7 → x^2 + 6x + 9 = 7 + 9 → (x + 3)^2 = 16 → x + 3 = ±4 → **x = 1 or x = −7**.",
      "It works even when the equation doesn't factor: x^2 − 4x − 1 = 0 → (x − 2)^2 = 5 → x = 2 ± √5.",
      "Doing these same steps to ax^2 + bx + c = 0 with letters is exactly how the quadratic formula is derived.",
    ],
  },
  why: [
    { kind: "choice", prompt: "When you add 9 to the left side of x^2 + 6x = 7, why must you add 9 to the right side too?", choices: ["Adding the same amount to both sides keeps the equation balanced (same solutions).", "Because 9 is a perfect square.", "You don't need to; it's only to complete the square.", "Because the right side must be 9."], correct: 0, explain: "The addition property of equality: doing the same thing to both sides preserves the solutions." },
    { kind: "written", prompt: "Explain why completing the square can solve x^2 + 8x + 3 = 0 even though it doesn't factor nicely.", keyIdeas: ["rewrite as (x + 4)^2 = 13", "taking square roots gives x + 4 = ±√13", "so x = −4 ± √13; the method doesn't need integer factors"], exemplar: "Move the 3 and add 16 to both sides: (x + 4)^2 = 13. Then x + 4 = ±√13, so x = −4 ± √13. Completing the square turns any quadratic into a square equal to a number, so it works even when the solutions aren't whole numbers." },
  ],
  generate(r, lv) {
    const h = r.nonzero(-6, 6); // (x − h)^2 = s
    if (lv < 3) {
      const s = r.int(1, 7);
      const b = -2 * h, c = h * h - s * s;
      const x1 = h + s, x2 = h - s;
      return {
        prompt: `Solve by completing the square: ${poly([1, b, c])} = 0`,
        answer: both(x1, x2),
        hints: [`Move the constant: x^2 ${b < 0 ? "−" : "+"} ${Math.abs(b)}x = ${ms(-c)}. Then add (${ms(b)} ÷ 2)^2 = ${h * h} to both sides.`, `${binom(h)}^2 = ${s * s}. Take square roots.`],
        steps: [
          st("Move the constant.", `x^2 ${b < 0 ? "−" : "+"} ${Math.abs(b)}x = ${ms(-c)}`),
          st("Add (b/2)^2 to both sides.", `x^2 ${b < 0 ? "−" : "+"} ${Math.abs(b)}x + ${h * h} = ${ms(-c)} + ${h * h} = ${s * s}`),
          st("Write the square.", `${binom(h)}^2 = ${s * s}`),
          st("Take square roots.", `x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = ±${s}`),
          st("Solve.", `x = ${ms(x1)} or x = ${ms(x2)}`),
        ],
      };
    }
    const k = r.pick([2, 3, 5, 6, 7, 10, 11, 12, 13, 8]);
    const b = -2 * h, c = h * h - k;
    const correct = `x = ${pm(h, k)}`;
    return {
      prompt: `Solve by completing the square: ${poly([1, b, c])} = 0`,
      answer: choice(r, correct, [[`x = ${pm(-h, k)}`, "Check the sign of h: the square is " + binom(h) + "^2."], [`x = ${pm(h, k + 2 * h * h)}`, `Add (b/2)^2 = ${h * h} to both sides, not to just one.`], [`x = ${ms(h)} ± ${k}`, `Take the square root of ${k}.`]]),
      hints: [`x^2 ${b < 0 ? "−" : "+"} ${Math.abs(b)}x = ${ms(-c)}. Add ${h * h} to both sides.`, `${binom(h)}^2 = ${k}, so x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = ±√${k}.`],
      steps: [st("Move the constant.", `x^2 ${b < 0 ? "−" : "+"} ${Math.abs(b)}x = ${ms(-c)}`), st("Add (b/2)^2 to both sides.", `x^2 ${b < 0 ? "−" : "+"} ${Math.abs(b)}x + ${h * h} = ${k}`), st("Write the square.", `${binom(h)}^2 = ${k}`), st("Take square roots and solve.", correct)],
    };
  },
};

// ---------- 3. Quadratic formula ----------
const formula: Skill = {
  id: "m2.qeq.formula",
  title: "The quadratic formula",
  topic: T,
  standards: ["NC.M2.A-REI.4", "NC.M2.A-REI.4a"],
  prereqs: ["m2.qeq.complete-square"],
  lesson: {
    bigIdea: "For ax^2 + bx + c = 0, x = {−b ± √(b^2 − 4ac)/2a}. It always works, and it comes from completing the square on the general equation.",
    explain: [
      "2x^2 + 3x − 2 = 0: a = 2, b = 3, c = −2. b^2 − 4ac = 9 + 16 = 25. x = {−3 ± 5/4}, so **x = {1/2} or x = −2**.",
      "x^2 − 4x + 1 = 0: b^2 − 4ac = 16 − 4 = 12 and √12 = 2√3. x = {4 ± 2√3/2} = **2 ± √3**.",
      "Write the equation in standard form (= 0) before reading a, b and c, and keep their signs.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Where does the ± in the quadratic formula come from?", choices: ["From taking the square root of both sides while completing the square.", "From the two terms b and c.", "From dividing by 2a.", "It's there so that a can be negative."], correct: 0, explain: "In the derivation, (x + b/2a)^2 = (b^2 − 4ac)/4a^2, and the square root gives ±." },
    { kind: "written", prompt: "A student solves 3x^2 − 5x − 2 = 0 and writes b = 5. Explain the mistake and its effect.", keyIdeas: ["b includes its sign, so b = −5", "−b should be +5, not −5", "using b = 5 gives the opposites of the true solutions"], exemplar: "The coefficients include their signs, so b = −5, and −b = 5. Using b = 5 flips the sign of −b, which gives the opposites of the real solutions (−2 and 1/3 instead of 2 and −1/3)." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      // Rational roots: (px − q)(sx − t) with p, s from small sets.
      const p = lv === 1 ? 1 : r.pick([1, 2, 3]), s = lv === 1 ? 1 : r.pick([2, 3, 1]);
      const q = r.nonzero(-6, 6), t = r.nonzero(-6, 6);
      const a = p * s, b = -(p * t + q * s), c = q * t;
      const D = b * b - 4 * a * c;
      const sq = Math.round(Math.sqrt(D));
      const x1 = frac(q, p), x2 = frac(t, s);
      return {
        prompt: `Use the quadratic formula to solve ${poly([a, b, c])} = 0.`,
        answer: both(x1, x2),
        hints: [`a = ${ms(a)}, b = ${ms(b)}, c = ${ms(c)}.`, `b^2 − 4ac = ${b * b} − 4(${ms(a)})(${ms(c)}) = ${D}, and √${D} = ${sq}. Now x = {${ms(-b)} ± ${sq}/${2 * a}}.`],
        steps: [
          st("Identify a, b, c.", `a = ${ms(a)}, b = ${ms(b)}, c = ${ms(c)}`),
          st("Compute the discriminant.", `b^2 − 4ac = ${sn(b)}^2 − 4(${ms(a)})(${ms(c)}) = ${b * b} ${-4 * a * c < 0 ? "−" : "+"} ${Math.abs(4 * a * c)} = ${D}`),
          st("Substitute.", `x = {${ms(-b)} ± √${D}/2(${a})} = {${ms(-b)} ± ${sq}/${2 * a}}`),
          st("Split into two answers.", `x = {${ms(-b + sq)}/${2 * a}} or x = {${ms(-b - sq)}/${2 * a}}`),
          st("Simplify.", `x = ${fs(frac(-b + sq, 2 * a))} or x = ${fs(frac(-b - sq, 2 * a))}`),
        ],
      };
    }
    let a: number, b: number, c: number, D: number;
    for (;;) {
      a = r.pick([1, 2, 3]); b = r.int(-9, 9); c = r.int(-8, 8);
      D = b * b - 4 * a * c;
      if (D > 0 && Math.sqrt(D) % 1 !== 0 && c !== 0) break;
    }
    const { a: m, b: n } = radical(D);
    const g = gcd(gcd(Math.abs(b), m), 2 * a);
    const p = -b / g, q = m / g, d = (2 * a) / g;
    const top = `${p === 0 ? "" : ms(p) + " + "}${q === 1 ? "" : q}√${n}`;
    const disp = d === 1 ? top : `{${top}/${d}}`;
    const val = `(${-b}+${m}sqrt(${n}))/${2 * a}`;
    return {
      prompt: `Solve ${poly([a, b, c])} = 0 with the quadratic formula. Enter the larger solution as an exact value.`,
      answer: exact(val, disp),
      hints: [`a = ${a}, b = ${ms(b)}, c = ${ms(c)}; b^2 − 4ac = ${D}.`, `√${D}${m > 1 ? ` = ${radText(m, n)}` : ""}. The larger solution uses +: x = {${ms(-b)} + ${radText(m, n)}/${2 * a}}. Type it like (${-b}+${m === 1 ? "" : m}sqrt(${n}))/${2 * a}.`],
      steps: [
        st("Identify a, b, c.", `a = ${a}, b = ${ms(b)}, c = ${ms(c)}`),
        st("Discriminant.", `${sn(b)}^2 − 4(${a})(${ms(c)}) = ${D}`),
        st("Simplify the root.", `√${D} = ${radText(m, n)}`),
        st("Substitute.", `x = {${ms(-b)} ± ${radText(m, n)}/${2 * a}}`),
        ...(g > 1 ? [st(`Divide every term by ${g}.`, `x = ${d === 1 ? `${p === 0 ? "" : ms(p) + " ± "}${q === 1 ? "" : q}√${n}` : `{${p === 0 ? "" : ms(p) + " ± "}${q === 1 ? "" : q}√${n}/${d}}`}`)] : []),
        st("Larger solution (use +).", `x = ${disp} ≈ ${ms(((-b + Math.sqrt(D)) / (2 * a)).toFixed(3))}`),
      ],
    };
  },
};

// ---------- 4. The discriminant ----------
const discriminant: Skill = {
  id: "m2.qeq.discriminant",
  title: "The discriminant and the number of solutions",
  topic: T,
  standards: ["NC.M2.A-REI.4", "NC.M2.A-REI.4b"],
  prereqs: ["m2.qeq.formula"],
  lesson: {
    bigIdea: "The discriminant b^2 − 4ac tells how many real solutions there are: positive → 2, zero → 1, negative → none (two non-real solutions).",
    explain: [
      "x^2 − 6x + 9 = 0: 36 − 36 = 0, one real solution (x = 3). The parabola just touches the x-axis.",
      "2x^2 + x + 5 = 0: 1 − 40 = −39 < 0, no real solutions. The parabola never crosses the x-axis.",
      "Graph connection: the number of real solutions of ax^2 + bx + c = 0 is the number of x-intercepts of y = ax^2 + bx + c.",
    ],
    visual: { type: "plot", xMin: -2, xMax: 6, yMin: -4, yMax: 8, curves: [{ expr: "x^2-4x+1", label: "D > 0" }, { expr: "x^2-4x+4", label: "D = 0", color: 2 }, { expr: "x^2-4x+7", label: "D < 0", color: 3 }] },
  },
  why: [
    { kind: "choice", prompt: "Why does a negative discriminant mean no real solutions?", choices: ["The formula would need the square root of a negative number, which isn't real.", "Because a negative times a negative is positive.", "Because the parabola must open downward.", "Because the solutions are both negative."], correct: 0, explain: "√(b^2 − 4ac) is not a real number when b^2 − 4ac < 0." },
    { kind: "written", prompt: "Explain why a discriminant of 0 gives exactly one solution.", keyIdeas: ["the formula becomes x = (−b ± 0)/2a", "adding or subtracting 0 gives the same value", "so both solutions are −b/2a: the vertex touches the x-axis"], exemplar: "With b^2 − 4ac = 0, the formula is x = (−b ± √0)/(2a) = −b/(2a). Plus zero and minus zero give the same number, so there's only one solution. On the graph, the vertex sits right on the x-axis." },
  ],
  generate(r, lv) {
    const a = r.nonzero(-4, 5), b = r.int(-9, 9), c = r.int(-9, 9);
    const D = b * b - 4 * a * c;
    if (lv === 1) {
      return {
        prompt: `Find the discriminant of ${poly([a, b, c])} = 0.`,
        answer: num(D),
        hints: ["The discriminant is b^2 − 4ac.", `a = ${ms(a)}, b = ${ms(b)}, c = ${ms(c)}.`],
        steps: [st("Identify a, b, c.", `a = ${ms(a)}, b = ${ms(b)}, c = ${ms(c)}`), st("Compute b^2 − 4ac.", `${sn(b)}^2 − 4(${ms(a)})(${ms(c)}) = ${b * b} ${-4 * a * c < 0 ? "−" : "+"} ${Math.abs(4 * a * c)} = ${D}`)],
        traps: traps(frac(D), [trap(b * b + 4 * a * c, "Watch the sign: it's minus 4ac."), trap(-b * b - 4 * a * c, "b^2 is never negative: (−b)^2 is positive."), trap(b - 4 * a * c, "Square b first.")]),
      };
    }
    if (lv === 2) {
      // Make D = 0 sometimes.
      let A = a, B = b, C = c;
      if (r.chance(0.3)) { const s = r.nonzero(-5, 5); A = 1; B = -2 * s; C = s * s; }
      const DD = B * B - 4 * A * C;
      const correct = DD > 0 ? "Two real solutions" : DD === 0 ? "One real solution" : "No real solutions (two non-real solutions)";
      return {
        prompt: `How many real solutions does ${poly([A, B, C])} = 0 have?`,
        answer: choice(r, correct, ["Two real solutions", "One real solution", "No real solutions (two non-real solutions)"].filter((x) => x !== correct).map((x) => [x, `Compute b^2 − 4ac = ${ms(DD)} and check its sign.`] as [string, string]), true),
        hints: ["Compute the discriminant b^2 − 4ac.", "Positive: 2 real solutions; zero: 1; negative: none."],
        steps: [st("Compute the discriminant.", `${sn(B)}^2 − 4(${ms(A)})(${ms(C)}) = ${ms(DD)}`), st("Interpret.", `${DD > 0 ? "Positive" : DD === 0 ? "Zero" : "Negative"}, so ${correct.toLowerCase()}.`)],
      };
    }
    const s = r.int(2, 8) * r.sign();
    const aa = r.pick([1, 2, 3]);
    // ax^2 + bx + k = 0 has one solution when b^2 = 4ak. Use b = 2·aa·s so k = aa·s^2.
    const bb = 2 * aa * s, k = aa * s * s;
    return {
      prompt: `For what value of k does ${aa === 1 ? "" : aa}x^2 ${bb < 0 ? "−" : "+"} ${Math.abs(bb)}x + k = 0 have exactly one real solution?`,
      answer: num(k),
      hints: ["Exactly one real solution means the discriminant equals 0.", `${sn(bb)}^2 − 4(${aa})k = 0.`],
      steps: [st("Set the discriminant to 0.", `${sn(bb)}^2 − 4(${aa})k = 0`), st("Solve.", `${bb * bb} = ${4 * aa}k, so k = ${k}`), st("Check.", `${poly([aa, bb, k])} = ${aa === 1 ? "" : aa}(x ${s > 0 ? "+" : "−"} ${Math.abs(s)})^2, a perfect square. ✓`)],
      traps: traps(frac(k), [trap(-k, "Check the sign: b^2 is positive, so 4ak must be positive too."), trap(bb * bb, "Divide by 4a after setting b^2 − 4ak = 0.")]),
    };
  },
};

// ---------- 5. Non-real solutions ----------
const complexSolutions: Skill = {
  id: "m2.qeq.complex-solutions",
  title: "Non-real solutions a ± bi",
  topic: T,
  standards: ["NC.M2.A-REI.4b", "NC.M2.N-CN.1", "NC.M2.A-REI.4"],
  prereqs: ["m2.qeq.discriminant", "m2.rad.imaginary"],
  lesson: {
    bigIdea: "When the discriminant is negative, the solutions are a pair of complex numbers a ± bi, using √(−n) = i√n.",
    explain: [
      "x^2 + 25 = 0 → x^2 = −25 → **x = ±5i**.",
      "x^2 − 4x + 13 = 0: b^2 − 4ac = 16 − 52 = −36, √(−36) = 6i. x = {4 ± 6i/2} = **2 ± 3i**.",
      "Non-real solutions always come in pairs a + bi and a − bi (conjugates), and the parabola doesn't cross the x-axis.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why do the non-real solutions of a quadratic come in a pair a + bi and a − bi?", choices: ["The ± in the formula puts the same imaginary part with opposite signs.", "Because i^2 = −1.", "Because a is always positive.", "They don't always come in pairs."], correct: 0, explain: "x = −b/2a ± (√(negative))/2a gives the same real part and opposite imaginary parts." },
    { kind: "written", prompt: "Explain what the solutions 3 ± 2i tell you about the graph of the related quadratic function.", keyIdeas: ["the solutions are not real", "so the graph has no x-intercepts", "the real part 3 is the axis of symmetry x = 3"], exemplar: "Since 3 ± 2i aren't real numbers, the graph of the function never crosses the x-axis. The real part 3 is −b/2a, so the axis of symmetry (and vertex) is at x = 3." },
  ],
  generate(r, lv) {
    let p = 0, q: number, a: number, b: number, c: number;
    if (lv === 1) {
      q = r.int(1, 9); a = r.pick([1, 1, 2, 4]); b = 0; c = a * q * q;
    } else {
      p = r.nonzero(-5, 5); q = r.int(1, 6); a = lv === 2 ? 1 : r.pick([2, 3]);
      b = -2 * p * a; c = a * (p * p + q * q);
    }
    const D = b * b - 4 * a * c;
    const ans: Answer = { kind: "multi", fields: [{ value: frac(p), pre: "x =" }, { value: frac(q), pre: "±", post: "i" }] };
    const disp = p === 0 ? `±${q === 1 ? "" : q}i` : `${ms(p)} ± ${q === 1 ? "" : q}i`;
    return {
      prompt: `Solve ${poly([a, b, c])} = 0. Write the solutions as a ± bi (enter a, then b > 0).`,
      answer: ans,
      hints: lv === 1 ? [`Isolate x^2: x^2 = −${q * q}.`, `√(−${q * q}) = ${q}i.`] : [`The discriminant is ${ms(D)}, which is negative.`, `√(${ms(D)}) = ${Math.sqrt(-D)}i. Then x = {${ms(-b)} ± ${Math.sqrt(-D)}i/${2 * a}}.`],
      steps: lv === 1
        ? [st("Isolate x^2.", `x^2 = −${q * q}`), st("Take square roots.", `x = ±√(−${q * q}) = ${disp}`)]
        : [st("Identify a, b, c.", `a = ${a}, b = ${ms(b)}, c = ${c}`), st("Discriminant.", `${sn(b)}^2 − 4(${a})(${c}) = ${ms(D)}`), st("Square root of a negative.", `√(${ms(D)}) = ${Math.sqrt(-D)}i`), st("Use the formula.", `x = {${ms(-b)} ± ${Math.sqrt(-D)}i/${2 * a}} = ${disp}`)],
    };
  },
};

// ---------- 6. Justifying steps and deriving the formula ----------
const justify: Skill = {
  id: "m2.qeq.justify",
  title: "Justify solution steps and derive the formula",
  topic: T,
  standards: ["NC.M2.A-REI.1", "NC.M2.A-REI.4a"],
  prereqs: ["m2.qeq.formula"],
  lesson: {
    bigIdea: "Each solving step is backed by a property: equality properties, the zero product property, the square root property. The quadratic formula is completing the square done once, with letters.",
    explain: [
      "Zero product property: if AB = 0, then A = 0 or B = 0. That's why factoring works: (x − 2)(x + 5) = 0 gives x = 2 or x = −5.",
      "Derivation: ax^2 + bx + c = 0 → divide by a → x^2 + {b/a}x = −{c/a} → add ({b/2a})^2 to both sides → (x + {b/2a})^2 = {b^2 − 4ac/4a^2} → square roots → x + {b/2a} = ±{√(b^2 − 4ac)/2a} → subtract {b/2a}: x = {−b ± √(b^2 − 4ac)/2a}.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can't you use the zero product property on (x − 2)(x + 5) = 8?", choices: ["It only works when the product equals 0; many pairs of numbers multiply to 8.", "Because 8 is even.", "Because there are two factors.", "You can: x − 2 = 8 or x + 5 = 8."], correct: 0, explain: "Only zero forces one of the factors to be zero." },
    { kind: "written", prompt: "In deriving the quadratic formula, why is the first step to divide both sides by a?", keyIdeas: ["completing the square is easiest when the x^2 coefficient is 1", "dividing both sides by a (a ≠ 0) keeps the equation equivalent", "then add (b/2a)^2 to both sides"], exemplar: "Completing the square works on x^2 + (something)x, so the x^2 coefficient needs to be 1. Dividing both sides by a, which isn't zero, keeps the solutions the same and makes that happen." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const p = r.nonzero(-7, 7), q = r.nonzero(-7, 7);
      const steps: [string, string][] = [
        [`${binom(p)}${binom(q)} = 0`, "Factoring"],
        [`x ${p > 0 ? "−" : "+"} ${Math.abs(p)} = 0 or x ${q > 0 ? "−" : "+"} ${Math.abs(q)} = 0`, "Zero product property"],
        [`x = ${ms(p)} or x = ${ms(q)}`, `${"Addition/subtraction property of equality"}`],
      ];
      const k = r.int(1, 2);
      const correct = steps[k][1];
      const opts = ["Zero product property", "Addition/subtraction property of equality", "Square root property", "Distributive property", "Division property of equality"];
      return {
        prompt: `A student solves ${poly([1, -(p + q), p * q])} = 0: (1) ${steps[0][0]}; (2) ${steps[1][0]}; (3) ${steps[2][0]}. What justifies step ${k + 1}?`,
        answer: choice(r, correct, opts.filter((o) => o !== correct).slice(0, 3).map((o) => [o, "Look at what changed from the previous step."] as [string, string])),
        hints: ["Compare the step with the one before it. What was done?", k === 1 ? "The product equals 0, so one factor must be 0." : "Something was added to or subtracted from both sides."],
        steps: [st(`Step ${k + 1}.`, `${steps[k][0]}: ${correct}.`)],
      };
    }
    if (lv === 2) {
      const h = r.nonzero(-5, 5), s = r.int(2, 7);
      const qs: [string, string, [string, string][]][] = [
        [`Solving ${binom(h)}^2 = ${s * s}, a student writes only x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = ${s}. What's the error?`, `The square root step needs ±: x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = ${s} or −${s}.`, [["Nothing; there is one solution.", `x = ${ms(h - s)} also works: (${ms(-s)})^2 = ${s * s}.`], [`They should have expanded ${binom(h)}^2 first.`, "That works but isn't required; the real issue is a missing solution."], ["They should divide by 2 instead.", "Square roots undo squares."]]],
        [`Solving x^2 = ${s}x, a student divides both sides by x to get x = ${s}. What's the error?`, "Dividing by x loses the solution x = 0; move everything to one side and factor instead.", [["Nothing; x = " + s + " is the only solution.", "Try x = 0: 0 = 0. It's a solution too."], ["They should have taken the square root of both sides.", "That gives x = ±√(" + s + "x), which doesn't help."], ["They should add x to both sides.", "That doesn't isolate x."]]],
      ];
      const [q, c, w] = r.pick(qs);
      return {
        prompt: q,
        answer: choice(r, c, w),
        hints: ["Check by substituting other possible values. Did the student lose a solution?", "Taking a square root gives two signs; dividing by a variable can throw away the solution where that variable is 0."],
        steps: [st("Identify the error.", c)],
      };
    }
    const D: [string, string][] = [
      ["ax^2 + bx + c = 0", "Start"],
      ["x^2 + {b/a}x + {c/a} = 0", "Divide both sides by a"],
      ["x^2 + {b/a}x = −{c/a}", "Subtract {c/a} from both sides"],
      ["x^2 + {b/a}x + {b^2/4a^2} = {b^2/4a^2} − {c/a}", "Add ({b/2a})^2 to both sides"],
      ["(x + {b/2a})^2 = {b^2 − 4ac/4a^2}", "Factor the left side; combine fractions on the right"],
      ["x + {b/2a} = ±{√(b^2 − 4ac)/2a}", "Take the square root of both sides"],
      ["x = {−b ± √(b^2 − 4ac)/2a}", "Subtract {b/2a} from both sides"],
    ];
    const k = r.int(2, 6);
    const correct = D[k][1];
    return {
      prompt: `Deriving the quadratic formula. The step before is “${D[k - 1][0]}”. The next step is “${D[k][0]}”. What was done?`,
      answer: choice(r, correct, D.slice(1).map((d) => d[1]).filter((x) => x !== correct).slice(0, 3).map((x) => [x, "Compare the two lines: what operation turns the first into the second?"] as [string, string])),
      hints: ["Compare the two lines term by term.", "The derivation is completing the square: divide by a, move c/a, add (b/2a)^2, factor, take roots, isolate x."],
      steps: [st("What changed.", `${D[k - 1][0]} → ${D[k][0]}: ${correct.toLowerCase()}.`), st("Whole derivation.", D.map((d) => d[0]).join(" → "))],
    };
  },
};

// ---------- 7. Modeling with quadratic equations ----------
const model: Skill = {
  id: "m2.qeq.model",
  title: "Write and solve quadratic equations in context",
  topic: T,
  standards: ["NC.M2.A-CED.1", "NC.M2.A-REI.4"],
  prereqs: ["m2.qeq.formula"],
  lesson: {
    bigIdea: "Translate the situation into an equation, set it equal to 0, solve, then keep only the answers that make sense in context.",
    explain: [
      "A rectangular phone screen is 3 cm longer than it is wide and has area 70 cm^2. w(w + 3) = 70 → w^2 + 3w − 70 = 0 → (w + 10)(w − 7) = 0. Width can't be −10, so **w = 7 cm**.",
      "A ball's height is h = −16t^2 + 32t + 48. It hits the ground when h = 0: −16(t^2 − 2t − 3) = 0 → t = 3 or t = −1. Time can't be negative: **3 seconds**.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why do you reject a negative solution for the width of a rectangle?", choices: ["A length can't be negative, so it doesn't fit the context even though it solves the equation.", "Negative solutions are always wrong.", "Because the formula made a mistake.", "You shouldn't reject it."], correct: 0, explain: "The equation is a model; only answers that make physical sense count." },
    { kind: "written", prompt: "A ball's height is h(t) = −16t^2 + 48t. Explain how to find when it lands and why one solution is ignored.", keyIdeas: ["set h(t) = 0", "factor: −16t(t − 3) = 0, so t = 0 or t = 3", "t = 0 is the launch, so it lands at t = 3 seconds"], exemplar: "Landing means height 0, so solve −16t^2 + 48t = 0. Factoring gives −16t(t − 3) = 0, so t = 0 or t = 3. At t = 0 the ball is just being thrown from the ground, so it lands at t = 3 seconds." },
  ],
  generate(r, lv) {
    const kind = lv === 1 ? "rect" : lv === 2 ? r.pick(["ball", "rect"]) : r.pick(["border", "ball"]);
    if (kind === "rect") {
      const w = r.int(4, 15), d = r.int(2, 8);
      const A = w * (w + d);
      const thing = r.pick(["phone screen", "garden bed", "poster", "solar panel"]);
      return {
        prompt: `A rectangular ${thing} is ${d} units longer than it is wide, and its area is ${A} square units. Find the width.`,
        answer: num(w),
        hints: [`Let w be the width. Then the length is w + ${d}, and w(w + ${d}) = ${A}.`, `w^2 + ${d}w − ${A} = 0. Factor or use the formula; reject the negative answer.`],
        steps: [st("Write the equation.", `w(w + ${d}) = ${A}`), st("Set it equal to 0.", `w^2 + ${d}w − ${A} = 0`), st("Factor.", `(w − ${w})(w + ${w + d}) = 0`), st("Solve and check context.", `w = ${w} or w = −${w + d}. A width can't be negative, so w = ${w}.`)],
        traps: traps(frac(w), [trap(w + d, "That's the length. The question asks for the width."), trap(-(w + d), "A width can't be negative.")]),
      };
    }
    if (kind === "ball") {
      const t1 = r.int(2, 5), t0 = r.int(1, Math.min(2, t1 - 1));
      // h = −16(t − t1)(t + t0)
      const b = 16 * (t1 - t0), c = 16 * t1 * t0;
      return {
        prompt: `A ball is launched from ${String(c).startsWith("8") ? "an" : "a"} ${c}-ft platform. Its height is h(t) = −16t^2 + ${b}t + ${c}. After how many seconds does it hit the ground?`,
        answer: num(t1, { unit: " s" }),
        hints: ["The ball hits the ground when h(t) = 0.", `Factor out −16: −16(t^2 − ${b / 16}t − ${c / 16}) = 0.`],
        steps: [st("Set the height to 0.", `−16t^2 + ${b}t + ${c} = 0`), st("Factor out −16.", `−16(t^2 − ${b / 16 === 1 ? "" : b / 16}t − ${c / 16}) = 0`.replace("− 0t ", "")), st("Factor.", `−16(t − ${t1})(t + ${t0}) = 0`), st("Choose the sensible answer.", `t = ${t1} or t = −${t0}. Time after launch is positive: t = ${t1} s.`)],
        traps: traps(frac(t1), [trap(-t0, "Time can't be negative here."), trap(b / 32, "That's when it reaches its maximum height, not when it lands.")]),
      };
    }
    // Border around a picture: (L + 2x)(W + 2x) = total.
    const x = r.int(1, 4), L = r.int(6, 14), W = r.int(4, 10);
    const total = (L + 2 * x) * (W + 2 * x);
    const bq = 2 * (L + W), cq = L * W - total; // 4x^2 + 2(L+W)x + LW − total = 0
    return {
      prompt: `A ${L}-in. by ${W}-in. photo gets a frame of uniform width x. The photo and frame together cover ${total} in.². Find x.`,
      answer: num(x, { unit: " in." }),
      hints: ["The frame adds x on each side, so the outer dimensions are (L + 2x) by (W + 2x).", `(${L} + 2x)(${W} + 2x) = ${total}. Expand and set equal to 0.`],
      steps: [st("Write the equation.", `(${L} + 2x)(${W} + 2x) = ${total}`), st("Expand.", `4x^2 + ${bq}x + ${L * W} = ${total}`), st("Standard form.", `4x^2 + ${bq}x − ${-cq} = 0`), st("Solve (formula or factoring).", `x = ${x} (the other solution is negative)`), st("Check.", `${L + 2 * x} × ${W + 2 * x} = ${total} ✓`)],
      traps: traps(frac(x), [trap(2 * x, "That's the total added to each dimension; the frame width is half of that.")]),
    };
  },
};

const skills: Skill[] = [squareRoots, completeSolve, formula, discriminant, complexSolutions, justify, model];
export default skills;
