// Unit 12: Significance tests for a proportion: hypotheses, z-statistic, p-value and conclusions (NC.M4.SP.2.3).
import { choice, num } from "../helpers";
import { st } from "../steps";
import type { Skill } from "../types";
import { dec, fix, normCdf, rnd, tolTraps } from "./util";

const T = "m4-tests";

type Dir = ">" | "<" | "≠";
export interface TestCtx { setup: string; p0: number; dir: Dir; pop: string; trait: string; ha: string }
export const TESTS: TestCtx[] = [
  { setup: "Nationally, 35% of teens have a part-time job. A counselor thinks the rate is higher at her school.", p0: 0.35, dir: ">", pop: "students at her school", trait: "have a part-time job", ha: "more than 35% of students at her school have a part-time job" },
  { setup: "A phone company claims 80% of its customers are satisfied. A consumer group suspects the true rate is lower.", p0: 0.8, dir: "<", pop: "customers of the company", trait: "are satisfied", ha: "fewer than 80% of the company's customers are satisfied" },
  { setup: "A game developer says 10% of loot boxes hold a rare item. Players suspect the rate is lower.", p0: 0.1, dir: "<", pop: "loot boxes", trait: "hold a rare item", ha: "fewer than 10% of loot boxes hold a rare item" },
  { setup: "Last year 60% of students passed a placement test. After a new tutoring program, the school wants to know if the pass rate went up.", p0: 0.6, dir: ">", pop: "students this year", trait: "pass", ha: "more than 60% of students now pass" },
  { setup: "A coin used in a game app is supposed to land heads 50% of the time. A player wonders if it's unfair.", p0: 0.5, dir: "≠", pop: "flips of the app's coin", trait: "land heads", ha: "the coin does not land heads 50% of the time" },
  { setup: "A survey said 45% of adults in a city get news from social media. A reporter thinks the rate has changed.", p0: 0.45, dir: "≠", pop: "adults in the city", trait: "get news from social media", ha: "the proportion of adults who get news from social media is no longer 45%" },
];

const pval = (z: number, dir: Dir) => (dir === ">" ? 1 - normCdf(z) : dir === "<" ? normCdf(z) : 2 * (1 - normCdf(Math.abs(z))));

const hypotheses: Skill = {
  id: "m4.test.hypotheses",
  title: "Write hypotheses",
  topic: T,
  standards: ["NC.M4.SP.2.3"],
  prereqs: [],
  lesson: {
    bigIdea: "A significance test compares two claims about a population proportion p: the null hypothesis H_0 (no change, p = p_0) and the alternative H_a (what you suspect: p > p_0, p < p_0, or p ≠ p_0).",
    explain: [
      "Nationally 35% of teens have jobs; a counselor suspects more at her school. H_0: p = 0.35, H_a: p > 0.35, where p is the proportion of **all** students at her school with jobs.",
      "Hypotheses are about the population parameter p, never the sample statistic p̂. And they're written before looking at the data.",
      "Use ≠ when the question is just \"different\" or \"changed\" with no direction.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why are hypotheses written with p and not p̂?", choices: ["We already know p̂ from the sample; the question is about the unknown population proportion p.", "Because p̂ is always equal to p.", "It doesn't matter which you use."], correct: 0, explain: "Tests make claims about parameters." },
    { kind: "written", prompt: "A teacher says a new seating chart might change the proportion of students who finish homework (currently 70%). Write the hypotheses and explain your choice of alternative.", keyIdeas: ["H_0: p = 0.70", "H_a: p ≠ 0.70", "\"change\" has no direction, so two-sided"], exemplar: "H_0: p = 0.70 and H_a: p ≠ 0.70, where p is the proportion of all students who finish homework with the new seating chart. The teacher said \"change,\" not \"increase\" or \"decrease,\" so the alternative is two-sided." },
  ],
  generate(r, lv) {
    const t = lv === 1 ? r.pick(TESTS.filter((x) => x.dir !== "≠")) : r.pick(TESTS);
    const p0 = dec(t.p0);
    const correct = `H_0: p = ${p0},  H_a: p ${t.dir} ${p0}`;
    const others: Dir[] = (["<", ">", "≠"] as Dir[]).filter((d) => d !== t.dir);
    const wrong: [string, string][] = [
      [`H_0: p = ${p0},  H_a: p ${others[0]} ${p0}`, "Check the direction: what does the researcher suspect?"],
      [`H_0: p = ${p0},  H_a: p ${others[1]} ${p0}`, "Check the direction: what does the researcher suspect?"],
      [`H_0: p̂ = ${p0},  H_a: p̂ ${t.dir} ${p0}`, "Hypotheses are about the population proportion p, not the sample proportion p̂."],
    ];
    if (lv === 3) wrong.push([`H_0: p ${t.dir} ${p0},  H_a: p = ${p0}`, "The null hypothesis is the \"no change\" claim with the equals sign."]);
    return {
      prompt: `${t.setup} Which hypotheses should be tested?`,
      answer: choice(r, correct, wrong),
      hints: [`The null hypothesis is the claim being tested: p = ${p0}.`, `The alternative matches the suspicion: ${t.dir === ">" ? "higher" : t.dir === "<" ? "lower" : "different (either direction)"}.`],
      steps: [st("Parameter.", `p = the proportion of ${t.pop} who ${t.trait}.`), st("Null.", `H_0: p = ${p0}`), st("Alternative.", `H_a: p ${t.dir} ${p0} (the suspicion is that ${t.ha})`)],
    };
  },
};

function sampleFor(r: Parameters<Skill["generate"]>[0], t: TestCtx, strength: number) {
  const n = r.pick([100, 150, 200, 250, 400, 500]);
  const sd = Math.sqrt((t.p0 * (1 - t.p0)) / n);
  const sign = t.dir === "<" ? -1 : t.dir === ">" ? 1 : r.sign();
  const x = Math.min(n - 1, Math.max(1, Math.round(n * (t.p0 + sign * strength * sd))));
  return { n, x, ph: x / n, sd };
}

const zStat: Skill = {
  id: "m4.test.z-stat",
  title: "The test statistic z",
  topic: T,
  standards: ["NC.M4.SP.2.3"],
  prereqs: ["m4.test.hypotheses"],
  lesson: {
    bigIdea: "The test statistic measures how many standard deviations p̂ is from the claimed p_0: z = {p̂ − p_0/√(p_0(1 − p_0)/n)}.",
    explain: [
      "The SD uses p_0, not p̂, because we compute it assuming H_0 is true.",
      "Example: H_0: p = 0.35. In a sample of 200, 84 have jobs, so p̂ = 0.42. SD = √({0.35(0.65)/200}) ≈ 0.0337.",
      "z = {0.42 − 0.35/0.0337} ≈ **2.08**: the sample is about 2 SDs above what H_0 predicts. Check first: np_0 = 70 and n(1 − p_0) = 130, both ≥ 10.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does the test statistic use p_0 in the standard deviation instead of p̂?", choices: ["The test asks how surprising p̂ would be IF H_0 were true, so we use the claimed value.", "Because p̂ is unknown.", "Because p_0 is always bigger."], correct: 0, explain: "Everything in a test is computed assuming the null hypothesis." },
    { kind: "written", prompt: "Explain what a test statistic of z = −0.4 tells you.", keyIdeas: ["p̂ is 0.4 SDs below p_0", "that's very close to what H_0 predicts", "so it's not surprising; weak evidence against H_0"], exemplar: "z = −0.4 means the sample proportion is only 0.4 standard deviations below the claimed value. That's a very ordinary difference if H_0 is true, so the data give little evidence against the null hypothesis." },
  ],
  generate(r, lv) {
    const t = r.pick(TESTS);
    const { n, x, ph, sd } = sampleFor(r, t, r.pick([0.8, 1.4, 1.9, 2.3, 2.8]));
    const z = (ph - t.p0) / sd;
    const ans = rnd(z, 2);
    const phText = lv === 3 ? `${x} of ${n} ${t.trait}` : `p̂ = ${dec(ph, 4)}`;
    return {
      prompt: `${t.setup} H_0: p = ${dec(t.p0)}. In a random sample of ${n} ${t.pop}, ${phText}. Find the test statistic z. Round to two decimal places.`,
      answer: num(ans, { tolerance: 0.015 }),
      hints: [lv === 3 ? `p̂ = ${x} ÷ ${n} = ${dec(ph, 4)}.` : `SD = √(p_0(1 − p_0) ÷ n) = √(${dec(t.p0)}(${dec(1 - t.p0)}) ÷ ${n}).`, `SD ≈ ${dec(sd, 4)}; z = (${dec(ph, 4)} − ${dec(t.p0)}) ÷ ${dec(sd, 4)}.`],
      steps: [
        ...(lv === 3 ? [st("Sample proportion.", `p̂ = {${x}/${n}} = ${dec(ph, 4)}`)] : []),
        st("Conditions.", `np_0 = ${dec(n * t.p0)} and n(1 − p_0) = ${dec(n * (1 - t.p0))}, both ≥ 10.`),
        st("SD under H_0.", `√({${dec(t.p0)}(${dec(1 - t.p0)})/${n}}) ≈ ${dec(sd, 4)}`),
        st("Test statistic.", `z = {${dec(ph, 4)} − ${dec(t.p0)}/${dec(sd, 4)}} ≈ ${dec(ans, 2)}`),
      ],
      traps: tolTraps(ans, 0.015, [[(ph - t.p0) / Math.sqrt((ph * (1 - ph)) / n), "Use p_0 in the standard deviation, not p̂."], [-z, "Subtract in the order p̂ − p_0."], [(ph - t.p0) / ((t.p0 * (1 - t.p0)) / n), "Take the square root in the denominator."], [ph - t.p0, "Divide the difference by the standard deviation."]]),
    };
  },
};

const pValue: Skill = {
  id: "m4.test.p-value",
  title: "Find the p-value",
  topic: T,
  standards: ["NC.M4.SP.2.3"],
  prereqs: ["m4.test.z-stat"],
  lesson: {
    bigIdea: "The p-value is the probability, assuming H_0 is true, of a result at least as extreme as the one observed, in the direction of H_a.",
    explain: [
      "H_a: p > p_0 → area to the right of z. H_a: p < p_0 → area to the left. H_a: p ≠ p_0 → both tails: double the smaller tail.",
      "Example: z = 2.08 with H_a: p > 0.35. p-value = P(Z > 2.08) = 1 − 0.9812 = **0.0188**.",
      "If H_a were p ≠ 0.35, the p-value would be 2(0.0188) = 0.0376.",
    ],
    visual: { type: "normal", mean: 0, sd: 1, shadeFrom: 2.08, label: "z (assuming H₀ is true)" },
  },
  why: [
    { kind: "choice", prompt: "Why do you double the tail area for a two-sided test?", choices: ["\"At least as extreme\" counts results that far from p_0 in either direction.", "Because two-sided tests use two samples.", "To make the p-value smaller."], correct: 0, explain: "Both tails are as surprising as the observed result." },
    { kind: "written", prompt: "Explain in plain words what a p-value of 0.03 means in a test of whether a coin is fair.", keyIdeas: ["assume the coin is fair (H_0)", "a result at least as extreme as ours would happen about 3% of the time", "so our result would be fairly unusual for a fair coin"], exemplar: "If the coin really were fair, there would only be about a 3% chance of getting a result at least as far from 50% heads as ours. That's unusual, so it's some evidence the coin isn't fair. It is not the probability that the coin is fair." },
  ],
  generate(r, lv) {
    const dir: Dir = lv === 1 ? ">" : lv === 2 ? r.pick([">", "<"] as Dir[]) : "≠";
    const mag = r.int(30, 290) / 100;
    const z = dir === "<" ? -mag : dir === ">" ? mag : r.sign() * mag;
    const tail = 1 - normCdf(Math.abs(z));
    const ans = rnd(pval(z, dir), 4);
    return {
      prompt: `In a test of H_0: p = p_0 against H_a: p ${dir} p_0, the test statistic is z = ${dec(z)}. Find the p-value. Round to four decimal places.`,
      visual: { type: "normal", mean: 0, sd: 1, shadeFrom: dir === "<" ? undefined : dir === ">" ? z : Math.abs(z), shadeTo: dir === "<" ? z : undefined, label: dir === "≠" ? "z (shade both tails)" : "z" },
      answer: num(ans, { tolerance: 0.0015 }),
      hints: [dir === ">" ? `H_a uses >, so find the area to the right of z = ${dec(z)}.` : dir === "<" ? `H_a uses <, so find the area to the left of z = ${dec(z)}.` : "H_a uses ≠, so find one tail beyond |z| and double it.", `P(Z < ${dec(z)}) ≈ ${fix(normCdf(z))}.`],
      steps: [
        st("Which tail?", dir === ">" ? "Right tail (H_a: >)." : dir === "<" ? "Left tail (H_a: <)." : "Both tails (H_a: ≠)."),
        st("Area.", dir === ">" ? `P(Z > ${dec(z)}) = 1 − ${fix(normCdf(z))} = ${fix(ans)}` : dir === "<" ? `P(Z < ${dec(z)}) = ${fix(ans)}` : `One tail: P(Z > ${dec(Math.abs(z))}) = ${fix(tail)}. Double it: ${fix(2 * tail)}`),
      ],
      traps: tolTraps(ans, 0.0015, [[dir === "≠" ? tail : 1 - ans, dir === "≠" ? "That's one tail. A two-sided test doubles it." : "That's the other side. Shade in the direction of H_a."], [dir === "≠" ? 1 - 2 * tail : 2 * ans, dir === "≠" ? "That's the middle area. The p-value is in the tails." : "Only double the tail for a two-sided (≠) test."]]),
    };
  },
};

const conclusion: Skill = {
  id: "m4.test.conclusion",
  title: "Draw a conclusion",
  topic: T,
  standards: ["NC.M4.SP.2.3"],
  prereqs: ["m4.test.p-value"],
  lesson: {
    bigIdea: "Compare the p-value with the significance level α (often 0.05). If p-value < α, reject H_0: convincing evidence for H_a. If not, fail to reject H_0: not convincing evidence. Always state it in context.",
    explain: [
      "p-value 0.0188 < α = 0.05 → reject H_0. \"There is convincing evidence that more than 35% of students at this school have a part-time job.\"",
      "p-value 0.21 > 0.05 → fail to reject H_0. \"There is not convincing evidence that…\" We never say we \"accept\" or \"prove\" H_0: lack of evidence isn't proof.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why do we say \"fail to reject H_0\" instead of \"accept H_0\"?", choices: ["A large p-value only means the data are consistent with H_0; it doesn't prove H_0 is true.", "Because H_0 is always false.", "They mean exactly the same thing."], correct: 0, explain: "Absence of evidence is not evidence of absence." },
    { kind: "written", prompt: "A test gives a p-value of 0.003. Explain what you conclude at α = 0.05, and what 0.003 tells you.", keyIdeas: ["0.003 < 0.05, so reject H_0", "if H_0 were true, a result this extreme would happen only 0.3% of the time", "convincing evidence for H_a (in context)"], exemplar: "Since 0.003 < 0.05, reject H_0. If the null hypothesis were true, a sample result this extreme would happen only about 0.3% of the time, which is so unlikely that we have convincing evidence for the alternative." },
  ],
  generate(r, lv) {
    const t = r.pick(TESTS);
    const alpha = lv === 1 ? 0.05 : r.pick([0.01, 0.05, 0.1]);
    let pv: number, extra: string[] = [], intro: string;
    if (lv < 3) {
      pv = r.chance(0.5) ? rnd(r.int(1, 99) / 10000 * (alpha / 0.01), 4) : rnd(alpha + r.int(5, 300) / 1000, 3);
      if (Math.abs(pv - alpha) < 0.002) pv = rnd(alpha + 0.02, 3);
      intro = `${t.setup} A test of H_0: p = ${dec(t.p0)} vs. H_a: p ${t.dir} ${dec(t.p0)} gives a p-value of ${dec(pv, 4)}. Using α = ${alpha}, what is the conclusion?`;
    } else {
      const { n, x, ph, sd } = sampleFor(r, t, r.pick([0.9, 1.3, 2.2, 2.7, 3.1]));
      const z = rnd((ph - t.p0) / sd, 2);
      pv = rnd(pval(z, t.dir), 4);
      intro = `${t.setup} In a random sample of ${n} ${t.pop}, ${x} ${t.trait}. Test H_0: p = ${dec(t.p0)} vs. H_a: p ${t.dir} ${dec(t.p0)} at α = ${alpha}. What is the conclusion?`;
      extra = [st("Sample proportion.", `p̂ = {${x}/${n}} = ${dec(ph, 4)}`), st("Test statistic.", `z = {${dec(ph, 4)} − ${dec(t.p0)}/${dec(sd, 4)}} ≈ ${dec(z)}`), st("p-value.", `${t.dir === "≠" ? "two-sided" : t.dir === ">" ? "right tail" : "left tail"}: ≈ ${fix(pv)}`)];
    }
    const reject = pv < alpha;
    const yes = `Reject H_0: there is convincing evidence that ${t.ha}.`;
    const no = `Fail to reject H_0: there is not convincing evidence that ${t.ha}.`;
    return {
      prompt: intro,
      answer: choice(r, reject ? yes : no, [
        [reject ? no : yes, `Compare: p-value ${dec(pv, 4)} is ${reject ? "less" : "greater"} than α = ${alpha}.`],
        [reject ? `Accept H_a: this proves that ${t.ha}.` : `Accept H_0: this proves that p = ${dec(t.p0)}.`, reject ? "A test gives evidence, not proof." : "Failing to reject H_0 doesn't prove it's true."],
        [`Reject H_0 because the p-value is ${reject ? "small" : "large"}, so H_0 is probably true.`, "Rejecting H_0 means we think H_0 is false; mixing these up reverses the conclusion."],
      ]),
      hints: ["Compare the p-value to α.", "p-value < α → reject H_0 (convincing evidence for H_a). Otherwise fail to reject H_0."],
      steps: [...extra, st("Compare with α.", `${dec(pv, 4)} ${reject ? "<" : "≥"} ${alpha}`), st("Conclusion in context.", reject ? yes : no)],
    };
  },
};

export default [hypotheses, zStat, pValue, conclusion] satisfies Skill[];

