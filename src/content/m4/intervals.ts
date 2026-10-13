// Unit 11: Confidence intervals for a population proportion (NC.M4.SP.2.2).
import { choice, num } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { dec, fix, rnd, tolTraps } from "./util";

const T = "m4-intervals";

export const ZSTAR: Record<number, number> = { 90: 1.645, 95: 1.96, 99: 2.576 };
export const POLLS = [
  { pop: "students at a large high school", trait: "have a part-time job" },
  { pop: "teens in the state", trait: "use a music streaming app daily" },
  { pop: "voters in a city", trait: "support building a new skate park" },
  { pop: "customers of a phone company", trait: "are satisfied with their plan" },
  { pop: "players of an online game", trait: "have bought an in-game item" },
  { pop: "adults in a county", trait: "get most of their news from social media" },
];
const ZTABLE = "(z* = 1.645 for 90%, 1.96 for 95%, 2.576 for 99%)";

const margin: Skill = {
  id: "m4.ci.margin",
  title: "Margin of error",
  topic: T,
  standards: ["NC.M4.SP.2.2"],
  prereqs: [],
  lesson: {
    bigIdea: "For a sample proportion p̂ from a random sample of n, the margin of error is ME = z*·√({p̂(1 − p̂)/n}), where z* depends on the confidence level.",
    explain: [
      "A poll of 400 students finds 30% have a part-time job. At 95% confidence, z* = 1.96.",
      "ME = 1.96·√({0.3(0.7)/400}) = 1.96·√0.000525 ≈ 1.96(0.0229) ≈ **0.045**, about 4.5 percentage points.",
      "Common z* values: 1.645 (90%), 1.96 (95%), 2.576 (99%). Higher confidence needs a bigger z*, so a wider margin.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does a larger sample give a smaller margin of error?", choices: ["n is in the denominator: bigger samples vary less, so p̂ is a more precise estimate.", "Because big samples are always unbiased.", "It doesn't; the margin only depends on the confidence level."], correct: 0, explain: "ME ∝ 1/√n." },
    { kind: "written", prompt: "Explain why a 99% confidence interval is wider than a 95% interval from the same data.", keyIdeas: ["99% uses a larger z* (2.576 vs 1.96)", "ME = z* × SE, so the margin is larger", "to be more confident of capturing p, you need a wider net"], exemplar: "To be more confident the interval catches the true proportion, you have to cast a wider net. That shows up in z*: 2.576 for 99% versus 1.96 for 95%. The same standard error times a bigger z* gives a bigger margin of error." },
  ],
  generate(r, lv) {
    const c = r.pick(POLLS);
    const n = r.pick([200, 300, 400, 500, 600, 800, 1000, 1200]);
    const conf = lv === 1 ? 95 : r.pick([90, 95, 99]);
    const zs = ZSTAR[conf];
    const x = r.int(Math.round(n * 0.2), Math.round(n * 0.75));
    const ph = lv === 3 ? x / n : rnd(r.int(15, 80) / 100, 2);
    const se = Math.sqrt((ph * (1 - ph)) / n);
    const me = rnd(zs * se, 3);
    const phText = lv === 3 ? `${x} of ${n} said they ${c.trait}` : `${dec(ph * 100)}% ${c.trait}`;
    return {
      prompt: `A random sample of ${n} ${c.pop} found that ${phText}. Find the margin of error for a ${conf}% confidence interval${lv === 1 ? " (use z* = 1.96)" : ` ${ZTABLE}`}. Round to three decimal places.`,
      answer: num(me, { tolerance: 0.0015 }),
      hints: [lv === 3 ? `First find p̂ = ${x} ÷ ${n} = ${dec(ph, 4)}.` : `ME = z*·√(p̂(1 − p̂) ÷ n) with p̂ = ${dec(ph)}.`, `SE = √(${dec(ph, 4)} × ${dec(1 - ph, 4)} ÷ ${n}) ≈ ${dec(se, 4)}. Multiply by ${zs}.`],
      steps: [
        ...(lv === 3 ? [st("Sample proportion.", `p̂ = {${x}/${n}} = ${dec(ph, 4)}`)] : []),
        st("Standard error.", `SE = √({${dec(ph, 4)}(${dec(1 - ph, 4)})/${n}}) ≈ ${dec(se, 4)}`),
        st(`Multiply by z* = ${zs}.`, `ME = ${zs} × ${dec(se, 4)} ≈ ${dec(me, 3)}`),
        st("Meaning.", `About ±${dec(me * 100, 1)} percentage points.`),
      ],
      traps: tolTraps(me, 0.0015, [[se, `That's the standard error. Multiply by z* = ${zs}.`], [zs * ((ph * (1 - ph)) / n), "Take the square root of p̂(1 − p̂)/n."], [zs * Math.sqrt(ph * (1 - ph)), "Divide by n inside the square root."], [1.96 * se, `For ${conf}% confidence, use z* = ${zs}.`]]),
    };
  },
};

const construct: Skill = {
  id: "m4.ci.construct",
  title: "Build a confidence interval",
  topic: T,
  standards: ["NC.M4.SP.2.2"],
  prereqs: ["m4.ci.margin"],
  lesson: {
    bigIdea: "A confidence interval for a proportion is p̂ ± ME: estimate plus or minus margin of error.",
    explain: [
      "Poll of 400: p̂ = 0.30, ME ≈ 0.045 at 95%. Interval: 0.30 − 0.045 = 0.255 to 0.30 + 0.045 = 0.345.",
      "Conditions to check: a random sample, and at least 10 successes and 10 failures (np̂ ≥ 10, n(1 − p̂) ≥ 10) so the normal model works.",
      "Calculator: 1-PropZInt with x (number of successes), n and the confidence level.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is the interval centered at p̂?", choices: ["p̂ is our best single estimate of p, and the true p is equally likely to be above or below it.", "Because p̂ always equals p.", "It's centered at 0.5."], correct: 0, explain: "The margin of error extends equally in both directions from the estimate." },
    { kind: "written", prompt: "Explain why we need at least 10 successes and 10 failures in the sample before building the interval.", keyIdeas: ["the method uses a normal model for p̂", "the normal model is only reasonable when np̂ and n(1 − p̂) are at least 10", "otherwise the sampling distribution is skewed and the interval is unreliable"], exemplar: "The margin-of-error formula comes from treating p̂ as normally distributed. That's only reasonable when there are at least 10 successes and 10 failures; with fewer, the sampling distribution is skewed and the interval's confidence level isn't trustworthy." },
  ],
  generate(r, lv) {
    const c = r.pick(POLLS);
    if (lv === 1) {
      const ph = rnd(r.int(20, 80) / 100, 2), me = rnd(r.int(20, 60) / 1000, 3);
      return {
        prompt: `A poll of ${c.pop} estimates that ${dec(ph * 100)}% ${c.trait}, with a margin of error of ${dec(me)} at 95% confidence. Find the confidence interval.`,
        answer: { kind: "multi", fields: [{ value: frac(Math.round((ph - me) * 1000), 1000), pre: "from" }, { value: frac(Math.round((ph + me) * 1000), 1000), pre: "to" }] },
        hints: ["Interval = p̂ ± ME.", `${dec(ph)} − ${dec(me)} and ${dec(ph)} + ${dec(me)}.`],
        steps: [st("Lower end.", `${dec(ph)} − ${dec(me)} = ${dec(ph - me)}`), st("Upper end.", `${dec(ph)} + ${dec(me)} = ${dec(ph + me)}`), st("Interval.", `(${dec(ph - me)}, ${dec(ph + me)})`)],
      };
    }
    const n = r.pick([150, 250, 400, 500, 800, 1000]);
    const conf = lv === 2 ? r.pick([90, 95]) : r.pick([95, 99]);
    const zs = ZSTAR[conf];
    const x = r.int(Math.round(n * 0.2), Math.round(n * 0.7));
    const ph = lv === 3 ? x / n : rnd(r.int(20, 75) / 100, 2);
    const se = Math.sqrt((ph * (1 - ph)) / n);
    const me = zs * se;
    const lo = rnd(ph - me, 3), hi = rnd(ph + me, 3);
    return {
      prompt: `A random sample of ${n} ${c.pop} found that ${lv === 3 ? `${x} ${c.trait}` : `${dec(ph * 100)}% ${c.trait}`}. Construct a ${conf}% confidence interval for the proportion of all ${c.pop} who ${c.trait} ${ZTABLE}. Round the endpoints to three decimal places.`,
      answer: { kind: "multi", fields: [{ value: frac(Math.round(lo * 1000), 1000), pre: "from", tolerance: 0.002 }, { value: frac(Math.round(hi * 1000), 1000), pre: "to", tolerance: 0.002 }] },
      hints: [lv === 3 ? `p̂ = ${x} ÷ ${n} = ${dec(ph, 4)}. Check: ${x} successes and ${n - x} failures, both ≥ 10.` : `Check conditions: np̂ = ${dec(n * ph)} and n(1 − p̂) = ${dec(n * (1 - ph))}, both ≥ 10.`, `ME = ${zs}·√(${dec(ph, 4)}(${dec(1 - ph, 4)}) ÷ ${n}) ≈ ${dec(me, 4)}.`],
      steps: [
        ...(lv === 3 ? [st("Sample proportion.", `p̂ = {${x}/${n}} = ${dec(ph, 4)}`)] : []),
        st("Conditions.", `Random sample; ${dec(n * ph)} successes and ${dec(n * (1 - ph))} failures, both ≥ 10.`),
        st("Margin of error.", `${zs} × √({${dec(ph, 4)}(${dec(1 - ph, 4)})/${n}}) ≈ ${zs} × ${dec(se, 4)} ≈ ${dec(me, 4)}`),
        st("Interval.", `${dec(ph, 4)} ± ${dec(me, 4)} → (${fix(lo, 3)}, ${fix(hi, 3)})`),
        st("In context.", `We are ${conf}% confident that between ${dec(lo * 100, 1)}% and ${dec(hi * 100, 1)}% of all ${c.pop} ${c.trait}.`),
      ],
    };
  },
};

const interpret: Skill = {
  id: "m4.ci.interpret",
  title: "Interpret confidence intervals",
  topic: T,
  standards: ["NC.M4.SP.2.2"],
  prereqs: ["m4.ci.construct"],
  lesson: {
    bigIdea: "\"95% confident\" describes the method: if we repeated the sampling many times, about 95% of the intervals built this way would capture the true proportion.",
    explain: [
      "Interval (0.255, 0.345) for students with jobs: \"We are 95% confident that between 25.5% and 34.5% of **all students at the school** have a part-time job.\"",
      "It does NOT mean 95% of students are in the interval, or that there's a 95% chance p̂ is in it (p̂ is always in its own interval).",
      "Claims: if a claimed value is outside the interval, the data give convincing evidence against it. If it's inside, the claim is plausible (not proven).",
    ],
  },
  why: [
    { kind: "choice", prompt: "A 95% interval for p is (0.41, 0.49). Why is it wrong to say \"there's a 95% chance p is between 0.41 and 0.49\"?", choices: ["p is a fixed number; this particular interval either contains it or not. The 95% describes how often the method works.", "Because the chance is actually 100%.", "Because p is always 0.45."], correct: 0, explain: "Confidence is about the long-run success rate of the procedure." },
    { kind: "written", prompt: "A 95% interval for the proportion of students who support a later start time is (0.53, 0.61). Does this support the claim that a majority support it? Explain.", keyIdeas: ["majority means p > 0.5", "every value in the interval is above 0.5", "so it gives convincing evidence of majority support"], exemplar: "A majority means more than 0.50. The whole interval, from 0.53 to 0.61, is above 0.50, so all plausible values for the true proportion are majorities. That's convincing evidence that most students support it." },
  ],
  generate(r, lv) {
    const c = r.pick(POLLS);
    const lo = r.int(20, 60) / 100, w = r.int(4, 12) / 100;
    const hi = rnd(lo + w, 2);
    const conf = r.pick([90, 95, 99]);
    const L = dec(lo * 100), H = dec(hi * 100);
    if (lv === 1) {
      return {
        prompt: `A ${conf}% confidence interval for the proportion of ${c.pop} who ${c.trait} is (${dec(lo)}, ${dec(hi)}). Which is the correct interpretation?`,
        answer: choice(r, `We are ${conf}% confident that between ${L}% and ${H}% of all ${c.pop} ${c.trait}.`, [
          [`${conf}% of ${c.pop} ${c.trait}.`, "The confidence level isn't a percent of people."],
          [`There is a ${conf}% chance that the sample proportion is between ${dec(lo)} and ${dec(hi)}.`, "The sample proportion is always at the center of its own interval; the interval is about the population proportion."],
          [`Between ${L}% and ${H}% of the people in the sample ${c.trait}.`, "We know the sample's exact proportion; the interval estimates the population's."],
        ]),
        hints: ["The interval estimates the population proportion, not the sample's.", "Use the form: \"We are __% confident that the true proportion of [population] who [trait] is between __ and __.\""],
        steps: [st("What does it estimate?", `The proportion of all ${c.pop} who ${c.trait}.`), st("Interpretation.", `We are ${conf}% confident the true proportion is between ${L}% and ${H}%.`)],
      };
    }
    if (lv === 2) {
      return {
        prompt: `A news report says a ${conf}% confidence interval for the proportion of ${c.pop} who ${c.trait} is (${dec(lo)}, ${dec(hi)}). What does "${conf}% confidence" mean?`,
        answer: choice(r, `If many random samples were taken and an interval built from each, about ${conf}% of those intervals would contain the true proportion.`, [
          [`There is a ${conf}% probability that the true proportion is between ${dec(lo)} and ${dec(hi)}.`, "The true proportion is fixed; it's either in this interval or not. The confidence level describes the method."],
          [`${conf}% of all ${c.pop} were surveyed.`, "The confidence level has nothing to do with how much of the population was sampled."],
          [`About ${conf}% of future samples will have a p̂ between ${dec(lo)} and ${dec(hi)}.`, "The interval estimates the true proportion, not where future sample results will fall."],
        ]),
        hints: ["Think about repeating the whole process (sample, then build an interval) many times.", "What fraction of those intervals would catch the true p?"],
        steps: [st("Confidence level.", `It's the long-run capture rate: about ${conf}% of intervals built this way contain the true proportion.`)],
      };
    }
    const inside = r.chance(0.5);
    const claim = inside ? rnd(lo + r.int(1, Math.round(w * 100) - 1) / 100, 2) : rnd(r.chance(0.5) ? lo - r.int(2, 6) / 100 : hi + r.int(2, 6) / 100, 2);
    const who = r.pick(["A company", "A local official", "A school administrator", "A blogger"]);
    return {
      prompt: `A ${conf}% confidence interval for the proportion of ${c.pop} who ${c.trait} is (${dec(lo)}, ${dec(hi)}). ${who} claims that ${dec(claim * 100)}% ${c.trait}. What does the interval say about the claim?`,
      answer: choice(r, inside ? `${dec(claim)} is inside the interval, so the claim is plausible; the data don't contradict it.` : `${dec(claim)} is outside the interval, so the data give convincing evidence against the claim.`, [
        [inside ? `${dec(claim)} is inside the interval, so the claim is proven true.` : `${dec(claim)} is outside the interval, so the claim is plausible.`, inside ? "Being inside makes it plausible, not proven; other values in the interval are plausible too." : "Values outside the interval are not plausible at this confidence level."],
        [inside ? `${dec(claim)} is inside the interval, but the interval says nothing about claims.` : `${dec(claim)} is outside the interval, so the claim is proven false with 100% certainty.`, inside ? "Intervals are a natural way to judge claims: compare the claimed value with the plausible values." : "It's convincing evidence, not 100% certainty."],
        [`The sample was too small to say anything.`, "We can compare the claimed value with the interval."],
      ]),
      hints: ["The interval lists the plausible values for the true proportion.", `Is ${dec(claim)} between ${dec(lo)} and ${dec(hi)}?`],
      steps: [st("Compare.", `${dec(claim)} is ${inside ? "inside" : "outside"} (${dec(lo)}, ${dec(hi)}).`), st("Conclusion.", inside ? "The claim is plausible (not proven)." : "Convincing evidence against the claim.")],
    };
  },
};

const design: Skill = {
  id: "m4.ci.design",
  title: "Margin of error and sample size",
  topic: T,
  standards: ["NC.M4.SP.2.2"],
  prereqs: ["m4.ci.interpret"],
  lesson: {
    bigIdea: "An interval (L, U) has center p̂ = {L + U/2} and margin of error {U − L/2}. To shrink the margin, increase n: quadrupling n halves the margin.",
    explain: [
      "Interval (0.42, 0.50): p̂ = 0.46 and ME = 0.04.",
      "To plan a poll with ME ≤ 0.03 at 95% confidence and no prior estimate, use p̂ = 0.5 (the worst case): n ≥ ({1.96/0.03})^2(0.25) ≈ 1067.1, so survey **1,068** people (always round up).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why use p̂ = 0.5 when planning a sample size with no prior estimate?", choices: ["p̂(1 − p̂) is largest at 0.5, so it guarantees the margin is small enough whatever the true p is.", "Because most proportions are 0.5.", "Because 0.5 makes the math simpler but less safe."], correct: 0, explain: "It's the conservative choice." },
    { kind: "written", prompt: "A pollster wants to cut the margin of error from 6 points to 3 points. Explain how the sample size must change.", keyIdeas: ["ME is proportional to 1/√n", "halving ME needs √n doubled", "so n must be multiplied by 4"], exemplar: "The margin of error is proportional to 1/√n. To cut it in half, √n has to double, which means n has to be four times as large." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const ph = r.int(25, 75) / 100, me = r.int(2, 8) / 100;
      const lo = rnd(ph - me, 2), hi = rnd(ph + me, 2);
      return {
        prompt: `A confidence interval for a population proportion is (${dec(lo)}, ${dec(hi)}). Find the sample proportion p̂ and the margin of error.`,
        answer: { kind: "multi", fields: [{ value: frac(Math.round(ph * 100), 100), pre: "p̂ =" }, { value: frac(Math.round(me * 100), 100), pre: "ME =" }] },
        hints: ["p̂ is the midpoint of the interval.", "The margin of error is half the width."],
        steps: [st("Midpoint.", `p̂ = {${dec(lo)} + ${dec(hi)}/2} = ${dec(ph)}`), st("Half the width.", `ME = {${dec(hi)} − ${dec(lo)}/2} = ${dec(me)}`)],
      };
    }
    if (lv === 2) {
      const me = r.int(3, 8) / 100, n = r.pick([150, 250, 400, 600]);
      const k = r.pick([4, 9]);
      const ans = rnd(me / Math.sqrt(k), 4);
      return {
        prompt: `A poll of ${n} people had a margin of error of ${dec(me)}. About what would the margin of error be with ${n * k} people (same p̂ and confidence level)?`,
        answer: num(ans, { tolerance: 0.0005 }),
        hints: ["ME is proportional to {1/√n}.", `The sample is ${k} times as large, so divide the margin by √${k} = ${Math.sqrt(k)}.`],
        steps: [st("Compare sample sizes.", `${n * k} ÷ ${n} = ${k}`), st("Square-root effect.", `ME is divided by √${k} = ${Math.sqrt(k)}.`), st("New margin.", `${dec(me)} ÷ ${Math.sqrt(k)} ≈ ${dec(ans, 4)}`)],
        traps: tolTraps(ans, 0.0005, [[me / k, `Dividing by ${k} would need a sample ${k * k} times as large. Divide by √${k}.`], [me * Math.sqrt(k), "A bigger sample makes the margin smaller."]]),
      };
    }
    const conf = r.pick([90, 95, 99]);
    const zs = ZSTAR[conf];
    const m = r.pick([0.02, 0.025, 0.03, 0.04, 0.05]);
    const usePrior = r.chance(0.5);
    const p = usePrior ? r.pick([0.2, 0.3, 0.6, 0.7]) : 0.5;
    const raw = (zs / m) ** 2 * p * (1 - p);
    const ans = Math.ceil(rnd(raw, 6));
    return {
      prompt: `A student council wants a ${conf}% confidence interval with a margin of error of at most ${m} ${ZTABLE}. ${usePrior ? `A previous survey found p̂ ≈ ${p}.` : "They have no prior estimate, so use p̂ = 0.5."} What is the smallest sample size they need?`,
      answer: num(ans),
      hints: [`Solve ${zs}·√(${p}(${rnd(1 - p, 2)}) ÷ n) ≤ ${m} for n.`, `n ≥ (${zs} ÷ ${m})^2 × ${p}(${rnd(1 - p, 2)}). Round UP.`],
      steps: [st("Set up.", `${zs}√({${p}(${rnd(1 - p, 2)})/n}) ≤ ${m}`), st("Solve for n.", `n ≥ ({${zs}/${m}})^2 × ${dec(p * (1 - p), 4)} = ${dec((zs / m) ** 2, 2)} × ${dec(p * (1 - p), 4)} ≈ ${dec(raw, 2)}`), st("Round up.", `n = ${ans} (rounding down would give a margin slightly over ${m}).`)],
      traps: tolTraps(ans, 0, [[Math.floor(rnd(raw, 6)) === ans ? -1 : Math.floor(raw), "Always round a sample size up, or the margin will be slightly too big."], [Math.ceil((zs / m) * p * (1 - p)), "Square the ratio z*/ME."]].filter((t) => (t[0] as number) > 0) as [number, string][]),
    };
  },
};

export default [margin, construct, interpret, design] satisfies Skill[];
