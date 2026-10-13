// Unit 9: Normal distributions: the empirical rule, z-scores, probabilities and percentiles (NC.M4.SP.3.4).
import { choice, num } from "../helpers";
import { st } from "../steps";
import type { Skill } from "../types";
import { PEOPLE, dec, fix, invNorm, normCdf, rnd, tolTraps } from "./util";

const T = "m4-normal";

interface Ctx { what: string; unit: string; mu: number; sd: number }
export const NORMAL_CTX: Ctx[] = [
  { what: "battery life of a phone model", unit: "hours", mu: 20, sd: 2 },
  { what: "heights of adult women in a large study", unit: "inches", mu: 64, sd: 3 },
  { what: "commute times for workers in a city", unit: "minutes", mu: 26, sd: 5 },
  { what: "reaction times in a video-game test", unit: "milliseconds", mu: 250, sd: 20 },
  { what: "scores on a statewide math test", unit: "points", mu: 500, sd: 100 },
  { what: "lengths of songs on a streaming playlist", unit: "seconds", mu: 210, sd: 30 },
  { what: "weights of bags of trail mix", unit: "grams", mu: 340, sd: 10 },
];
const ER: Record<number, number> = { 1: 34, 2: 47.5, 3: 49.85 };

const empirical: Skill = {
  id: "m4.norm.empirical",
  title: "The 68–95–99.7 rule",
  topic: T,
  standards: ["NC.M4.SP.3.4"],
  prereqs: [],
  lesson: {
    bigIdea: "In any normal distribution, about 68% of values are within 1 SD of the mean, 95% within 2 SDs, and 99.7% within 3 SDs.",
    explain: [
      "Split the curve at the mean: each half holds 50%. From the mean out to 1 SD is 34%, out to 2 SDs is 47.5%, out to 3 SDs is 49.85%.",
      "Battery life: μ = 20 h, σ = 2 h. Between 18 and 24 hours is 1 SD below to 2 SDs above: 34% + 47.5% = **81.5%**.",
      "More than 22 hours (above 1 SD): 50% − 34% = **16%**.",
    ],
    visual: { type: "normal", mean: 20, sd: 2, shadeFrom: 18, shadeTo: 24, label: "battery life (hours)" },
  },
  why: [
    { kind: "choice", prompt: "Why is the percent above μ + σ equal to 16%?", choices: ["Half the data (50%) is above the mean, and 34% of it is between μ and μ + σ, leaving 16%.", "Because 100% − 68% = 32%, so 32% is above.", "Because 1 SD always holds 16%."], correct: 0, explain: "The 32% outside μ ± σ splits evenly into two 16% tails." },
    { kind: "written", prompt: "Explain why the empirical rule only works for distributions that are approximately normal.", keyIdeas: ["the percents come from the shape of the normal curve", "skewed or uneven distributions put different amounts in each interval", "check the shape (histogram) before using it"], exemplar: "The 68–95–99.7 percents describe the specific bell shape of a normal curve. A skewed distribution piles more data on one side, so the percents within 1, 2 or 3 SDs can be very different. Check that the data look roughly normal first." },
  ],
  generate(r, lv) {
    const c = r.pick(NORMAL_CTX);
    const at = (k: number) => c.mu + k * c.sd;
    if (lv === 1) {
      const kind = r.pick(["within", "above", "below"]);
      const k = r.int(1, 3);
      let lo: number | undefined, hi: number | undefined, ans: number, q: string;
      if (kind === "within") { lo = at(-k); hi = at(k); ans = 2 * ER[k]; q = `between ${dec(lo)} and ${dec(hi)} ${c.unit}`; }
      else if (kind === "above") { lo = at(k); ans = rnd(50 - ER[k], 2); q = `more than ${dec(lo)} ${c.unit}`; }
      else { hi = at(-k); ans = rnd(50 - ER[k], 2); q = `less than ${dec(hi)} ${c.unit}`; }
      return {
        prompt: `The ${c.what} are approximately normal with mean ${c.mu} and standard deviation ${c.sd} ${c.unit}. About what percent are ${q}?`,
        visual: { type: "normal", mean: c.mu, sd: c.sd, shadeFrom: lo, shadeTo: hi, label: c.unit },
        answer: num(ans, { unit: "%" }),
        hints: [`How many SDs from the mean is each boundary? ${c.sd} ${c.unit} = 1 SD.`, kind === "within" ? `Within ${k} SD${k > 1 ? "s" : ""}: use the ${[68, 95, 99.7][k - 1]}% part of the rule.` : `A tail beyond ${k} SD${k > 1 ? "s" : ""} is half of what's outside ${[68, 95, 99.7][k - 1]}%.`],
        steps: [st("Convert to SDs.", kind === "within" ? `${dec(lo!)} = μ − ${k}σ and ${dec(hi!)} = μ + ${k}σ` : `${dec(kind === "above" ? lo! : hi!)} = μ ${kind === "above" ? "+" : "−"} ${k}σ`), st("Use the rule.", kind === "within" ? `${[68, 95, 99.7][k - 1]}%` : `(100% − ${[68, 95, 99.7][k - 1]}%) ÷ 2 = ${dec(ans, 2)}%`)],
        traps: kind === "within" ? [] : tolTraps(ans, 0, [[2 * ans, "That's both tails. The question asks about one side only."], [[68, 95, 99.7][k - 1], "That's the middle. The question asks about a tail."], [50 + ER[k], "That's everything on the other side of the boundary."]]),
      };
    }
    const a = r.int(1, 3);
    let b = r.int(1, 3);
    if (b === a) b = a === 3 ? 1 : a + 1;
    const lo = at(-a), hi = at(b);
    const pctv = rnd(ER[a] + ER[b], 2);
    if (lv === 2) {
      return {
        prompt: `The ${c.what} are approximately normal with mean ${c.mu} and standard deviation ${c.sd} ${c.unit}. About what percent are between ${dec(lo)} and ${dec(hi)} ${c.unit}?`,
        visual: { type: "normal", mean: c.mu, sd: c.sd, shadeFrom: lo, shadeTo: hi, label: c.unit },
        answer: num(pctv, { unit: "%" }),
        hints: [`${dec(lo)} is ${a} SD${a > 1 ? "s" : ""} below the mean and ${dec(hi)} is ${b} SD${b > 1 ? "s" : ""} above.`, "Add the two halves separately: mean to 1 SD = 34%, to 2 SDs = 47.5%, to 3 SDs = 49.85%."],
        steps: [st("Left part.", `From μ − ${a}σ to μ: ${ER[a]}%`), st("Right part.", `From μ to μ + ${b}σ: ${ER[b]}%`), st("Add.", `${ER[a]}% + ${ER[b]}% = ${dec(pctv, 2)}%`)],
        traps: tolTraps(pctv, 0, [[[68, 95, 99.7][Math.max(a, b) - 1], "The interval isn't symmetric; add the two sides separately."]]),
      };
    }
    let a3 = r.int(1, 2), b3 = r.int(1, 2);
    if (a3 === b3) b3 = 3 - a3;
    const N = r.pick([200, 400, 1000, 2000]);
    const p3 = ER[a3] + ER[b3];
    const ans = (p3 / 100) * N;
    const lo3 = at(-a3), hi3 = at(b3);
    return {
      prompt: `The ${c.what} are approximately normal with mean ${c.mu} and SD ${c.sd} ${c.unit}. ${r.pick(PEOPLE)} takes a random sample of ${N}. About how many should be between ${dec(lo3)} and ${dec(hi3)} ${c.unit}?`,
      visual: { type: "normal", mean: c.mu, sd: c.sd, shadeFrom: lo3, shadeTo: hi3, label: c.unit },
      answer: num(ans),
      hints: ["Find the percent with the empirical rule, then take that percent of the total.", `${ER[a3]}% + ${ER[b3]}% = ${p3}% of ${N}.`],
      steps: [st("Percent.", `${ER[a3]}% + ${ER[b3]}% = ${p3}%`), st("Count.", `${dec(p3 / 100, 3)} × ${N} = ${dec(ans)}`)],
      traps: tolTraps(ans, 0, [[p3, `That's the percent. Multiply ${dec(p3 / 100, 3)} by ${N}.`]]),
    };
  },
};

const zscore: Skill = {
  id: "m4.norm.zscore",
  title: "z-scores",
  topic: T,
  standards: ["NC.M4.SP.3.4"],
  prereqs: ["m4.norm.empirical"],
  lesson: {
    bigIdea: "A z-score says how many standard deviations a value is from the mean: z = {x − μ/σ}. It lets you compare values from different distributions.",
    explain: [
      "Commute: μ = 26, σ = 5. A 33-minute commute has z = {33 − 26/5} = **1.4**: 1.4 SDs above average.",
      "Negative z means below the mean. Going backward: x = μ + zσ.",
      "Comparing: a 680 on a test with μ = 500, σ = 100 (z = 1.8) is relatively better than a 29 on a test with μ = 21, σ = 5 (z = 1.6).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why compare z-scores instead of raw scores across two different tests?", choices: ["z-scores put both on the same scale: standard deviations from each test's mean.", "Because raw scores are always wrong.", "Because z-scores are always positive."], correct: 0, explain: "Different tests have different means and spreads." },
    { kind: "written", prompt: "Explain what z = −2.5 tells you about a value, and whether it's unusual.", keyIdeas: ["the value is 2.5 SDs below the mean", "in a normal distribution about 95% are within 2 SDs", "so it's unusual (in the lowest ~1%)"], exemplar: "z = −2.5 means the value is 2.5 standard deviations below the mean. Since about 95% of values are within 2 SDs in a normal distribution, this value is unusual: it's in roughly the lowest 1% of values." },
  ],
  generate(r, lv) {
    const c = r.pick(NORMAL_CTX);
    if (lv === 1) {
      const z = r.pick([-2.5, -2, -1.5, -1.2, -0.8, -0.5, 0.4, 0.5, 1, 1.5, 1.8, 2, 2.5, 3]);
      const x = rnd(c.mu + z * c.sd, 2);
      return {
        prompt: `The ${c.what} have mean ${c.mu} and standard deviation ${c.sd} ${c.unit}. Find the z-score of ${dec(x)} ${c.unit}.`,
        answer: num(z),
        hints: ["z = (x − μ) ÷ σ.", `(${dec(x)} − ${c.mu}) ÷ ${c.sd}.`],
        steps: [st("Subtract the mean.", `${dec(x)} − ${c.mu} = ${dec(x - c.mu)}`), st("Divide by the SD.", `${dec(x - c.mu)} ÷ ${c.sd} = ${dec(z)}`), st("Meaning.", `${dec(x)} is ${dec(Math.abs(z))} SDs ${z > 0 ? "above" : "below"} the mean.`)],
        traps: tolTraps(z, 0, [[rnd(x - c.mu, 2), `That's the distance in ${c.unit}. Divide by the SD.`], [-z, "Check the sign: values below the mean have negative z."], [rnd(x / c.sd - c.mu, 2), "Subtract the mean first, then divide."]]),
      };
    }
    if (lv === 2) {
      const n1 = r.pick(PEOPLE);
      let n2 = r.pick(PEOPLE);
      if (n2 === n1) n2 = n1 === "Maya" ? "Leo" : "Maya";
      const zA = r.pick([0.8, 1.2, 1.5, 1.8, 2.2]);
      let zB = r.pick([0.6, 1, 1.4, 1.6, 2, 2.4]);
      if (Math.abs(zA - zB) < 0.1) zB += 0.3;
      const xA = 500 + zA * 100, xB = rnd(21 + zB * 5, 1);
      const better = zA > zB ? n1 : n2;
      return {
        prompt: `${n1} scored ${xA} on the SAT math section (mean 500, SD 100). ${n2} scored ${dec(xB)} on the ACT math section (mean 21, SD 5). Relative to other test takers, who did better?`,
        answer: choice(r, `${better}: a higher z-score (${dec(Math.max(zA, zB))} vs. ${dec(Math.min(zA, zB))})`, [
          [`${better === n1 ? n2 : n1}: a higher z-score (${dec(Math.max(zA, zB))} vs. ${dec(Math.min(zA, zB))})`, "Compute both z-scores and compare."],
          [`${n1}: ${xA} is a bigger number than ${dec(xB)}`, "The tests use different scales; raw scores can't be compared directly."],
          ["They did equally well, since both are above average.", "Both are above average, but by different numbers of SDs."],
        ]),
        hints: ["Convert each score to a z-score with its own mean and SD.", `SAT: (${xA} − 500) ÷ 100. ACT: (${dec(xB)} − 21) ÷ 5.`],
        steps: [st(`${n1}'s z-score.`, `(${xA} − 500) ÷ 100 = ${dec(zA)}`), st(`${n2}'s z-score.`, `(${dec(xB)} − 21) ÷ 5 = ${dec(zB)}`), st("Compare.", `${better} is more SDs above the mean, so ${better} did relatively better.`)],
      };
    }
    const z = r.pick([-2.4, -1.6, -1.25, -0.6, 0.75, 1.3, 1.75, 2.2, 2.6]);
    const x = rnd(c.mu + z * c.sd, 2);
    return {
      prompt: `The ${c.what} have mean ${c.mu} and standard deviation ${c.sd} ${c.unit}. What value has a z-score of ${dec(z)}?`,
      answer: num(x, { unit: ` ${c.unit}` }),
      hints: ["Solve z = (x − μ) ÷ σ for x: x = μ + zσ.", `x = ${c.mu} + (${dec(z)})(${c.sd}).`],
      steps: [st("Rearrange.", "x = μ + zσ"), st("Substitute.", `x = ${c.mu} + (${dec(z)})(${c.sd}) = ${c.mu} + ${z < 0 ? `(${dec(z * c.sd)})` : dec(z * c.sd)} = ${dec(x)}`)],
      traps: tolTraps(x, 0, [[rnd(c.mu - z * c.sd, 2), "Check the sign: a negative z is below the mean, a positive z above."], [rnd(z * c.sd, 2), "Add the mean."], [rnd((c.mu + z) * c.sd, 2), "Multiply z by σ before adding μ."]]),
    };
  },
};

function zClean(r: { int: (a: number, b: number) => number }, lo = 10, hi = 250): number {
  let z = 0;
  while (Math.abs(z) < lo / 100) z = (r.int(-hi / 5, hi / 5) * 5) / 100;
  return z;
}

const prob: Skill = {
  id: "m4.norm.prob",
  title: "Normal probabilities",
  topic: T,
  standards: ["NC.M4.SP.3.4"],
  prereqs: ["m4.norm.zscore"],
  lesson: {
    bigIdea: "To find P(X < a) for a normal distribution, standardize to z = {a − μ/σ}, then use a z-table or calculator for the area to the left. For P(X > a), subtract from 1.",
    explain: [
      "Commute times: μ = 26, σ = 5. P(X < 33): z = {33 − 26/5} = 1.4, and the area to the left of z = 1.4 is **0.9192**.",
      "P(X > 33) = 1 − 0.9192 = **0.0808**: about 8% of commutes are longer than 33 minutes.",
      "Calculator: normalcdf(lower, upper, μ, σ). Use a very big number (like 10^99) for \"no upper limit\".",
    ],
    visual: { type: "normal", mean: 26, sd: 5, shadeFrom: 33, label: "commute (minutes)" },
  },
  why: [
    { kind: "choice", prompt: "Why does P(X > a) = 1 − P(X < a)?", choices: ["The total area under the curve is 1, and the two regions together cover all of it.", "Because the normal curve is always centered at 0.", "Because P(X > a) is always small."], correct: 0, explain: "Complements add to 1 (and P(X = a) is 0 for a continuous variable)." },
    { kind: "written", prompt: "Explain why P(X ≤ 30) and P(X < 30) are the same for a normal distribution.", keyIdeas: ["normal is a continuous distribution", "probability is area under the curve", "a single point has zero width, so zero area"], exemplar: "A normal distribution is continuous, so probabilities are areas under the curve. The single value 30 is a line with no width, so its area is 0. Including or excluding it doesn't change the probability." },
  ],
  generate(r, lv) {
    const c = r.pick(NORMAL_CTX);
    const z = zClean(r, lv === 1 ? 50 : 10, lv === 1 ? 200 : 250);
    const a = rnd(c.mu + z * c.sd, 2);
    const left = lv === 1 ? z < 0 : r.chance(0.5);
    const pl = normCdf(z);
    const ans = rnd(left ? pl : 1 - pl, 4);
    const word = left ? "less than" : "more than";
    return {
      prompt: `The ${c.what} are approximately normal with mean ${c.mu} and standard deviation ${c.sd} ${c.unit}. Find the probability that a randomly chosen one is ${word} ${dec(a)} ${c.unit}. Round to four decimal places.`,
      visual: { type: "normal", mean: c.mu, sd: c.sd, shadeFrom: left ? undefined : a, shadeTo: left ? a : undefined, label: c.unit },
      answer: num(ans, { tolerance: 0.0015 }),
      hints: [`Standardize: z = (${dec(a)} − ${c.mu}) ÷ ${c.sd}.`, `z = ${dec(z)}. The area to the left is ${fix(pl)}${left ? "." : "; you want the area to the right."}`],
      steps: [
        st("Standardize.", `z = {${dec(a)} − ${c.mu}/${c.sd}} = ${dec(z)}`),
        st("Area to the left.", `P(Z < ${dec(z)}) ≈ ${fix(pl)}`),
        ...(left ? [] : [st("Take the complement.", `P(Z > ${dec(z)}) = 1 − ${fix(pl)} = ${fix(ans)}`)]),
        st("Check with a sketch.", `${dec(a)} is ${z > 0 ? "above" : "below"} the mean, so the shaded area should be ${(left === z > 0) ? "more" : "less"} than 0.5. ✓`),
      ],
      traps: tolTraps(ans, 0.0015, [[1 - ans, left ? "That's the area to the right. \"Less than\" is the area to the left." : "That's the area to the left. \"More than\" is the area to the right."]]),
    };
  },
};

const between: Skill = {
  id: "m4.norm.between",
  title: "Probabilities between two values",
  topic: T,
  standards: ["NC.M4.SP.3.4"],
  prereqs: ["m4.norm.prob"],
  lesson: {
    bigIdea: "P(a < X < b) = (area left of b) − (area left of a). Standardize both values first.",
    explain: [
      "Trail mix bags: μ = 340 g, σ = 10 g. P(330 < X < 355): z-scores −1 and 1.5. Areas to the left: 0.1587 and 0.9332.",
      "Subtract: 0.9332 − 0.1587 = **0.7745**. About 77% of bags weigh between 330 and 355 grams.",
      "To estimate a count, multiply by the number of items: in 500 bags, about 0.7745 × 500 ≈ 387.",
    ],
    visual: { type: "normal", mean: 340, sd: 10, shadeFrom: 330, shadeTo: 355, label: "grams" },
  },
  why: [
    { kind: "choice", prompt: "Why subtract the two left areas to get the area between?", choices: ["The left area of b includes the left area of a plus the part between them.", "Because areas always subtract.", "Because the curve is symmetric."], correct: 0, explain: "Remove the overlap to leave just the middle." },
    { kind: "written", prompt: "A factory says 99% of its bolts are between 9.8 and 10.2 mm. Explain how you could check that claim if lengths are normal with μ = 10 and σ = 0.08.", keyIdeas: ["standardize 9.8 and 10.2: z = ±2.5", "area between z = −2.5 and 2.5 ≈ 0.9876", "so about 98.8%, slightly less than the claimed 99%"], exemplar: "z for 9.8 is (9.8 − 10)/0.08 = −2.5 and for 10.2 it's 2.5. The area between is about 0.9938 − 0.0062 = 0.9876, so about 98.8% of bolts are in range, a bit under the claimed 99%." },
  ],
  generate(r, lv) {
    const c = r.pick(NORMAL_CTX);
    let z1 = zClean(r, 10, 250), z2 = zClean(r, 10, 250);
    if (lv === 1) { z1 = -Math.abs(z1); z2 = Math.abs(z2); }
    if (Math.abs(z1 - z2) < 0.3) z2 = z1 + 0.8;
    const [za, zb] = [Math.min(z1, z2), Math.max(z1, z2)];
    const a = rnd(c.mu + za * c.sd, 2), b = rnd(c.mu + zb * c.sd, 2);
    const pa = normCdf(za), pb = normCdf(zb);
    const pr = rnd(rnd(pb, 4) - rnd(pa, 4), 4);
    const base = { visual: { type: "normal" as const, mean: c.mu, sd: c.sd, shadeFrom: a, shadeTo: b, label: c.unit } };
    const stepsCore = [st("Standardize both.", `z = {${dec(a)} − ${c.mu}/${c.sd}} = ${dec(za)} and z = {${dec(b)} − ${c.mu}/${c.sd}} = ${dec(zb)}`), st("Left areas.", `P(Z < ${dec(zb)}) ≈ ${fix(pb)}; P(Z < ${dec(za)}) ≈ ${fix(pa)}`), st("Subtract.", `${fix(pb)} − ${fix(pa)} ≈ ${fix(pr)}`)];
    if (lv < 3) {
      const ans = rnd(pr, 4);
      return {
        prompt: `The ${c.what} are approximately normal with mean ${c.mu} and SD ${c.sd} ${c.unit}. Find P(${dec(a)} < X < ${dec(b)}). Round to four decimal places.`,
        ...base,
        answer: num(ans, { tolerance: 0.0015 }),
        hints: ["Standardize both values.", `z = ${dec(za)} and ${dec(zb)}. Subtract the smaller left-area from the larger.`],
        steps: stepsCore,
        traps: tolTraps(ans, 0.0015, [[pa + pb, "Subtract the left areas; don't add them."], [pb, `That's everything below ${dec(b)}. Remove the part below ${dec(a)}.`], [1 - pr, "That's the area outside the interval."]]),
      };
    }
    const N = r.pick([300, 500, 800, 1200]);
    const ans = Math.round(pr * N);
    return {
      prompt: `The ${c.what} are approximately normal with mean ${c.mu} and SD ${c.sd} ${c.unit}. In a random sample of ${N}, about how many would you expect to be between ${dec(a)} and ${dec(b)} ${c.unit}? Round to the nearest whole number.`,
      ...base,
      answer: num(ans, { tolerance: 1 }),
      hints: ["Find the probability first, then multiply by the number of items.", `P ≈ ${fix(pr)}. Multiply by ${N}.`],
      steps: [...stepsCore, st("Expected count.", `${fix(pr)} × ${N} ≈ ${dec(pr * N, 1)}, about ${ans}`)],
      traps: tolTraps(ans, 1, [[Math.round(pb * N), `That counts everything below ${dec(b)}.`], [rnd(pr * 100, 1), "That's the percent. Multiply the probability by the number of items."]]),
    };
  },
};

const PCTS: [number, string][] = [[0.9, "top 10%"], [0.95, "top 5%"], [0.8, "top 20%"], [0.75, "top 25%"], [0.99, "top 1%"], [0.1, "bottom 10%"], [0.05, "bottom 5%"], [0.25, "bottom 25%"], [0.2, "bottom 20%"]];

const inverse: Skill = {
  id: "m4.norm.inverse",
  title: "Find a value from a percentile",
  topic: T,
  standards: ["NC.M4.SP.3.4"],
  prereqs: ["m4.norm.prob"],
  lesson: {
    bigIdea: "To find the value with a given area to its left, find the z-score for that area (invNorm or a z-table), then convert: x = μ + zσ.",
    explain: [
      "Test scores: μ = 500, σ = 100. What score is needed for the top 10%? The cutoff has 90% of scores below it, so z ≈ 1.28.",
      "x = 500 + 1.28(100) = **628**. Calculator: invNorm(0.90, 500, 100) ≈ 628.2.",
      "Bottom 10%: area 0.10 to the left, z ≈ −1.28, x ≈ 372.",
    ],
    visual: { type: "normal", mean: 500, sd: 100, shadeFrom: 628.2, label: "top 10%" },
  },
  why: [
    { kind: "choice", prompt: "To find the cutoff for the top 10%, why do you use an area of 0.90?", choices: ["z-tables and invNorm use the area to the LEFT, and 90% of values are below the top-10% cutoff.", "Because 0.90 is close to 1.", "You should use 0.10."], correct: 0, explain: "Unless your calculator has a \"right\" tail option, convert to a left area." },
    { kind: "written", prompt: "A coach wants runners whose 400 m times are in the fastest 15% (lowest times). Explain how to find the cutoff time if times are normal with μ = 62 s and σ = 4 s.", keyIdeas: ["fastest = lowest times, so area 0.15 to the left", "z ≈ −1.04", "x = 62 + (−1.04)(4) ≈ 57.8 seconds"], exemplar: "Fastest means the lowest times, so the cutoff has 15% of times below it. invNorm(0.15) gives z ≈ −1.04. Then x = 62 + (−1.04)(4) ≈ 57.8 seconds; runners at or under about 57.8 s qualify." },
  ],
  generate(r, lv) {
    const c = r.pick(NORMAL_CTX);
    const [area, label] = r.pick(lv === 1 ? PCTS.filter((p) => p[1].startsWith("top")) : PCTS);
    const z = invNorm(area);
    const ans = rnd(c.mu + z * c.sd, 1);
    const tol = rnd(Math.max(0.1, 0.006 * c.sd + 0.05), 2);
    const ctxText = lv === 3 ? `A company wants to advertise a cutoff for the ${label} of ${c.what}.` : `The ${c.what} are approximately normal.`;
    return {
      prompt: `${ctxText} The mean is ${c.mu} and the SD is ${c.sd} ${c.unit}. What value marks the ${label}? Round to the nearest tenth.`,
      visual: { type: "normal", mean: c.mu, sd: c.sd, shadeFrom: label.startsWith("top") ? ans : undefined, shadeTo: label.startsWith("top") ? undefined : ans, label: label },
      answer: num(ans, { tolerance: tol }),
      hints: [`The cutoff has ${Math.round(area * 100)}% of values to its left.`, `invNorm(${area}) gives z ≈ ${dec(z, 2)}. Then x = μ + zσ.`],
      steps: [st("Area to the left.", `${label} → ${area} to the left`), st("Find z.", `invNorm(${area}) ≈ ${dec(z, 3)}`), st("Convert to x.", `x = ${c.mu} + (${dec(z, 3)})(${c.sd}) ≈ ${dec(ans, 1)} ${c.unit}`)],
      traps: tolTraps(ans, tol, [[rnd(c.mu - z * c.sd, 1), label.startsWith("top") ? "The top cutoff is above the mean." : "The bottom cutoff is below the mean."], [rnd(c.mu + area * c.sd, 1), "Use the z-score for that area, not the area itself."]]),
    };
  },
};

export default [empirical, zscore, prob, between, inverse] satisfies Skill[];
