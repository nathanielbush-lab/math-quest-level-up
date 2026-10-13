// Unit 9: Statistics: study design, inference from samples, simulation, margins of error, and evaluating reports.
import { choice, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Problem, Skill, Visual } from "../types";
import { dn, trapsTol } from "./util";

const T = "m3-stats";

/** Standard normal CDF (Abramowitz–Stegun approximation). */
function phi(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/** Histogram bins of an approximately normal set of `n` simulated values. */
function normalBins(mean: number, sd: number, width: number, n: number, k = 6): { from: number; to: number; count: number }[] {
  const bins = [];
  for (let i = -k; i < k; i++) {
    const from = mean + i * width, to = from + width;
    bins.push({ from: Number(from.toFixed(4)), to: Number(to.toFixed(4)), count: Math.round(n * (phi((to - mean) / sd) - phi((from - mean) / sd))) });
  }
  return bins;
}

// ---------------------------------------------------------------------------
const SCEN: { text: string; type: "survey" | "observational study" | "experiment" }[] = [
  { text: "A researcher asks 400 randomly chosen teens how many hours of sleep they get on school nights.", type: "survey" },
  { text: "Students are randomly assigned to study with music or in silence, and their quiz scores are compared.", type: "experiment" },
  { text: "A scientist records whether students who already play varsity sports have higher GPAs than students who don't.", type: "observational study" },
  { text: "A phone company randomly assigns 200 volunteers to use a new battery-saver app or the old one and compares battery life.", type: "experiment" },
  { text: "A school mails a questionnaire to 300 randomly selected families about their opinion of a later start time.", type: "survey" },
  { text: "Doctors review hospital records to compare heart health of people who did and didn't drink coffee daily.", type: "observational study" },
  { text: "A coach randomly splits the team: half do a new warm-up routine, half do the usual one, and injuries are counted all season.", type: "experiment" },
  { text: "Researchers watch a mall food court and record whether shoppers with kids buy more desserts than shoppers without kids.", type: "observational study" },
  { text: "A streaming service asks a random sample of subscribers to rate their satisfaction from 1 to 10.", type: "survey" },
  { text: "Plant growers randomly assign seedlings to get a new fertilizer or plain water and measure their heights after a month.", type: "experiment" },
];

const studyType: Skill = {
  id: "m3.stat.study-type",
  title: "Surveys, observational studies and experiments",
  topic: T,
  standards: ["NC.M3.S-IC.3", "NC.M3.S-IC.6"],
  prereqs: [],
  lesson: {
    bigIdea: "A survey asks people questions. An observational study measures what's already happening without changing anything. An experiment imposes treatments on subjects, ideally assigned at random. Only well-designed experiments can show cause and effect.",
    explain: [
      "**Survey:** ask a random sample of 500 students how often they skip breakfast. Goal: estimate something about the population.",
      "**Observational study:** compare grades of students who already skip breakfast with those who don't. Even if the skippers have lower grades, something else (like sleep) could explain it: a **confounding variable**.",
      "**Experiment:** randomly assign volunteers to eat breakfast or not for a month and compare test scores. Random assignment balances the confounding variables, so a big difference can be blamed on the treatment.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can't an observational study prove that video games cause better reaction times?", choices: ["Gamers may differ from non-gamers in other ways (age, sports, sleep) that also affect reaction time.", "Because observational studies use too few people.", "Because reaction time can't be measured."], correct: 0, explain: "Without random assignment, confounding variables can't be ruled out." },
    { kind: "written", prompt: "Describe how to turn the question “Does chewing gum improve test scores?” into an experiment.", keyIdeas: ["get a group of volunteers", "randomly assign half to chew gum and half not to during the same test", "compare the average scores of the two groups"], exemplar: "Take a group of student volunteers and use a random number generator to split them into two groups. One group chews gum during a test and the other doesn't, with everything else the same. Then compare the mean scores; random assignment means a big difference is likely due to the gum." },
  ],
  generate(r, lv) {
    const sc = r.pick(SCEN);
    if (lv === 1) {
      const all = ["survey", "observational study", "experiment"] as const;
      const fb: Record<string, string> = { survey: "A survey collects answers to questions from a sample.", "observational study": "In an observational study, researchers only observe; they don't assign anything.", experiment: "An experiment imposes a treatment on the subjects." };
      return {
        prompt: `What kind of study is this? ${sc.text}`,
        answer: choice(r, `An ${sc.type === "survey" ? "survey" : sc.type}`.replace("An survey", "A survey"), all.filter((t) => t !== sc.type).map((t) => [`${t === "survey" ? "A" : "An"} ${t}`, fb[sc.type]] as [string, string]), true),
        hints: ["Does the researcher impose a treatment, just watch, or ask questions?", "If subjects are assigned to groups by the researcher, it's an experiment."],
        steps: [st("Who decides the groups?", sc.type === "experiment" ? "The researcher assigns the treatments." : sc.type === "survey" ? "No groups: people are asked questions." : "The groups already existed; the researcher only records data."), st("Answer.", `This is ${sc.type === "survey" ? "a survey" : `an ${sc.type}`}.`)],
      };
    }
    const exps = SCEN.filter((s) => (lv === 2 ? true : s.type === "observational study"));
    const s2 = r.pick(exps);
    if (lv === 2) {
      const isExp = s2.type === "experiment";
      const correct = isExp ? "Yes. The treatments were randomly assigned, so other differences between the groups should balance out." : s2.type === "survey" ? "No. A survey describes opinions or habits; it doesn't test a treatment." : "No. It's observational, so a confounding variable could explain any difference.";
      const opts = [
        "Yes. The treatments were randomly assigned, so other differences between the groups should balance out.",
        "No. It's observational, so a confounding variable could explain any difference.",
        "No. A survey describes opinions or habits; it doesn't test a treatment.",
        "Yes. Any study with a large sample shows cause and effect.",
      ];
      return {
        prompt: `${s2.text} Could this study show a cause-and-effect relationship?`,
        answer: choice(r, correct, opts.filter((o) => o !== correct).map((o) => [o, o.startsWith("Yes. Any") ? "Sample size doesn't fix confounding; random assignment does." : "Look at how the groups were formed."] as [string, string]), true),
        hints: ["Cause and effect needs an experiment with random assignment.", "Did the researcher assign the groups at random?"],
        steps: [st("Type of study.", `It's ${s2.type === "survey" ? "a survey" : `an ${s2.type}`}.`), st("Conclusion.", correct)],
      };
    }
    const correct = "Randomly assign subjects to the two groups instead of letting the groups form on their own.";
    return {
      prompt: `${s2.text} Which change would let the researchers draw a cause-and-effect conclusion?`,
      answer: choice(r, correct, [
        ["Use a much larger sample of the same kind.", "More data doesn't remove confounding variables."],
        ["Ask the subjects whether they think there's an effect.", "Opinions don't establish cause and effect."],
        ["Only include subjects from one school or one town.", "That limits who the results apply to, but doesn't fix confounding."],
      ]),
      hints: ["What makes an experiment different from an observational study?", "Random assignment balances out other variables between the groups."],
      steps: [st("Problem.", "The groups chose themselves, so they may differ in other ways (confounding variables)."), st("Fix.", correct)],
    };
  },
};

// ---------------------------------------------------------------------------
const randomization: Skill = {
  id: "m3.stat.randomization",
  title: "Random sampling, random assignment and bias",
  topic: T,
  standards: ["NC.M3.S-IC.1", "NC.M3.S-IC.3"],
  prereqs: [],
  lesson: {
    bigIdea: "Random sampling lets you generalize from a sample to a population. Random assignment lets you conclude cause and effect. Non-random methods introduce bias.",
    explain: [
      "**Random sample:** number every student and let a random number generator pick 60. Every student has the same chance, so the sample tends to look like the school.",
      "**Biased methods:** surveying the first 60 people in the lunch line (convenience), posting an online poll (voluntary response: people with strong opinions answer), or only calling landlines (undercoverage).",
      "**Random assignment** is different: it splits the subjects you already have into treatment groups by chance.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does random sampling allow you to generalize to the population?", choices: ["Every member has an equal chance of being chosen, so the sample tends to represent the whole population.", "Because random samples are always large.", "Because random samples have no variability."], correct: 0, explain: "Randomness avoids systematically favoring some groups, so the sample is representative on average." },
    { kind: "written", prompt: "A YouTuber asks viewers to vote in a poll about whether school should start later. 92% vote yes. Explain why this may not represent all students.", keyIdeas: ["voluntary response: only people who choose to respond", "viewers of that channel may not be like all students", "people with strong opinions are more likely to vote"], exemplar: "This is a voluntary response sample: only people who watch the channel and choose to vote are counted. They may have stronger opinions or be different from students in general, so the 92% probably overestimates support." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const randSample = r.chance(0.5);
      const correct = randSample ? "To make the sample representative so the results can be generalized to the population" : "To balance other variables between groups so differences can be blamed on the treatment";
      const other = randSample ? "To balance other variables between groups so differences can be blamed on the treatment" : "To make the sample representative so the results can be generalized to the population";
      return {
        prompt: randSample ? "What is the main purpose of selecting a random sample in a survey?" : "In an experiment, what is the main purpose of randomly assigning subjects to treatments?",
        answer: choice(r, correct, [[other, randSample ? "That's the purpose of random assignment in an experiment." : "That's the purpose of random sampling in a survey."], ["To make the sample size larger", "Randomness doesn't change the sample size."], ["To guarantee the results will be exactly right", "Random methods still have sampling variability."]]),
        hints: ["Random sampling is about who gets into the study.", "Random assignment is about which group each subject goes into."],
        steps: [st("Answer.", correct)],
      };
    }
    if (lv === 2) {
      const pop = r.pick(["students at a high school", "members of a gym", "fans at a stadium", "residents of a town"]);
      const n = r.pick([50, 60, 80, 100]);
      const correct = `Number every one of the ${pop} and use a random number generator to choose ${n}.`;
      return {
        prompt: `Which method gives a random sample of ${n} ${pop}?`,
        answer: choice(r, correct, [
          [`Choose the first ${n} ${pop} who walk through the main entrance.`, "That's a convenience sample: early arrivals may differ from everyone else."],
          [`Post an online survey and use the first ${n} responses.`, "That's voluntary response: people choose whether to answer."],
          [`Ask ${n} of your friends who are ${pop}.`, "Friends are likely to be similar to you, so the sample is biased."],
        ]),
        hints: ["In a random sample, every member of the population has the same chance of being picked.", "Which method leaves the choice entirely to chance?"],
        steps: [st("Check each method.", "Only one method gives every member an equal chance of selection."), st("Answer.", correct)],
      };
    }
    const cases: [string, string][] = [
      ["A news site asks readers to text YES or NO about a new law.", "Voluntary response bias"],
      ["To estimate how much residents exercise, a researcher surveys people leaving a gym.", "Convenience sampling bias"],
      ["A survey asks, “Don't you agree that the unfair new dress code should be removed?”", "Response bias from a leading question"],
      ["A city phones randomly selected landline numbers to survey all residents.", "Undercoverage (people without landlines are left out)"],
      ["A school emails a survey to all families; only 12% reply.", "Nonresponse bias"],
    ];
    const [text, ans] = r.pick(cases);
    return {
      prompt: `What is the main source of bias? ${text}`,
      answer: choice(r, ans, cases.filter(([, a]) => a !== ans).map(([, a]) => [a, "Think about who gets included or how the question is asked."] as [string, string]).slice(0, 3)),
      hints: ["Ask: who is in the sample, who chose to respond, and how was the question worded?", "Bias means the method systematically favors certain answers."],
      steps: [st("Identify the flaw.", text), st("Answer.", ans)],
    };
  },
};

// ---------------------------------------------------------------------------
const estimate: Skill = {
  id: "m3.stat.estimate",
  title: "Estimate population values from a sample",
  topic: T,
  standards: ["NC.M3.S-IC.1"],
  prereqs: ["m3.stat.randomization"],
  lesson: {
    bigIdea: "A random sample is a small copy of the population, so a sample proportion or mean estimates the population's. Scale it up to the whole population.",
    explain: [
      "In a random sample of 120 students, 30 bike to school. The sample proportion is {30/120} = 0.25.",
      "For a school of 1,600 students, estimate 0.25 · 1,600 = **400 bikers**.",
      "Estimates vary from sample to sample, which is why a margin of error usually comes with them.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why must the sample be random for this kind of estimate to make sense?", choices: ["A biased sample might have a very different proportion than the population.", "Because random samples are always exactly right.", "It doesn't need to be random."], correct: 0, explain: "Only a representative sample's proportion is a fair estimate." },
    { kind: "written", prompt: "Two random samples of 50 students give 18% and 26% vegetarians. Explain why they differ and what that means for an estimate.", keyIdeas: ["sampling variability: different random samples give different results", "each is an estimate of the true proportion", "a larger sample or a margin of error helps describe the uncertainty"], exemplar: "Each random sample contains different students, so the percentages naturally vary. Both are estimates of the true percent. This variability is why estimates come with a margin of error, and larger samples vary less." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      for (;;) {
        const n = r.pick([40, 50, 60, 80, 100, 120, 150, 200]), k = r.int(4, n / 2);
        const N = r.pick([800, 1200, 1500, 2000, 2400, 3000]);
        const est = (N * k) / n;
        if (!Number.isInteger(est)) continue;
        const what = r.pick(["have a part-time job", "own a gaming console", "play a school sport", "use public transit"]);
        return {
          prompt: `In a random sample of ${n} students, ${k} ${what}. Estimate how many of the school's ${N.toLocaleString("en-US")} students ${what}.`,
          answer: num(est, { unit: " students" }),
          hints: [`Sample proportion: {${k}/${n}}.`, `Multiply by ${N}.`],
          steps: [st("Sample proportion.", `{${k}/${n}} = ${dn(k / n, 4)}`), st("Scale up.", `${dn(k / n, 4)} · ${N} = ${est}`)],
          traps: traps(frac(est), [trap(k, `That's the count in the sample, not the school of ${N}.`), trap(N - est, `That's the number who don't ${what}.`)]),
        };
      }
    }
    if (lv === 2) {
      const n = r.pick([40, 50, 60]), mean = r.pick([1.8, 2.2, 2.4, 2.6, 3.5]), H = r.pick([1500, 2000, 4000, 5000]);
      const tot = Math.round(mean * H);
      return {
        prompt: `A random sample of ${n} households in a town of ${H.toLocaleString("en-US")} households has a mean of ${mean} streaming subscriptions per household. Estimate the total number of subscriptions in the town.`,
        answer: num(tot, { unit: " subscriptions" }),
        hints: ["The sample mean estimates the mean for all households.", `Multiply ${mean} by ${H}.`],
        steps: [st("Estimate the population mean.", `about ${mean} per household`), st("Total.", `${mean} · ${H} = ${tot}`)],
        traps: traps(frac(tot), [trap(Math.round(mean * n), "That's the total for the sample only.")]),
      };
    }
    for (;;) {
      const Tg = r.pick([40, 50, 60, 80, 100]), n = r.pick([50, 60, 75, 80, 100]), t = r.int(4, 20);
      const N = (Tg * n) / t;
      if (!Number.isInteger(N) || t >= n) continue;
      return {
        prompt: `To estimate the number of fish in a lake, biologists catch, tag and release ${Tg} fish. Later they catch a random sample of ${n} fish, and ${t} of them are tagged. Estimate the number of fish in the lake.`,
        answer: num(N, { unit: " fish" }),
        hints: ["Assume the proportion of tagged fish in the sample matches the proportion in the lake.", `{${t}/${n}} = {${Tg}/N}.`],
        steps: [st("Set up a proportion.", `{${t}/${n}} = {${Tg}/N}`), st("Solve.", `N = {${Tg} · ${n}/${t}} = ${N}`)],
        traps: traps(frac(N), [trap(Math.round((Tg * t) / n * 100) / 100, "Cross-multiply carefully: N = (tagged · sample size) ÷ tagged in sample."), trap(Tg + n, "Adding the two catches counts some fish twice and misses the rest.")]),
      };
    }
  },
};

// ---------------------------------------------------------------------------
const marginProp: Skill = {
  id: "m3.stat.margin-prop",
  title: "Simulation and margin of error for a proportion",
  topic: T,
  standards: ["NC.M3.S-IC.4", "NC.M3.S-IC.1"],
  prereqs: ["m3.stat.estimate"],
  lesson: {
    bigIdea: "Simulate many samples to see how much a sample proportion varies. The middle 95% of simulated results lies within about 2 standard deviations, so the margin of error is about 2 · SD.",
    explain: [
      "A random sample of 200 voters shows 58% support a new skate park. A simulation of 1,000 samples of size 200 (assuming about 58% support) gives proportions with a standard deviation of about 3.5%.",
      "Margin of error ≈ 2 · 3.5% = **7%**. The plausible range for the true support is 58% ± 7%, or **51% to 65%**.",
      "A claim that only 45% support it is outside that range, so it's not plausible. A claim of 60% is plausible.",
    ],
    visual: { type: "normal", mean: 58, sd: 3.5, shadeFrom: 51, shadeTo: 65, label: "simulated sample proportions (%)" },
  },
  why: [
    { kind: "choice", prompt: "Why does a larger sample size give a smaller margin of error?", choices: ["Larger samples vary less from sample to sample, so the simulated proportions cluster more tightly.", "Because larger samples are always more accurate by exactly 1%.", "It doesn't change the margin of error."], correct: 0, explain: "The spread of sample proportions shrinks as the sample size grows." },
    { kind: "written", prompt: "A poll says 54% of students want a longer lunch, with a margin of error of 5%. Explain what that means and whether you can conclude that a majority want it.", keyIdeas: ["plausible values are 49% to 59%", "the true percent is likely in that interval", "49% is below 50%, so a majority isn't certain"], exemplar: "The true percent of all students is plausibly between 54 − 5 = 49% and 54 + 5 = 59%. Since some plausible values are below 50%, we can't be confident a majority wants a longer lunch." },
  ],
  generate(r, lv): Problem {
    const p = r.int(30, 75), sd = r.pick([2, 2.5, 3, 3.5, 4, 4.5, 5]);
    const n = r.pick([150, 200, 250, 400]);
    const topic = r.pick(["support a later school start", "use a phone during meals", "stream music daily", "have a summer job"]);
    const m = 2 * sd;
    const vis: Visual = { type: "normal", mean: p, sd, shadeFrom: p - m, shadeTo: p + m, label: "simulated sample proportions (%)" };
    const ctx = `In a random sample of ${n} teens, ${p}% ${topic}. A simulation of 1,000 random samples of size ${n} gives sample proportions with a standard deviation of ${sd}%.`;
    if (lv === 1) {
      return {
        prompt: `${ctx} What is the margin of error (about 2 standard deviations), in percentage points?`,
        visual: vis,
        answer: num(m, { unit: "%" }),
        hints: ["About 95% of simulated proportions are within 2 standard deviations of the center.", `2 · ${sd}%.`],
        steps: [st("Margin of error ≈ 2 · SD.", `2 · ${sd}% = ${dn(m)}%`)],
        traps: traps(frac(m * 10, 10), [trap(frac(sd * 10, 10), "That's one standard deviation. Use two."), trap(frac(3 * sd * 10, 10), "The usual margin of error uses 2 standard deviations, not 3.")]),
      };
    }
    if (lv === 2) {
      return {
        prompt: `${ctx} Using a margin of error of 2 standard deviations, find the interval of plausible values for the true percent.`,
        visual: vis,
        answer: { kind: "multi", fields: [{ value: frac((p - m) * 10, 10), pre: "from", post: "%" }, { value: frac((p + m) * 10, 10), pre: "to", post: "%" }] },
        hints: [`Margin of error: 2 · ${sd}% = ${dn(m)}%.`, `Interval: ${p}% ± ${dn(m)}%.`],
        steps: [st("Margin of error.", `2 · ${sd} = ${dn(m)}`), st("Interval.", `${p} − ${dn(m)} = ${dn(p - m)}% to ${p} + ${dn(m)} = ${dn(p + m)}%`)],
      };
    }
    const claimIn = r.chance(0.5);
    const claim = claimIn ? p + r.pick([-1, 1]) * Math.floor(m - 1) : p + r.pick([-1, 1]) * Math.ceil(m + 2);
    const correct = claimIn ? `Plausible: ${claim}% is within ${p}% ± ${dn(m)}%.` : `Not plausible: ${claim}% is outside ${p}% ± ${dn(m)}%.`;
    return {
      prompt: `${ctx} A blogger claims that ${claim}% of all teens ${topic}. Is that claim plausible?`,
      visual: vis,
      answer: choice(r, correct, [
        [claimIn ? `Not plausible: ${claim}% is outside ${p}% ± ${dn(m)}%.` : `Plausible: ${claim}% is within ${p}% ± ${dn(m)}%.`, `Compute ${p} ± ${dn(m)} and check where ${claim} falls.`],
        [`Not plausible: the claim isn't exactly ${p}%.`, "A sample estimate isn't exact; values within the margin of error are plausible."],
      ]),
      hints: [`Margin of error ≈ 2 · ${sd}% = ${dn(m)}%.`, `Plausible values: ${dn(p - m)}% to ${dn(p + m)}%.`],
      steps: [st("Plausible interval.", `${dn(p - m)}% to ${dn(p + m)}%`), st("Compare.", `${claim}% is ${claimIn ? "inside" : "outside"} the interval.`), st("Conclusion.", correct)],
    };
  },
};

// ---------------------------------------------------------------------------
const marginMean: Skill = {
  id: "m3.stat.margin-mean",
  title: "Simulation and margin of error for a mean",
  topic: T,
  standards: ["NC.M3.S-IC.4", "NC.M3.S-IC.1"],
  prereqs: ["m3.stat.estimate"],
  lesson: {
    bigIdea: "To estimate a population mean, resample (simulate) many sample means. The center of the simulated means is the estimate, and about 2 standard deviations of them is the margin of error.",
    explain: [
      "A random sample of 40 students reports a mean screen time of 4.2 hours per day. Resampling 200 times gives the histogram of sample means below, centered at 4.2 with a standard deviation of about 0.15 hours.",
      "Margin of error ≈ 2 · 0.15 = **0.3 hours**, so plausible values for the true mean are **3.9 to 4.5 hours**.",
      "If the middle 95% of simulated means runs from 3.9 to 4.5, the margin of error is half that width: (4.5 − 3.9) ÷ 2 = 0.3.",
    ],
    visual: { type: "histogram", bins: normalBins(4.2, 0.15, 0.075, 200), xLabel: "simulated sample mean (hours)", yLabel: "number of simulations" },
  },
  why: [
    { kind: "choice", prompt: "Why is the margin of error half the width of the middle-95% range?", choices: ["The range runs from (estimate − margin) to (estimate + margin), so its width is twice the margin.", "Because only half the simulations count.", "It's the full width."], correct: 0, explain: "The interval is centered at the estimate and extends one margin of error each way." },
    { kind: "written", prompt: "Explain what a simulation of sample means shows that a single sample can't.", keyIdeas: ["one sample gives one estimate", "many simulated samples show how much estimates vary", "that spread gives the margin of error"], exemplar: "A single sample only gives one mean, with no sense of how far off it might be. Simulating many samples shows the range of means you'd typically get, and that spread (about 2 standard deviations) tells you the margin of error." },
  ],
  generate(r, lv): Problem {
    const ctx = r.pick([
      { what: "minutes spent on homework per night", u: "minutes", m: r.pick([45, 52, 60, 68]), sd: r.pick([2, 2.5, 3, 4]) },
      { what: "hours of sleep on school nights", u: "hours", m: r.pick([6.8, 7.1, 7.4]), sd: r.pick([0.1, 0.15, 0.2]) },
      { what: "dollars spent on food per week", u: "dollars", m: r.pick([28, 35, 42]), sd: r.pick([1.5, 2, 2.5]) },
    ]);
    const n = r.pick([30, 40, 50]);
    const vis: Visual = { type: "histogram", bins: normalBins(ctx.m, ctx.sd, ctx.sd / 2, 200), xLabel: `simulated sample mean (${ctx.u})`, yLabel: "number of simulations" };
    const marg = Number((2 * ctx.sd).toFixed(4));
    const lo = Number((ctx.m - marg).toFixed(4)), hi = Number((ctx.m + marg).toFixed(4));
    const intro = `A random sample of ${n} students gives a mean of ${ctx.m} ${ctx.what}. The histogram shows 200 simulated sample means.`;
    if (lv === 1) {
      return {
        prompt: `${intro} The middle 95% of the simulated means falls between ${dn(lo, 2)} and ${dn(hi, 2)} ${ctx.u}. What is the margin of error?`,
        visual: vis,
        answer: num(marg, { unit: ` ${ctx.u}` }),
        hints: ["The 95% range is centered at the estimate and extends one margin of error each way.", `Margin = (${dn(hi, 2)} − ${dn(lo, 2)}) ÷ 2.`],
        steps: [st("Width of the range.", `${dn(hi, 2)} − ${dn(lo, 2)} = ${dn(hi - lo, 2)}`), st("Half of it.", `${dn(hi - lo, 2)} ÷ 2 = ${dn(marg, 2)} ${ctx.u}`)],
        traps: traps(frac(Math.round(marg * 100), 100), [trap(frac(Math.round((hi - lo) * 100), 100), "That's the full width. The margin of error is half of it.")]),
      };
    }
    if (lv === 2) {
      return {
        prompt: `${intro} The simulated means have a standard deviation of ${ctx.sd} ${ctx.u}. Give the interval of plausible values for the population mean (estimate ± 2 standard deviations).`,
        visual: vis,
        answer: { kind: "multi", fields: [{ value: frac(Math.round(lo * 100), 100), pre: "from" }, { value: frac(Math.round(hi * 100), 100), pre: "to" }] },
        hints: [`Margin of error ≈ 2 · ${ctx.sd} = ${dn(marg, 2)}.`, `${ctx.m} ± ${dn(marg, 2)}.`],
        steps: [st("Margin of error.", `2 · ${ctx.sd} = ${dn(marg, 2)}`), st("Interval.", `${ctx.m} − ${dn(marg, 2)} = ${dn(lo, 2)} to ${ctx.m} + ${dn(marg, 2)} = ${dn(hi, 2)} ${ctx.u}`)],
      };
    }
    const inside = r.chance(0.5);
    const claim = Number((inside ? ctx.m + r.pick([-1, 1]) * ctx.sd : ctx.m + r.pick([-1, 1]) * 3 * ctx.sd).toFixed(2));
    const correct = inside ? `Yes. ${dn(claim, 2)} is within the plausible range ${dn(lo, 2)} to ${dn(hi, 2)}.` : `No. ${dn(claim, 2)} is outside the plausible range ${dn(lo, 2)} to ${dn(hi, 2)}.`;
    return {
      prompt: `${intro} The simulated means have a standard deviation of ${ctx.sd} ${ctx.u}. Is a population mean of ${dn(claim, 2)} ${ctx.u} plausible?`,
      visual: vis,
      answer: choice(r, correct, [
        [inside ? `No. ${dn(claim, 2)} is outside the plausible range ${dn(lo, 2)} to ${dn(hi, 2)}.` : `Yes. ${dn(claim, 2)} is within the plausible range ${dn(lo, 2)} to ${dn(hi, 2)}.`, `Compute ${ctx.m} ± 2 · ${ctx.sd} and compare.`],
        [`No. Only ${ctx.m} is plausible, because that's the sample mean.`, "The sample mean is an estimate; nearby values are plausible too."],
      ]),
      hints: [`Plausible values: ${ctx.m} ± 2 · ${ctx.sd}.`, `That's ${dn(lo, 2)} to ${dn(hi, 2)}.`],
      steps: [st("Plausible range.", `${dn(lo, 2)} to ${dn(hi, 2)} ${ctx.u}`), st("Compare.", correct)],
    };
  },
};

// ---------------------------------------------------------------------------
const randTest: Skill = {
  id: "m3.stat.rand-test",
  title: "Is the difference significant? Randomization tests",
  topic: T,
  standards: ["NC.M3.S-IC.5", "NC.M3.S-IC.3"],
  prereqs: ["m3.stat.study-type"],
  lesson: {
    bigIdea: "To test whether a treatment made a difference, pretend it didn't: reshuffle the results into two random groups many times. If a difference as big as the real one rarely shows up by chance, the result is statistically significant.",
    explain: [
      "In an experiment, 20 students who did a new study app averaged 82 on a quiz, and 20 controls averaged 76. Observed difference: 82 − 76 = **6 points**.",
      "Shuffle all 40 scores into two new groups of 20, 100 times, and record each difference. Suppose only 3 of the 100 differences are 6 or more.",
      "That's 3%. Since a difference this large happens less than about 5% of the time by chance alone, the result is **statistically significant**: the app probably helped.",
    ],
    visual: { type: "histogram", bins: normalBins(0, 2.6, 1.5, 100, 5), xLabel: "difference in means (re-randomized)", yLabel: "count" },
  },
  why: [
    { kind: "choice", prompt: "Why does the re-randomization histogram center near 0?", choices: ["Shuffling assumes the treatment has no effect, so differences are just chance and average out to 0.", "Because the real difference was 0.", "Because the groups have the same size."], correct: 0, explain: "Under the “no effect” assumption, neither group should be favored on average." },
    { kind: "written", prompt: "In a re-randomization of 200 trials, 46 differences were at least as large as the observed one. Explain what you would conclude.", keyIdeas: ["46/200 = 23% of chance results were as extreme", "that's common, not rare (well above 5%)", "the difference is not statistically significant; it could be due to random assignment"], exemplar: "46 out of 200 is 23%, so a difference that big happens often just by chance when groups are formed randomly. That's not rare, so the result isn't statistically significant: we don't have convincing evidence the treatment works." },
  ],
  generate(r, lv): Problem {
    const ctx = r.pick([
      { treat: "practiced with a typing game", ctrl: "used regular practice", y: "words per minute", w: 1 },
      { treat: "drank an electrolyte drink", ctrl: "drank water", y: "seconds in a sprint test", w: 0.2 },
      { treat: "used a spaced-repetition app", ctrl: "studied normally", y: "quiz points", w: 1 },
    ]);
    const w = ctx.w;
    const bins = normalBins(0, 2.4 * w, w, 100, 6);
    if (lv === 1) {
      const a = Number((r.int(40, 90) * w).toFixed(2)), d = Number((r.int(2, 8) * w).toFixed(2));
      const b = Number((a - d).toFixed(2));
      return {
        prompt: `Students were randomly assigned to two groups. The group that ${ctx.treat} had a mean of ${dn(a)} ${ctx.y}; the group that ${ctx.ctrl} had a mean of ${dn(b)}. What is the observed difference in means (treatment − control)?`,
        answer: num(frac(Math.round(d * 100), 100)),
        hints: ["Subtract the control group's mean from the treatment group's mean.", `${dn(a)} − ${dn(b)}.`],
        steps: [st("Difference in means.", `${dn(a)} − ${dn(b)} = ${dn(d)} ${ctx.y}`)],
        traps: traps(frac(Math.round(d * 100), 100), [trap(frac(Math.round(-d * 100), 100), "Subtract in the order treatment − control.")]),
      };
    }
    const k = r.int(2, 5);
    const obs = Number((k * w).toFixed(2));
    const count = bins.filter((b) => b.from >= obs - 1e-9).reduce((s, b) => s + b.count, 0);
    const total = bins.reduce((s, b) => s + b.count, 0);
    const prop = count / total;
    const intro = `In an experiment, the group that ${ctx.treat} beat the group that ${ctx.ctrl} by ${dn(obs)} ${ctx.y}. The histogram shows the differences from ${total} re-randomizations, assuming the treatment had no effect.`;
    const visual: Visual = { type: "histogram", bins, xLabel: `difference in means (${ctx.y})`, yLabel: "count" };
    if (lv === 2) {
      return {
        prompt: `${intro} What proportion of the re-randomized differences are at least ${dn(obs)}? Give a decimal.`,
        visual,
        answer: num(frac(count, total), { tolerance: 0.005 }),
        hints: [`Add the counts of the bars that start at ${dn(obs)} or higher.`, `Then divide by the total number of re-randomizations, ${total}.`],
        steps: [
          st("Count the extreme results.", `Bars from ${dn(obs)} up: ${bins.filter((b) => b.from >= obs - 1e-9).map((b) => b.count).join(" + ")} = ${count}`),
          st("Proportion.", `{${count}/${total}} ≈ ${dn(prop, 3)}`),
        ],
        traps: trapsTol(prop, 0.005, [[count, "That's the count. Divide by the total to get a proportion."]]),
      };
    }
    const sig = prop < 0.05;
    const correct = sig ? `Significant: only about ${dn(prop * 100, 1)}% of chance differences are this large, so the treatment likely made a difference.` : `Not significant: about ${dn(prop * 100, 1)}% of chance differences are this large, so random assignment alone could explain it.`;
    return {
      prompt: `${intro} ${count} of the ${total} re-randomized differences are ${dn(obs)} or more. What should you conclude?`,
      visual,
      answer: choice(r, correct, [
        [sig ? `Not significant: about ${dn(prop * 100, 1)}% of chance differences are this large, so random assignment alone could explain it.` : `Significant: only about ${dn(prop * 100, 1)}% of chance differences are this large, so the treatment likely made a difference.`, "Compare the proportion with 5%: below about 5% is usually called rare."],
        ["Significant, because the observed difference is greater than 0.", "Any difference can happen by chance; ask how often a difference this big happens."],
      ]),
      hints: [`Compute {${count}/${total}}.`, "A result is usually called significant if chance alone produces it less than about 5% of the time."],
      steps: [st("How rare?", `{${count}/${total}} ≈ ${dn(prop, 3)} = ${dn(prop * 100, 1)}%`), st("Compare with 5%.", sig ? "Less than 5%: rare under “no effect”." : "More than 5%: not rare under “no effect”."), st("Conclusion.", correct)],
    };
  },
};

// ---------------------------------------------------------------------------
const evaluate: Skill = {
  id: "m3.stat.evaluate",
  title: "Evaluate reports based on data",
  topic: T,
  standards: ["NC.M3.S-IC.6", "NC.M3.S-IC.3"],
  prereqs: ["m3.stat.randomization"],
  lesson: {
    bigIdea: "When you read a statistical claim, check the source, how the data were collected (random sample? experiment?), whether the conclusion matches the design, and whether the graph is honest.",
    explain: [
      "**Source:** a study paid for by a company selling the product deserves extra skepticism.",
      "**Design:** “People who drink tea live longer” from an observational study can't show the tea is the cause.",
      "**Graphs:** a bar graph whose vertical axis starts at 90 instead of 0 makes a 92 vs 96 difference look huge.",
    ],
  },
  why: [
    { kind: "choice", prompt: "A headline says “Teens who eat breakfast get better grades, so breakfast boosts grades.” The data came from a survey. Why is the conclusion questionable?", choices: ["A survey can show an association but not cause and effect; other factors could explain it.", "Because surveys are always biased.", "Because grades can't be measured."], correct: 0, explain: "Without random assignment, confounding variables (like sleep or family routines) could be the real reason." },
    { kind: "written", prompt: "A graph compares two phones' battery lives: 20 hours and 22 hours. The bars look like one is three times as tall. Explain what is probably wrong and how to fix it.", keyIdeas: ["the vertical axis probably doesn't start at 0 (truncated)", "this exaggerates a 10% difference", "start the axis at 0 so bar heights are proportional"], exemplar: "The axis likely starts near 19 instead of 0, so the bars show only the tops and a 2-hour (10%) difference looks huge. Starting the axis at 0 makes the bar heights proportional to the actual values." },
  ],
  generate(r, lv) {
    const easy: [string, string, string[]][] = [
      ["A bar graph compares average test scores of 81 and 84. The vertical axis starts at 80, so one bar looks four times as tall as the other.", "The graph exaggerates the difference because the axis doesn't start at 0.", ["The sample size is too large.", "The scores were averaged instead of added.", "Nothing; the graph is accurate."]],
      ["An energy-drink company funds a study and reports that its drink improves focus.", "The source has a financial interest in the result, which could bias how the study was run or reported.", ["Energy drinks can't be studied.", "The study must have used a random sample.", "Nothing; companies always report fairly."]],
      ["A website poll finds 85% of voters support a new law, based on 3,000 people who chose to click a link.", "It's a voluntary response sample, so it probably doesn't represent all voters.", ["3,000 people is too few to say anything.", "Percentages can't be used for polls.", "Nothing; a large sample guarantees accuracy."]],
    ];
    const hard: [string, string, string[]][] = [
      ["A news story says “Kids who play chess are better at math, so chess makes kids smarter,” based on comparing chess club members with other students.", "It's an observational study, so it can't show chess causes the difference; confounding variables are likely.", ["The sample needed to be smaller.", "Math can't be measured accurately.", "It's a valid cause-and-effect conclusion."]],
      ["A study of 8 volunteers finds a new app raised their sleep by 30 minutes and claims it works for everyone.", "The sample is tiny and not random, so the result may not generalize and could be due to chance.", ["30 minutes is too small to matter.", "Sleep should be measured in hours, not minutes.", "Nothing; any improvement proves it works."]],
      ["A survey asks, “Do you agree that our hardworking teachers deserve a raise?” and reports 90% agreement.", "The question is worded to lead people toward agreeing (response bias).", ["90% is too high to be true.", "Teachers shouldn't be surveyed.", "Nothing; wording doesn't affect answers."]],
      ["A school compares students who chose to take an SAT prep class with those who didn't and concludes the class raised scores by 60 points.", "Students chose whether to take the class, so motivated students may be in it; without random assignment, the class can't be credited.", ["60 points is too small to notice.", "The SAT changes every year.", "Nothing; the comparison proves the class works."]],
    ];
    const pool = lv === 1 ? easy : hard;
    const [text, ans, wrong] = r.pick(pool);
    if (lv === 3) {
      const fixes: Record<string, string> = {
        observational: "Randomly assign participants to the treatment and control groups.",
      };
      void fixes;
    }
    return {
      prompt: `${text} What is the biggest problem with this report?`,
      answer: choice(r, ans, wrong.map((w) => [w, "Look at the source, how the data were collected, and whether the conclusion fits the design."] as [string, string])),
      hints: ["Who collected the data, and how were subjects chosen?", "Does the conclusion claim cause and effect, and was there random assignment?"],
      steps: [st("Check the design and source.", text), st("Main problem.", ans)],
    };
  },
};

const skills: Skill[] = [studyType, randomization, estimate, marginProp, marginMean, randTest, evaluate];
export default skills;
