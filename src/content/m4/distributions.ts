// Unit 8: Discrete probability distributions, expected value and the binomial distribution (NC.M4.SP.3.1, NC.M4.SP.3.2).
import { choice, money, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { PEOPLE, binomPmf, dec, fix, nCk, rnd, tolTraps } from "./util";

const T = "m4-distributions";

/** Random probabilities (in hundredths) that add to 100. */
function probs(r: { int: (a: number, b: number) => number }, k: number): number[] {
  const out: number[] = [];
  let left = 100;
  for (let i = 0; i < k - 1; i++) {
    const v = r.int(5, Math.max(5, Math.min(45, left - 5 * (k - 1 - i))));
    out.push(v);
    left -= v;
  }
  out.push(left);
  return out;
}
const p2 = (h: number) => dec(h / 100, 2);

const CTX = [
  { what: "the number of songs a listener skips in a 10-minute stretch", start: 0 },
  { what: "the number of goals a soccer team scores in a game", start: 0 },
  { what: "the number of phones in a household", start: 1 },
  { what: "the number of texts a student gets during lunch", start: 0 },
  { what: "the number of video game levels a player clears in an hour", start: 0 },
];

const discrete: Skill = {
  id: "m4.dist.discrete",
  title: "Discrete probability distributions",
  topic: T,
  standards: ["NC.M4.SP.3.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A probability distribution lists every value of a random variable X with its probability. The probabilities are between 0 and 1 and add to exactly 1.",
    explain: [
      "X = number of goals a team scores: P(0) = 0.25, P(1) = 0.35, P(2) = 0.25, P(3) = 0.15. These add to 1.",
      "Probabilities of ranges add: P(X ≥ 2) = 0.25 + 0.15 = **0.40**. \"At most 1\" means P(X ≤ 1) = 0.25 + 0.35 = 0.60.",
      "A missing probability is whatever's needed to make the total 1.",
    ],
    visual: { type: "table", headers: ["x", "0", "1", "2", "3"], rows: [["P(X = x)", 0.25, 0.35, 0.25, 0.15]] },
  },
  why: [
    { kind: "choice", prompt: "Why must the probabilities in a distribution add to 1?", choices: ["The listed values cover every possible outcome, and something must happen.", "Because each probability is 1 divided by the number of values.", "They only need to add to less than 1."], correct: 0, explain: "The total probability of all possible outcomes is 100%." },
    { kind: "written", prompt: "Explain the difference between P(X > 2) and P(X ≥ 2), and why it matters for a discrete variable.", keyIdeas: ["≥ includes X = 2, > does not", "for a discrete variable P(X = 2) can be positive", "so the two answers differ by P(X = 2)"], exemplar: "P(X ≥ 2) includes the value 2 and P(X > 2) doesn't. For a discrete variable, X = 2 has its own positive probability, so the two answers differ by exactly P(X = 2)." },
  ],
  generate(r, lv) {
    const c = r.pick(CTX);
    const k = lv === 1 ? 4 : 5;
    const ps = probs(r, k);
    const xs = ps.map((_, i) => c.start + i);
    const miss = r.int(0, k - 1);
    const showMissing = lv !== 2;
    const row = ps.map((p, i) => (showMissing && i === miss ? "?" : p / 100));
    const vis = { type: "table" as const, headers: ["x", ...xs.map(String)], rows: [["P(X = x)", ...row]] };
    const known = ps.filter((_, i) => i !== miss);
    if (lv === 1) {
      return {
        prompt: `X = ${c.what}. Find the missing probability P(X = ${xs[miss]}).`,
        visual: vis,
        answer: num(frac(ps[miss], 100)),
        hints: ["All the probabilities must add to 1.", `1 − (${known.map(p2).join(" + ")}).`],
        steps: [st("Add the known probabilities.", `${known.map(p2).join(" + ")} = ${p2(100 - ps[miss])}`), st("Subtract from 1.", `1 − ${p2(100 - ps[miss])} = ${p2(ps[miss])}`)],
        traps: traps(frac(ps[miss], 100), [trap(frac(100 - ps[miss], 100), "That's the sum of the others. Subtract it from 1.")]),
      };
    }
    const cut = xs[r.int(1, k - 2)];
    const ge = r.chance(0.5);
    const idx = xs.map((_, i) => i).filter((i) => (ge ? xs[i] >= cut : xs[i] < cut));
    const ans = idx.reduce((s, i) => s + ps[i], 0);
    const wrongIdx = xs.map((_, i) => i).filter((i) => (ge ? xs[i] > cut : xs[i] <= cut));
    const wrong = wrongIdx.reduce((s, i) => s + ps[i], 0);
    const q = ge ? `at least ${cut}` : `fewer than ${cut}`;
    const sym = ge ? `P(X ≥ ${cut})` : `P(X < ${cut})`;
    return {
      prompt: `X = ${c.what}. ${lv === 3 ? `One probability is missing. ` : ""}Find ${sym}, the probability of ${q}.`,
      visual: vis,
      answer: num(frac(ans, 100)),
      hints: [lv === 3 ? `First find the missing probability: 1 − (${known.map(p2).join(" + ")}) = ${p2(ps[miss])}.` : `List the values of X that are ${ge ? `${cut} or more` : `less than ${cut}`}.`, `Add P(X = x) for x = ${idx.map((i) => xs[i]).join(", ")}.`],
      steps: [
        ...(lv === 3 ? [st("Missing probability.", `1 − (${known.map(p2).join(" + ")}) = ${p2(ps[miss])}`)] : []),
        st("Which values count?", `${q}: x = ${idx.map((i) => xs[i]).join(", ")}`),
        st("Add their probabilities.", `${idx.map((i) => p2(ps[i])).join(" + ")} = ${p2(ans)}`),
      ],
      traps: traps(frac(ans, 100), [trap(frac(wrong, 100), ge ? `"At least ${cut}" includes ${cut} itself.` : `"Fewer than ${cut}" doesn't include ${cut}.`), trap(frac(100 - ans, 100), "That's the complement: the probability of the other values.")]),
    };
  },
};

const expected: Skill = {
  id: "m4.dist.expected-value",
  title: "Expected value",
  topic: T,
  standards: ["NC.M4.SP.3.1"],
  prereqs: ["m4.dist.discrete"],
  lesson: {
    bigIdea: "The expected value E(X) = Σ x·P(x) is the long-run average of X: multiply each value by its probability and add.",
    explain: [
      "Goals: P(0) = 0.25, P(1) = 0.35, P(2) = 0.25, P(3) = 0.15. E(X) = 0(0.25) + 1(0.35) + 2(0.25) + 3(0.15) = 0 + 0.35 + 0.5 + 0.45 = **1.3 goals**.",
      "The expected value doesn't have to be a possible value. No team scores 1.3 goals in a game, but over many games they average 1.3.",
      "For games: expected *net* gain = (expected winnings) − (cost to play).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can the expected number of goals be 1.3 when you can't score 1.3 goals?", choices: ["It's a long-run average over many games, not a single game's result.", "Because the probabilities are wrong.", "Expected value always rounds to a whole number."], correct: 0, explain: "Averages of whole numbers are often not whole numbers." },
    { kind: "written", prompt: "A carnival game costs $2. Its expected winnings are $1.50. Explain what that means for someone who plays 100 times.", keyIdeas: ["expected net gain is 1.50 − 2 = −0.50 per play", "over 100 plays they'd expect to lose about $50", "the game favors the carnival"], exemplar: "Each play, the player can expect to win $1.50 on average but pays $2, so the expected net gain is −$0.50. Over 100 plays that's about −$50: the player should expect to lose around $50, which is how the carnival makes money." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const cost = r.pick([2, 3, 5, 10]);
      const prizes = [0, cost, cost * r.pick([3, 5]), cost * r.pick([10, 20])];
      const pr = [r.int(62, 80), 0, r.int(3, 8), 1];
      pr[1] = 100 - pr[0] - pr[2] - pr[3];
      const ew = prizes.reduce((s, p, i) => s + (p * pr[i]) / 100, 0);
      const net = rnd(ew - cost, 2);
      const game = r.pick(["A school fundraiser game", "An arcade prize wheel", "A raffle-style scratch card"]);
      return {
        prompt: `${game} costs $${cost} to play. The table shows the prizes and their probabilities. What is the expected net gain per play? (Use a negative number for a loss.)`,
        visual: { type: "table", headers: ["prize", ...prizes.map((p) => money(p))], rows: [["probability", ...pr.map((p) => p / 100)]] },
        answer: num(net, { pre: "$" }),
        hints: ["Find the expected winnings first: Σ (prize × probability).", `Expected winnings = ${money(ew)}. Then subtract the $${cost} cost.`],
        steps: [st("Expected winnings.", `${prizes.map((p, i) => `${p}(${p2(pr[i])})`).join(" + ")} = ${money(ew)}`), st("Subtract the cost.", `${money(ew)} − $${cost} = ${net < 0 ? "−" : ""}${money(Math.abs(net))}`), st("Meaning.", net < 0 ? `On average a player loses ${money(-net)} per play.` : `On average a player gains ${money(net)} per play.`)],
        traps: traps(frac(Math.round(net * 100), 100), [trap(frac(Math.round(ew * 100), 100), `That's the expected winnings. Subtract the $${cost} cost to play.`), trap(frac(Math.round((prizes.reduce((s, p) => s + p, 0) / 4 - cost) * 100), 100), "Weight each prize by its probability; don't just average the prizes.")]),
      };
    }
    const c = r.pick(CTX);
    const k = lv === 1 ? 3 : 5;
    const ps = probs(r, k);
    const xs = ps.map((_, i) => c.start + i);
    const ev = xs.reduce((s, x, i) => s + x * ps[i], 0) / 100;
    const plain = xs.reduce((s, x) => s + x, 0) / k;
    return {
      prompt: `X = ${c.what}. Find the expected value E(X).`,
      visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["P(X = x)", ...ps.map((p) => p / 100)]] },
      answer: num(ev),
      hints: ["Multiply each value by its probability.", `E(X) = ${xs.map((x, i) => `${x}(${p2(ps[i])})`).join(" + ")}.`],
      steps: [st("Multiply each value by its probability.", xs.map((x, i) => `${x}(${p2(ps[i])}) = ${dec((x * ps[i]) / 100, 2)}`).join("; ")), st("Add.", `E(X) = ${xs.map((x, i) => dec((x * ps[i]) / 100, 2)).join(" + ")} = ${dec(ev, 2)}`)],
      traps: traps(frac(Math.round(ev * 100), 100), [trap(frac(Math.round(plain * 100), 100), "That's the plain average of the x-values. Weight each value by its probability."), trap(1, "The probabilities add to 1, but E(X) multiplies each by its value.")]),
    };
  },
};

const evDecision: Skill = {
  id: "m4.dist.ev-decision",
  title: "Make decisions with expected value",
  topic: T,
  standards: ["NC.M4.SP.3.1"],
  prereqs: ["m4.dist.expected-value"],
  lesson: {
    bigIdea: "Compare options by their expected values: the choice with the better long-run average is usually the better deal, though risk matters too.",
    explain: [
      "Phone protection costs $96 a year. You estimate a 15% chance of a $350 repair. Without the plan, the expected repair cost is 0.15 × 350 = $52.50, less than $96, so on average skipping the plan saves money.",
      "A **fair game** has expected net gain 0. If a game pays $40 with probability 0.05 and nothing otherwise, its fair price is 0.05 × 40 = **$2**.",
      "Insurance companies set premiums above the expected payout per policy; the difference is their expected profit.",
    ],
  },
  why: [
    { kind: "choice", prompt: "If insurance has a negative expected value for buyers, why do people still buy it?", choices: ["It protects against a rare but huge loss they couldn't afford, even if it costs more on average.", "Because the expected value is always positive for the buyer.", "Because insurance companies lose money on average."], correct: 0, explain: "Expected value is a long-run average; one person might not be able to survive one bad outcome." },
    { kind: "written", prompt: "Explain what makes a game \"fair\" and how to find a fair price to play.", keyIdeas: ["fair means expected net gain is 0", "find expected winnings = Σ prize × probability", "the fair price equals the expected winnings"], exemplar: "A game is fair when the expected net gain is 0, so neither the player nor the host comes out ahead in the long run. Compute the expected winnings by multiplying each prize by its probability and adding; the fair price is exactly that amount." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const cost = r.pick([300, 400, 500, 600]), pct = r.pick([10, 15, 20, 25, 30]), plan = r.pick([60, 72, 84, 96, 120, 150]);
      const exp = (cost * pct) / 100;
      const buy = plan < exp;
      return {
        prompt: `A phone protection plan costs $${plan} a year. ${r.pick(PEOPLE)} estimates a ${pct}% chance of needing a $${cost} repair this year (and otherwise no repair). Based on expected value, which choice costs less on average?`,
        answer: choice(r, buy ? `Buy the plan: $${plan} < expected repair cost of ${money(exp)}` : `Skip the plan: expected repair cost of ${money(exp)} < $${plan}`, [
          [buy ? `Skip the plan: expected repair cost of ${money(exp)} < $${plan}` : `Buy the plan: $${plan} < expected repair cost of ${money(exp)}`, `Compare: ${money(exp)} vs $${plan}.`],
          [`Skip the plan: the repair probably won't happen`, `"Probably won't happen" ignores how big the cost is. Use expected value: ${pct}% × $${cost}.`],
          [`Buy the plan: the repair would cost $${cost}`, `The full $${cost} only happens ${pct}% of the time; the expected cost is ${money(exp)}.`],
        ]),
        hints: ["Expected repair cost = probability × cost.", `${pct}% × $${cost} = ${money(exp)}. Compare with $${plan}.`],
        steps: [st("Expected cost without the plan.", `${dec(pct / 100, 2)} × ${cost} = ${money(exp)}`), st("Compare.", `${money(exp)} vs. ${money(plan)}: ${buy ? "the plan is cheaper on average" : "skipping is cheaper on average"}.`)],
      };
    }
    if (lv === 2) {
      const a = r.pick([20, 25, 40, 50, 100]), pa = r.pick([5, 10, 20]), b = r.pick([5, 10]), pb = r.pick([20, 25, 30]);
      const fair = rnd((a * pa + b * pb) / 100, 2);
      return {
        prompt: `A game pays $${a} with probability ${p2(pa)}, $${b} with probability ${p2(pb)}, and nothing otherwise. What price to play would make it a fair game?`,
        answer: num(fair, { pre: "$" }),
        hints: ["A fair game has expected net gain 0, so the price equals the expected winnings.", `Expected winnings = ${a}(${p2(pa)}) + ${b}(${p2(pb)}).`],
        steps: [st("Expected winnings.", `${a}(${p2(pa)}) + ${b}(${p2(pb)}) + 0 = ${dec((a * pa) / 100, 2)} + ${dec((b * pb) / 100, 2)} = ${money(fair)}`), st("Fair price.", `Charging ${money(fair)} makes the expected net gain 0.`)],
        traps: traps(frac(Math.round(fair * 100), 100), [trap(a + b, "Weight each prize by its probability."), trap(frac(Math.round(((a + b) / 3) * 100), 100), "Don't average the prizes equally; their probabilities differ.")]),
      };
    }
    const big = r.pick([20000, 25000, 40000, 50000]), pBig = r.pick([2, 4, 5]); // per thousand
    const small = r.pick([2000, 2500, 3000, 5000]), pSmall = r.pick([20, 30, 40, 50]);
    const exPay = (big * pBig + small * pSmall) / 1000;
    const premium = Math.ceil(exPay / 50) * 50 + r.pick([50, 100, 150]);
    const profit = premium - exPay;
    return {
      prompt: `An insurance company charges $${premium} a year for a car policy. Each year, there's a ${dec(pBig / 1000, 3)} probability of a $${big.toLocaleString("en-US")} claim, a ${dec(pSmall / 1000, 3)} probability of a $${small.toLocaleString("en-US")} claim, and otherwise no claim. What is the company's expected profit per policy?`,
      answer: num(profit, { pre: "$" }),
      hints: ["Expected payout = Σ claim × probability.", `Expected payout = ${big}(${dec(pBig / 1000, 3)}) + ${small}(${dec(pSmall / 1000, 3)}) = ${money(exPay)}. Subtract it from the premium.`],
      steps: [st("Expected payout.", `${big}(${dec(pBig / 1000, 3)}) + ${small}(${dec(pSmall / 1000, 3)}) = ${dec((big * pBig) / 1000)} + ${dec((small * pSmall) / 1000)} = ${money(exPay)}`), st("Expected profit.", `${premium} − ${dec(exPay)} = ${money(profit)} per policy`), st("Meaning.", "Over many policies, the company expects to keep about this much per customer.")],
      traps: traps(frac(Math.round(profit * 100), 100), [trap(frac(Math.round(exPay * 100), 100), "That's the expected payout. Profit = premium − expected payout."), trap(premium - big - small, "Weight each claim by its probability; claims are rare.")]),
    };
  },
};

const BIN_CASES: { scene: string; ok: boolean; fail: string }[] = [
  { scene: "A basketball player who makes 80% of free throws shoots 10 free throws; X = number made.", ok: true, fail: "" },
  { scene: "A student guesses on all 12 questions of a multiple-choice quiz with 4 choices each; X = number correct.", ok: true, fail: "" },
  { scene: "A quality inspector tests 20 phone chargers from a huge shipment where 3% are defective; X = number defective.", ok: true, fail: "" },
  { scene: "You roll a die until you get a 6; X = number of rolls.", ok: false, fail: "There's no fixed number of trials: you keep going until a success." },
  { scene: "You draw 5 cards from a 52-card deck without replacement; X = number of hearts.", ok: false, fail: "Drawing without replacement from a small deck makes the trials dependent: the probability of a heart changes each draw." },
  { scene: "A gamer plays 8 matches; she gets more tired each match, so her chance of winning drops; X = number of wins.", ok: false, fail: "The probability of success isn't the same on every trial." },
  { scene: "You record the number of minutes each of 10 friends spends on homework; X = total minutes.", ok: false, fail: "Each trial isn't a success/failure outcome; minutes are a measurement." },
];

const binomCheck: Skill = {
  id: "m4.dist.binomial-check",
  title: "Recognize binomial settings",
  topic: T,
  standards: ["NC.M4.SP.3.2"],
  prereqs: ["m4.dist.discrete"],
  lesson: {
    bigIdea: "X is binomial when there are a fixed number n of independent trials, each a success or failure, with the same success probability p. (Remember: BINS: Binary, Independent, Number fixed, Same p.)",
    explain: [
      "Shooting 10 free throws at 80%: binary (make/miss), independent (one shot doesn't affect the next), n = 10 fixed, same p = 0.8. Binomial.",
      "Rolling until a 6: n isn't fixed. Not binomial (it's geometric).",
      "Drawing cards without replacement: the trials aren't independent, because p changes. But sampling a few items from a huge population is close enough to independent (the 10% rule).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is drawing 5 people from a school of 2,000 without replacement still treated as binomial?", choices: ["The sample is less than 10% of the population, so p barely changes from draw to draw.", "Because people are always independent.", "It isn't; you must use replacement."], correct: 0, explain: "The 10% condition makes the independence assumption reasonable." },
    { kind: "written", prompt: "Explain why the number of rolls needed to get a 6 is not a binomial random variable.", keyIdeas: ["binomial needs a fixed number of trials n", "here you stop when you get a success", "the number of trials is the random variable itself"], exemplar: "A binomial variable counts successes in a fixed number of trials. Rolling until you get a 6 has no fixed n; you stop at the first success, and the number of rolls is the thing that varies. That's a geometric setting, not binomial." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const c = r.pick(BIN_CASES);
      return {
        prompt: `${c.scene} Is X a binomial random variable?`,
        answer: choice(r, c.ok ? "Yes: fixed n, two outcomes, independent trials, same p." : `No: ${c.fail[0].toLowerCase()}${c.fail.slice(1)}`, c.ok ? [["No: the probability of success is too high.", "Any p between 0 and 1 is allowed."], ["No: there are more than two possible values of X.", "X can take many values; each *trial* has two outcomes."]] : [["Yes: fixed n, two outcomes, independent trials, same p.", c.fail]]),
        hints: ["Check BINS: Binary outcomes? Independent trials? Number of trials fixed? Same p each time?", "If any one fails, it's not binomial."],
        steps: [st("Check each condition.", c.ok ? "Two outcomes per trial, trials independent, n fixed, p constant." : c.fail), st("Conclusion.", c.ok ? "Binomial." : "Not binomial.")],
      };
    }
    const bad = r.pick(BIN_CASES.filter((c) => !c.ok));
    const goods = r.shuffle(BIN_CASES.filter((c) => c.ok)).slice(0, 2);
    if (lv === 2) {
      return {
        prompt: "Which of these is NOT a binomial setting?",
        answer: choice(r, bad.scene, goods.map((g) => [g.scene, "This one meets all four conditions (BINS)."] as [string, string])),
        hints: ["Check each for a fixed n, two outcomes, independence and constant p.", "Look for \"until\", \"without replacement\" from a small group, a changing chance, or a measurement instead of success/failure."],
        steps: [st("The one that fails.", `${bad.scene} ${bad.fail}`)],
      };
    }
    const reasons = BIN_CASES.filter((c) => !c.ok && c !== bad).map((c) => c.fail);
    return {
      prompt: `${bad.scene} Which binomial condition fails?`,
      answer: choice(r, bad.fail, reasons.map((f) => [f, "That condition is met here."] as [string, string])),
      hints: ["Go through B-I-N-S one at a time.", "Ask: is n fixed? Is p the same? Are trials independent? Are outcomes success/failure?"],
      steps: [st("Check the conditions.", bad.fail)],
    };
  },
};

const BIN_CTX = [
  (n: number, p: number) => `A player makes ${Math.round(p * 100)}% of her free throws. She shoots ${n} free throws.`,
  (n: number, p: number) => `${Math.round(p * 100)}% of a phone maker's chargers last more than 3 years. You buy ${n} of them.`,
  (n: number, p: number) => `A music app says ${Math.round(p * 100)}% of its users skip ads. A random sample of ${n} users is chosen.`,
  (n: number, p: number) => `${Math.round(p * 100)}% of students at a large school ride the bus. ${n} students are picked at random.`,
];

const binomProb: Skill = {
  id: "m4.dist.binomial-prob",
  title: "Binomial probabilities",
  topic: T,
  standards: ["NC.M4.SP.3.2"],
  prereqs: ["m4.dist.binomial-check"],
  lesson: {
    bigIdea: "For a binomial X with n trials and success probability p: P(X = k) = C(n, k) · p^k · (1 − p)^(n − k).",
    explain: [
      "C(n, k) (also written nCk) counts the ways to arrange k successes among n trials; p^k(1 − p)^(n − k) is the probability of any one arrangement.",
      "Example: 5 free throws at 70%. P(exactly 4) = C(5, 4)(0.7)^4(0.3)^1 = 5(0.2401)(0.3) ≈ **0.3602**.",
      "\"At least one\" is easiest with the complement: P(X ≥ 1) = 1 − P(X = 0) = 1 − (1 − p)^n. Calculators: binompdf(n, p, k) and binomcdf(n, p, k) = P(X ≤ k).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does the formula include C(n, k)?", choices: ["There are C(n, k) different orders in which k successes can happen, each with the same probability.", "To make the probability bigger than 1.", "Because n and k are always equal."], correct: 0, explain: "For example, 4 makes in 5 shots can happen with the miss on any of the 5 shots." },
    { kind: "written", prompt: "Explain why P(at least 1 success in 6 trials) is easier to find as 1 − P(0 successes).", keyIdeas: ["\"at least 1\" includes 1, 2, 3, 4, 5, 6 successes: six calculations", "its complement is just \"0 successes\"", "P(0) = (1 − p)^6, then subtract from 1"], exemplar: "\"At least 1\" means 1, 2, 3, 4, 5 or 6 successes, which is six separate calculations. The only other possibility is 0 successes, so P(at least 1) = 1 − P(0) = 1 − (1 − p)^6, which is one quick calculation." },
  ],
  generate(r, lv) {
    const n = lv === 1 ? r.int(4, 6) : r.int(6, 12);
    const p = lv === 3 ? r.pick([0.1, 0.15, 0.2, 0.25, 0.3]) : r.pick([0.2, 0.25, 0.3, 0.4, 0.6, 0.7, 0.75, 0.8, 0.9]);
    const ctx = r.pick(p >= 0.4 ? BIN_CTX : BIN_CTX.slice(1))(n, p);
    const q = rnd(1 - p, 2);
    if (lv < 3) {
      const k = r.int(1, n - 1);
      const ans = rnd(binomPmf(n, k, p), 4);
      return {
        prompt: `${ctx} Find the probability of exactly ${k} successes. Round to four decimal places.`,
        answer: num(ans, { tolerance: 0.0006 }),
        hints: [`Use P(X = ${k}) = C(${n}, ${k})(${p})^${k}(${q})^${n - k}.`, `C(${n}, ${k}) = ${nCk(n, k)}.`],
        steps: [
          st("Identify n, p and k.", `n = ${n}, p = ${p}, k = ${k}, so 1 − p = ${q}`),
          st("Count the arrangements.", `C(${n}, ${k}) = ${nCk(n, k)}`),
          st("Apply the formula.", `${nCk(n, k)}(${p})^${k}(${q})^${n - k} ≈ ${nCk(n, k)}(${dec(p ** k, 6)})(${dec(q ** (n - k), 6)}) ≈ ${fix(ans)}`),
        ],
        traps: tolTraps(ans, 0.0006, [[p ** k * q ** (n - k), `That's one arrangement only. Multiply by C(${n}, ${k}) = ${nCk(n, k)}.`], [k / n, `${k}/${n} is the sample proportion, not a probability from the binomial model.`], [nCk(n, k) * p ** (n - k) * q ** k, "The success probability p goes with the number of successes k."]]),
      };
    }
    if (r.chance(0.5)) {
      const ans = rnd(1 - q ** n, 4);
      return {
        prompt: `${ctx} Find the probability of at least one success. Round to four decimal places.`,
        answer: num(ans, { tolerance: 0.0006 }),
        hints: ["Use the complement: P(X ≥ 1) = 1 − P(X = 0).", `P(X = 0) = (${q})^${n}.`],
        steps: [st("Complement.", "P(X ≥ 1) = 1 − P(X = 0)"), st("P(X = 0).", `(${q})^${n} ≈ ${fix(q ** n)}`), st("Subtract.", `1 − ${fix(q ** n)} ≈ ${fix(ans)}`)],
        traps: tolTraps(ans, 0.0006, [[q ** n, "That's P(X = 0). Subtract it from 1."], [binomPmf(n, 1, p), "That's exactly one success. \"At least one\" includes 1, 2, 3, …"], [1 - p ** n, `(${p})^${n} is the chance of all successes. Use the chance of no successes, (${q})^${n}.`]]),
      };
    }
    const ans = rnd(binomPmf(n, 0, p) + binomPmf(n, 1, p), 4);
    return {
      prompt: `${ctx} Find the probability of at most one success. Round to four decimal places.`,
      answer: num(ans, { tolerance: 0.0006 }),
      hints: ["At most one means 0 or 1 successes: add P(X = 0) and P(X = 1).", `P(X = 0) = (${q})^${n} and P(X = 1) = ${n}(${p})(${q})^${n - 1}.`],
      steps: [st("P(X = 0).", `(${q})^${n} ≈ ${fix(binomPmf(n, 0, p))}`), st("P(X = 1).", `${n}(${p})(${q})^${n - 1} ≈ ${fix(binomPmf(n, 1, p))}`), st("Add.", `${fix(binomPmf(n, 0, p))} + ${fix(binomPmf(n, 1, p))} ≈ ${fix(ans)}`)],
      traps: tolTraps(ans, 0.0006, [[binomPmf(n, 1, p), "That's exactly one. \"At most one\" also includes zero."], [1 - ans, "That's the complement (2 or more)."]]),
    };
  },
};

const binomMean: Skill = {
  id: "m4.dist.binomial-mean",
  title: "Mean and SD of a binomial",
  topic: T,
  standards: ["NC.M4.SP.3.2"],
  prereqs: ["m4.dist.binomial-prob"],
  lesson: {
    bigIdea: "A binomial X has mean μ = np and standard deviation σ = √(np(1 − p)).",
    explain: [
      "100 free throws at 80%: μ = 100(0.8) = 80 makes and σ = √(100 · 0.8 · 0.2) = √16 = **4**.",
      "So a typical result is 80 give or take about 4. A result more than 2 standard deviations away (below 72 or above 88) would be unusual.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does the mean of a binomial equal np?", choices: ["Each of the n trials contributes p successes on average.", "Because the most likely value is always n.", "It's a coincidence of the formula."], correct: 0, explain: "Expected successes per trial is p; over n trials that's np." },
    { kind: "written", prompt: "A quiz has 40 true/false questions. Explain how to decide whether a score of 28 is unusual for someone who's guessing.", keyIdeas: ["n = 40, p = 0.5", "mean 20, SD √10 ≈ 3.16", "28 is about 2.5 SDs above the mean, so it's unusual for a guesser"], exemplar: "For a guesser, n = 40 and p = 0.5, so the mean is 20 and the SD is √(40 · 0.5 · 0.5) = √10 ≈ 3.16. 28 is 8 above the mean, about 2.5 SDs, which is more than 2, so it would be unusual. The person probably knew some answers." },
  ],
  generate(r, lv) {
    const [n, p] = r.pick([[100, 0.8], [100, 0.2], [400, 0.5], [50, 0.4], [200, 0.1], [80, 0.25], [150, 0.6], [60, 0.3], [120, 0.75], [500, 0.3]] as [number, number][]);
    const mu = rnd(n * p, 4), sd = Math.sqrt(n * p * (1 - p));
    const what = r.pick([`A survey firm calls ${n} random adults; ${Math.round(p * 100)}% of adults in the region stream music daily.`, `A factory tests ${n} parts; each has a ${Math.round(p * 100)}% chance of passing a stress test.`, `A gamer opens ${n} loot boxes, each with a ${Math.round(p * 100)}% chance of a rare item.`]);
    if (lv === 1) {
      return {
        prompt: `${what} Let X be the number of successes. Find the mean of X.`,
        answer: num(mu),
        hints: ["μ = np.", `${n} × ${p}.`],
        steps: [st("Mean.", `μ = np = ${n}(${p}) = ${dec(mu)}`)],
        traps: traps(frac(mu), [trap(rnd(n * (1 - p), 4), "That uses 1 − p. The mean counts successes: np.")]),
      };
    }
    if (lv === 2) {
      const ans = rnd(sd, 2);
      return {
        prompt: `${what} Let X be the number of successes. Find the standard deviation of X. Round to two decimal places.`,
        answer: num(ans, { tolerance: 0.011 }),
        hints: ["σ = √(np(1 − p)).", `√(${n} × ${p} × ${rnd(1 - p, 2)}) = √${dec(n * p * (1 - p))}.`],
        steps: [st("Variance.", `np(1 − p) = ${n}(${p})(${rnd(1 - p, 2)}) = ${dec(n * p * (1 - p))}`), st("Square root.", `σ = √${dec(n * p * (1 - p))} ≈ ${dec(ans, 2)}`)],
        traps: tolTraps(ans, 0.011, [[n * p * (1 - p), "That's the variance. Take the square root."], [Math.sqrt(n * p), "Include the factor (1 − p)."]]),
      };
    }
    const dir = r.sign();
    const zTarget = r.pick([1, 1.5, 2.5, 3]);
    const k = Math.round(mu + dir * zTarget * sd);
    const z = (k - mu) / sd;
    const unusual = Math.abs(z) > 2;
    return {
      prompt: `${what} Suppose X turned out to be ${k}. Is that unusual (more than 2 standard deviations from the mean)?`,
      answer: choice(r, unusual ? `Yes: ${k} is about ${dec(Math.abs(z), 1)} SDs ${z > 0 ? "above" : "below"} the mean.` : `No: ${k} is only about ${dec(Math.abs(z), 1)} SDs ${z > 0 ? "above" : "below"} the mean.`, [
        [unusual ? `No: ${k} is only about ${dec(Math.abs(z), 1)} SDs ${z > 0 ? "above" : "below"} the mean.` : `Yes: ${k} is about ${dec(Math.abs(z), 1)} SDs ${z > 0 ? "above" : "below"} the mean.`, `Compare ${dec(Math.abs(z), 1)} with 2.`],
        [`Yes: ${k} is ${dec(Math.abs(k - mu))} away from the mean.`, "Distance alone isn't enough; measure it in standard deviations."],
        ["No: any value between 0 and n is possible, so nothing is unusual.", "Possible isn't the same as likely; use the SD to judge."],
      ]),
      hints: ["Find μ = np and σ = √(np(1 − p)).", `μ = ${dec(mu)}, σ ≈ ${dec(sd, 2)}. How many σ is ${k} from μ?`],
      steps: [st("Mean and SD.", `μ = ${dec(mu)}, σ = √(${dec(n * p * (1 - p))}) ≈ ${dec(sd, 2)}`), st("Standardize.", `z = {${k} − ${dec(mu)}/${dec(sd, 2)}} ≈ ${dec(z, 2)}`), st("Decide.", unusual ? "|z| > 2, so it's unusual." : "|z| < 2, so it's not unusual.")],
    };
  },
};

export default [discrete, expected, evDecision, binomCheck, binomProb, binomMean] satisfies Skill[];
