// Unit 1: One-variable statistics (NC.M1.S-ID.1, S-ID.2, S-ID.3).
import { choice, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { f, fiveNum, mean, med, sortNums } from "./util";

const T = "m1-one-var-stats";

// ---------- shared generators ----------

const HIST_CONTEXTS = [
  { label: "Minutes spent on homework last night", unit: "minutes", width: 10, start: 0, who: "students" },
  { label: "Points scored per game", unit: "points", width: 5, start: 0, who: "games" },
  { label: "Commute time to work (minutes)", unit: "minutes", width: 5, start: 5, who: "employees" },
  { label: "Songs streamed in one day", unit: "songs", width: 10, start: 10, who: "listeners" },
  { label: "Height of players (inches)", unit: "inches", width: 2, start: 64, who: "players" },
];

/** k positive counts that add to total (each between 1 and the cap). */
function partition(r: Parameters<Skill["generate"]>[0], k: number, total: number): number[] {
  const c = Array(k).fill(1);
  let left = total - k;
  // A rough hump: middle bins get picked more often.
  const weights = Array.from({ length: k }, (_, i) => 1 + Math.min(i, k - 1 - i) * 2);
  const wsum = weights.reduce((a, b) => a + b, 0);
  while (left > 0) {
    let t = r.int(1, wsum);
    let i = 0;
    while (t > weights[i]) { t -= weights[i]; i++; }
    c[i]++;
    left--;
  }
  return c;
}

const histogram: Skill = {
  id: "m1.stat1.histogram",
  title: "Read a histogram",
  topic: T,
  standards: ["NC.M1.S-ID.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A histogram groups data into equal-width intervals (bins); the height of each bar is how many values land in that bin.",
    explain: [
      "Each bar covers an interval such as 20 to 30. A value of exactly 30 goes in the *next* bar (30 to 40), so every value is counted once.",
      "To answer \"how many values are at least 30?\", add the heights of the bars from 30 up. To find a percent, divide by the total number of values (the sum of **all** the bar heights).",
      "Worked example: bars of 3, 7, 6 and 4 give 20 values in all. The number of values of at least 20 (the last two bars) is 6 + 4 = 10, which is {10/20} = 50% of the data.",
      "A histogram hides the exact values. You can say which bin the median is in, but not the exact median.",
    ],
    visual: { type: "histogram", bins: [{ from: 0, to: 10, count: 3 }, { from: 10, to: 20, count: 7 }, { from: 20, to: 30, count: 6 }, { from: 30, to: 40, count: 4 }], xLabel: "Minutes", yLabel: "Frequency" },
    tip: "Always find the total first. Almost every histogram question needs it.",
  },
  why: [
    { kind: "choice", prompt: "A histogram has a bar from 20 to 30 of height 6. Why can't you tell the mean of the data exactly?", choices: ["The histogram only shows how many values are in each interval, not the exact values.", "Because histograms always leave out outliers.", "Because the bars are different heights."], correct: 0, explain: "Six values somewhere between 20 and 30 could be anything in that range, so the exact sum (and mean) is unknown." },
    { kind: "written", prompt: "Explain how to find the bin that contains the median from a histogram with 25 values.", keyIdeas: ["the median is the 13th value in order", "add bar heights from the left", "the bin where the running total first reaches 13 holds the median"], exemplar: "With 25 values, the median is the 13th value when they're in order. Add up the bar heights from the left; the bar where the running total first reaches 13 or more contains the median." },
  ],
  generate(r, lv) {
    const ctx = r.pick(HIST_CONTEXTS);
    const k = r.int(5, 6);
    const total = lv === 1 ? r.int(15, 30) : r.pick([20, 25, 40, 50]);
    let counts = partition(r, k, total);
    const bins = counts.map((count, i) => ({ from: ctx.start + i * ctx.width, to: ctx.start + (i + 1) * ctx.width, count }));
    const visual: Visual = { type: "histogram", bins, xLabel: ctx.label, yLabel: "Frequency" };
    const totalStep = st("Find the total.", `${counts.join(" + ")} = ${total} ${ctx.who}`);
    if (lv === 1) {
      const i = r.int(0, k - 1);
      const b = bins[i];
      if (r.chance(0.5)) {
        return {
          prompt: `The histogram shows data for some ${ctx.who}. How many ${ctx.who} are in the interval from ${b.from} up to ${b.to}?`,
          visual,
          answer: num(b.count),
          hints: ["Find the bar that starts at " + b.from + " and ends at " + b.to + ".", "Read the height of that bar on the frequency axis."],
          steps: [st("Find the bar.", `The bar from ${b.from} to ${b.to}.`), st("Read its height.", `It reaches ${b.count}, so ${b.count} ${ctx.who}.`)],
          traps: traps(frac(b.count), [trap(total, "That's the total for the whole histogram. The question asks about one bar."), trap(b.from, "That's where the bar starts on the horizontal axis. Read the height instead.")]),
        };
      }
      return {
        prompt: `The histogram shows data for some ${ctx.who}. How many ${ctx.who} are represented in all?`,
        visual,
        answer: num(total),
        hints: ["Each bar's height is a count of " + ctx.who + ".", "Add the heights of all the bars."],
        steps: [st("Read each bar's height.", counts.join(", ")), totalStep],
        traps: traps(frac(total), [trap(k, "That's the number of bars, not the number of data values. Add the bar heights.")]),
      };
    }
    if (lv === 2) {
      const cut = r.int(1, k - 1);
      const x = bins[cut].from;
      const atLeast = counts.slice(cut).reduce((a, b) => a + b, 0);
      const below = total - atLeast;
      const askPct = r.chance(0.5);
      const askAbove = r.chance(0.5);
      const part = askAbove ? atLeast : below;
      const phrase = askAbove ? `at least ${x} ${ctx.unit}` : `less than ${x} ${ctx.unit}`;
      const barsUsed = askAbove ? counts.slice(cut) : counts.slice(0, cut);
      if (askPct) {
        const pct = (part / total) * 100;
        return {
          prompt: `The histogram shows data for ${total} ${ctx.who}. What percent of them had ${phrase}?`,
          visual,
          answer: num(pct, { unit: "%" }),
          hints: [`Which bars are ${askAbove ? `at ${x} or to the right of it` : `to the left of ${x}`}?`, `Add those bars, then divide by the total, ${total}, and multiply by 100.`],
          steps: [st("Pick the bars.", `${askAbove ? `The bars starting at ${x} and above` : `The bars below ${x}`}: ${barsUsed.join(" + ")} = ${part}.`), totalStep, st("Find the percent.", `{${part}/${total}} = ${f(part / total)} = ${f(pct)}%`)],
          traps: traps(frac(pct), [trap(part, "That's the count. Turn it into a percent of the total."), trap(100 - pct, `That's the percent ${askAbove ? "below" : "at or above"} ${x}. Check which side the question asks about.`)]),
        };
      }
      return {
        prompt: `Based on the histogram, how many ${ctx.who} had ${phrase}?`,
        visual,
        answer: num(part),
        hints: [`A value of exactly ${x} belongs to the bar that *starts* at ${x}.`, `Add the heights of the bars ${askAbove ? `from ${x} up` : `below ${x}`}.`],
        steps: [st("Pick the bars.", askAbove ? `Bars from ${x} up.` : `Bars that end at or before ${x}.`), st(barsUsed.length > 1 ? "Add their heights." : "Read its height.", barsUsed.length > 1 ? `${barsUsed.join(" + ")} = ${part}` : `${part}`)],
        traps: traps(frac(part), [trap(total - part, `That counts the other side of ${x}.`), ...(barsUsed.length > 1 ? [trap(askAbove ? atLeast - counts[cut] : below - counts[cut - 1], "You left out one bar at the edge. A value of exactly " + x + " goes in the bar starting at " + x + ".")] : [])]),
      };
    }
    // Level 3: which bin holds the median?
    let tries = 0;
    let mi = 0;
    for (;;) {
      const lowPos = Math.ceil(total / 2), highPos = Math.floor(total / 2) + 1;
      const binOf = (pos: number) => { let run = 0; for (let i = 0; i < k; i++) { run += counts[i]; if (run >= pos) return i; } return k - 1; };
      if (binOf(lowPos) === binOf(total % 2 ? lowPos : highPos) || tries > 30) { mi = binOf(lowPos); break; }
      counts = partition(r, k, total);
      tries++;
    }
    const bins2 = counts.map((count, i) => ({ from: ctx.start + i * ctx.width, to: ctx.start + (i + 1) * ctx.width, count }));
    const labels = bins2.map((b) => `${b.from} to ${b.to}`);
    const running: number[] = [];
    counts.reduce((a, c) => { running.push(a + c); return a + c; }, 0);
    const pos = total % 2 ? `the ${(total + 1) / 2}th value` : `the average of the ${total / 2}th and ${total / 2 + 1}th values`;
    const modeBin = counts.indexOf(Math.max(...counts));
    return {
      prompt: `The histogram shows data for ${total} ${ctx.who}. Which interval contains the median?`,
      visual: { type: "histogram", bins: bins2, xLabel: ctx.label, yLabel: "Frequency" },
      answer: choice(r, labels[mi], labels.map((l, i) => ({ l, i })).filter((o) => o.i !== mi).map((o) => [o.l, o.i === modeBin ? "That's the tallest bar (the most common interval), not necessarily the middle value." : "Count values from the left: the median is the middle one in order."] as [string, string]), true),
      hints: [`With ${total} values, the median is ${pos}.`, "Keep a running total of the bar heights from the left until you reach that position."],
      steps: [st("Locate the middle position.", `${total} values, so the median is ${pos}.`), st("Running totals from the left.", running.map((t, i) => `${labels[i]}: ${t}`).join("; ")), st("Find where the middle falls.", `The running total first reaches the middle position in the ${labels[mi]} bar.`)],
    };
  },
};

// ---------- five-number summary ----------

const DATA_CONTEXTS = [
  { what: "quiz scores", lo: 8, hi: 30 },
  { what: "numbers of texts sent in an hour", lo: 2, hi: 40 },
  { what: "minutes of a workout", lo: 15, hi: 60 },
  { what: "ages of people at a concert", lo: 14, hi: 45 },
  { what: "game scores", lo: 20, hi: 90 },
];

function dataList(r: Parameters<Skill["generate"]>[0], n: number, lo: number, hi: number): number[] {
  return Array.from({ length: n }, () => r.int(lo, hi));
}

const fiveNumber: Skill = {
  id: "m1.stat1.five-number",
  title: "Five-number summary and IQR",
  topic: T,
  standards: ["NC.M1.S-ID.1", "NC.M1.S-ID.2"],
  prereqs: [],
  lesson: {
    bigIdea: "Sort the data, find the median, then find the median of each half: those are Q1 and Q3. The IQR = Q3 − Q1 is the spread of the middle half.",
    explain: [
      "The five-number summary is **minimum, Q1, median, Q3, maximum**. It is exactly what a box plot draws.",
      "Example: 4, 7, 8, 10, 12, 15, 21 (already sorted, 7 values). The median is the 4th value, 10. The lower half is 4, 7, 8, so Q1 = 7. The upper half is 12, 15, 21, so Q3 = 15.",
      "When the count is odd, leave the median out of both halves. When it's even, split the list right down the middle.",
      "IQR = Q3 − Q1 = 15 − 7 = 8: the middle 50% of the data spans 8 units. The range, max − min = 17, uses only the two most extreme values.",
    ],
    visual: { type: "boxplot", min: 4, q1: 7, median: 10, q3: 15, max: 21, scaleMin: 0, scaleMax: 25 },
    tip: "Sorting is where most mistakes happen. Count your sorted list to make sure no value went missing.",
  },
  why: [
    { kind: "choice", prompt: "Why is the IQR often a better measure of spread than the range?", choices: ["It only uses the middle half, so one extreme value can't change it much.", "It is always bigger than the range.", "It uses every data value equally."], correct: 0, explain: "The range depends entirely on the two most extreme values; the IQR ignores the top and bottom quarters." },
    { kind: "written", prompt: "Explain why the data must be sorted before you find the median.", keyIdeas: ["the median is the middle value in order", "the middle of an unsorted list is just a random value", "half the data should be below and half above"], exemplar: "The median is the value with half the data below it and half above. That only works if the values are in order; the middle of an unsorted list could be any value." },
  ],
  generate(r, lv) {
    const ctx = r.pick(DATA_CONTEXTS);
    const n = lv === 1 ? r.pick([7, 9]) : lv === 2 ? r.pick([8, 10, 12]) : r.pick([11, 12, 13]);
    const data = dataList(r, n, ctx.lo, ctx.hi);
    const s = fiveNum(data);
    const listText = data.join(", ");
    const sortStep = st("Sort the data.", s.sorted.join(", "));
    const medStep = st("Find the median.", n % 2 ? `${n} values: the middle one is the ${(n + 1) / 2}th, ${f(s.median)}.` : `${n} values: average the ${n / 2}th and ${n / 2 + 1}th values, (${s.sorted[n / 2 - 1]} + ${s.sorted[n / 2]}) ÷ 2 = ${f(s.median)}.`);
    const halfSteps = [
      st("Find Q1, the median of the lower half.", `${s.lower.join(", ")} → Q1 = ${f(s.q1)}`),
      st("Find Q3, the median of the upper half.", `${s.upper.join(", ")} → Q3 = ${f(s.q3)}`),
    ];
    if (lv < 3) {
      return {
        prompt: `Here are ${n} ${ctx.what}: ${listText}. Find Q1, the median and Q3.`,
        answer: { kind: "multi", fields: [{ value: frac(s.q1), pre: "Q1 =" }, { value: frac(s.median), pre: "Median =" }, { value: frac(s.q3), pre: "Q3 =" }] },
        hints: ["Put the values in order from least to greatest first.", n % 2 ? "The count is odd, so the median is a data value. Leave it out of both halves." : "The count is even, so the median is the average of the two middle values. Split the list exactly in half.", "Q1 and Q3 are the medians of the lower and upper halves."],
        steps: [sortStep, medStep, ...halfSteps],
      };
    }
    const iqr = s.q3 - s.q1;
    return {
      prompt: `Here are ${n} ${ctx.what}: ${listText}. What is the interquartile range (IQR)?`,
      answer: num(frac(Math.round(iqr * 2), 2)),
      hints: ["Sort the data, then find the median.", "Find Q1 and Q3 as the medians of the lower and upper halves.", "IQR = Q3 − Q1."],
      steps: [sortStep, medStep, ...halfSteps, st("Subtract.", `IQR = ${f(s.q3)} − ${f(s.q1)} = ${f(iqr)}`)],
      traps: traps(frac(Math.round(iqr * 2), 2), [trap(s.max - s.min, "That's the range (max − min). The IQR uses Q3 − Q1."), trap(frac(Math.round((s.q3 - s.median) * 2), 2), "That's Q3 − median, only the upper quarter. Use Q3 − Q1.")]),
    };
  },
};

// ---------- box plots ----------

const boxplotRead: Skill = {
  id: "m1.stat1.boxplot",
  title: "Read a box plot",
  topic: T,
  standards: ["NC.M1.S-ID.1"],
  prereqs: ["m1.stat1.five-number"],
  lesson: {
    bigIdea: "A box plot splits the data into four parts with about 25% of the values in each: whisker, half-box, half-box, whisker.",
    explain: [
      "Read the five numbers from left to right: minimum, Q1 (left edge of the box), median (line inside), Q3 (right edge), maximum.",
      "About 25% of the values are below Q1, 50% are below the median, and 75% are below Q3. The box holds the middle 50%.",
      "Worked example: in the plot shown, the IQR is 30 − 18 = 12 and the range is 42 − 10 = 32. If 80 students are in the data, about 25% of 80 = **20** scored above 30.",
      "A long whisker or a long half of the box means the values are more spread out there, not that there are more of them.",
    ],
    visual: { type: "boxplot", min: 10, q1: 18, median: 24, q3: 30, max: 42, scaleMin: 0, scaleMax: 50 },
  },
  why: [
    { kind: "choice", prompt: "The right whisker of a box plot is much longer than the left whisker. What does that tell you?", choices: ["The top 25% of values are more spread out than the bottom 25%.", "There are more values in the top 25%.", "The mean is lower than the median."], correct: 0, explain: "Each whisker holds about 25% of the data; a longer one means those values cover a wider range." },
    { kind: "written", prompt: "Explain why about half of the data lies inside the box of a box plot.", keyIdeas: ["the box runs from Q1 to Q3", "25% of values are below Q1 and 25% above Q3", "so 50% are between them"], exemplar: "The box goes from Q1 to Q3. A quarter of the data is below Q1 and a quarter is above Q3, so the remaining half is between Q1 and Q3, inside the box." },
  ],
  generate(r, lv) {
    const step = r.pick([1, 2, 5]);
    const base = r.int(0, 6) * step;
    const g = [r.int(2, 6), r.int(1, 5), r.int(1, 5), r.int(2, 7)].map((x) => x * step);
    const min = base, q1 = min + g[0], md = q1 + g[1], q3 = md + g[2], max = q3 + g[3];
    const pad = step * 2;
    const visual: Visual = { type: "boxplot", min, q1, median: md, q3, max, scaleMin: Math.max(0, Math.floor((min - pad) / (5 * step)) * 5 * step), scaleMax: Math.ceil((max + pad) / (5 * step)) * 5 * step };
    const what = r.pick(["scores on a test", "hours of sleep logged by a group of students", "prices of concert tickets (dollars)", "minutes spent gaming per day"]);
    if (lv === 1) {
      const ask = r.pick(["median", "IQR", "range"] as const);
      const ans = ask === "median" ? md : ask === "IQR" ? q3 - q1 : max - min;
      return {
        prompt: `The box plot shows ${what}. What is the ${ask === "median" ? "median" : ask === "IQR" ? "interquartile range (IQR)" : "range"}?`,
        visual,
        answer: num(ans),
        hints: ["Read the five numbers: min, Q1, median, Q3, max.", ask === "median" ? "The median is the line inside the box." : ask === "IQR" ? "IQR = Q3 − Q1: the width of the box." : "Range = max − min: the full length from whisker tip to whisker tip."],
        steps: [st("Read the five-number summary.", `min ${min}, Q1 ${q1}, median ${md}, Q3 ${q3}, max ${max}`), st(ask === "median" ? "The median is the middle line." : ask === "IQR" ? "Subtract the box edges." : "Subtract the whisker ends.", ask === "median" ? `${md}` : ask === "IQR" ? `${q3} − ${q1} = ${q3 - q1}` : `${max} − ${min} = ${max - min}`)],
        traps: traps(frac(ans), [trap(max - min, "That's the range (max − min)."), trap(q3 - q1, "That's the IQR (Q3 − Q1)."), trap(md, "That's the median."), trap(q3 - md, "That's only the right half of the box.")]),
      };
    }
    const regions = [
      { text: `less than ${q1}`, pct: 25 },
      { text: `greater than ${md}`, pct: 50 },
      { text: `between ${q1} and ${q3}`, pct: 50 },
      { text: `greater than ${q1}`, pct: 75 },
      { text: `less than ${q3}`, pct: 75 },
      { text: `greater than ${q3}`, pct: 25 },
      { text: `between ${md} and ${max}`, pct: 50 },
      { text: `between ${min} and ${q3}`, pct: 75 },
    ];
    const reg = r.pick(regions);
    const pieceSteps = st("Each section holds about 25%.", `min to Q1, Q1 to median, median to Q3, Q3 to max: four quarters.`);
    if (lv === 2) {
      return {
        prompt: `The box plot shows ${what}. About what percent of the values are ${reg.text}?`,
        visual,
        answer: num(reg.pct, { unit: "%" }),
        hints: ["A box plot splits the data into four sections with about 25% each.", "Count how many sections the interval covers."],
        steps: [st("Read the five-number summary.", `min ${min}, Q1 ${q1}, median ${md}, Q3 ${q3}, max ${max}`), pieceSteps, st("Count the sections.", `${reg.text}: ${reg.pct / 25} section${reg.pct === 25 ? "" : "s"} → ${reg.pct}%`)],
        traps: traps(frac(reg.pct), [trap(100 - reg.pct, "That's the percent on the other side."), trap(reg.pct === 50 ? 25 : 50, "Count the quarters again: whiskers and half-boxes each hold about 25%.")]),
      };
    }
    const N = r.pick([40, 60, 80, 120, 200]);
    const count = (reg.pct / 100) * N;
    return {
      prompt: `The box plot summarizes ${N} ${what}. About how many of the values are ${reg.text}?`,
      visual,
      answer: num(count),
      hints: ["First decide what percent of the data lies in that interval.", `Then take that percent of ${N}.`],
      steps: [pieceSteps, st("Find the percent.", `${reg.text}: about ${reg.pct}%`), st("Take that percent of the total.", `${reg.pct}% of ${N} = ${count}`)],
      traps: traps(frac(count), [trap(reg.pct, "That's the percent. The question asks for a number of values."), trap(N - count, "That's the count on the other side.")]),
    };
  },
};

// ---------- mean and standard deviation ----------

const SD_PATTERNS: { dev: number[]; sd: number }[] = [
  { dev: [-1, -1, 1, 1], sd: 1 },
  { dev: [-5, 1, 1, 3], sd: 3 },
  { dev: [-3, -1, 0, 1, 3], sd: 2 },
  { dev: [-4, 1, 1, 1, 1], sd: 2 },
  { dev: [4, -1, -1, -1, -1], sd: 2 },
  { dev: [-5, -1, -1, 1, 1, 5], sd: 3 },
  { dev: [-1, -1, -1, 1, 1, 1], sd: 1 },
  { dev: [-7, -1, 1, 7], sd: 5 },
];

const meanSd: Skill = {
  id: "m1.stat1.mean-sd",
  title: "Mean and standard deviation",
  topic: T,
  standards: ["NC.M1.S-ID.2"],
  prereqs: [],
  lesson: {
    bigIdea: "The standard deviation measures the typical distance of the values from the mean: average the squared distances, then take the square root.",
    explain: [
      "Mean: add the values and divide by how many there are.",
      "Standard deviation (σ): find each value's deviation from the mean, square each one, average the squares, then take the square root. Squaring stops the positive and negative deviations from canceling out.",
      "Worked example: 6, 8, 10, 12, 14. The mean is 50 ÷ 5 = 10. Deviations −4, −2, 0, 2, 4. Squares 16, 4, 0, 4, 16, which average to 40 ÷ 5 = 8. So σ = √8 ≈ 2.83.",
      "Calculators show two versions: σx (divide by n, used here) and Sx (divide by n − 1, for samples). On the EOC, use your calculator's 1-Var Stats and read the one the question asks for.",
    ],
    tip: "Adding the same number to every value shifts the mean but leaves the standard deviation alone. Multiplying every value by k multiplies both by k.",
  },
  why: [
    { kind: "choice", prompt: "Why are the deviations squared before averaging?", choices: ["Positive and negative deviations would cancel out and always add to zero.", "Squaring makes the numbers whole.", "Because the mean is always squared."], correct: 0, explain: "Deviations from the mean always sum to 0, so their plain average is useless; squaring makes every distance count." },
    { kind: "written", prompt: "Data set A is 48, 50, 52 and data set B is 30, 50, 70. Explain which has the larger standard deviation without calculating.", keyIdeas: ["both have mean 50", "B's values are much farther from the mean", "so B has the larger standard deviation"], exemplar: "Both sets have a mean of 50. In A every value is within 2 of 50, but in B two values are 20 away. Standard deviation measures typical distance from the mean, so B's is larger." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const m0 = r.int(10, 40) * 2, s0 = r.int(2, 9);
      const ctx = r.pick([
        { who: "A teacher", what: "test scores", how: "adds", k: r.int(3, 8), unit: "points to every score" },
        { who: "A store", what: "prices", how: "adds", k: r.int(2, 6), unit: "dollars to every price" },
        { who: "A coach", what: "practice times", how: "doubles", k: 2, unit: "every time" },
        { who: "A scientist", what: "measurements", how: "triples", k: 3, unit: "every measurement" },
      ]);
      const adds = ctx.how === "adds";
      const m1 = adds ? m0 + ctx.k : m0 * ctx.k, s1 = adds ? s0 : s0 * ctx.k;
      return {
        prompt: `A set of ${ctx.what} has mean ${m0} and standard deviation ${s0}. ${ctx.who} ${ctx.how} ${adds ? ctx.k + " " : ""}${ctx.unit}. Find the new mean and new standard deviation.`,
        answer: { kind: "multi", fields: [{ value: frac(m1), pre: "Mean =" }, { value: frac(s1), pre: "SD =" }] },
        hints: ["Think about what happens to the center: every value moves the same way.", adds ? "Adding a constant slides every value over. Do the distances between values change?" : "Multiplying stretches the data. Distances from the mean get multiplied too."],
        steps: [st("The mean changes the same way each value does.", adds ? `${m0} + ${ctx.k} = ${m1}` : `${m0} × ${ctx.k} = ${m1}`), st("The spread.", adds ? `Every value shifts by ${ctx.k}, so the distances from the mean don't change: SD stays ${s0}.` : `Every distance from the mean is multiplied by ${ctx.k}: ${s0} × ${ctx.k} = ${s1}.`)],
      };
    }
    const pats = SD_PATTERNS.filter((p) => (lv === 1 ? p.dev.length === 4 : p.dev.length >= 5));
    const p = r.pick(pats);
    const scale = r.pick([1, 1, 2]);
    const mu = r.int(16, 40);
    const data = r.shuffle(p.dev.map((d) => mu + d * scale));
    const sd = p.sd * scale;
    const devs = data.map((x) => x - mu);
    const sq = devs.map((d) => d * d);
    const ctx = r.pick(["hours worked by part-time employees", "points scored in recent games", "minutes of daily exercise", "phones charged per hour at a kiosk"]);
    return {
      prompt: `Here are ${data.length} values (${ctx}): ${data.map(f).join(", ")}. Find the mean and the standard deviation σ (divide by n).`,
      answer: { kind: "multi", fields: [{ value: frac(mu), pre: "Mean =" }, { value: frac(sd), pre: "σ =" }] },
      hints: ["Mean = sum ÷ number of values.", "Subtract the mean from each value, then square each deviation.", `Average the squared deviations (divide by ${data.length}), then take the square root.`],
      steps: [
        st("Find the mean.", `(${data.map(f).join(" + ")}) ÷ ${data.length} = ${data.reduce((a, b) => a + b, 0)} ÷ ${data.length} = ${mu}`),
        st("Find each deviation from the mean.", devs.map(f).join(", ")),
        st("Square them.", sq.join(", ")),
        st("Average the squares.", `(${sq.join(" + ")}) ÷ ${data.length} = ${sq.reduce((a, b) => a + b, 0)} ÷ ${data.length} = ${sd * sd}`),
        st("Take the square root.", `σ = √${sd * sd} = ${sd}`),
      ],
    };
  },
};

// ---------- shape and choosing statistics ----------

const RIGHT_PATTERNS = [[4, 6, 3, 2, 1, 0, 1, 0, 1], [2, 5, 5, 3, 1, 1, 0, 0, 1], [3, 6, 4, 2, 1, 0, 0, 1]];
const SYM_PATTERNS = [[1, 2, 3, 4, 3, 2, 1], [1, 3, 4, 4, 3, 1], [2, 3, 5, 3, 2]];

function shapedData(r: Parameters<Skill["generate"]>[0], shape: "right" | "left" | "symmetric", start: number): number[] {
  const pat = shape === "symmetric" ? r.pick(SYM_PATTERNS) : shape === "right" ? r.pick(RIGHT_PATTERNS) : [...r.pick(RIGHT_PATTERNS)].reverse();
  const out: number[] = [];
  pat.forEach((c, i) => { for (let k = 0; k < c; k++) out.push(start + i); });
  return out;
}

const shapeCenter: Skill = {
  id: "m1.stat1.shape-center",
  title: "Shape, center and the right statistics",
  topic: T,
  standards: ["NC.M1.S-ID.2", "NC.M1.S-ID.3"],
  prereqs: ["m1.stat1.five-number", "m1.stat1.mean-sd"],
  lesson: {
    bigIdea: "For roughly symmetric data use the mean and standard deviation; for skewed data or data with outliers use the median and IQR.",
    explain: [
      "**Skewed right** means a long tail toward the high values (most values are low, a few are much higher). **Skewed left** is the mirror image.",
      "The mean gets pulled toward the tail, but the median barely moves. So in right-skewed data the mean is usually **greater** than the median; in left-skewed data it's usually less.",
      "Worked example: house prices in a town are skewed right by a few mansions. The median price describes a typical house better than the mean, and the IQR describes the spread better than the standard deviation.",
    ],
    visual: { type: "dotplot", values: [1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 6, 8], min: 0, max: 9, label: "Hours of video watched per day" },
    tip: "The tail tells you the direction: name the skew after the side the tail points to.",
  },
  why: [
    { kind: "choice", prompt: "Why is the median a better center than the mean for data that is strongly skewed?", choices: ["The median depends on the middle position, so extreme values in the tail don't pull it.", "The median is always larger than the mean.", "The mean can't be calculated for skewed data."], correct: 0, explain: "The mean uses the size of every value, so a long tail drags it; the median only cares about order." },
    { kind: "written", prompt: "The mean salary at a small company is $95,000 but the median is $52,000. Explain what that suggests about the data.", keyIdeas: ["the mean is much greater than the median", "a few very high salaries pull the mean up", "the data is skewed right"], exemplar: "The mean is far above the median, which means a few very large salaries (probably the owners) pull the mean up. The data is skewed right, so the median of $52,000 better describes a typical worker." },
  ],
  generate(r, lv) {
    const shape = r.pick(["right", "left", "symmetric"] as const);
    const ctxs = {
      right: ["Number of concerts attended last year", "Hours of overtime worked per week", "Number of pets owned"],
      left: ["Questions correct on an easy 12-question quiz", "Days out of 12 the bus was on time", "Songs out of 12 a fan could sing along to"],
      symmetric: ["Heights of plants (cm)", "Shoe sizes in a class", "Number of free throws made out of 15"],
    };
    const label = r.pick(ctxs[shape]);
    const start = shape === "left" ? r.int(1, 3) : r.int(0, 4);
    const values = shapedData(r, shape, start);
    const min = start - 1, max = Math.max(...values) + 1;
    const visual: Visual = { type: "dotplot", values, min, max, label };
    const shapeName = shape === "symmetric" ? "Roughly symmetric" : `Skewed ${shape}`;
    const m = mean(values), md = med(values);
    if (lv === 1) {
      return {
        prompt: "Which best describes the shape of the distribution in the dot plot?",
        visual,
        answer: choice(r, shapeName, [
          ...(shape !== "right" ? [["Skewed right", "A right skew has its long tail on the high (right) side."] as [string, string]] : []),
          ...(shape !== "left" ? [["Skewed left", "A left skew has its long tail on the low (left) side."] as [string, string]] : []),
          ...(shape !== "symmetric" ? [["Roughly symmetric", "One side has a long tail, so the two halves aren't mirror images."] as [string, string]] : []),
          ["Uniform", "Uniform means every value appears about equally often. Look at the heights of the stacks."],
        ]),
        hints: ["Find where most of the dots pile up.", "Is there a long tail of a few dots stretching out to one side? Name the skew after the tail's side."],
        steps: [st("Find the peak.", "Most of the dots pile up " + (shape === "right" ? "on the left (low values)." : shape === "left" ? "on the right (high values)." : "in the middle.")), st("Look for a tail.", shape === "symmetric" ? "Both sides fall off about the same way, so it's roughly symmetric." : `A thin tail stretches to the ${shape}, so it's skewed ${shape}.`)],
      };
    }
    if (lv === 2) {
      const good = shape === "symmetric" ? "Mean and standard deviation" : "Median and interquartile range";
      return {
        prompt: `The dot plot shows "${label}". Which measures of center and spread best summarize this data?`,
        visual,
        answer: choice(r, good, [
          [shape === "symmetric" ? "Median and interquartile range" : "Mean and standard deviation", shape === "symmetric" ? "Those work too, but for symmetric data without outliers the mean and standard deviation are the usual choice." : "The tail would pull the mean and inflate the standard deviation."],
          ["Mean and range", "The range depends only on the two extremes; it is rarely the best spread measure."],
          ["Mode and range", "The mode and range ignore most of the data."],
        ]),
        hints: ["First decide whether the data is symmetric or skewed.", "Skewed data or outliers call for statistics that resist extreme values (median, IQR)."],
        steps: [st("Describe the shape.", shapeName + "."), st("Choose the statistics.", shape === "symmetric" ? "Symmetric with no outliers: the mean and standard deviation describe it well." : "Skewed: the tail pulls the mean, so use the median and IQR.")],
      };
    }
    const rel = Math.abs(m - md) < 0.05 ? "about equal to" : m > md ? "greater than" : "less than";
    return {
      prompt: "Without calculating exactly, how does the mean of this data compare with its median?",
      visual,
      answer: choice(r, `The mean is ${rel} the median`, ["greater than", "less than", "about equal to"].filter((x) => x !== rel).map((x) => [`The mean is ${x} the median`, shape === "symmetric" ? "The data is balanced, so the mean and median sit close together." : `The long tail on the ${shape} pulls the mean toward it.`] as [string, string])),
      hints: ["The mean is pulled toward a long tail; the median stays near the bulk of the data.", "Which way does the tail point?"],
      steps: [st("Describe the shape.", shapeName + "."), st("Compare.", shape === "symmetric" ? `Balanced data: mean ≈ median (here mean ≈ ${f(Math.round(m * 10) / 10)}, median = ${f(md)}).` : `The tail pulls the mean ${shape === "right" ? "up" : "down"}: mean ≈ ${f(Math.round(m * 10) / 10)}, median = ${f(md)}.`)],
    };
  },
};

// ---------- comparing two data sets ----------

const compare: Skill = {
  id: "m1.stat1.compare",
  title: "Compare two data sets",
  topic: T,
  standards: ["NC.M1.S-ID.2"],
  prereqs: ["m1.stat1.shape-center"],
  lesson: {
    bigIdea: "Compare data sets on both center (which is typically higher) and spread (which is more consistent), using statistics that fit their shapes.",
    explain: [
      "A smaller standard deviation or IQR means the values are more **consistent** (closer together). A larger center means typically higher values.",
      "Worked example: Team A's points per game have mean 62, SD 4; Team B's have mean 65, SD 11. B scores more on average, but A is more consistent.",
      "If either data set is skewed or has outliers, compare medians and IQRs instead of means and standard deviations.",
    ],
    visual: { type: "table", headers: ["", "Mean", "SD"], rows: [["Team A", 62, 4], ["Team B", 65, 11]] },
  },
  why: [
    { kind: "choice", prompt: "Two classes have the same mean test score, but Class 1 has SD 3 and Class 2 has SD 12. What can you conclude?", choices: ["Class 1's scores are bunched closer to the mean.", "Class 2 did better overall.", "Class 1 has more students."], correct: 0, explain: "Same center; the smaller SD means less spread." },
    { kind: "written", prompt: "A coach must pick one of two runners for a race where steady times matter most. Explain which statistic should guide the choice and why.", keyIdeas: ["a measure of spread (SD or IQR)", "smaller spread means more consistent times", "pick the runner with the smaller spread if centers are similar"], exemplar: "The coach should compare spread, like the standard deviation of each runner's times. The runner with the smaller SD runs more consistent times, which is what the coach wants, as long as the average times are close." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const ctx = r.pick([
        { what: "points per game", A: "Team Red", B: "Team Blue" },
        { what: "minutes per pizza delivery", A: "Store A", B: "Store B" },
        { what: "daily tips (dollars)", A: "Ava", B: "Diego" },
        { what: "100 m sprint times (tenths of a second over 12 s)", A: "Kai", B: "Nora" },
      ]);
      const { A, B } = ctx;
      const mA = r.int(20, 85), mB = mA + r.nonzero(-6, 6);
      const sA = r.int(2, 12);
      let sB = r.int(2, 12);
      if (sA === sB) sB += 3;
      const askSpread = r.chance(0.5);
      const consistent = sA < sB ? A : B, higher = mA > mB ? A : B;
      const correct = askSpread ? consistent : higher;
      return {
        prompt: `The table summarizes ${ctx.what} for ${A} and ${B}. Both distributions are roughly symmetric. ${askSpread ? "Whose values are more consistent?" : "Whose values are typically higher?"}`,
        visual: { type: "table", headers: ["", "Mean", "Standard deviation"], rows: [[A, mA, sA], [B, mB, sB]] },
        answer: choice(r, correct, [[correct === A ? B : A, askSpread ? "More consistent means less spread: the smaller standard deviation." : "Typical value is about center: compare the means."]], true),
        hints: [askSpread ? "Consistency is about spread." : "Typical value is about center.", askSpread ? "Compare the standard deviations: smaller means more consistent." : "Compare the means."],
        steps: [st(askSpread ? "Compare the spreads." : "Compare the centers.", askSpread ? `SD ${sA} vs ${sB}.` : `Mean ${mA} vs ${mB}.`), st("Conclude.", askSpread ? `${consistent} has the smaller SD, so the values are more consistent.` : `${higher} has the higher mean.`)],
      };
    }
    if (lv === 2) {
      const [A, B] = r.pick([["Team Red", "Team Blue"], ["Group A", "Group B"], ["Juniors", "Seniors"]]);
      const n = 7;
      const a = Array.from({ length: n }, () => r.int(10, 40));
      let b = Array.from({ length: n }, () => r.int(15, 45));
      while (med(b) === med(a)) b = Array.from({ length: n }, () => r.int(15, 45));
      const MA = med(a), MB = med(b);
      const diff = Math.abs(MA - MB);
      return {
        prompt: `Minutes of practice logged by members of two groups are shown in the table. By how much do the two medians differ?`,
        visual: { type: "table", headers: ["Group", "Minutes"], rows: [[A, a.join(", ")], [B, b.join(", ")]] },
        answer: num(diff),
        hints: ["Sort each list separately.", "With 7 values, the median is the 4th value in order.", "Subtract the smaller median from the larger."],
        steps: [st(`Sort ${A}.`, `${sortNums(a).join(", ")} → median ${MA}`), st(`Sort ${B}.`, `${sortNums(b).join(", ")} → median ${MB}`), st("Subtract.", `${Math.max(MA, MB)} − ${Math.min(MA, MB)} = ${diff}`)],
        traps: traps(frac(diff), [trap(Math.abs(a[3] - b[3]), "Those are the middle values of the unsorted lists. Sort first."), trap(frac(Math.round(Math.abs(mean(a) - mean(b)) * 100), 100), "That's the difference of the means, not the medians.")]),
      };
    }
    // Level 3: one set skewed with an outlier. Which comparison is appropriate?
    const ctx = r.pick([
      { what: "weekly earnings from a side job (dollars)", A: "Maya", B: "Theo" },
      { what: "followers gained per week", A: "Account A", B: "Account B" },
      { what: "minutes spent commuting", A: "Route 1", B: "Route 2" },
    ]);
    const skewFirst = r.chance(0.5);
    const medS = r.int(30, 50), medY = medS + r.nonzero(-5, 5);
    const iqrY = r.int(6, 12), iqrS = iqrY + r.int(3, 8);
    const meanS = medS + r.int(8, 15), sdS = r.int(15, 25);
    const meanY = medY + r.pick([-1, 0, 1]), sdY = Math.round(iqrY * 0.75);
    const skewName = skewFirst ? ctx.A : ctx.B, symName = skewFirst ? ctx.B : ctx.A;
    const rowS: (string | number)[] = [skewName, meanS, medS, sdS, iqrS], rowY: (string | number)[] = [symName, meanY, medY, sdY, iqrY];
    const correct = `Compare medians and IQRs: ${symName} has less spread in the middle half.`;
    return {
      prompt: `The table summarizes ${ctx.what} for ${ctx.A} and ${ctx.B}. ${skewName}'s data is strongly skewed right with an outlier; ${symName}'s is roughly symmetric. Which comparison is most appropriate?`,
      visual: { type: "table", headers: ["", "Mean", "Median", "SD", "IQR"], rows: skewFirst ? [rowS, rowY] : [rowY, rowS] },
      answer: choice(r, correct, [
        [`Compare means: ${meanS > meanY ? skewName : symName} has the higher typical value.`, `${skewName}'s data is skewed with an outlier, so its mean is pulled up and isn't a fair typical value.`],
        [`Compare standard deviations: ${symName} is more consistent.`, "The outlier inflates the SD. With skewed data, compare IQRs instead."],
        [`Compare medians and IQRs: ${skewName} has less spread in the middle half.`, `Right idea, but check the IQRs: ${iqrS} vs ${iqrY}.`],
      ]),
      hints: ["When one data set is skewed or has outliers, which statistics resist extreme values?", "Use the median for center and the IQR for spread for BOTH groups so the comparison is fair."],
      steps: [st("Check the shapes.", `${skewName}'s data is skewed with an outlier, so its mean (${meanS}) and SD (${sdS}) are distorted.`), st("Use resistant statistics for both.", `Medians ${medS} and ${medY}; IQRs ${iqrS} and ${iqrY}.`), st("Conclude.", `${symName} has the smaller IQR, so the middle half of the data is more consistent.`)],
    };
  },
};

// ---------- outliers ----------

const outliers: Skill = {
  id: "m1.stat1.outliers",
  title: "Outliers and their effects",
  topic: T,
  standards: ["NC.M1.S-ID.3"],
  prereqs: ["m1.stat1.five-number"],
  lesson: {
    bigIdea: "A value is an outlier if it is more than 1.5 × IQR below Q1 or above Q3. Outliers pull the mean and standard deviation much more than the median and IQR.",
    explain: [
      "Fences: lower fence = Q1 − 1.5·IQR, upper fence = Q3 + 1.5·IQR. Anything outside the fences is an outlier.",
      "Worked example: Q1 = 20, Q3 = 30, so IQR = 10 and 1.5·IQR = 15. The fences are 20 − 15 = 5 and 30 + 15 = 45. A value of 52 is an outlier; 44 is not.",
      "Removing a high outlier lowers the mean (sometimes a lot) and shrinks the standard deviation and range. The median usually moves only a little, and the IQR barely changes.",
    ],
    tip: "Find the IQR first, then multiply by 1.5. Using 1.5 × Q3 is a common slip.",
  },
  why: [
    { kind: "choice", prompt: "A data set's largest value is changed from 40 to 400. Which statistic changes the most?", choices: ["The mean", "The median", "The IQR"], correct: 0, explain: "The mean uses the size of every value, so one huge value drags it up. The median and IQR depend on positions." },
    { kind: "written", prompt: "Explain why the IQR is used to define outliers instead of the range.", keyIdeas: ["the range includes the outliers themselves", "the IQR describes the middle half", "a value is unusual compared with where most of the data lies"], exemplar: "The range is built from the most extreme values, which might be the outliers we're trying to find. The IQR describes where the middle half of the data sits, so measuring 1.5 IQRs beyond the box tells us whether a value is unusually far from the typical data." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const q1 = r.int(4, 20) * 2, iqr = r.int(2, 10) * 2, q3 = q1 + iqr;
      const upper = r.chance(0.6);
      const fence = upper ? q3 + 1.5 * iqr : q1 - 1.5 * iqr;
      return {
        prompt: `A data set has Q1 = ${q1} and Q3 = ${q3}. Find the ${upper ? "upper" : "lower"} fence for outliers.`,
        answer: num(fence),
        hints: ["Start with the IQR = Q3 − Q1.", `${upper ? "Upper fence = Q3 + 1.5 × IQR" : "Lower fence = Q1 − 1.5 × IQR"}.`],
        steps: [st("Find the IQR.", `${q3} − ${q1} = ${iqr}`), st("Multiply by 1.5.", `1.5 × ${iqr} = ${1.5 * iqr}`), st(upper ? "Add to Q3." : "Subtract from Q1.", upper ? `${q3} + ${1.5 * iqr} = ${f(fence)}` : `${q1} − ${1.5 * iqr} = ${f(fence)}`)],
        traps: traps(frac(fence), [trap(upper ? q3 + iqr : q1 - iqr, "Multiply the IQR by 1.5 before adding or subtracting."), trap(upper ? 1.5 * q3 : 1.5 * q1, `That's 1.5 × ${upper ? "Q3" : "Q1"}. The rule uses 1.5 × IQR.`), trap(upper ? q1 + 1.5 * iqr : q3 - 1.5 * iqr, `Start from ${upper ? "Q3" : "Q1"}, the edge of the box on that side.`)]),
      };
    }
    if (lv === 2) {
      // Data with one clear high outlier.
      const n = r.pick([9, 11]);
      const base = r.int(20, 40);
      const core = sortNums(Array.from({ length: n - 1 }, () => base + r.int(0, 14)));
      const s0 = fiveNum(core);
      const out = Math.ceil(s0.q3 + 1.5 * Math.max(s0.q3 - s0.q1, 4)) + r.int(10, 25);
      const data = [...core, out];
      const s = fiveNum(data);
      const iqr = s.q3 - s.q1;
      const up = s.q3 + 1.5 * iqr, lo = s.q1 - 1.5 * iqr;
      const outs = sortNums(data.filter((x) => x > up || x < lo));
      const correctText = outs.length ? outs.join(" and ") : "There are no outliers";
      const cands = [...new Set([out, core[core.length - 1], core[0], core[Math.floor(core.length / 2)]])].filter((c) => !outs.includes(c));
      const wrong: [string, string][] = cands.map((c) => [String(c), `${c} is inside the fences (${f(lo)} to ${f(up)}).`]);
      if (outs.length) wrong.push(["There are no outliers", `${outs.join(" and ")} ${outs.length === 1 ? "is" : "are"} outside the fences (${f(lo)} to ${f(up)}).`]);
      return {
        prompt: `Data: ${r.shuffle(data).join(", ")}. Using the 1.5 × IQR rule, which value(s) are outliers?`,
        answer: choice(r, correctText, wrong),
        hints: ["Sort the data and find Q1 and Q3.", "Compute the fences: Q1 − 1.5·IQR and Q3 + 1.5·IQR.", "Any value outside the fences is an outlier."],
        steps: [st("Sort.", s.sorted.join(", ")), st("Quartiles.", `Q1 = ${f(s.q1)}, Q3 = ${f(s.q3)}, IQR = ${f(iqr)}`), st("Fences.", `${f(s.q1)} − 1.5(${f(iqr)}) = ${f(lo)} and ${f(s.q3)} + 1.5(${f(iqr)}) = ${f(up)}`), st("Check the values.", outs.length ? `${correctText} ${outs.length === 1 ? "is" : "are"} outside the fences.` : "Every value is inside the fences.")],
      };
    }
    // Level 3: effect of removing the outlier on the mean.
    const n2 = r.pick([5, 6, 8]);
    const target = r.int(12, 30);
    const devs: number[] = [];
    while (devs.length < n2 - 2) { const d = r.int(1, 5); devs.push(d, -d); }
    if (devs.length < n2 - 1) devs.push(0);
    const others = devs.slice(0, n2 - 1).map((d) => target + d);
    const k = r.int(6, 12);
    const big = target + k * n2;
    const all = [...others, big];
    const sumAll = all.reduce((a, b) => a + b, 0);
    const ctx = r.pick([["Tips earned (dollars)", "days"], ["Points scored", "games"], ["Minutes on the phone", "days"]]);
    return {
      prompt: `${ctx[0]} over ${n2} ${ctx[1]}: ${r.shuffle(all).join(", ")}. The value ${big} is an outlier. By how much does the mean decrease if ${big} is removed?`,
      answer: num(k),
      hints: [`Find the mean of all ${n2} values.`, `Find the mean of the other ${n2 - 1} values.`, "Subtract the new mean from the old one."],
      steps: [st("Mean with the outlier.", `${sumAll} ÷ ${n2} = ${f(sumAll / n2)}`), st("Mean without it.", `${sumAll - big} ÷ ${n2 - 1} = ${target}`), st("Difference.", `${f(sumAll / n2)} − ${target} = ${k}`), st("Notice.", "One value moved the mean that much, while the median barely moves.")],
      traps: traps(frac(k), [trap(sumAll / n2, "That's the mean with the outlier. The question asks how much it changes."), trap(target, "That's the new mean. Subtract it from the original mean."), trap(big - target, "Divide by the number of values: the outlier's extra amount is shared across all of them.")]),
    };
  },
};

export default [histogram, fiveNumber, boxplotRead, meanSd, shapeCenter, compare, outliers];
