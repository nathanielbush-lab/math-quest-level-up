// Unit 6: Graphs of the trig functions and sinusoidal models (PC.F.1.1–PC.F.1.4).
import { choice, cst, expr, ms, num, sn, trap } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { ang, angAns, angExpr, angInline, angText, angV, trapsTol, type Ang } from "./util";

const T = "pc-trig-graphs";

/** The coefficient B in sin(B(x − C)). */
interface Bc { disp: string; typed: string; v: number; piK?: number; int?: number }
function intB(b: number): Bc {
  return b === 0.5 ? { disp: "{1/2}", typed: "(1/2)", v: 0.5 } : { disp: b === 1 ? "" : String(b), typed: String(b), v: b, int: b };
}
function piB(k: number): Bc {
  return { disp: `{π/${k}}`, typed: `(pi/${k})`, v: Math.PI / k, piK: k };
}
/** Period 2π/B as display text and answer. */
function period(B: Bc) {
  if (B.piK) return { text: String(2 * B.piK), ans: num(2 * B.piK), num: 2 * B.piK };
  const p = B.v === 0.5 ? ang(4, 1) : ang(2, B.v);
  return { text: angText(p), ans: angAns(p), num: angV(p) };
}

interface Sin { fn: "sin" | "cos"; A: number; B: Bc; C: Ang | number; D: number }
const cIsZero = (C: Ang | number) => (typeof C === "number" ? C === 0 : C.n === 0);
const cText = (C: Ang | number) => (typeof C === "number" ? ms(C) : angText(C));
const cInline = (C: Ang | number) => (typeof C === "number" ? ms(C) : angInline(C));
const cTyped = (C: Ang | number) => (typeof C === "number" ? String(C) : angExpr(C));
const cNeg = (C: Ang | number) => (typeof C === "number" ? C < 0 : C.n < 0);
const cAbs = (C: Ang | number): Ang | number => (typeof C === "number" ? Math.abs(C) : ang(Math.abs(C.n), C.d));
const aDisp = (A: number) => (A === 1 ? "" : A === -1 ? "−" : ms(A));

function sinText(s: Sin): string {
  const inner = cIsZero(s.C)
    ? s.B.piK ? `{πx/${s.B.piK}}` : s.B.v === 0.5 ? "{x/2}" : `${s.B.disp}x`
    : `${s.B.disp}${s.B.disp ? "(" : ""}x ${cNeg(s.C) ? "+" : "−"} ${cText(cAbs(s.C))}${s.B.disp ? ")" : ""}`;
  return `${aDisp(s.A)}${s.fn}(${inner})${cst(s.D)}`;
}
function sinTyped(s: Sin, v = "x"): string {
  const c = cIsZero(s.C) ? v : `(${v}-(${cTyped(s.C)}))`;
  return `${s.A}*${s.fn}(${s.B.typed}*${c})${s.D ? (s.D > 0 ? "+" + s.D : s.D) : ""}`;
}

const features: Skill = {
  id: "pc.triggraphs.features",
  title: "Amplitude, period, midline and phase shift",
  topic: T,
  standards: ["PC.F.1.1"],
  prereqs: [],
  lesson: {
    bigIdea: "In y = A sin(B(x − C)) + D: |A| is the amplitude, {2π/B} is the period, C is the phase shift (right if positive) and y = D is the midline.",
    explain: [
      "y = 3 sin(2(x − {π/4})) + 1: amplitude 3, period {2π/2} = π, shifted {π/4} right, midline y = 1. It ranges from 1 − 3 = −2 up to 1 + 3 = 4.",
      "Watch for an unfactored inside: y = cos(2x − {π/2}) = cos(2(x − {π/4})). The shift is {π/4}, not {π/2}. Factor out B first.",
      "If B is a multiple of π, the period comes out as a plain number: y = sin({πx/6}) has period 2π ÷ {π/6} = **12**.",
    ],
    visual: { type: "plot", xMin: -1, xMax: 7, yMin: -3, yMax: 5, xStep: Math.PI / 4, curves: [{ expr: "3sin(2(x-pi/4))+1" }], hlines: [{ y: 1, dashed: true, label: "midline y = 1" }], points: [{ x: Math.PI / 2, y: 4, label: "max" }, { x: Math.PI, y: -2, label: "min" }] },
    tip: "A negative A flips the graph but the amplitude is still |A|.",
  },
  why: [
    { kind: "choice", prompt: "Why does sin(2x) complete a cycle in π instead of 2π?", choices: ["The inside 2x reaches 2π when x is only π, so the whole cycle happens twice as fast.", "Because 2 makes the graph twice as tall.", "Because the amplitude is 2.", "It completes a cycle in 4π."], correct: 0, explain: "sin repeats when its input goes up by 2π. With input 2x, that happens after x increases by π." },
    { kind: "written", prompt: "Explain how to find the maximum and minimum values of y = −4 cos(x) + 7.", keyIdeas: ["midline y = 7", "amplitude |−4| = 4", "max 7 + 4 = 11, min 7 − 4 = 3", "the negative only flips which x gives the max"], exemplar: "The midline is y = 7 and the amplitude is |−4| = 4, so the graph goes 4 above and 4 below 7: max 11, min 3. The negative sign just flips it, so the max happens where cos x = −1 instead of 1." },
  ],
  generate(r, lv) {
    const fn = r.pick(["sin", "cos"] as const);
    const usePi = lv >= 2 && r.chance(0.4);
    const B = usePi ? piB(r.pick([2, 3, 4, 6])) : intB(r.pick(lv === 1 ? [1, 2, 3, 4, 0.5] : [2, 3, 4, 0.5]));
    const A = lv === 3 ? r.pick([2, 3, 4, 5, -2, -3]) : r.pick([2, 3, 4, 5, 6]);
    const D = r.int(-5, 5);
    const C: Ang | number = lv === 1 ? 0 : usePi ? r.nonzero(-3, 3) : r.pick([ang(1, 4), ang(1, 3), ang(1, 6), ang(-1, 4), ang(-1, 3), ang(1, 2)]);
    const s: Sin = { fn, A, B, C, D };
    const per = period(B);
    const eq = `y = ${sinText(s)}`;
    if (lv === 1) {
      if (r.chance(0.5)) {
        return {
          prompt: `Find the amplitude and the midline of ${eq}.`,
          visual: { type: "plot", xMin: -0.5, xMax: per.num * 1.5, yMin: D - A - 2, yMax: D + A + 2, xStep: per.num / 4, curves: [{ expr: sinTyped(s) }] },
          answer: { kind: "multi", fields: [{ value: frac(Math.abs(A)), pre: "amplitude" }, { value: frac(D), pre: "midline y =" }] },
          hints: ["The amplitude is the number in front of the trig function (made positive).", "The midline is the number added at the end."],
          steps: [st("Amplitude.", `|A| = ${Math.abs(A)}`), st("Midline.", `y = ${ms(D)}`), st("Check with the graph.", `It goes from ${ms(D - A)} to ${ms(D + A)}, centered on ${ms(D)}.`)],
        };
      }
      return {
        prompt: `Find the period of ${eq}.`,
        answer: per.ans,
        hints: ["Period = {2π/B}, where B multiplies x.", `B = ${B.v === 0.5 ? "{1/2}" : B.typed}. Compute 2π ÷ ${B.v === 0.5 ? "{1/2}" : B.typed}.`],
        steps: [st("Identify B.", `B = ${B.v === 0.5 ? "{1/2}" : B.typed}`), st("Period.", `{2π/B} = ${per.text}`)],
      };
    }
    if (lv === 2) {
      if (r.chance(0.4)) {
        return {
          prompt: `Find the period of ${eq}.`,
          answer: per.ans,
          hints: ["Period = 2π ÷ B. The shift and the midline don't affect it.", `B = ${B.piK ? `{π/${B.piK}}` : B.v === 0.5 ? "{1/2}" : B.typed}.`],
          steps: [st("Identify B.", `B = ${B.piK ? `{π/${B.piK}}` : B.v === 0.5 ? "{1/2}" : B.typed}`), st("Period.", B.piK ? `2π ÷ {π/${B.piK}} = 2π · {${B.piK}/π} = ${per.text}` : `{2π/B} = ${per.text}`)],
        };
      }
      const dir = cNeg(C) ? "left" : "right";
      const opp = cNeg(C) ? "right" : "left";
      const correct = `${cInline(cAbs(C))} to the ${dir}`;
      const bc = typeof C === "number" ? null : ang(Math.abs(C.n) * (B.int ?? 1), C.d * (B.v === 0.5 ? 2 : 1));
      return {
        prompt: `What is the phase shift of ${eq}?`,
        answer: choice(r, correct, [[`${cInline(cAbs(C))} to the ${opp}`, `(x ${cNeg(C) ? "+" : "−"} c) shifts ${dir}: inside the function, the sign does the opposite.`], ...(bc && (B.int ?? 0) > 1 ? [[`${angInline(bc)} to the ${dir}`, "That's B times the shift. The shift is the number subtracted from x after factoring out B."] as [string, string]] : []), [`${Math.abs(D)} ${D >= 0 ? "up" : "down"}`, "That's the vertical shift (midline), not the phase shift."], ["No phase shift", "Look inside the parentheses: x has something subtracted or added."]]),
        hints: ["The phase shift is C in y = A sin(B(x − C)) + D.", `Inside: (x ${cNeg(C) ? "+" : "−"} ${cText(cAbs(C))}). Subtracting shifts right, adding shifts left.`],
        steps: [st("Read the inside.", `x ${cNeg(C) ? "+" : "−"} ${cText(cAbs(C))}, so C = ${cText(C)}.`), st("Direction.", `C ${cNeg(C) ? "< 0: shift left" : "> 0: shift right"} ${cText(cAbs(C))}.`)],
      };
    }
    // Level 3: unfactored inside, or max/min.
    if (r.chance(0.5) && !B.piK && (B.int ?? 0) > 1 && typeof C !== "number") {
      const b = B.int!;
      const BC = ang(C.n * b, C.d);
      const raw = `y = ${aDisp(A)}${fn}(${b}x ${cNeg(BC) ? "+" : "−"} ${angText(ang(Math.abs(BC.n), BC.d))})${cst(D)}`;
      const dir = cNeg(C) ? "left" : "right";
      const correct = `${angInline(cAbs(C) as Ang)} to the ${dir}`;
      return {
        prompt: `What is the phase shift of ${raw}?`,
        answer: choice(r, correct, [[`${angInline(ang(Math.abs(BC.n), BC.d))} to the ${dir}`, `Factor out ${b} first: ${b}x ${cNeg(BC) ? "+" : "−"} ${angInline(ang(Math.abs(BC.n), BC.d))} = ${b}(x ${cNeg(C) ? "+" : "−"} ${angInline(cAbs(C) as Ang)}).`], [`${angInline(cAbs(C) as Ang)} to the ${cNeg(C) ? "right" : "left"}`, "Check the direction: x − c shifts right."], [`${angInline(ang(Math.abs(BC.n) * b, BC.d))} to the ${dir}`, `Divide by ${b}, don't multiply.`]]),
        hints: [`Factor ${b} out of the inside: ${b}(x ${cNeg(C) ? "+" : "−"} ?).`, `${angText(ang(Math.abs(BC.n), BC.d))} ÷ ${b} = ${angText(cAbs(C) as Ang)}.`],
        steps: [st("Factor out B.", `${b}x ${cNeg(BC) ? "+" : "−"} ${angText(ang(Math.abs(BC.n), BC.d))} = ${b}(x ${cNeg(C) ? "+" : "−"} ${angText(cAbs(C) as Ang)})`), st("Read the shift.", `${angText(cAbs(C) as Ang)} to the ${dir}`)],
      };
    }
    return {
      prompt: `Find the maximum and minimum values of ${eq}.`,
      answer: { kind: "multi", fields: [{ value: frac(D + Math.abs(A)), pre: "max =" }, { value: frac(D - Math.abs(A)), pre: "min =" }] },
      hints: [`The midline is y = ${ms(D)} and the amplitude is |${ms(A)}| = ${Math.abs(A)}.`, "Max = midline + amplitude; min = midline − amplitude. The sign of A doesn't change these values."],
      steps: [st("Midline and amplitude.", `D = ${ms(D)}, |A| = ${Math.abs(A)}`), st("Max.", `${ms(D)} + ${Math.abs(A)} = ${ms(D + Math.abs(A))}`), st("Min.", `${ms(D)} − ${Math.abs(A)} = ${ms(D - Math.abs(A))}`)],
    };
  },
};

const fromGraph: Skill = {
  id: "pc.triggraphs.from-graph",
  title: "Write a sinusoid from its graph",
  topic: T,
  standards: ["PC.F.1.1", "PC.F.1.3"],
  prereqs: ["pc.triggraphs.features"],
  lesson: {
    bigIdea: "Read four things off the graph: the midline (halfway between max and min), the amplitude (max − midline), the period (max to next max) and where a cycle starts.",
    explain: [
      "Max (2, 7) and next min (6, −1): midline y = {7 + (−1)/2} = 3, amplitude 7 − 3 = 4.",
      "Max to min is half a period, 6 − 2 = 4, so the period is 8 and B = {2π/8} = {π/4}.",
      "A cosine starts at a max, so use the max as the shift: **y = 4 cos({π/4}(x − 2)) + 3**. A sine version works too: y = 4 sin({π/4}x) + 3 (it crosses the midline going up at x = 0).",
    ],
    visual: { type: "plot", xMin: -2, xMax: 12, yMin: -3, yMax: 9, curves: [{ expr: "4cos((pi/4)(x-2))+3" }], hlines: [{ y: 3, dashed: true, label: "y = 3" }], points: [{ x: 2, y: 7, label: "(2, 7)" }, { x: 6, y: -1, label: "(6, −1)" }] },
    tip: "Using cosine with the shift at a maximum is usually the fastest route.",
  },
  why: [
    { kind: "choice", prompt: "Why is the distance from a maximum to the next minimum half the period?", choices: ["One full cycle goes max → min → max, and the two halves take equal time.", "Because the amplitude is half the height.", "Because the midline is halfway.", "It's a quarter of the period."], correct: 0, explain: "A sinusoid is symmetric: falling from max to min takes the same time as rising back." },
    { kind: "written", prompt: "Two students write different equations for the same graph: y = 2 cos(x) + 1 and y = 2 sin(x + {π/2}) + 1. Explain how both can be right.", keyIdeas: ["the sine graph shifted left π/2 matches the cosine graph", "sin(x + π/2) = cos x", "equations can look different but describe the same function"], exemplar: "Sine and cosine have the same shape, just shifted by {π/2}. Shifting sine left {π/2} lines it up exactly with cosine, so sin(x + {π/2}) = cos x and both equations give the same graph." },
  ],
  generate(r, lv) {
    const k = r.pick([2, 3, 4, 6]);
    const P = 2 * k;
    const A = r.int(1, 5), D = r.int(-3, 4);
    const C = lv === 1 ? 0 : r.int(1, P - 1);
    const flip = lv === 3 && r.chance(0.6);
    // y = A cos(π/k (x − C)) + D, or for flip: −A cos(...) (min at C).
    const sA = flip ? -A : A;
    const s: Sin = { fn: "cos", A: sA, B: piB(k), C, D };
    const ex = sinTyped(s);
    const p1 = { x: C, y: D + sA }, p2 = { x: C + k, y: D - sA };
    return {
      prompt: `Write an equation for the sinusoid shown. (Any correct form is accepted.)`,
      visual: { type: "plot", xMin: -1, xMax: C + P + 2, yMin: D - A - 2, yMax: D + A + 2, curves: [{ expr: ex }], points: [{ x: p1.x, y: p1.y, label: `(${ms(p1.x)}, ${ms(p1.y)})` }, { x: p2.x, y: p2.y, label: `(${ms(p2.x)}, ${ms(p2.y)})` }] },
      answer: expr(ex, { lhs: "y", display: sinText(s) }),
      hints: [
        `Midline: halfway between ${ms(D + A)} and ${ms(D - A)}. Amplitude: distance from the midline to a max.`,
        `The labeled ${flip ? "minimum and maximum" : "maximum and minimum"} are half a period apart, so the period is 2 × ${k} = ${P} and B = {2π/${P}} = {π/${k}}.`,
        flip ? `The graph is at a minimum at x = ${C}, so try y = −${A} cos({π/${k}}(x − ${C})) + ${ms(D)}.` : `A cosine starts at a maximum. The max is at x = ${C}.`,
      ],
      steps: [
        st("Midline.", `y = {${ms(D + A)} + ${ms(D - A).replace(/^−/, "(−") + (D - A < 0 ? ")" : "")}/2} = ${ms(D)}`),
        st("Amplitude.", `${ms(D + A)} − ${sn(D)} = ${A}`),
        st("Period.", `Max to min takes ${k}, so the period is ${P}: B = {2π/${P}} = {π/${k}}.`),
        st(flip ? "A minimum is at the start, so use −cos." : "Cosine starts at a maximum.", `Shift: ${C === 0 ? "none" : `${C} to the right`}.`),
        st("Equation.", `y = ${sinText(s)}`),
      ],
    };
  },
};

const build: Skill = {
  id: "pc.triggraphs.build",
  title: "Build a sinusoidal model",
  topic: T,
  standards: ["PC.F.1.3"],
  prereqs: ["pc.triggraphs.features"],
  lesson: {
    bigIdea: "To model anything that repeats, pick A (half the max-to-min distance), D (the middle value), B = {2π/period}, and a starting point that matches the context.",
    explain: [
      "A Ferris wheel 50 m across with its center 30 m up turns once every 10 minutes. You board at the bottom.",
      "A = 25, D = 30, B = {2π/10} = {π/5}. Starting at the bottom (a minimum) means a flipped cosine: **h(t) = −25 cos({π/5}t) + 30**.",
      "Check: h(0) = −25 + 30 = 5 m (the bottom), and h(5) = 25 + 30 = 55 m (the top, halfway around).",
    ],
    visual: { type: "plot", xMin: 0, xMax: 20, yMin: 0, yMax: 60, xStep: 2.5, yStep: 10, curves: [{ expr: "-25cos(pi x/5)+30", label: "h(t)" }], hlines: [{ y: 30, dashed: true }] },
  },
  why: [
    { kind: "choice", prompt: "Why does the Ferris wheel model use −cos instead of cos?", choices: ["The ride starts at the bottom, a minimum, and −cos starts at its minimum.", "Because heights are negative.", "Because the wheel turns clockwise.", "cos would also start at the bottom."], correct: 0, explain: "cos(0) = 1 is a maximum. Multiplying by −1 makes t = 0 a minimum, matching boarding at the bottom." },
    { kind: "written", prompt: "High tide is 9 ft at noon and low tide is 1 ft at 6 pm. Explain how to find A, D and the period of a model.", keyIdeas: ["D = (9 + 1)/2 = 5", "A = 9 − 5 = 4", "high to low is half a period, 6 hours, so the period is 12 hours"], exemplar: "The middle level is (9 + 1)/2 = 5 ft, so D = 5, and the amplitude is 9 − 5 = 4 ft. Going from high to low tide is half a cycle and takes 6 hours, so the full period is 12 hours and B = 2π/12 = π/6." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const fn = r.pick(["sin", "cos"] as const);
      const usePi = r.chance(0.5);
      const B = usePi ? piB(r.pick([2, 3, 4, 6])) : intB(r.pick([2, 3, 4, 0.5]));
      const A = r.int(2, 6), D = r.int(-4, 4);
      const per = period(B);
      const s: Sin = { fn, A, B, C: 0, D };
      return {
        prompt: `Write a ${fn === "sin" ? "sine" : "cosine"} function with amplitude ${A}, period ${per.text}, midline y = ${ms(D)} and no phase shift.`,
        answer: expr(sinTyped(s), { lhs: "y", display: sinText(s) }),
        hints: [`Use y = A ${fn}(Bx) + D.`, `B = {2π/period} = 2π ÷ ${per.text}.`],
        steps: [st("A and D.", `A = ${A}, D = ${ms(D)}`), st("B from the period.", `B = 2π ÷ ${per.text} = ${B.piK ? `{π/${B.piK}}` : B.v === 0.5 ? "{1/2}" : B.typed}`), st("Equation.", `y = ${sinText(s)}`)],
      };
    }
    if (lv === 2) {
      const R = r.pick([10, 15, 20, 25, 30]);
      const hub = R + r.pick([2, 3, 5]);
      const Tm = r.pick([4, 6, 8, 10, 12]);
      const s: Sin = { fn: "cos", A: -R, B: piB(Tm / 2), C: 0, D: hub };
      return {
        prompt: `A Ferris wheel has a diameter of ${2 * R} m and its center is ${hub} m above the ground. It makes one full turn every ${Tm} minutes. You board at the lowest point. Write h(t), your height in meters t minutes after boarding.`,
        answer: expr(sinTyped(s, "t"), { vars: ["t"], lhs: "h(t)", display: sinText(s).replace("πx", "πt") }),
        hints: [`Amplitude = radius = ${R}. Midline = height of the center = ${hub}.`, `Period ${Tm} min, so B = {2π/${Tm}} = {π/${Tm / 2}}.`, "You start at the bottom (a minimum), so use −cos."],
        steps: [st("Amplitude and midline.", `A = ${R} (the radius), D = ${hub}`), st("B.", `B = {2π/${Tm}} = {π/${Tm / 2}}`), st("Starting point.", "Bottom at t = 0: use −cos."), st("Model.", `h(t) = ${sinText(s).replace("πx", "πt")}`), st("Check.", `h(0) = −${R} + ${hub} = ${hub - R} m (the bottom)`)],
      };
    }
    const tides = r.chance(0.5);
    if (tides) {
      const L = r.int(1, 3), H = L + 2 * r.int(2, 5), t1 = r.int(1, 5);
      const A = (H - L) / 2, D = (H + L) / 2;
      const s: Sin = { fn: "cos", A, B: piB(6), C: t1, D };
      return {
        prompt: `At a beach, high tide is ${H} ft at ${t1} a.m. and the next low tide is ${L} ft six hours later. Write a cosine model h(t) for the water depth, with t in hours after midnight.`,
        answer: expr(sinTyped(s, "t"), { vars: ["t"], lhs: "h(t)", display: sinText(s).replace(/\(x/g, "(t") }),
        hints: [`D = {${H} + ${L}/2} = ${D}, A = ${H} − ${D} = ${A}.`, "High to low is half a period, so the period is 12 hours: B = {π/6}.", `Cosine starts at a max, and the max is at t = ${t1}.`],
        steps: [st("Midline and amplitude.", `D = ${D}, A = ${A}`), st("Period.", "6 hours is half a cycle, so the period is 12 and B = {2π/12} = {π/6}."), st("Shift.", `High tide at t = ${t1}: C = ${t1}.`), st("Model.", `h(t) = ${sinText(s).replace(/\(x/g, "(t")}`)],
      };
    }
    const lo = r.int(45, 60), hi = lo + 2 * r.int(6, 12), th = r.pick([14, 15, 16]);
    const A = (hi - lo) / 2, D = (hi + lo) / 2;
    const s: Sin = { fn: "cos", A, B: piB(12), C: th, D };
    return {
      prompt: `On a summer day the temperature peaks at ${hi}°F at ${th - 12} p.m. (t = ${th}) and bottoms out at ${lo}°F twelve hours earlier. Write a cosine model T(t) with t in hours after midnight.`,
      answer: expr(sinTyped(s, "t"), { vars: ["t"], lhs: "T(t)", display: sinText(s).replace(/\(x/g, "(t") }),
      hints: [`D = {${hi} + ${lo}/2} = ${D}, A = ${A}.`, "Max to min is 12 hours, so the period is 24 and B = {π/12}.", `The max is at t = ${th}.`],
      steps: [st("Midline and amplitude.", `D = ${D}, A = ${A}`), st("Period.", "24 hours, so B = {2π/24} = {π/12}."), st("Shift.", `Max at t = ${th}.`), st("Model.", `T(t) = ${sinText(s).replace(/\(x/g, "(t")}`)],
    };
  },
};

const other: Skill = {
  id: "pc.triggraphs.other",
  title: "Graphs of tangent, cotangent, secant and cosecant",
  topic: T,
  standards: ["PC.F.1.2"],
  prereqs: ["pc.triggraphs.features"],
  lesson: {
    bigIdea: "tan and cot have period π; sec and csc have period 2π. Each has vertical asymptotes wherever the function it's built from divides by zero.",
    explain: [
      "tan x = {sin x/cos x} has asymptotes where cos x = 0: x = {π/2} + kπ. cot x has asymptotes where sin x = 0: x = kπ.",
      "sec x = {1/cos x} shares tan's asymptotes; csc x = {1/sin x} shares cot's.",
      "With a coefficient B, the period is {π/B} (tan, cot) or {2π/B} (sec, csc). y = tan(2x) has period {π/2} and asymptotes at x = {π/4} + {kπ/2}.",
      "sec and csc never take values between −1 and 1: the range of y = sec x is (−∞, −1] ∪ [1, ∞).",
    ],
    visual: { type: "plot", xMin: -4.7, xMax: 4.7, yMin: -5, yMax: 5, xStep: Math.PI / 2, curves: [{ expr: "tan(x)", domain: [-4.6, 4.6] }], vlines: [{ x: -Math.PI / 2, dashed: true, label: "−π/2" }, { x: Math.PI / 2, dashed: true, label: "π/2" }, { x: (3 * Math.PI) / 2, dashed: true }, { x: (-3 * Math.PI) / 2, dashed: true }] },
  },
  why: [
    { kind: "choice", prompt: "Why does y = sec x have no values between −1 and 1?", choices: ["cos x is always between −1 and 1, and the reciprocal of such a number is at least 1 in size.", "Because sec x is always positive.", "Because the graph has asymptotes there.", "It does: sec(π/4) = 1/2."], correct: 0, explain: "If |cos x| ≤ 1, then |1/cos x| ≥ 1. So sec x is never strictly between −1 and 1." },
    { kind: "written", prompt: "Explain why y = tan x has a vertical asymptote at x = π/2.", keyIdeas: ["tan x = sin x / cos x", "cos(π/2) = 0 while sin(π/2) = 1", "dividing 1 by numbers near 0 gives huge values"], exemplar: "tan x = sin x ÷ cos x. Near π/2, cos x gets close to 0 while sin x is close to 1, so the quotient gets huge (positive on one side, negative on the other). At π/2 itself it doesn't exist, so the graph has a vertical asymptote." },
  ],
  generate(r, lv) {
    const fn = r.pick(["tan", "cot", "sec", "csc"] as const);
    const b = r.pick([2, 3, 4, 0.5]);
    const bD = b === 0.5 ? "{x/2}" : `${b}x`;
    const a = r.pick([1, 2, 3, -2]);
    const base = fn === "tan" || fn === "cot" ? ang(1, 1) : ang(2, 1);
    if (lv === 1) {
      const p = b === 0.5 ? ang(base.n * 2, 1) : ang(base.n, b);
      return {
        prompt: `Find the period of y = ${a === 1 ? "" : a === -1 ? "−" : ms(a)}${fn}(${bD}).`,
        answer: angAns(p),
        hints: [`The parent ${fn} x has period ${fn === "tan" || fn === "cot" ? "π" : "2π"}.`, `Divide that by B = ${b === 0.5 ? "{1/2}" : b}.`],
        steps: [st("Parent period.", fn === "tan" || fn === "cot" ? "π" : "2π"), st("Divide by B.", `${fn === "tan" || fn === "cot" ? "π" : "2π"} ÷ ${b === 0.5 ? "{1/2}" : b} = ${angText(p)}`)],
      };
    }
    if (lv === 2) {
      // Asymptotes of fn(bx): tan/sec at bx = π/2 + kπ; cot/csc at bx = kπ.
      const nb = b === 0.5 ? 1 : b, db = b === 0.5 ? 2 : 1; // b = nb/db
      const half = fn === "tan" || fn === "sec";
      const first = half ? ang(db, 2 * nb) : ang(db, nb);
      const wrongParent = half ? ang(1, 2) : ang(1, 1);
      const zero = half ? ang(db, nb) : ang(db, 2 * nb);
      const choices: [string, string][] = [
        [`x = ${angInline(wrongParent)}`, "That's the parent function's asymptote. The B changes where they are."],
        [`x = ${angInline(zero)}`, half ? "There the function is defined. Asymptotes come from cos(Bx) = 0." : "There the function is defined. Asymptotes come from sin(Bx) = 0."],
        ["x = 0", half ? "At x = 0, cos 0 = 1, so there's no division by zero." : "Look for another asymptote: x = 0 is one, but it's not the one listed first. Recheck."],
      ];
      const correct = `x = ${angInline(first)}`;
      return {
        prompt: `Which line is a vertical asymptote of y = ${fn}(${bD})?`,
        answer: choice(r, correct, half ? choices : choices.slice(0, 2)),
        hints: [half ? `${fn} has asymptotes where cos(${bD}) = 0.` : `${fn} has asymptotes where sin(${bD}) = 0.`, half ? `cos is 0 at {π/2}. Solve ${bD} = {π/2}.` : `sin is 0 at π (and 0). Solve ${bD} = π.`],
        steps: [st("Where does the function not exist?", half ? `${fn} = {${fn === "tan" ? "sin" : "1"}/cos}: not defined when cos(${bD}) = 0.` : `${fn} = {${fn === "cot" ? "cos" : "1"}/sin}: not defined when sin(${bD}) = 0.`), st("Solve.", `${bD} = ${half ? "{π/2}" : "π"} gives x = ${angText(first)}.`)],
      };
    }
    const sec = r.chance(0.5);
    const A = r.int(1, 4), k = r.int(-4, 4);
    const correct = `(−∞, ${ms(k - A)}] ∪ [${ms(k + A)}, ∞)`;
    return {
      prompt: `What is the range of y = ${A === 1 ? "" : A}${sec ? "sec" : "csc"}(x)${cst(k)}?`,
      answer: choice(r, correct, [[`[${ms(k - A)}, ${ms(k + A)}]`, `That's the range of ${A === 1 ? "" : A}${sec ? "cos" : "sin"} x${cst(k)}. The reciprocal function lives outside that band.`], [`(−∞, ${ms(k - A)}) ∪ (${ms(k + A)}, ∞)`, `The values ${ms(k - A)} and ${ms(k + A)} are reached (where ${sec ? "cos" : "sin"} x = ±1).`], ["All real numbers", `It never takes values strictly between ${ms(k - A)} and ${ms(k + A)}.`], [`(−∞, ${ms(-A)}] ∪ [${ms(A)}, ∞)`, "Don't forget the vertical shift."]]),
      hints: [`${sec ? "sec" : "csc"} x is never between −1 and 1.`, `Multiplying by ${A} moves the gap to (−${A}, ${A}); then shift by ${ms(k)}.`],
      steps: [st("Parent range.", "(−∞, −1] ∪ [1, ∞)"), st(`Stretch by ${A}.`, `(−∞, −${A}] ∪ [${A}, ∞)`), st(`Shift by ${ms(k)}.`, correct)],
    };
  },
};

const contextSolve: Skill = {
  id: "pc.triggraphs.context-solve",
  title: "Solve sinusoidal models in context",
  topic: T,
  standards: ["PC.F.1.4"],
  prereqs: ["pc.triggraphs.build"],
  lesson: {
    bigIdea: "'When is the height 35 m?' means solve h(t) = 35. Graph h and the line y = 35 (or use inverse cosine) and read the t-values; 'how long above 35 m' is the length of the interval where h(t) > 35.",
    explain: [
      "h(t) = 30 − 20 cos({π/6}t): rider on a wheel with period 12 minutes. When first at 40 m? 30 − 20 cos({π/6}t) = 40 → cos({π/6}t) = −{1/2} → {π/6}t = {2π/3} → **t = 4 min**.",
      "By symmetry the rider is at 40 m again at t = 12 − 4 = 8. So in each turn the rider is above 40 m from t = 4 to t = 8: **4 minutes**.",
      "On a graphing calculator: graph Y1 = h(x) and Y2 = 40, then use intersect.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 13, yMin: 0, yMax: 55, xStep: 1, yStep: 10, curves: [{ expr: "30-20cos(pi x/6)", label: "h(t)" }], hlines: [{ y: 40, dashed: true, label: "40 m" }], points: [{ x: 4, y: 40, label: "(4, 40)" }, { x: 8, y: 40, label: "(8, 40)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does h(t) = 35 usually have two solutions in each turn of a Ferris wheel?", choices: ["The rider passes 35 m once going up and once coming down.", "Because cosine has two values at every input.", "Because the wheel turns twice.", "It has only one solution."], correct: 0, explain: "Each turn includes a rise and a fall, and both cross every height between the bottom and top." },
    { kind: "written", prompt: "Explain how to use symmetry to find how long a rider is above a certain height, once you know the first time they reach it.", keyIdeas: ["the graph is symmetric about the time of the max", "the second crossing is the same distance after the max as the first is before it", "time above = second crossing − first crossing"], exemplar: "The top of the ride is halfway through the turn, and the height graph is symmetric around that moment. If the rider first reaches the height t_1 minutes in, they reach it again t_1 minutes before the end of the turn. The time above is the difference between those two times." },
  ],
  generate(r, lv) {
    const k = r.pick([3, 6, 9, 12]);
    const R = r.pick([15, 20, 25, 30, 40]), hub = R + r.pick([2, 4, 5]);
    const P = 2 * k;
    const ex = `${hub}-${R}cos(pi x/${k})`;
    const model = `h(t) = ${hub} − ${R} cos({πt/${k}})`;
    const vis = (y: number) => ({ type: "plot" as const, xMin: 0, xMax: P + 1, yMin: 0, yMax: hub + R + 5, xStep: k / 3, curves: [{ expr: ex, label: "h(t)" }], hlines: [{ y, dashed: true, label: `${y} m` }] });
    if (lv === 1) {
      const t = r.pick([k / 3, k / 2, (2 * k) / 3, k]);
      const c = Math.cos((Math.PI * t) / k);
      const h = Math.round((hub - R * c) * 100) / 100;
      return {
        prompt: `A Ferris wheel rider's height is ${model} meters, t minutes after boarding. Find the height after ${t} minutes.`,
        answer: num(h, { unit: " m" }),
        hints: [`Substitute t = ${t}: the angle is {π · ${t}/${k}}.`, `cos({π · ${t}/${k}}) = ${ms(Math.round(c * 100) / 100)}.`],
        steps: [st("Substitute.", `h(${t}) = ${hub} − ${R} cos({${t}π/${k}}) = ${hub} − ${R} cos(${angText(ang(t, k))})`), st("Evaluate cosine.", `cos(${angText(ang(t, k))}) = ${ms(Math.round(c * 100) / 100)}`), st("Finish.", `${hub} − ${R} · ${ms(Math.round(c * 100) / 100).replace(/^−/, "(−") + (c < 0 ? ")" : "")} = ${h} m`)],
        traps: trapsTol(h, 0, [trap(Math.round((hub - R * Math.cos(t)) * 100) / 100, "Your calculator was in degree mode, or you dropped the π/" + k + ". Use radians."), trap(hub - R, "That's the height at t = 0.")].filter((x) => Number.isFinite(x.value.n))),
      };
    }
    const opts = [{ y: hub - R / 2, first: k / 3, above: (4 * k) / 3, c: "{1/2}", ang: "{π/3}" }, { y: hub, first: k / 2, above: k, c: "0", ang: "{π/2}" }, { y: hub + R / 2, first: (2 * k) / 3, above: (2 * k) / 3, c: "−{1/2}", ang: "{2π/3}" }];
    const o = r.pick(opts);
    if (lv === 2) {
      return {
        prompt: `A Ferris wheel rider's height is ${model} meters, t minutes after boarding. When does the rider first reach ${o.y} m? (Use a graph or solve; round to the nearest tenth if needed.)`,
        visual: vis(o.y),
        answer: num(o.first, { tolerance: 0.051, unit: " min" }),
        hints: [`Set ${hub} − ${R} cos({πt/${k}}) = ${o.y} and isolate the cosine.`, `cos({πt/${k}}) = ${o.c}. The first positive angle with that cosine is ${o.ang}.`, `Solve {πt/${k}} = ${o.ang} for t.`],
        steps: [st("Set up.", `${hub} − ${R} cos({πt/${k}}) = ${o.y}`), st("Isolate cosine.", `cos({πt/${k}}) = ${o.c}`), st("Inverse cosine.", `{πt/${k}} = ${o.ang}`), st("Solve.", `t = ${o.ang} · {${k}/π} = ${o.first} min`)],
        traps: trapsTol(o.first, 0.051, [trap(P - o.first, "That's the second time the rider is at that height (on the way down)."), trap(o.first * 2, `Check: solve {πt/${k}} = ${o.ang} carefully.`)]),
      };
    }
    return {
      prompt: `A Ferris wheel rider's height is ${model} meters, t minutes after boarding. During each ${P}-minute turn, for how many minutes is the rider above ${o.y} m?`,
      visual: vis(o.y),
      answer: num(o.above, { tolerance: 0.051, unit: " min" }),
      hints: [`First find when h(t) = ${o.y}: cos({πt/${k}}) = ${o.c}, so t = ${o.first}.`, `By symmetry the rider comes back down to ${o.y} m at t = ${P} − ${o.first} = ${P - o.first}.`, "The time above is the difference."],
      steps: [st("First crossing.", `cos({πt/${k}}) = ${o.c} → t = ${o.first}`), st("Second crossing (symmetry).", `t = ${P} − ${o.first} = ${P - o.first}`), st("Time above.", `${P - o.first} − ${o.first} = ${o.above} min`)],
      traps: trapsTol(o.above, 0.051, [trap(o.first, "That's when the rider first reaches the height, not how long they stay above it."), trap(P - o.above, `That's the time below ${o.y} m.`)]),
    };
  },
};

export default [features, fromGraph, build, other, contextSolve];
