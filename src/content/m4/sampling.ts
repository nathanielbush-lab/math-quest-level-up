// Unit 10: Sampling distributions: simulation, the spread of p̂ and x̄, and when the normal model applies (NC.M4.SP.2.1, NC.M4.SP.3.3).
import { choice, num } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { dec, fix, normCdf, rnd, simBinomial, tolTraps } from "./util";

const T = "m4-sampling";

const CLAIMS = [
  { who: "A streaming service", claim: "of teens use it every week", unit: "teens" },
  { who: "A school newspaper", claim: "of students bring lunch from home", unit: "students" },
  { who: "A phone maker", claim: "of its customers upgrade within two years", unit: "customers" },
  { who: "A gaming site", claim: "of players finish the tutorial level", unit: "players" },
  { who: "A city report", claim: "of residents bike to work at least once a month", unit: "residents" },
];

/** Simulated sample proportions as a histogram, one bar per possible count. */
function simulate(r: Parameters<Skill["generate"]>[0], n: number, p: number, reps: number): { counts: Map<number, number>; vis: Visual } {
  const counts = new Map<number, number>();
  for (let i = 0; i < reps; i++) {
    const k = simBinomial(r, n, p);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const ks = [...counts.keys()];
  const lo = Math.min(...ks), hi = Math.max(...ks);
  const w = 1 / n;
  const bins = [];
  for (let k = lo; k <= hi; k++) bins.push({ from: rnd(k / n - w / 2, 4), to: rnd(k / n + w / 2, 4), count: counts.get(k) ?? 0 });
  return { counts, vis: { type: "histogram", bins, xLabel: "simulated sample proportion p̂", yLabel: "number of simulations" } };
}

const simulation: Skill = {
  id: "m4.samp.simulation",
  title: "Simulate a sampling distribution",
  topic: T,
  standards: ["NC.M4.SP.2.1"],
  prereqs: [],
  lesson: {
    bigIdea: "To judge whether a sample result is surprising, simulate many samples assuming the claim is true and see how often a result at least as extreme shows up.",
    explain: [
      "A company claims 40% of teens use its app. In a sample of 25 teens, 15 do (p̂ = 0.60). Is that surprising if the claim is true?",
      "Simulate: a computer draws 200 samples of 25 from a population where p = 0.40 and records each p̂. Suppose only 8 of the 200 simulated p̂ values are 0.60 or higher.",
      "That's 8/200 = 0.04. A result this extreme happens only about 4% of the time if the claim is true, so it's surprising: evidence that the true proportion is higher than 40%.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why do we simulate assuming the claim is true?", choices: ["To see what results would look like if the claim were right, so we can judge whether our sample fits.", "Because the claim is always true.", "To make the sample bigger."], correct: 0, explain: "The simulation shows the natural sample-to-sample variation under the claim." },
    { kind: "written", prompt: "In a simulation, 61 of 200 samples gave a result at least as extreme as yours. Explain what you'd conclude.", keyIdeas: ["61/200 ≈ 0.31", "results like yours happen about 31% of the time if the claim is true", "so it's not surprising; no convincing evidence against the claim"], exemplar: "61/200 ≈ 0.31, so if the claim were true, a result as extreme as mine would happen about 31% of the time. That isn't unusual, so my sample doesn't give convincing evidence against the claim (though it doesn't prove the claim either)." },
  ],
  generate(r, lv) {
    const c = r.pick(CLAIMS);
    const n = r.pick([25, 40, 50]);
    const p = r.pick([0.2, 0.3, 0.4, 0.5]);
    const sd = Math.sqrt((p * (1 - p)) / n);
    const zt = lv === 3 ? r.pick([1, 1.5, 2.2, 2.6]) : r.pick([1, 1.5, 2]);
    const kObs = Math.min(n, Math.round(n * p + zt * sd * n));
    const phat = kObs / n;
    const { counts, vis } = simulate(r, n, p, 200);
    let ext = 0;
    counts.forEach((v, k) => { if (k >= kObs) ext += v; });
    const intro = `${c.who} claims ${Math.round(p * 100)}% ${c.claim}. In a random sample of ${n} ${c.unit}, ${kObs} said yes (p̂ = ${dec(phat)}). A computer simulated 200 samples of ${n} assuming the claim is true; the histogram shows the simulated p̂ values.`;
    const hint1 = `Add the heights of the bars at p̂ = ${dec(phat)} and above.`;
    if (lv === 1) {
      return {
        prompt: `${intro} How many simulated samples had p̂ ≥ ${dec(phat)}?`,
        visual: vis,
        answer: num(ext),
        hints: [hint1, "Each bar is one possible p̂ value; its height is how many simulations gave it."],
        steps: [st("Bars at or above the observed p̂.", [...counts.entries()].filter(([k]) => k >= kObs).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${dec(k / n)}: ${v}`).join(", ") || "none"), st("Add.", `${ext} simulations`)],
        traps: tolTraps(ext, 0, [[ext - (counts.get(kObs) ?? 0), `"At least ${dec(phat)}" includes the bar at ${dec(phat)}.`], [200 - ext, "That counts the results below the observed value."]]),
      };
    }
    const est = ext / 200;
    if (lv === 2) {
      return {
        prompt: `${intro} Use the simulation to estimate the probability of getting p̂ ≥ ${dec(phat)} if the claim is true.`,
        visual: vis,
        answer: num(frac(ext, 200)),
        hints: [hint1, `${ext} of the 200 simulations. Divide by 200.`],
        steps: [st("Count extreme results.", `${ext} of 200 simulated samples had p̂ ≥ ${dec(phat)}.`), st("Estimate the probability.", `${ext} ÷ 200 = ${dec(est, 3)}`)],
        traps: [ext, 200 - ext].filter((v) => v !== ext / 200).map((v, i) => ({ value: frac(v), feedback: i === 0 ? "That's the count. Divide by the 200 simulations." : "Count the results at or above the observed p̂." })),
      };
    }
    const surprising = est < 0.05;
    return {
      prompt: `${intro} ${ext} of the 200 simulated samples had p̂ ≥ ${dec(phat)}. What should you conclude?`,
      visual: vis,
      answer: choice(r, surprising ? `The result is surprising (about ${dec(est * 100, 1)}% of simulations): convincing evidence that more than ${Math.round(p * 100)}% ${c.claim}.` : `The result isn't surprising (about ${dec(est * 100, 1)}% of simulations): no convincing evidence against the claim.`, [
        [surprising ? `The result isn't surprising (about ${dec(est * 100, 1)}% of simulations): no convincing evidence against the claim.` : `The result is surprising (about ${dec(est * 100, 1)}% of simulations): convincing evidence that more than ${Math.round(p * 100)}% ${c.claim}.`, `Results this extreme happened ${dec(est * 100, 1)}% of the time. ${surprising ? "That's rare." : "That's not rare."}`],
        ["The claim is definitely true because the sample came from the population.", "One sample can't prove a claim true."],
        [`The claim is false because p̂ = ${dec(phat)} isn't exactly ${p}.`, "Sample proportions vary; the question is whether this one is unusually far from the claim."],
      ]),
      hints: [`What fraction of simulations gave a result at least as extreme? ${ext}/200.`, "If that's very small (often less than 5%), the result is surprising under the claim."],
      steps: [st("Estimate the probability.", `${ext} ÷ 200 = ${dec(est, 3)}`), st("Judge.", surprising ? "Less than 0.05: the observed result rarely happens if the claim is true." : "Not small: results like this happen fairly often by chance."), st("Conclusion.", surprising ? "Convincing evidence against the claim." : "No convincing evidence against the claim.")],
    };
  },
};

const NICE: [number, number, number][] = [[0.5, 100, 0.05], [0.2, 100, 0.04], [0.1, 100, 0.03], [0.4, 96, 0.05], [0.8, 400, 0.02], [0.5, 625, 0.02], [0.3, 84, 0.05], [0.6, 150, 0.04], [0.9, 100, 0.03], [0.5, 400, 0.025]];

const phatDist: Skill = {
  id: "m4.samp.phat",
  title: "Sampling distribution of p̂",
  topic: T,
  standards: ["NC.M4.SP.3.3"],
  prereqs: ["m4.samp.simulation"],
  lesson: {
    bigIdea: "For random samples of size n from a population with proportion p, the sample proportion p̂ has mean p and standard deviation √({p(1 − p)/n}).",
    explain: [
      "p = 0.40 of teens use an app, samples of n = 96: the p̂ values center at 0.40 with SD √({0.4(0.6)/96}) = √0.0025 = **0.05**.",
      "Bigger samples vary less. Because n is under a square root, you need **4 times** the sample size to cut the SD in half.",
      "When np ≥ 10 and n(1 − p) ≥ 10, the distribution of p̂ is approximately normal.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does quadrupling n only halve the SD of p̂?", choices: ["n is inside a square root: √(4n) = 2√n.", "Because the SD is always halved.", "It doesn't; quadrupling n divides the SD by 4."], correct: 0, explain: "SD ∝ 1/√n." },
    { kind: "written", prompt: "Explain why the mean of the sampling distribution of p̂ is p.", keyIdeas: ["random samples don't favor high or low values", "some p̂ are above p and some below", "on average they balance out at p (p̂ is unbiased)"], exemplar: "Random samples don't systematically lean one way. Some samples give p̂ above p and some below, and across all possible samples they average out to exactly p. That's what it means for p̂ to be an unbiased estimator." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const [p, n, sd] = r.pick(NICE);
      return {
        prompt: `In a large population, ${Math.round(p * 100)}% ${r.pick(CLAIMS).claim}. For random samples of ${n}, find the mean and standard deviation of the sample proportion p̂.`,
        answer: { kind: "multi", fields: [{ value: frac(p), pre: "mean =" }, { value: frac(sd), pre: "SD =" }] },
        hints: ["The mean of p̂ is p.", `SD = √(${p}(${rnd(1 - p, 2)}) ÷ ${n}).`],
        steps: [st("Mean.", `μ_p̂ = p = ${p}`), st("SD.", `σ_p̂ = √({${p}(${rnd(1 - p, 2)})/${n}}) = √(${dec((p * (1 - p)) / n, 6)}) = ${sd}`)],
      };
    }
    if (lv === 2) {
      const p = r.pick([0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.72]), n = r.pick([50, 80, 120, 200, 300, 500]);
      const sd = Math.sqrt((p * (1 - p)) / n);
      const ans = rnd(sd, 3);
      const cc = r.pick(CLAIMS);
      return {
        prompt: `${cc.who} says ${Math.round(p * 100)}% ${cc.claim}. For random samples of ${n}, find the standard deviation of p̂. Round to three decimal places.`,
        answer: num(ans, { tolerance: 0.0011 }),
        hints: ["σ_p̂ = √(p(1 − p) ÷ n).", `√(${p} × ${rnd(1 - p, 2)} ÷ ${n}).`],
        steps: [st("Formula.", "σ_p̂ = √({p(1 − p)/n})"), st("Substitute.", `√({${p}(${rnd(1 - p, 2)})/${n}}) = √(${dec((p * (1 - p)) / n, 6)}) ≈ ${dec(ans, 3)}`)],
        traps: tolTraps(ans, 0.0011, [[Math.sqrt(p * (1 - p)), "Divide by n inside the square root."], [(p * (1 - p)) / n, "Take the square root."], [Math.sqrt(p / n), "Use p(1 − p), not just p."]]),
      };
    }
    const [p, n, sd] = r.pick(NICE);
    const k = 2;
    const target = rnd(sd / k, 4);
    const ans = n * k * k;
    return {
      prompt: `In a population with p = ${p}, samples of ${n} give σ_p̂ = ${sd}. What sample size would make σ_p̂ = ${dec(target)}?`,
      answer: num(ans),
      hints: [`You want the SD divided by ${k}. Since n is under a square root, multiply n by ${k}^2.`, `Or solve √(${p}(${rnd(1 - p, 2)}) ÷ n) = ${dec(target)} for n.`],
      steps: [st("Compare the SDs.", `${dec(target)} is ${sd} ÷ ${k}.`), st("Square root rule.", `To divide the SD by ${k}, multiply n by ${k}² = ${k * k}.`), st("New sample size.", `${n} × ${k * k} = ${ans}`), st("Check.", `√({${p}(${rnd(1 - p, 2)})/${ans}}) = ${dec(target)} ✓`)],
      traps: tolTraps(ans, 0, [[n * k, `Multiplying n by ${k} only divides the SD by √${k}.`], [n / k, "A smaller SD needs a larger sample."]]),
    };
  },
};

const xbarDist: Skill = {
  id: "m4.samp.xbar",
  title: "Sampling distribution of x̄",
  topic: T,
  standards: ["NC.M4.SP.3.3", "NC.M4.SP.3.4"],
  prereqs: ["m4.samp.phat"],
  lesson: {
    bigIdea: "The sample mean x̄ of random samples of size n has mean μ and standard deviation {σ/√n}. If the population is normal, or n is large (about 30+), x̄ is approximately normal.",
    explain: [
      "Song lengths: μ = 210 s, σ = 30 s. For playlists of n = 36 random songs, x̄ has mean 210 and SD {30/√36} = **5 s**.",
      "P(x̄ > 218): z = {218 − 210/5} = 1.6, so the probability is 1 − 0.9452 = **0.0548**.",
      "Notice one song longer than 218 s is common (z ≈ 0.27), but a whole playlist averaging that much is not.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is the SD of x̄ smaller than the SD of individual values?", choices: ["High and low values in a sample tend to cancel out when you average them.", "Because samples always come from the middle of the data.", "Because σ is divided by n, which is always large."], correct: 0, explain: "Averages are less variable than individual observations." },
    { kind: "written", prompt: "Incomes in a town are strongly right-skewed. Explain whether the sampling distribution of x̄ for samples of 100 would be approximately normal.", keyIdeas: ["the Central Limit Theorem", "for large n (100 ≥ 30), x̄ is approximately normal even if the population isn't", "so yes, approximately normal"], exemplar: "Yes. By the Central Limit Theorem, when the sample size is large (100 is well over 30), the distribution of sample means is approximately normal even when the population is skewed, because averaging washes out the skew." },
  ],
  generate(r, lv) {
    const ctx = r.pick([
      { what: "song lengths on a streaming service", unit: "seconds", mu: 210, sd: 30 },
      { what: "daily screen times of teens", unit: "minutes", mu: 280, sd: 60 },
      { what: "weights of apples from an orchard", unit: "grams", mu: 150, sd: 24 },
      { what: "delivery times for a pizza shop", unit: "minutes", mu: 32, sd: 8 },
    ]);
    const n = r.pick([4, 9, 16, 36, 64, 144].filter((m) => (ctx.sd / Math.sqrt(m)) * 100 === Math.round((ctx.sd / Math.sqrt(m)) * 100)));
    const se = ctx.sd / Math.sqrt(n);
    if (lv === 1) {
      return {
        prompt: `The ${ctx.what} have mean ${ctx.mu} and standard deviation ${ctx.sd} ${ctx.unit}. For random samples of ${n}, find the mean and standard deviation of the sample mean x̄.`,
        answer: { kind: "multi", fields: [{ value: frac(ctx.mu), pre: "mean =" }, { value: frac(Math.round(se * 100), 100), pre: "SD =" }] },
        hints: ["The mean of x̄ is μ.", `SD of x̄ = σ ÷ √n = ${ctx.sd} ÷ √${n}.`],
        steps: [st("Mean.", `μ_x̄ = μ = ${ctx.mu}`), st("SD.", `σ_x̄ = {${ctx.sd}/√${n}} = {${ctx.sd}/${Math.sqrt(n)}} = ${dec(se)}`)],
      };
    }
    const nn = lv === 2 ? n : r.pick([36, 64, 144].filter((m) => Number.isInteger((ctx.sd / Math.sqrt(m)) * 100)));
    const se2 = ctx.sd / Math.sqrt(nn);
    const z = (r.int(4, 44) * 5) / 100 * (lv === 3 ? r.sign() : 1);
    const a = rnd(ctx.mu + z * se2, 2);
    const above = lv === 2 ? true : r.chance(0.5);
    const pl = normCdf(z);
    const ans = rnd(above ? 1 - pl : pl, 4);
    return {
      prompt: `The ${ctx.what} have mean ${ctx.mu} and SD ${ctx.sd} ${ctx.unit}${lv === 3 ? " (the population is skewed)" : " and are approximately normal"}. For a random sample of ${nn}, find the probability that the sample mean is ${above ? "more" : "less"} than ${dec(a)} ${ctx.unit}. Round to four decimal places.`,
      visual: { type: "normal", mean: ctx.mu, sd: rnd(se2, 4), shadeFrom: above ? a : undefined, shadeTo: above ? undefined : a, label: `sample mean x̄ (${ctx.unit})` },
      answer: num(ans, { tolerance: 0.0015 }),
      hints: [`Use the SD of x̄: ${ctx.sd} ÷ √${nn} = ${dec(se2)}.`, `z = (${dec(a)} − ${ctx.mu}) ÷ ${dec(se2)} = ${dec(z)}.`],
      steps: [
        ...(lv === 3 ? [st("Is a normal model OK?", `The population is skewed, but n = ${nn} ≥ 30, so by the Central Limit Theorem x̄ is approximately normal.`)] : []),
        st("SD of x̄.", `{${ctx.sd}/√${nn}} = ${dec(se2)}`),
        st("Standardize.", `z = {${dec(a)} − ${ctx.mu}/${dec(se2)}} = ${dec(z)}`),
        st("Probability.", above ? `P(Z > ${dec(z)}) = 1 − ${fix(pl)} = ${fix(ans)}` : `P(Z < ${dec(z)}) = ${fix(ans)}`),
      ],
      traps: tolTraps(ans, 0.0015, [[above ? 1 - normCdf((a - ctx.mu) / ctx.sd) : normCdf((a - ctx.mu) / ctx.sd), `That uses σ = ${ctx.sd}, the SD of individual values. For a sample mean use σ/√n.`], [1 - ans, "Check which side of the cutoff you need."]]),
    };
  },
};

const conditions: Skill = {
  id: "m4.samp.conditions",
  title: "When is the normal model OK?",
  topic: T,
  standards: ["NC.M4.SP.3.3"],
  prereqs: ["m4.samp.phat"],
  lesson: {
    bigIdea: "Sampling distributions become approximately normal when samples are large enough: for p̂, np ≥ 10 and n(1 − p) ≥ 10; for x̄, a normal population or n ≥ 30.",
    explain: [
      "With p = 0.05 and n = 40, the expected number of successes is np = 2. Most samples have 0, 1, 2 or 3 successes, so the p̂ distribution is piled up near 0 and skewed right: not normal.",
      "With n = 400, np = 20 and n(1 − p) = 380, both ≥ 10, so p̂ is approximately normal.",
      "Simulations show this: as n grows, the histogram of simulated p̂ or x̄ values looks more and more like a bell curve (the Central Limit Theorem).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does a small np make the distribution of p̂ skewed?", choices: ["p̂ can't go below 0, so when the expected count is tiny the values bunch up at 0 with a long tail to the right.", "Because small samples are always normal.", "Because p̂ is always symmetric."], correct: 0, explain: "The left side is blocked by 0." },
    { kind: "written", prompt: "Explain how you'd use a simulation to check whether a normal model is reasonable for p̂ with n = 30 and p = 0.1.", keyIdeas: ["simulate many samples of 30 with p = 0.1", "make a histogram of the p̂ values", "look at the shape: it will be skewed right because np = 3 < 10"], exemplar: "I'd simulate a few hundred samples of size 30 with p = 0.1, record each p̂, and make a histogram. With np = 3, most p̂ values would be 0, 0.033, 0.067 or 0.1 and the histogram would be skewed right, so a normal model wouldn't be reasonable." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const p = r.pick([0.02, 0.05, 0.1, 0.2, 0.5, 0.9, 0.95]), n = r.pick([30, 50, 100, 200, 400]);
      const s = n * p, f = n * (1 - p);
      const ok = s >= 10 && f >= 10;
      return {
        prompt: `A sample of ${n} is taken from a population with p = ${p}. Is the sampling distribution of p̂ approximately normal?`,
        answer: choice(r, ok ? `Yes: np = ${dec(s)} and n(1 − p) = ${dec(f)} are both at least 10.` : `No: ${s < 10 ? `np = ${dec(s)}` : `n(1 − p) = ${dec(f)}`} is less than 10.`, [
          [ok ? `No: ${s < f ? `np = ${dec(s)}` : `n(1 − p) = ${dec(f)}`} is less than 10.` : `Yes: np = ${dec(s)} and n(1 − p) = ${dec(f)} are both at least 10.`, `Check both: np = ${dec(s)} and n(1 − p) = ${dec(f)}.`],
          [`Yes: n = ${n} is at least 30.`, "n ≥ 30 is the rule of thumb for means. For proportions, check np and n(1 − p)."],
          ["No: sampling distributions are never normal.", "They often are, when the sample is large enough."],
        ]),
        hints: ["Compute the expected successes np and failures n(1 − p).", "Both need to be at least 10."],
        steps: [st("Expected successes.", `np = ${n}(${p}) = ${dec(s)}`), st("Expected failures.", `n(1 − p) = ${n}(${rnd(1 - p, 2)}) = ${dec(f)}`), st("Decide.", ok ? "Both ≥ 10: approximately normal." : "One is below 10: the distribution is skewed.")],
      };
    }
    if (lv === 2) {
      const p = r.pick([0.02, 0.04, 0.05, 0.08, 0.15, 0.85, 0.9, 0.96]);
      const m = Math.min(p, 1 - p);
      const ans = Math.ceil(rnd(10 / m, 6));
      return {
        prompt: `For a population proportion p = ${p}, what is the smallest sample size n for which both np ≥ 10 and n(1 − p) ≥ 10?`,
        answer: num(ans),
        hints: [`The smaller of p and 1 − p is ${rnd(m, 2)}; that one sets the requirement.`, `Solve n(${rnd(m, 2)}) ≥ 10.`],
        steps: [st("Which condition is harder?", `min(p, 1 − p) = ${rnd(m, 2)}`), st("Solve.", `n ≥ {10/${rnd(m, 2)}} = ${dec(10 / m, 2)}`), st("Round up.", `n = ${ans}`)],
        traps: tolTraps(ans, 0, [[Math.ceil(rnd(10 / Math.max(p, 1 - p), 6)), `That only satisfies the easier condition. Use ${rnd(m, 2)}.`], [30, "n ≥ 30 is the rule for means, not proportions."]]),
      };
    }
    const small = r.pick([5, 8, 10]), big = r.pick([40, 60, 100]);
    const bins = [[0, 20, 38], [20, 40, 26], [40, 60, 15], [60, 80, 9], [80, 100, 6], [100, 120, 3], [120, 140, 2], [140, 160, 1]].map(([from, to, count]) => ({ from, to, count }));
    const ask = r.pick(["small", "big"]);
    const nAsk = ask === "small" ? small : big;
    return {
      prompt: `The histogram shows the (strongly right-skewed) distribution of monthly spending on in-game purchases for a large group of players, in dollars. Would the sampling distribution of x̄ for random samples of ${nAsk} players be approximately normal?`,
      visual: { type: "histogram", bins, xLabel: "monthly spending ($)", yLabel: "percent of players" },
      answer: choice(r, ask === "big" ? `Yes: n = ${nAsk} is large (≥ 30), so the Central Limit Theorem applies even though the population is skewed.` : `No: the population is strongly skewed and n = ${nAsk} is small, so x̄ will still be skewed.`, [
        [ask === "big" ? `No: the population is strongly skewed, so x̄ can never be normal.` : `Yes: sample means are always normal.`, ask === "big" ? "The Central Limit Theorem says large samples fix this." : "Only when n is large or the population is normal."],
        [ask === "big" ? `No: n needs to be at least 1,000.` : `Yes: n = ${nAsk} is more than 1.`, ask === "big" ? "About 30 is usually enough, more if the skew is extreme." : "A tiny sample from a skewed population gives skewed means."],
        ["Yes: the histogram itself is normal.", "The histogram is clearly skewed right."],
      ]),
      hints: ["Is the population normal? If not, how big is the sample?", "Central Limit Theorem: for large n (about 30 or more), x̄ is approximately normal regardless of the population's shape."],
      steps: [st("Population shape.", "Strongly skewed right, not normal."), st("Sample size.", `n = ${nAsk} ${nAsk >= 30 ? "≥" : "<"} 30.`), st("Conclusion.", ask === "big" ? "The CLT applies: x̄ is approximately normal." : "Too small to overcome the skew: x̄ is not approximately normal.")],
    };
  },
};

const probPhat: Skill = {
  id: "m4.samp.prob-phat",
  title: "Probabilities for sample proportions",
  topic: T,
  standards: ["NC.M4.SP.3.3", "NC.M4.SP.3.4"],
  prereqs: ["m4.samp.conditions"],
  lesson: {
    bigIdea: "When np ≥ 10 and n(1 − p) ≥ 10, model p̂ as normal with mean p and SD √({p(1 − p)/n}), then standardize as usual.",
    explain: [
      "40% of teens use an app. In a sample of 96, what's P(p̂ > 0.48)? SD = √({0.4(0.6)/96}) = 0.05.",
      "z = {0.48 − 0.40/0.05} = 1.6, so P(p̂ > 0.48) = 1 − 0.9452 = **0.0548**.",
      "Check conditions first: np = 38.4 and n(1 − p) = 57.6, both ≥ 10. ✓",
    ],
    visual: { type: "normal", mean: 0.4, sd: 0.05, shadeFrom: 0.48, label: "sample proportion p̂" },
  },
  why: [
    { kind: "choice", prompt: "Why use √(p(1 − p)/n) instead of √(p(1 − p)) as the SD here?", choices: ["We're modeling the variability of a sample proportion, which shrinks as n grows.", "Because n is always 1.", "Because it makes the probability larger."], correct: 0, explain: "√(p(1 − p)) describes single yes/no outcomes, not averages of n of them." },
    { kind: "written", prompt: "If 50% of voters support a measure, explain why a poll of 1,000 voters showing 56% support would be very surprising.", keyIdeas: ["SD of p̂ = √(0.25/1000) ≈ 0.0158", "0.56 is (0.56 − 0.5)/0.0158 ≈ 3.8 SDs above 0.5", "probability is tiny (< 0.001)"], exemplar: "With p = 0.5 and n = 1,000, the SD of p̂ is √(0.25/1000) ≈ 0.0158. A result of 0.56 is about 3.8 SDs above 0.50, which has a probability well under 0.001. So it would be very surprising if support were really 50%." },
  ],
  generate(r, lv) {
    let p: number, n: number, sd: number, z: number, cut: number;
    if (lv === 1) {
      const pick = r.pick(NICE.filter((x) => x[1] * x[0] >= 10 && x[1] * (1 - x[0]) >= 10));
      [p, n, sd] = pick;
      z = r.pick([-2, -1.5, -1, 1, 1.5, 2, 1.2, -1.2, 0.8]);
      cut = rnd(p + z * sd, 4);
    } else {
      p = r.pick([0.2, 0.3, 0.35, 0.45, 0.6, 0.7, 0.75]); n = r.pick([80, 120, 150, 200, 250, 400]);
      sd = Math.sqrt((p * (1 - p)) / n);
      cut = rnd(p + r.pick([-1, 1]) * r.int(3, 10) / 100, 2);
      z = (cut - p) / sd;
    }
    const c = r.pick(CLAIMS);
    const above = r.chance(0.5);
    const zr = rnd(z, 2);
    const pl = normCdf(zr);
    const ans = rnd(above ? 1 - pl : pl, 4);
    if (lv === 3) {
      const cut2 = rnd(2 * p - cut, 2);
      const [lo, hi] = [Math.min(cut, cut2), Math.max(cut, cut2)];
      const zl = rnd((lo - p) / sd, 2), zh = rnd((hi - p) / sd, 2);
      const between = rnd(rnd(normCdf(zh), 4) - rnd(normCdf(zl), 4), 4);
      return {
        prompt: `${c.who} says ${Math.round(p * 100)}% ${c.claim}. For a random sample of ${n}, find the probability that p̂ is between ${dec(lo)} and ${dec(hi)}. Round to four decimal places.`,
        visual: { type: "normal", mean: p, sd: rnd(sd, 4), shadeFrom: lo, shadeTo: hi, label: "sample proportion p̂" },
        answer: num(between, { tolerance: 0.002 }),
        hints: [`Check np = ${dec(n * p)} and n(1 − p) = ${dec(n * (1 - p))}, then find SD = √(${p}(${rnd(1 - p, 2)}) ÷ ${n}) ≈ ${dec(sd, 4)}.`, `z-scores: ${dec(zl)} and ${dec(zh)}.`],
        steps: [
          st("Conditions.", `np = ${dec(n * p)} ≥ 10 and n(1 − p) = ${dec(n * (1 - p))} ≥ 10 ✓`),
          st("SD of p̂.", `√({${p}(${rnd(1 - p, 2)})/${n}}) ≈ ${dec(sd, 4)}`),
          st("Standardize.", `z = {${dec(lo)} − ${p}/${dec(sd, 4)}} ≈ ${dec(zl)}, z = {${dec(hi)} − ${p}/${dec(sd, 4)}} ≈ ${dec(zh)}`),
          st("Area between.", `${fix(normCdf(zh))} − ${fix(normCdf(zl))} ≈ ${fix(between)}`),
        ],
        traps: tolTraps(between, 0.002, [[1 - between, "That's the area outside the interval."], [normCdf((hi - p) / Math.sqrt(p * (1 - p))) - normCdf((lo - p) / Math.sqrt(p * (1 - p))), "Divide by n inside the square root for the SD of p̂."]]),
      };
    }
    return {
      prompt: `${c.who} says ${Math.round(p * 100)}% ${c.claim}. For a random sample of ${n}, find the probability that p̂ is ${above ? "greater" : "less"} than ${dec(cut)}. Round to four decimal places.`,
      visual: { type: "normal", mean: p, sd: rnd(sd, 4), shadeFrom: above ? cut : undefined, shadeTo: above ? undefined : cut, label: "sample proportion p̂" },
      answer: num(ans, { tolerance: 0.002 }),
      hints: [`SD of p̂ = √(${p}(${rnd(1 - p, 2)}) ÷ ${n}) ≈ ${dec(sd, 4)}.`, `z = (${dec(cut)} − ${p}) ÷ ${dec(sd, 4)} ≈ ${dec(zr)}.`],
      steps: [
        st("Conditions.", `np = ${dec(n * p)} ≥ 10 and n(1 − p) = ${dec(n * (1 - p))} ≥ 10 ✓`),
        st("SD of p̂.", `√({${p}(${rnd(1 - p, 2)})/${n}}) ≈ ${dec(sd, 4)}`),
        st("Standardize.", `z = {${dec(cut)} − ${p}/${dec(sd, 4)}} ≈ ${dec(zr)}`),
        st("Probability.", above ? `1 − ${fix(pl)} = ${fix(ans)}` : `${fix(ans)}`),
      ],
      traps: tolTraps(ans, 0.002, [[1 - ans, "Check which side you need."], [above ? 1 - normCdf((cut - p) / Math.sqrt(p * (1 - p))) : normCdf((cut - p) / Math.sqrt(p * (1 - p))), "Use the SD of p̂, √(p(1 − p)/n), not √(p(1 − p))."]]),
    };
  },
};

export default [simulation, phatDist, xbarDist, conditions, probPhat] satisfies Skill[];
