// Unit 4: Sinusoidal models: amplitude, period, phase shift, midline, domain and range (NC.M4.AF.2.3).
import { choice, cst, exact, ms, num, sn } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { PEOPLE, dec } from "./util";

const T = "m4-sinusoids";

/** Coefficient display: 3 → "3", 1 → "", −1 → "−". */
const co = (a: number) => (a === 1 ? "" : a === -1 ? "−" : ms(a));
/** Typed coefficient for plot curves. */
const coE = (a: number) => (a === 1 ? "" : a === -1 ? "-" : String(a));
const kE = (k: number) => (k === 0 ? "" : k > 0 ? `+${k}` : String(k));

/** π-multiple text: piText(2, 3) → "{2π/3}", piText(1, 1) → "π". */
function piText(n: number, d: number): string {
  const f = frac(n, d);
  const top = `${f.n === 1 ? "" : f.n}π`;
  return f.d === 1 ? top : `{${top}/${f.d}}`;
}
const piTyped = (n: number, d: number) => {
  const f = frac(n, d);
  return `${f.n}pi/${f.d}`;
};

const ampMidline: Skill = {
  id: "m4.sin.amp-midline",
  title: "Amplitude, midline and range",
  topic: T,
  standards: ["NC.M4.AF.2.3"],
  prereqs: [],
  lesson: {
    bigIdea: "In y = A sin(Bx) + k or y = A cos(Bx) + k, the midline is y = k, the amplitude is |A|, and the range runs from k − |A| to k + |A|.",
    explain: [
      "The midline is the horizontal line halfway between the highest and lowest points. The amplitude is the distance from the midline to a peak.",
      "Example: y = −3sin(2x) + 5. Midline y = 5, amplitude |−3| = 3, so the graph goes from 5 − 3 = **2** up to 5 + 3 = **8**. The negative sign flips the graph but doesn't change the amplitude.",
      "From data: if a tide's high is 9 ft and its low is 1 ft, the midline is {9 + 1/2} = 5 ft and the amplitude is {9 − 1/2} = 4 ft.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 6.3, yMin: 0, yMax: 9, xStep: Math.PI / 2, curves: [{ expr: "-3sin(2x)+5" }], hlines: [{ y: 5, dashed: true, label: "midline y = 5" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the amplitude of y = −4cos(x) equal to 4, not −4?", choices: ["Amplitude is a distance from the midline, and distances aren't negative.", "Because cosine is always positive.", "It is −4; the sign stays."], correct: 0, explain: "The negative reflects the graph across the midline; the peaks are still 4 units away." },
    { kind: "written", prompt: "A sound wave's graph has a maximum of 12 and a minimum of −2. Explain how to find its midline and amplitude.", keyIdeas: ["midline is the average of max and min: (12 + (−2))/2 = 5", "amplitude is half the distance from max to min: (12 − (−2))/2 = 7", "check: 5 + 7 = 12 and 5 − 7 = −2"], exemplar: "The midline is halfway between the max and min: (12 + (−2)) ÷ 2 = 5. The amplitude is half the total height: (12 − (−2)) ÷ 2 = 7. Check: 5 + 7 = 12 and 5 − 7 = −2." },
  ],
  generate(r, lv) {
    const A = r.nonzero(-6, 6), k = r.int(-5, 8), B = r.int(1, 4);
    const fn = r.pick(["sin", "cos"]);
    const eq = `y = ${co(A)}${fn}(${B === 1 ? "" : B}x)${cst(k)}`;
    if (lv === 1) {
      return {
        prompt: `Find the amplitude and the midline of ${eq}.`,
        answer: { kind: "multi", fields: [{ value: frac(Math.abs(A)), pre: "amplitude =" }, { value: frac(k), pre: "midline: y =" }] },
        hints: ["Compare with y = A·sin(Bx) + k: amplitude = |A|, midline y = k.", `Here A = ${ms(A)} and k = ${ms(k)}.`],
        steps: [st("Match the form.", `A = ${ms(A)}, B = ${B}, k = ${ms(k)}`), st("Amplitude.", `|A| = |${ms(A)}| = ${Math.abs(A)}`), st("Midline.", `y = ${ms(k)}`)],
      };
    }
    if (lv === 2) {
      return {
        prompt: `What are the minimum and maximum values of ${eq}?`,
        answer: { kind: "multi", fields: [{ value: frac(k - Math.abs(A)), pre: "minimum =" }, { value: frac(k + Math.abs(A)), pre: "maximum =" }] },
        hints: [`The graph goes ${Math.abs(A)} above and below its midline.`, `Midline y = ${ms(k)}, amplitude ${Math.abs(A)}: ${ms(k)} ± ${Math.abs(A)}.`],
        steps: [st("Midline and amplitude.", `Midline y = ${ms(k)}, amplitude |${ms(A)}| = ${Math.abs(A)}`), st("Minimum.", `${ms(k)} − ${Math.abs(A)} = ${ms(k - Math.abs(A))}`), st("Maximum.", `${ms(k)} + ${Math.abs(A)} = ${ms(k + Math.abs(A))}`), st("Range.", `${ms(k - Math.abs(A))} ≤ y ≤ ${ms(k + Math.abs(A))}`)],
      };
    }
    const lo = r.int(1, 6), amp = r.pick([1.5, 2, 2.5, 3, 3.5, 4, 5]);
    const hi = lo + 2 * amp;
    const ctx = r.pick([
      [`At a beach, the tide's water depth varies sinusoidally between a low of ${lo} ft and a high of ${hi} ft.`, "ft"],
      [`A buoy bobs up and down; its height above the sea floor varies sinusoidally between ${lo} m and ${hi} m.`, "m"],
      [`The tip of a fan blade moves between ${lo} ft and ${hi} ft above the floor as it spins.`, "ft"],
    ]);
    return {
      prompt: `${ctx[0]} Find the amplitude and the midline of a model for this situation.`,
      answer: { kind: "multi", fields: [{ value: frac(amp), pre: "amplitude =" }, { value: frac(lo + amp), pre: "midline: y =" }] },
      hints: ["The midline is the average of the high and low values.", `Midline = {${hi} + ${lo}/2}; amplitude = {${hi} − ${lo}/2}.`],
      steps: [st("Midline.", `{${hi} + ${lo}/2} = {${hi + lo}/2} = ${dec(lo + amp)} ${ctx[1]}`), st("Amplitude.", `{${hi} − ${lo}/2} = {${hi - lo}/2} = ${dec(amp)} ${ctx[1]}`), st("Check.", `${dec(lo + amp)} ± ${dec(amp)} gives ${lo} and ${dec(hi)}. ✓`)],
    };
  },
};

const period: Skill = {
  id: "m4.sin.period",
  title: "Period of a sinusoid",
  topic: T,
  standards: ["NC.M4.AF.2.3"],
  prereqs: ["m4.sin.amp-midline"],
  lesson: {
    bigIdea: "For y = A sin(Bx) + k, one full cycle takes period = {2π/|B|} (in radians). Bigger B means faster cycles and a shorter period.",
    explain: [
      "sin(x) repeats every 2π. In sin(Bx), the input runs B times as fast, so a cycle takes {2π/B}.",
      "Example: y = 4cos(3x) has period {2π/3}. Example: y = sin({π/6}x) has period {2π/π/6} = 2π · {6/π} = **12**, which is great for models measured in months or hours.",
      "Backward: to build a model with period 24 hours, use B = {2π/24} = {π/12}.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 24, yMin: -2, yMax: 2, xStep: 3, curves: [{ expr: "sin(pi*x/6)" }], vlines: [{ x: 12, dashed: true, label: "one period = 12" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does doubling B cut the period in half?", choices: ["The input Bx reaches 2π in half as much x, so the cycle finishes twice as fast.", "Because B is the amplitude.", "Doubling B doubles the period."], correct: 0, explain: "Period = 2π/B, so doubling B halves the period." },
    { kind: "written", prompt: "Explain how to choose B for a model of something that repeats every 365 days.", keyIdeas: ["period = 2π/B", "set 2π/B = 365", "B = 2π/365"], exemplar: "The period formula is 2π/B. I want that to equal 365, so 2π/B = 365 and B = 2π/365. Then the input 2πt/365 goes through one full cycle (2π) when t = 365." },
  ],
  generate(r, lv) {
    const A = r.pick([1, 2, 3, 4, 5, -2, -3]), k = r.int(-3, 10);
    const fn = r.pick(["sin", "cos"]);
    if (lv === 1) {
      const d = r.pick([1, 2, 3, 4, 6, 12]);
      const P = 2 * d;
      const Bt = d === 1 ? "πx" : `{π/${d}}x`;
      return {
        prompt: `Find the period of y = ${co(A)}${fn}(${Bt})${cst(k)}.`,
        answer: num(P),
        hints: ["Period = {2π/B}.", `Here B = ${d === 1 ? "π" : `{π/${d}}`}. Dividing by ${d === 1 ? "π" : `{π/${d}}`} is the same as multiplying by ${d === 1 ? "{1/π}" : `{${d}/π}`}.`],
        steps: [st("Identify B.", `B = ${d === 1 ? "π" : `{π/${d}}`}`), st("Use the period formula.", `period = {2π/B} = 2π × ${d === 1 ? "{1/π}" : `{${d}/π}`} = ${P}`)],
        traps: [{ value: frac(d), feedback: "That's half the period. One full cycle is 2π divided by B." }, ...(Math.abs(A) !== P ? [{ value: frac(Math.abs(A)), feedback: "That's the amplitude. The period comes from B." }] : [])].filter((t) => t.value.n !== P),
      };
    }
    if (lv === 2) {
      const B = r.pick([2, 3, 4, 5, 6]);
      return {
        prompt: `Find the exact period of y = ${co(A)}${fn}(${B}x)${cst(k)}. (Type π as pi.)`,
        answer: exact(piTyped(2, B), piText(2, B)),
        hints: ["Period = {2π/B}.", `B = ${B}, so the period is {2π/${B}}. Simplify if you can.`],
        steps: [st("Identify B.", `B = ${B}`), st("Use the period formula.", `period = {2π/${B}}${frac(2, B).n === 2 ? "" : ` = ${piText(2, B)}`}`), st("Meaning.", `The graph completes one full cycle every ${piText(2, B)} units, ${B} cycles in each 2π.`)],
      };
    }
    const [P, what] = r.pick([[12, "months (a yearly temperature cycle)"], [24, "hours (a daily temperature cycle)"], [365, "days (hours of daylight over a year)"], [4, "seconds (a swing on a playground)"], [6, "seconds (ocean waves hitting a pier)"], [8, "seconds (a breathing cycle while exercising)"]] as [number, string][]);
    return {
      prompt: `You're building a model y = A sin(Bt) + k for something that repeats every ${P} ${what}. Find the exact value of B (B > 0). (Type π as pi.)`,
      answer: exact(piTyped(2, P), piText(2, P)),
      hints: ["Period = {2π/B}, so B = {2π/period}.", `B = {2π/${P}}. Simplify.`],
      steps: [st("Set the period.", `{2π/B} = ${P}`), st("Solve for B.", `B = {2π/${P}}${frac(2, P).n === 2 ? "" : ` = ${piText(2, P)}`}`), st("Check.", `When t = ${P}, Bt = ${piText(2, P)} × ${P} = 2π, exactly one full cycle. ✓`)],
    };
  },
};

const shifts: Skill = {
  id: "m4.sin.shifts",
  title: "Phase shift and vertical shift",
  topic: T,
  standards: ["NC.M4.AF.2.3"],
  prereqs: ["m4.sin.period"],
  lesson: {
    bigIdea: "In y = A sin(B(x − h)) + k, the graph shifts h units horizontally (the phase shift) and k units vertically.",
    explain: [
      "y = 2sin(x − 3) + 1 is y = 2sin(x) moved **right 3** and **up 1**. Inside the parentheses, x − 3 means right, x + 3 means left.",
      "Factor B out first! y = sin(2x − 6) = sin(2(x − 3)), so the phase shift is 3 to the right, not 6.",
      "The vertical shift k is also the midline: y = k.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is the phase shift of sin(2x − 8) equal to 4, not 8?", choices: ["Factoring gives sin(2(x − 4)): x must change by 4 to make 2x − 8 change by 8.", "Because you always divide by 2 for sine.", "It is 8; the 2 doesn't matter."], correct: 0, explain: "The shift is measured in x, so factor B out of the inside." },
    { kind: "written", prompt: "Explain why y = sin(x − 2) is shifted right, even though there's a minus sign.", keyIdeas: ["the graph reaches each value when x − 2 equals the old input", "so x must be 2 bigger", "everything happens 2 units later (to the right)"], exemplar: "sin(x − 2) equals sin(0) when x − 2 = 0, which is x = 2. Every point of sin x now happens 2 units later, so the whole graph moves right 2." },
  ],
  generate(r, lv) {
    const A = r.pick([1, 2, 3, 4, -2, -3]), k = r.int(-6, 6), h = r.nonzero(-5, 5);
    const fn = r.pick(["sin", "cos"]);
    const B = lv === 1 ? 1 : r.int(2, 4);
    const inside = `x${cst(-h)}`;
    let eq: string, work: string[];
    if (lv < 3) {
      eq = `y = ${co(A)}${fn}(${B === 1 ? inside : `${B}(${inside})`})${cst(k)}`;
      work = [st("Match y = A·" + fn + "(B(x − h)) + k.", `${B === 1 ? inside : `${B}(${inside})`}: h = ${ms(h)}; k = ${ms(k)}`)];
    } else {
      eq = `y = ${co(A)}${fn}(${B}x${cst(-B * h)})${cst(k)}`;
      work = [st("Factor B out of the inside.", `${B}x${cst(-B * h)} = ${B}(${inside})`), st("Read h and k.", `h = ${ms(h)}; k = ${ms(k)}`)];
    }
    return {
      prompt: `For ${eq}, find the phase shift (positive = right, negative = left) and the vertical shift (positive = up, negative = down).`,
      answer: { kind: "multi", fields: [{ value: frac(h), pre: "phase shift =" }, { value: frac(k), pre: "vertical shift =" }] },
      hints: [lv === 3 ? `Factor ${B} out of the inside first: ${B}(x − ?).` : "Write the inside as (x − h). Then h is the phase shift.", `${h > 0 ? `x − ${h} means right ${h}` : `x + ${-h} means left ${-h}`}; the constant at the end is the vertical shift.`],
      steps: [...work, st("Interpret.", `Phase shift ${h > 0 ? `right ${h}` : `left ${-h}`} (h = ${ms(h)}); ${k === 0 ? "no vertical shift (k = 0)" : `vertical shift ${k > 0 ? `up ${k}` : `down ${-k}`} (k = ${ms(k)})`}, so the midline is y = ${ms(k)}.`)],
    };
  },
};

const graphRead: Skill = {
  id: "m4.sin.graph",
  title: "Read a sinusoid from its graph",
  topic: T,
  standards: ["NC.M4.AF.2.3"],
  prereqs: ["m4.sin.shifts"],
  lesson: {
    bigIdea: "From a graph: midline = average of max and min, amplitude = half the max-to-min distance, period = horizontal distance from one peak to the next.",
    explain: [
      "Find a maximum and a minimum. If the max is 7 and the min is 1, the midline is y = 4 and the amplitude is 3.",
      "Measure the period between two neighboring peaks. Peaks at x = 1 and x = 9 mean a period of 8, so B = {2π/8} = {π/4}.",
      "If the graph starts at a peak when x = 0, a cosine is the simplest model (cos starts at its max). If it starts on the midline going up, use sine.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 16, yMin: 0, yMax: 8, xStep: 2, curves: [{ expr: "3cos(pi*x/4)+4" }], points: [{ x: 0, y: 7, label: "(0, 7)" }, { x: 4, y: 1, label: "(4, 1)" }, { x: 8, y: 7, label: "(8, 7)" }], hlines: [{ y: 4, dashed: true }] },
  },
  why: [
    { kind: "choice", prompt: "Why can the same graph be written with sine or with cosine?", choices: ["A cosine graph is a sine graph shifted left a quarter period.", "Sine and cosine are the same function.", "It can't; each graph has only one equation."], correct: 0, explain: "cos x = sin(x + π/2), so a phase shift turns one into the other." },
    { kind: "written", prompt: "A graph has peaks at x = 3 and x = 15, with a minimum between them. Explain how to find the period and where the minimum is.", keyIdeas: ["period is the distance between consecutive peaks: 15 − 3 = 12", "the minimum is halfway between peaks", "at x = 9"], exemplar: "Neighboring peaks are one period apart, so the period is 15 − 3 = 12. The minimum is half a period after a peak, at x = 3 + 6 = 9." },
  ],
  generate(r, lv) {
    const amp = r.int(1, 5), k = r.int(-2, 6), d = r.pick([2, 3, 4, 6]);
    const P = 2 * d;
    const useCos = r.chance(0.5);
    const flip = r.chance(0.3) ? -1 : 1;
    const A = flip * amp;
    const typed = `${coE(A)}${useCos ? "cos" : "sin"}(pi*x/${d})${kE(k)}`;
    // First max location.
    const xMax = useCos ? (flip > 0 ? 0 : d) : flip > 0 ? d / 2 : (3 * d) / 2;
    const xMin = xMax + d;
    const vis: Visual = { type: "plot", xMin: 0, xMax: 2 * P, yMin: k - amp - 1, yMax: k + amp + 1, xStep: d / 2 >= 1 ? d / 2 : 1, curves: [{ expr: typed }], points: [{ x: xMax, y: k + amp, label: `(${dec(xMax)}, ${k + amp})` }, { x: xMin, y: k - amp, label: `(${dec(xMin)}, ${k - amp})` }] };
    const eq = `y = ${co(A)}${useCos ? "cos" : "sin"}({π/${d}}x)${cst(k)}`;
    if (lv === 1) {
      return {
        prompt: "Find the amplitude and the midline of the sinusoid shown.",
        visual: vis,
        answer: { kind: "multi", fields: [{ value: frac(amp), pre: "amplitude =" }, { value: frac(k), pre: "midline: y =" }] },
        hints: [`The highest value is ${k + amp} and the lowest is ${k - amp}.`, `Midline = average of ${k + amp} and ${ms(k - amp)}; amplitude = half their difference.`],
        steps: [st("Read the max and min.", `max = ${k + amp}, min = ${ms(k - amp)}`), st("Midline.", `{${k + amp} + ${sn(k - amp)}/2} = ${ms(k)}, so y = ${ms(k)}`), st("Amplitude.", `{${k + amp} − ${k - amp < 0 ? `(${ms(k - amp)})` : k - amp}/2} = {${2 * amp}/2} = ${amp}`)],
      };
    }
    if (lv === 2) {
      return {
        prompt: "What is the period of the sinusoid shown?",
        visual: vis,
        answer: num(P),
        hints: ["The period is the horizontal distance from one peak to the next.", `A peak is at x = ${dec(xMax)} and the next minimum is at x = ${dec(xMin)}: that's half a period.`],
        steps: [st("Peak to trough.", `${dec(xMin)} − ${dec(xMax)} = ${d}, which is half a period.`), st("Double it.", `period = 2 × ${d} = ${P}`), st("Check.", `The next peak is at x = ${dec(xMax + P)}.`)],
        traps: [{ value: frac(d), feedback: "From a peak to the next minimum is only half a period." }, ...(amp !== P && amp !== d ? [{ value: frac(amp), feedback: "That's the amplitude (vertical). The period is horizontal." }] : [])],
      };
    }
    const fnName = useCos ? "cos" : "sin", other = useCos ? "sin" : "cos";
    return {
      prompt: "Which equation matches the graph?",
      visual: vis,
      answer: choice(r, eq, [
        [`y = ${co(A)}${fnName}({π/${2 * d}}x)${cst(k)}`, `With B = {π/${2 * d}}, the period would be ${4 * d}. Measure peak to peak.`],
        [`y = ${co(A)}${other}({π/${d}}x)${cst(k)}`, `Check x = 0: the graph ${useCos ? (flip > 0 ? "starts at a maximum" : "starts at a minimum") : `starts on the midline going ${flip > 0 ? "up" : "down"}`}.`],
        [`y = ${co(2 * A)}${fnName}({π/${d}}x)${cst(k)}`, `The amplitude is ${amp}: half the distance from max to min.`],
        [`y = ${co(A)}${fnName}({π/${d}}x)${cst(-k)}`, `The midline is y = ${ms(k)}.`],
        [`y = ${co(-A)}${fnName}({π/${d}}x)${cst(k)}`, "Check whether the graph goes up or down first from x = 0."],
      ].filter((w) => w[0] !== eq).slice(0, 4) as [string, string][]),
      hints: ["Find the midline and amplitude from the max and min, and the period from peak to peak.", `Period ${P} gives B = {2π/${P}} = {π/${d}}. Then look at what happens at x = 0.`],
      steps: [
        st("Midline and amplitude.", `max ${k + amp}, min ${ms(k - amp)}: midline y = ${ms(k)}, amplitude ${amp}`),
        st("Period and B.", `peak to trough is ${d}, so the period is ${P} and B = {2π/${P}} = {π/${d}}`),
        st("Sine or cosine?", useCos ? `At x = 0 the graph is at its ${flip > 0 ? "maximum, like cos x" : "minimum, like −cos x"}.` : `At x = 0 the graph is on the midline heading ${flip > 0 ? "up, like sin x" : "down, like −sin x"}.`),
        st("Equation.", eq),
      ],
    };
  },
};

const context: Skill = {
  id: "m4.sin.context",
  title: "Sinusoidal models in context",
  topic: T,
  standards: ["NC.M4.AF.2.3"],
  prereqs: ["m4.sin.graph"],
  lesson: {
    bigIdea: "In a real sinusoidal model, the midline is the average level, the amplitude is how far it swings, the period is the time for one cycle, and the domain and range come from the situation.",
    explain: [
      "A Ferris wheel with radius 25 m and its lowest point 3 m above the ground turns once every 40 s. Starting at the bottom: h(t) = −25cos({2π/40}t) + 28.",
      "Midline 28 m (the axle height), amplitude 25 m (the radius), period 40 s. Highest point 28 + 25 = **53 m**, reached halfway through the ride at t = **20 s**.",
      "For one rotation, the domain is 0 ≤ t ≤ 40 and the range is 3 ≤ h ≤ 53.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 80, yMin: 0, yMax: 60, xStep: 10, yStep: 10, curves: [{ expr: "-25cos(2pi*x/40)+28" }], hlines: [{ y: 28, dashed: true, label: "axle: 28 m" }] },
  },
  why: [
    { kind: "choice", prompt: "In h(t) = −25cos({2π/40}t) + 28, why is there a negative in front?", choices: ["The rider starts at the bottom, and −cos starts at its minimum.", "Because heights below the axle are negative.", "To make the period shorter."], correct: 0, explain: "cos starts at a max; −cos starts at a min." },
    { kind: "written", prompt: "For a daily temperature model T(h) = −8cos({π/12}h) + 70 (h = hours after midnight), explain what 8, 70 and the period mean.", keyIdeas: ["70 is the average (midline) temperature", "8 is how far above and below average it swings: 62° to 78°", "period 2π ÷ (π/12) = 24 hours, one day"], exemplar: "70° is the average temperature (the midline). 8° is the amplitude, so the temperature swings between 62° and 78°. The period is 2π ÷ (π/12) = 24 hours, so the pattern repeats every day; the −cos makes the coldest time midnight." },
  ],
  generate(r, lv) {
    const wheel = r.chance(0.5);
    const name = r.pick(PEOPLE);
    let model: string, mid: number, amp: number, P: number, unitT: string, unitY: string, intro: string;
    if (wheel) {
      amp = r.pick([15, 20, 25, 30, 40]); const base = r.int(2, 6); mid = amp + base; P = r.pick([30, 40, 60, 90, 120]);
      model = `h(t) = −${amp}cos({2π/${P}}t) + ${mid}`;
      unitT = "seconds"; unitY = "m";
      intro = `${name} boards a Ferris wheel at the bottom. Their height in meters after t seconds is ${model}.`;
    } else {
      amp = r.int(5, 12); mid = r.int(55, 80); P = 24;
      model = `T(h) = −${amp}cos({π/12}h) + ${mid}`;
      unitT = "hours"; unitY = "°F";
      intro = `The temperature in a city on a spring day is modeled by ${model}, where h is hours after midnight.`;
    }
    const v = wheel ? "h" : "T";
    if (lv === 1) {
      const askMax = r.chance(0.5);
      const ans = askMax ? mid + amp : mid - amp;
      return {
        prompt: `${intro} What is the ${askMax ? "maximum" : "minimum"} ${wheel ? "height" : "temperature"}?`,
        answer: num(ans, { unit: wheel ? " m" : "°F" }),
        hints: [`The midline is ${mid} and the amplitude is ${amp}.`, `${askMax ? "Add" : "Subtract"} the amplitude ${askMax ? "to" : "from"} the midline.`],
        steps: [st("Read the model.", `amplitude ${amp}, midline ${mid}`), st(askMax ? "Maximum." : "Minimum.", `${mid} ${askMax ? "+" : "−"} ${amp} = ${ans} ${unitY}`)],
        traps: [{ value: frac(mid), feedback: "That's the midline (the average). Add or subtract the amplitude." }, { value: frac(askMax ? mid - amp : mid + amp), feedback: `That's the ${askMax ? "minimum" : "maximum"}.` }],
      };
    }
    if (lv === 2) {
      const half = P / 2;
      return {
        prompt: `${intro} When does the ${wheel ? "rider first reach the highest point" : "temperature first reach its daily high"}? Give t in ${unitT}.`,
        visual: { type: "plot", xMin: 0, xMax: P * 1.5, yMin: 0, yMax: mid + amp + 10, xStep: P / 4, yStep: wheel ? 10 : 10, curves: [{ expr: `-${amp}cos(2pi*x/${P})+${mid}` }], hlines: [{ y: mid, dashed: true }] },
        answer: num(half, { unit: ` ${unitT}` }),
        hints: [`The period is ${P} ${unitT}. −cos starts at its lowest point.`, "The maximum comes halfway through the cycle."],
        steps: [st("Find the period.", wheel ? `2π ÷ {2π/${P}} = ${P} seconds` : `2π ÷ {π/12} = 24 hours`), st("Where the cycle starts.", "−cos starts at the minimum when t = 0."), st("Halfway.", `The maximum is half a period later: ${P} ÷ 2 = ${half} ${unitT}.`)],
        traps: [{ value: frac(P), feedback: "After a full period you're back at the bottom/low. The top comes halfway." }, { value: frac(P / 4), feedback: `At a quarter period, ${v} is at the midline, not the maximum.` }],
      };
    }
    const lo = mid - amp, hi = mid + amp;
    const dom = wheel ? `0 ≤ t ≤ ${P}` : "0 ≤ h ≤ 24";
    const correct = `domain ${dom}; range ${lo} ≤ ${v} ≤ ${hi}`;
    return {
      prompt: `${intro} Which gives a sensible domain and range for ${wheel ? "one full rotation" : "one day"}?`,
      answer: choice(r, correct, [
        [`domain ${dom}; range ${mid} ≤ ${v} ≤ ${hi}`, "The range should go from the minimum to the maximum, and the model dips below the midline."],
        [`domain ${dom}; range ${ms(-amp)} ≤ ${v} ≤ ${amp}`, `That ignores the vertical shift of ${mid}.`],
        [`domain all real numbers; range ${lo} ≤ ${v} ≤ ${hi}`, wheel ? "Time for one rotation runs from 0 to one period." : "One day runs from h = 0 to h = 24."],
        [`domain ${lo} ≤ ${wheel ? "t" : "h"} ≤ ${hi}; range ${dom.replace(wheel ? "t" : "h", v)}`, "Domain and range are swapped: the domain is time."],
      ]),
      hints: [`One ${wheel ? "rotation" : "day"} lasts ${wheel ? P : 24} ${unitT}: that's the domain.`, `The range runs from ${mid} − ${amp} to ${mid} + ${amp}.`],
      steps: [st("Domain.", `${wheel ? `One rotation takes one period, ${P} s` : "One day is 24 hours"}: ${dom}.`), st("Range.", `midline ± amplitude: ${mid} − ${amp} = ${lo} to ${mid} + ${amp} = ${hi}.`), st("Answer.", correct)],
    };
  },
};

export default [ampMidline, period, shifts, graphRead, context] satisfies Skill[];
