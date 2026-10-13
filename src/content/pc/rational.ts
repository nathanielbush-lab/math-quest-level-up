// Unit 3: Polynomial and rational functions, inequalities and optimization
// (PC.F.4.5, PC.F.4.6, PC.A.1.1, PC.A.1.2).
import { binom, choice, ms, num, poly, sn, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Problem, Skill, Visual } from "../types";
import { shiftText } from "./util";

const T = "pc-rational";

type Rel = "<" | "≤" | ">" | "≥";
interface Crit { x: number; pole: boolean }

const fmtEnd = (x: number) => ms(x);
const cf = (c: number) => (c === 1 ? "" : c === -1 ? "−" : ms(c));

/** Solution set of sign(f) rel 0, given critical points and a sign function. */
function solveSet(crits: Crit[], sign: (x: number) => number, rel: Rel): string {
  const cs = [...crits].sort((a, b) => a.x - b.x);
  const strict = rel === "<" || rel === ">";
  const want = rel === "<" || rel === "≤" ? -1 : 1;
  const edges = [-Infinity, ...cs.map((c) => c.x), Infinity];
  const parts: { lo: number; hi: number; loIn: boolean; hiIn: boolean }[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const lo = edges[i], hi = edges[i + 1];
    const mid = lo === -Infinity ? hi - 1 : hi === Infinity ? lo + 1 : (lo + hi) / 2;
    if (Math.sign(sign(mid)) !== want) continue;
    const loC = cs[i - 1], hiC = cs[i];
    parts.push({ lo, hi, loIn: !!loC && !strict && !loC.pole, hiIn: !!hiC && !strict && !hiC.pole });
  }
  // Merge pieces that share an included endpoint.
  const merged: typeof parts = [];
  for (const p of parts) {
    const last = merged[merged.length - 1];
    if (last && last.hi === p.lo && last.hiIn) { last.hi = p.hi; last.hiIn = p.hiIn; } else merged.push({ ...p });
  }
  if (!merged.length) return "No solution";
  if (merged.length === 1 && merged[0].lo === -Infinity && merged[0].hi === Infinity) return "All real numbers";
  return merged
    .map((p) => `${p.lo === -Infinity ? "(−∞" : (p.loIn ? "[" : "(") + fmtEnd(p.lo)}, ${p.hi === Infinity ? "∞)" : fmtEnd(p.hi) + (p.hiIn ? "]" : ")")}`)
    .join(" ∪ ");
}

const flip: Record<Rel, Rel> = { "<": "≥", "≤": ">", ">": "≤", "≥": "<" };
const toggle: Record<Rel, Rel> = { "<": "≤", "≤": "<", ">": "≥", "≥": ">" };

function signChartStep(crits: Crit[], sign: (x: number) => number): string {
  const cs = [...crits].sort((a, b) => a.x - b.x);
  const edges = [-Infinity, ...cs.map((c) => c.x), Infinity];
  const out: string[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const lo = edges[i], hi = edges[i + 1];
    const t = lo === -Infinity ? hi - 1 : hi === Infinity ? lo + 1 : (lo + hi) / 2;
    out.push(`test x = ${ms(t)}: ${sign(t) > 0 ? "+" : "−"}`);
  }
  return out.join("; ");
}

function inequalityChoice(r: Parameters<Skill["generate"]>[0], crits: Crit[], sign: (x: number) => number, rel: Rel, poleText = ""): { answer: Problem["answer"]; correct: string } {
  const correct = solveSet(crits, sign, rel);
  const asZeros = crits.map((c) => ({ ...c, pole: false }));
  const wrong: [string, string][] = [
    [solveSet(crits, sign, flip[rel]), "That's where the inequality is false. Check the sign of a test point in each interval."],
    [solveSet(crits, sign, toggle[rel]), rel === "<" || rel === ">" ? "The inequality is strict, so the zeros themselves are not included." : "With ≤ or ≥, the zeros make the expression equal 0, so they are included."],
  ];
  if (crits.some((c) => c.pole)) wrong.push([solveSet(asZeros, sign, rel), `A value that makes the denominator zero can never be included${poleText}.`]);
  wrong.push([solveSet(crits, (x) => -sign(x), toggle[rel]), "Test a point in each interval instead of guessing the pattern."]);
  return { answer: choice(r, correct, wrong.filter((w) => w[0] !== correct)), correct };
}

const asymptotes: Skill = {
  id: "pc.rational.asymptotes",
  title: "Holes and vertical asymptotes",
  topic: T,
  standards: ["PC.F.4.5"],
  prereqs: [],
  lesson: {
    bigIdea: "Factor the top and bottom. A factor that cancels makes a hole; a factor left in the denominator makes a vertical asymptote.",
    explain: [
      "f(x) = {x^2 − x − 6/x^2 − 9} = {(x − 3)(x + 2)/(x − 3)(x + 3)}.",
      "(x − 3) cancels, so there's a **hole** at x = 3. Its height comes from the simplified function {x + 2/x + 3} at x = 3: {5/6}. So the hole is at (3, {5/6}).",
      "(x + 3) stays in the denominator, so x = −3 is a **vertical asymptote**: the graph shoots up or down near it.",
    ],
    visual: { type: "plot", xMin: -8, xMax: 6, yMin: -6, yMax: 8, curves: [{ expr: "(x+2)/(x+3)" }], vlines: [{ x: -3, dashed: true, label: "x = −3" }], hlines: [{ y: 1, dashed: true, label: "y = 1" }], points: [{ x: 3, y: 5 / 6, open: true, label: "hole (3, 5/6)" }] },
    tip: "Always factor and cancel before deciding. A zero of the denominator is only an asymptote if it survives the cancelling.",
  },
  why: [
    { kind: "choice", prompt: "Why does a cancelled factor make a hole instead of an asymptote?", choices: ["Near that x the function behaves like the simplified version, which has a normal finite value there; only the exact point is missing.", "Because cancelled factors make the function zero.", "Holes and asymptotes are the same thing.", "Because the numerator is larger."], correct: 0, explain: "Away from x = a, the factors (x − a)/(x − a) equal 1, so the graph follows the simplified function. At x = a itself the original is not defined, leaving a single missing point." },
    { kind: "written", prompt: "Explain why f(x) = 1/(x − 2) has a vertical asymptote at x = 2 by describing what happens to f(x) as x gets close to 2.", keyIdeas: ["the denominator gets close to 0", "dividing 1 by a tiny number gives a huge number", "from the right it's large positive, from the left large negative"], exemplar: "As x approaches 2, x − 2 gets very small, and 1 divided by a tiny number is huge. From the right it's a tiny positive number so f goes up toward ∞; from the left it's tiny negative so f goes down toward −∞. The graph hugs the line x = 2." },
  ],
  generate(r, lv) {
    let a = r.int(-5, 5), b = r.int(-5, 5), c = r.int(-5, 5);
    while (b === a) b = r.int(-5, 5);
    while (c === a || c === b) c = r.int(-5, 5);
    const factored = `{${binom(a)}${binom(b)}/${binom(a)}${binom(c)}}`;
    const expanded = `{${poly([1, -(a + b), a * b])}/${poly([1, -(a + c), a * c])}}`;
    const shown = lv === 1 ? factored : expanded;
    const holeY = frac(a - b, a - c);
    const fields = lv === 3
      ? [{ value: frac(a), pre: "hole at x =" }, { value: holeY, pre: "hole's y =" }, { value: frac(c), pre: "vertical asymptote x =" }]
      : [{ value: frac(a), pre: "hole at x =" }, { value: frac(c), pre: "vertical asymptote x =" }];
    return {
      prompt: `f(x) = ${shown}. Find ${lv === 3 ? "the hole (both coordinates)" : "the x-value of the hole"} and the vertical asymptote.`,
      answer: { kind: "multi", fields },
      hints: [
        lv === 1 ? "Which factor appears in both the numerator and the denominator?" : "Factor the numerator and the denominator first.",
        `f(x) = ${factored}. The common factor ${binom(a)} cancels; the factor left on the bottom gives the asymptote.`,
        ...(lv === 3 ? [`For the hole's height, plug x = ${ms(a)} into the simplified function {${shiftText(b)}/${shiftText(c)}}.`] : []),
      ],
      steps: [
        ...(lv === 1 ? [] : [st("Factor.", `f(x) = ${factored}`)]),
        st("Cancel the common factor.", `${binom(a)} cancels, so f(x) = {${shiftText(b)}/${shiftText(c)}} with x ≠ ${ms(a)}. That's a hole at x = ${ms(a)}.`),
        st("What's left in the denominator?", `${binom(c)} = 0 at x = ${ms(c)}: vertical asymptote x = ${ms(c)}.`),
        ...(lv === 3 ? [st("Height of the hole.", `{${ms(a)} − ${sn(b)}/${ms(a)} − ${sn(c)}} = {${ms(a - b)}/${ms(a - c)}}${holeY.d === 1 ? ` = ${ms(holeY.n)}` : holeY.n === a - b && holeY.d === a - c ? "" : ` = ${holeY.n < 0 ? "−" : ""}{${Math.abs(holeY.n)}/${holeY.d}}`}`)] : []),
      ],
    };
  },
};

const endBehavior: Skill = {
  id: "pc.rational.end-behavior",
  title: "Horizontal asymptotes and end behavior",
  topic: T,
  standards: ["PC.F.4.5"],
  prereqs: ["pc.rational.asymptotes"],
  lesson: {
    bigIdea: "For large |x|, a rational function acts like the ratio of the leading terms. Compare degrees to find the horizontal asymptote.",
    explain: [
      "Degree on top < degree on bottom: f(x) → 0, so the asymptote is **y = 0**.",
      "Same degree: f(x) → (ratio of leading coefficients). For f(x) = {6x^2 + 1/3x^2 − 4x}, f(x) → {6/3} = 2, so **y = 2**.",
      "Degree on top is bigger: no horizontal asymptote; f(x) grows without bound. If the top is exactly one degree bigger there's a slant asymptote.",
      "In limit notation: lim_(x→∞) f(x) = 2 means the outputs get as close to 2 as you like when x is large.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can you ignore the lower-degree terms when x is very large?", choices: ["The leading terms grow much faster, so the other terms become tiny by comparison.", "Because lower terms are always zero.", "Because they cancel between top and bottom.", "You can't; they change the asymptote."], correct: 0, explain: "At x = 1000, 3x^2 is 3,000,000 while 5x is only 5,000. The ratio is controlled by the leading terms." },
    { kind: "written", prompt: "Explain why f(x) = {2x + 1/x^2 + 3} approaches 0 as x gets very large.", keyIdeas: ["the denominator has the higher degree", "x^2 grows much faster than 2x", "a fixed-size top over a huge bottom goes to 0"], exemplar: "The bottom has x^2 and the top only has x. When x is large, the bottom grows much faster than the top, so the fraction acts like 2x/x^2 = 2/x, which gets closer and closer to 0." },
  ],
  generate(r, lv) {
    const p = r.pick([2, 3, 4, 6, -2, -6, 5]), q = r.pick([1, 2, 3]);
    const b1 = r.int(-6, 6), c1 = r.int(-9, 9), b2 = r.int(-6, 6), c2 = r.nonzero(-9, 9);
    const type = lv === 1 ? "same" : lv === 2 ? r.pick(["same", "lower"]) : r.pick(["same", "lower", "higher"]);
    const numer = type === "same" ? poly([p, b1, c1]) : type === "lower" ? poly([p, c1]) : poly([p, b1, c1]);
    const denom = type === "higher" ? poly([q, c2]) : poly([q, b2, c2]);
    const ha = type === "same" ? frac(p, q) : frac(0);
    const haText = ha.d === 1 ? ms(ha.n) : `${ha.n < 0 ? "−" : ""}${Math.abs(ha.n)}/${ha.d}`;
    const fx = `f(x) = {${numer}/${denom}}`;
    const steps = [
      st("Compare the degrees.", type === "same" ? "Both top and bottom have degree 2." : type === "lower" ? "Top has degree 1, bottom has degree 2." : "Top has degree 2, bottom has degree 1."),
      st("Look at the leading terms.", type === "same" ? `f(x) ≈ {${cf(p)}x^2/${cf(q)}x^2} = ${q === 1 ? ms(p) : `{${ms(p)}/${q}}`} for large |x|.` : type === "lower" ? `f(x) ≈ {${cf(p)}x/${cf(q)}x^2} = {${ms(p)}/${cf(q)}x}, which goes to 0.` : `f(x) ≈ {${cf(p)}x^2/${cf(q)}x} = ${q === 1 ? `${cf(p)}x` : `{${cf(p)}x/${q}}`}, which keeps growing.`),
      st("Conclusion.", type === "higher" ? "No horizontal asymptote (there is a slant asymptote instead)." : `Horizontal asymptote y = ${haText}.`),
    ];
    if (lv < 3) {
      const asLimit = lv === 2 && r.chance(0.5);
      return {
        prompt: asLimit ? `${fx}. Find lim_(x→∞) f(x).` : `${fx}. What is the horizontal asymptote? Give the y-value.`,
        answer: { kind: "number", value: ha, pre: asLimit ? undefined : "y = " },
        hints: ["Compare the highest power of x on top and on bottom.", type === "same" ? "Same degree: divide the leading coefficients." : "The bottom's degree is higher, so the fraction shrinks toward 0."],
        steps,
        traps: traps(ha, [trap(frac(c1, c2), "That's the ratio of the constant terms. For large x, the leading terms matter."), trap(frac(q, p), "Leading coefficient of the top goes on top: divide top by bottom."), ...(type === "lower" ? [trap(frac(p, q), "The degrees aren't equal. When the bottom's degree is higher, the asymptote is y = 0.")] : [])]),
      };
    }
    const correct = type === "higher" ? "No horizontal asymptote; f(x) grows without bound" : `y = ${haText}`;
    return {
      prompt: `Describe the end behavior of ${fx}.`,
      answer: choice(r, correct, [
        ...(type !== "higher" ? [["No horizontal asymptote; f(x) grows without bound", "Compare degrees: the top's degree isn't bigger."] as [string, string]] : []),
        ...(type !== "same" ? [[`y = ${frac(p, q).d === 1 ? ms(frac(p, q).n) : `${p < 0 ? "−" : ""}${Math.abs(p)}/${q}`}`, "Dividing leading coefficients only works when the degrees are equal."] as [string, string]] : []),
        ...(type !== "lower" ? [["y = 0", "y = 0 happens when the bottom's degree is higher."] as [string, string]] : []),
        [`y = ${ms(c1)}`, "The constant terms don't decide end behavior."],
      ]),
      hints: ["Compare the degrees of the top and bottom.", "Higher on top: no horizontal asymptote. Same: ratio of leading coefficients. Higher on bottom: y = 0."],
      steps,
    };
  },
};

function lineVisual(crits: Crit[]): Visual {
  const xs = crits.map((c) => c.x);
  const lo = Math.min(...xs) - 3, hi = Math.max(...xs) + 3;
  return { type: "numberline", min: lo, max: hi, step: 1, points: crits.map((c) => ({ v: c.x, label: c.pole ? `${ms(c.x)} (not allowed)` : ms(c.x) })) };
}

const polyIneq: Skill = {
  id: "pc.rational.poly-ineq",
  title: "Polynomial inequalities with a sign chart",
  topic: T,
  standards: ["PC.A.1.1"],
  prereqs: [],
  lesson: {
    bigIdea: "Find where the polynomial equals zero, split the number line there, and test one point in each interval to see its sign.",
    explain: [
      "Solve (x + 2)(x − 1)(x − 4) > 0. Zeros: −2, 1, 4. They cut the line into four intervals.",
      "Test x = −3: (−)(−)(−) = negative. x = 0: (+)(−)(−) = positive. x = 2: (+)(+)(−) = negative. x = 5: positive.",
      "We want > 0: **(−2, 1) ∪ (4, ∞)**. Parentheses because the inequality is strict; with ≥ the zeros would be included with brackets.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 6, yMin: -12, yMax: 16, curves: [{ expr: "(x+2)(x-1)(x-4)" }], points: [{ x: -2, y: 0, label: "−2" }, { x: 1, y: 0, label: "1" }, { x: 4, y: 0, label: "4" }] },
    tip: "Signs usually alternate across single zeros, but always test. A squared factor doesn't change the sign.",
  },
  why: [
    { kind: "choice", prompt: "Why is one test point enough for a whole interval?", choices: ["A polynomial can only change sign at a zero, and there are no zeros inside the interval.", "Because all intervals are the same length.", "Because polynomials are always positive between zeros.", "It isn't; you need to test every point."], correct: 0, explain: "Polynomials are continuous, so to go from positive to negative they must pass through 0. Between consecutive zeros the sign can't change." },
    { kind: "written", prompt: "Explain why the solution of x^2 − 9 ≤ 0 uses brackets: [−3, 3].", keyIdeas: ["at x = ±3 the expression equals 0", "≤ includes equal to 0", "so the endpoints are solutions"], exemplar: "At x = −3 and x = 3, x^2 − 9 = 0, and the inequality says less than OR equal to 0. So those endpoints are solutions and get brackets." },
  ],
  generate(r, lv) {
    const roots = new Set<number>();
    const n = lv === 1 ? 2 : 3;
    while (roots.size < n) roots.add(r.int(-5, 6));
    const rs = [...roots].sort((a, b) => a - b);
    const lead = lv === 3 && r.chance(0.5) ? -1 : 1;
    const rel = r.pick(["<", "≤", ">", "≥"] as Rel[]);
    const sign = (x: number) => lead * rs.reduce((s, ri) => s * (x - ri), 1);
    const crits = rs.map((x) => ({ x, pole: false }));
    let shown = `${lead < 0 ? "−" : ""}${rs.map((x) => binom(x)).join("")}`;
    if (lv === 3 && n === 3 && lead === 1) shown = poly([1, -(rs[0] + rs[1] + rs[2]), rs[0] * rs[1] + rs[0] * rs[2] + rs[1] * rs[2], -rs[0] * rs[1] * rs[2]]);
    const { answer, correct } = inequalityChoice(r, crits, sign, rel);
    return {
      prompt: `Solve ${shown} ${rel} 0.`,
      answer,
      hints: [shown.includes("(") ? "Find the zeros: set each factor equal to 0." : `Factor first. Try small integers: which values make it 0? (It factors as ${rs.map((x) => binom(x)).join("")}.)`, `The zeros are ${rs.map(ms).join(", ")}. Test one x in each interval to get the sign.`, `Keep the intervals where the sign is ${rel === "<" || rel === "≤" ? "negative" : "positive"}.${rel === "≤" || rel === "≥" ? " Include the zeros." : ""}`],
      steps: [
        st("Find the zeros.", `${rs.map(ms).join(", ")}`),
        st("Make a sign chart.", signChartStep(crits, sign)),
        st(`Keep the ${rel === "<" || rel === "≤" ? "negative" : "positive"} intervals.`, `${rel === "≤" || rel === "≥" ? "Include the zeros (brackets)." : "Exclude the zeros (parentheses)."}`),
        st("Solution.", correct),
      ],
      visual: lineVisual(crits),
    };
  },
};

const ratIneq: Skill = {
  id: "pc.rational.rat-ineq",
  title: "Rational inequalities",
  topic: T,
  standards: ["PC.A.1.1"],
  prereqs: ["pc.rational.poly-ineq", "pc.rational.asymptotes"],
  lesson: {
    bigIdea: "Critical points of a rational expression are the zeros of the top AND of the bottom. Test the sign between them, and never include a zero of the denominator.",
    explain: [
      "Solve {x − 3/x + 1} ≥ 0. Top is 0 at x = 3; bottom is 0 at x = −1.",
      "Test x = −2: {−/−} = +. x = 0: {−/+} = −. x = 4: {+/+} = +.",
      "We want ≥ 0: **(−∞, −1) ∪ [3, ∞)**. 3 is included (the fraction equals 0 there); −1 is excluded (division by zero).",
    ],
    tip: "Don't multiply both sides by the denominator: you don't know if it's positive or negative. Use a sign chart instead.",
  },
  why: [
    { kind: "choice", prompt: "Why can't you solve {x − 3/x + 1} ≥ 0 by multiplying both sides by (x + 1)?", choices: ["(x + 1) could be negative, which would flip the inequality, and you don't know which case you're in.", "Because multiplication isn't allowed with inequalities.", "Because x + 1 is always zero.", "You can; it gives the same answer every time."], correct: 0, explain: "Multiplying by a negative flips an inequality. Since the sign of x + 1 depends on x, a sign chart is the safe method." },
    { kind: "written", prompt: "In the solution of {x + 2/x − 5} ≤ 0, explain why −2 is included but 5 is not.", keyIdeas: ["at x = −2 the fraction equals 0, which satisfies ≤ 0", "at x = 5 the denominator is 0", "the expression isn't defined at 5, so it can't be a solution"], exemplar: "At x = −2 the numerator is 0, so the whole fraction equals 0 and '≤ 0' is true. At x = 5 the denominator is 0, so the fraction doesn't exist there and 5 can't be a solution." },
  ],
  generate(r, lv) {
    const used = new Set<number>();
    const pickRoot = () => { let v = r.int(-6, 6); while (used.has(v)) v = r.int(-6, 6); used.add(v); return v; };
    const a = pickRoot(), b = pickRoot();
    const c = lv === 3 ? pickRoot() : null;
    const rel = r.pick(["<", "≤", ">", "≥"] as Rel[]);
    const sign = (x: number) => ((x - a) * (c === null ? 1 : x - c)) / (x - b);
    const crits: Crit[] = [{ x: a, pole: false }, { x: b, pole: true }, ...(c === null ? [] : [{ x: c, pole: false }])];
    const top = c === null ? shiftText(a) : `${binom(a)}${binom(c)}`;
    const shown = `{${top}/${shiftText(b)}}`;
    const { answer, correct } = inequalityChoice(r, crits, sign, rel, ` (here x = ${ms(b)})`);
    return {
      prompt: `Solve ${shown} ${rel} 0.`,
      answer,
      visual: lineVisual(crits),
      hints: ["Critical points come from the zeros of the numerator and the zero of the denominator.", `Critical points: ${crits.map((k) => ms(k.x)).join(", ")}. Test a point in each interval.`, `x = ${ms(b)} makes the denominator 0, so it is never part of the answer.`],
      steps: [
        st("Zeros of the numerator.", `${[a, ...(c === null ? [] : [c])].map(ms).join(" and ")}`),
        st("Zero of the denominator (excluded).", ms(b)),
        st("Sign chart.", signChartStep(crits, sign)),
        st("Solution.", correct),
      ],
    };
  },
};

const graphIneq: Skill = {
  id: "pc.rational.graph-ineq",
  title: "Solve inequalities from a graph",
  topic: T,
  standards: ["PC.A.1.2"],
  prereqs: ["pc.rational.poly-ineq"],
  lesson: {
    bigIdea: "f(x) > 0 where the graph is above the x-axis; f(x) > g(x) where the graph of f is above the graph of g.",
    explain: [
      "Read the x-intercepts (or intersection points). They are the boundaries of the solution intervals.",
      "Then read which side is above. For f(x) ≥ g(x), include the x-values of the intersection points.",
      "A graphing calculator does exactly this: graph both sides and find the intersections.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 5, yMin: -6, yMax: 10, curves: [{ expr: "x^2-1", label: "f" }, { expr: "x+5", color: 2, label: "g" }], points: [{ x: -2, y: 3, label: "(−2, 3)" }, { x: 3, y: 8, label: "(3, 8)" }] },
    tip: "Answer with x-values. The y-values of intersection points don't belong in the solution set.",
  },
  why: [
    { kind: "choice", prompt: "Why do the intersection points mark the boundaries for f(x) < g(x)?", choices: ["At an intersection f(x) = g(x), so that's where one graph can switch from below to above the other.", "Because the y-values are equal to zero there.", "Because intersections are always at x = 0.", "They don't; only x-intercepts matter."], correct: 0, explain: "To change which graph is on top, the graphs have to cross, and crossing points are where f(x) = g(x)." },
    { kind: "written", prompt: "Explain how to solve x^3 − 4x < 0 with a graphing calculator.", keyIdeas: ["graph y = x^3 − 4x", "find the x-intercepts −2, 0, 2", "keep the x-intervals where the graph is below the x-axis", "answer (−∞, −2) ∪ (0, 2)"], exemplar: "Graph y = x^3 − 4x and find where it crosses the x-axis: −2, 0 and 2. The graph is below the axis for x < −2 and between 0 and 2, so the solution is (−∞, −2) ∪ (0, 2)." },
  ],
  generate(r, lv) {
    const rel = r.pick(["<", "≤", ">", "≥"] as Rel[]);
    if (lv < 3) {
      const set = new Set<number>();
      const n = lv === 1 ? 2 : 3;
      while (set.size < n) set.add(r.int(-4, 4));
      const rs = [...set].sort((a, b) => a - b);
      const lead = r.pick([1, -1]) * (n === 2 ? 1 : 0.5);
      const exprS = `${lead === 1 ? "" : lead === -1 ? "-" : lead === 0.5 ? "0.5" : "-0.5"}${rs.map((x) => `(x${x > 0 ? "-" + x : x < 0 ? "+" + -x : ""})`).join("")}`;
      const f = (x: number) => lead * rs.reduce((s, ri) => s * (x - ri), 1);
      const crits = rs.map((x) => ({ x, pole: false }));
      const { answer, correct } = inequalityChoice(r, crits, f, rel);
      const ys = Array.from({ length: 41 }, (_, i) => f(rs[0] - 2 + ((rs[n - 1] - rs[0] + 4) * i) / 40));
      return {
        prompt: `The graph of y = f(x) is shown. Use it to solve f(x) ${rel} 0.`,
        visual: { type: "plot", xMin: rs[0] - 2, xMax: rs[n - 1] + 2, yMin: Math.floor(Math.min(...ys, -2)), yMax: Math.ceil(Math.max(...ys, 2)), curves: [{ expr: exprS, label: "f" }], points: rs.map((x) => ({ x, y: 0, label: `(${ms(x)}, 0)` })) },
        answer,
        hints: [`The x-intercepts are ${rs.map(ms).join(", ")}.`, `f(x) ${rel} 0 means the graph is ${rel === "<" || rel === "≤" ? "below" : "above"} the x-axis${rel === "≤" || rel === "≥" ? " or touching it" : ""}.`],
        steps: [st("Read the x-intercepts.", rs.map(ms).join(", ")), st(`Find where the graph is ${rel === "<" || rel === "≤" ? "below" : "above"} the x-axis.`, correct), st("Endpoints.", rel === "≤" || rel === "≥" ? "Included, since f(x) = 0 there." : "Not included: the inequality is strict.")],
      };
    }
    // f(x) = x^2 + bx + c vs line g(x) = mx + k crossing at p < q.
    const p = r.int(-4, 0), q = p + r.int(2, 5), m = r.int(-2, 2), k = r.int(-3, 3);
    // f(x) − g(x) = (x − p)(x − q)
    const b = -(p + q) + m, c = p * q + k;
    const fE = `x^2${b ? (b > 0 ? "+" + b : b) + "x" : ""}${c ? (c > 0 ? "+" + c : c) : ""}`;
    const gE = `${m ? m + "x" : ""}${k ? (k > 0 && m ? "+" + k : k) : m ? "" : "0"}`;
    const diff = (x: number) => (x - p) * (x - q);
    const crits = [{ x: p, pole: false }, { x: q, pole: false }];
    const { answer, correct } = inequalityChoice(r, crits, diff, rel);
    const yP = m * p + k, yQ = m * q + k;
    return {
      prompt: `The graphs of y = f(x) (the parabola) and y = g(x) (the line) are shown. Solve f(x) ${rel} g(x).`,
      visual: { type: "plot", xMin: p - 3, xMax: q + 3, yMin: Math.min(yP, yQ, -2) - 4, yMax: Math.max(yP, yQ) + 8, curves: [{ expr: fE, label: "f" }, { expr: gE, color: 2, label: "g" }], points: [{ x: p, y: yP, label: `(${ms(p)}, ${ms(yP)})` }, { x: q, y: yQ, label: `(${ms(q)}, ${ms(yQ)})` }] },
      answer,
      hints: [`The graphs cross at x = ${ms(p)} and x = ${ms(q)}.`, `f(x) ${rel} g(x) means the parabola is ${rel === "<" || rel === "≤" ? "below" : "above"} the line.`, "Answer with x-values only."],
      steps: [st("Intersections.", `x = ${ms(p)} and x = ${ms(q)}`), st("Which graph is on top?", `The parabola is below the line between ${ms(p)} and ${ms(q)} and above it outside.`), st("Solution.", correct)],
    };
  },
};

const optimize: Skill = {
  id: "pc.rational.optimize",
  title: "Optimization with polynomial and rational models",
  topic: T,
  standards: ["PC.F.4.6"],
  prereqs: ["pc.rational.end-behavior"],
  lesson: {
    bigIdea: "Write the quantity to optimize as a function of one variable, use the constraints to set its domain, then find the highest or lowest point (with a graph or calculator).",
    explain: [
      "An open box is made from a 12 cm square sheet by cutting x-by-x squares from the corners and folding up. Volume V(x) = x(12 − 2x)^2 for 0 < x < 6.",
      "Graphing V shows a maximum at **x = 2**, where V = 2 · 8^2 = **128 cm^3**.",
      "Rational models show up when a fixed amount is spread out: a 200 m^2 pen against a wall with sides x, x and {200/x} needs fence L(x) = 2x + {200/x}. Its minimum is at x = 10, L = 40 m.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 6, yMin: 0, yMax: 140, yStep: 20, curves: [{ expr: "x(12-2x)^2", label: "V(x)" }], points: [{ x: 2, y: 128, label: "max (2, 128)" }] },
    tip: "Check the endpoints of the domain make sense: a cut of 0 or 6 cm leaves no box at all.",
  },
  why: [
    { kind: "choice", prompt: "For the box V(x) = x(12 − 2x)^2, why is the domain 0 < x < 6?", choices: ["The cut must be positive, and two cuts of x must fit in the 12 cm side.", "Because volumes are less than 6.", "Because the graph stops at 6.", "Any x works."], correct: 0, explain: "You can't cut a negative square, and 12 − 2x must stay positive for the base to exist." },
    { kind: "written", prompt: "A 200 m^2 pen needs fence L(x) = 2x + 200/x. Explain why L gets large both when x is tiny and when x is huge.", keyIdeas: ["tiny x makes 200/x huge (very long side)", "huge x makes 2x huge", "so the minimum is somewhere in between"], exemplar: "If x is tiny, the other side 200/x has to be enormous to keep the area, so you need lots of fence. If x is huge, the two sides 2x use lots of fence. The best x is in between, where the total is smallest." },
  ],
  generate(r, lv) {
    const kind = lv === 1 ? "box" : lv === 2 ? r.pick(["box", "pen"]) : r.pick(["pen", "box-volume"]);
    if (kind === "box" || kind === "box-volume") {
      const m = r.int(1, 4), s = 6 * m, x = m, V = x * (s - 2 * x) ** 2;
      const askV = kind === "box-volume";
      return {
        prompt: `An open box is made from a ${s} in by ${s} in sheet of cardboard by cutting equal x-by-x squares from the corners and folding up the sides. ${askV ? "What is the largest possible volume, in cubic inches?" : "What cut size x gives the largest volume?"}`,
        answer: num(askV ? V : x, { unit: askV ? " in³" : " in" }),
        hints: ["The base is (s − 2x) by (s − 2x) and the height is x.", `V(x) = x(${s} − 2x)^2 for 0 < x < ${s / 2}. Graph it and find the highest point.`, `The maximum is at x = ${x} (one sixth of the side).`],
        steps: [
          st("Write the volume.", `V(x) = x(${s} − 2x)^2, domain 0 < x < ${s / 2}`),
          st("Find the maximum (graph or calculator).", `The highest point is at x = ${x}.`),
          st("Evaluate.", `V(${x}) = ${x} · ${s - 2 * x}^2 = ${V} in^3`),
          st("Answer.", askV ? `${V} cubic inches` : `Cut ${x} in squares.`),
        ],
        traps: traps(frac(askV ? V : x), askV ? [trap(s ** 3, "That's a cube with the full sheet side. The box's base shrinks by 2x.")] : [trap(s / 4, "Check by graphing: V(x) is larger at a smaller cut."), trap(s / 2, `At x = ${s / 2} the base disappears and V = 0.`)]),
      };
    }
    const k = r.int(3, 12), A = 2 * k * k, L = 4 * k;
    const askL = r.chance(0.5);
    return {
      prompt: `A rectangular dog run of area ${A} ft^2 is built against a house, so fence is needed on only three sides: two sides of length x and one of length {${A}/x}. The fence length is L(x) = 2x + {${A}/x}. ${askL ? "What is the least amount of fence needed, in feet?" : "What value of x uses the least fence?"}`,
      answer: num(askL ? L : k, { unit: " ft" }),
      hints: ["Graph L(x) for x > 0 and look for the lowest point.", `Try values: L(${k - 1}), L(${k}), L(${k + 1}). Which is smallest?`, `The minimum is at x = √({${A}/2}) = ${k}.`],
      steps: [
        st("Model.", `L(x) = 2x + {${A}/x}, x > 0`),
        st("Find the minimum (graph or calculator).", `The lowest point is at x = ${k}.`),
        st("Evaluate.", `L(${k}) = 2(${k}) + {${A}/${k}} = ${2 * k} + ${2 * k} = ${L} ft`),
        st("Answer.", askL ? `${L} ft of fence` : `x = ${k} ft (the side parallel to the house is ${2 * k} ft)`),
      ],
      traps: traps(frac(askL ? L : k), askL ? [trap(Math.round(4 * Math.sqrt(A)), "That's the perimeter of a square pen with all four sides fenced.")] : [trap(Math.round(Math.sqrt(A)), "A square isn't best here, because one side is free (the house).")]),
    };
  },
};

export default [asymptotes, endBehavior, polyIneq, ratIneq, graphIneq, optimize];
