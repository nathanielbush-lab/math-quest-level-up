// Boss-level challenges for NC Math 4: multi-part, in-context problems that combine several skills.
import { choice, num } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Challenge, Problem } from "../types";
import { PEOPLE, dec, fix, normCdf, rnd, tolTraps } from "./util";

const rad = (d: number) => (d * Math.PI) / 180;

const viral: Challenge = {
  id: "m4.ch.viral-video",
  title: "Going Viral",
  needs: ["m4.reg.predict", "m4.log.exp-context", "m4.reg.residuals"],
  build(r) {
    const name = r.pick(PEOPLE);
    const a = r.int(20, 60) / 10, b = r.pick([1.25, 1.3, 1.35, 1.4]);
    const t1 = r.int(5, 8), target = r.pick([100, 150, 200, 250]);
    const pred = rnd(a * b ** t1, 1);
    const tReach = rnd(Math.log(target / a) / Math.log(b), 2);
    const d = r.int(3, 6), res = r.nonzero(-9, 9) / 10;
    const predD = rnd(a * b ** d, 1);
    const obs = rnd(predD + res, 1);
    const parts: Problem[] = [
      {
        prompt: `An exponential regression for the views of ${name}'s video (in thousands) gave V = ${a}(${b})^t, where t is days after posting. Predict the views on day ${t1}, in thousands, to the nearest tenth.`,
        answer: num(pred, { tolerance: 0.1 }),
        hints: [`Substitute t = ${t1}.`, `${a}(${b})^${t1}: exponent first, then multiply.`],
        steps: [st("Substitute.", `V = ${a}(${b})^${t1}`), st("Evaluate.", `≈ ${dec(a * b ** t1, 3)} ≈ ${dec(pred, 1)} thousand views`)],
        traps: tolTraps(pred, 0.1, [[a * b * t1, "The exponent means repeated multiplication by the base."]]),
      },
      {
        prompt: `According to the model, on what day t does the video reach ${target} thousand views? Round to the nearest hundredth.`,
        answer: num(tReach, { tolerance: 0.02 }),
        hints: [`Divide by ${a}: (${b})^t = ${dec(target / a, 4)}.`, `t = log(${dec(target / a, 4)}) ÷ log(${b}).`],
        steps: [st("Isolate the power.", `(${b})^t = {${target}/${a}} ≈ ${dec(target / a, 4)}`), st("Take logs.", `t = {log(${dec(target / a, 4)})/log(${b})} ≈ ${dec(tReach, 2)}`)],
        traps: tolTraps(tReach, 0.02, [[Math.log(target) / Math.log(b), `Divide by ${a} before taking logs.`]]),
      },
      {
        prompt: `On day ${d} the video actually had ${dec(obs)} thousand views. The model predicts ${dec(predD)} thousand. What is the residual (in thousands)?`,
        answer: num(res, { tolerance: 0.001 }),
        hints: ["Residual = observed − predicted.", `${dec(obs)} − ${dec(predD)}.`],
        steps: [st("Residual.", `${dec(obs)} − ${dec(predD)} = ${dec(res)}`), st("Meaning.", `The actual views were ${dec(Math.abs(res))} thousand ${res > 0 ? "above" : "below"} the model.`)],
        traps: tolTraps(res, 0.001, [[-res, "Residual = observed − predicted, not the other way around."]]),
      },
      {
        prompt: `What does the ${b} in the model mean?`,
        answer: choice(r, `Views grow by about ${Math.round((b - 1) * 100)}% each day.`, [[`Views grow by ${b} thousand each day.`, "Exponential growth is a percent per day, not a fixed amount."], [`Views grow by ${b}% each day.`, `The growth factor ${b} = 1 + ${dec(b - 1)}.`], [`The video started with ${b} thousand views.`, `The starting value is ${a} thousand.`]]),
        hints: ["In y = a·b^x, b is the growth factor per unit of x.", `${b} = 1 + ${dec(b - 1)}.`],
        steps: [st("Growth factor.", `${b} = 1 + ${dec(b - 1)}, so views grow ${Math.round((b - 1) * 100)}% per day.`)],
      },
    ];
    return { intro: `${name}'s clip is blowing up. Use a regression model, logs and residuals to analyze its growth.`, parts };
  },
};

const ferris: Challenge = {
  id: "m4.ch.ferris-wheel",
  title: "Ferris Wheel Physics",
  needs: ["m4.sin.amp-midline", "m4.sin.period", "m4.sin.context"],
  build(r) {
    const R = r.pick([20, 25, 30, 40]), base = r.int(2, 5), P = r.pick([40, 60, 80, 120]);
    const mid = R + base;
    const model = `h(t) = −${R}cos({2π/${P}}t) + ${mid}`;
    const tq = r.pick([P / 8, (3 * P) / 8, (5 * P) / 8]);
    const hq = rnd(-R * Math.cos((2 * Math.PI * tq) / P) + mid, 1);
    const parts: Problem[] = [
      {
        prompt: `A rider boards at the bottom of a Ferris wheel. Their height in meters after t seconds is ${model}. What are the amplitude and the midline?`,
        answer: { kind: "multi", fields: [{ value: frac(R), pre: "amplitude =" }, { value: frac(mid), pre: "midline: h =" }] },
        hints: ["Amplitude = |A|; midline = the constant added.", `A = −${R}, k = ${mid}.`],
        steps: [st("Amplitude.", `|−${R}| = ${R} m (the wheel's radius)`), st("Midline.", `h = ${mid} m (the axle height)`)],
      },
      {
        prompt: "How many seconds does one full rotation take?",
        answer: num(P),
        hints: ["Period = 2π ÷ B.", `B = {2π/${P}}.`],
        steps: [st("Period.", `2π ÷ {2π/${P}} = ${P} seconds`)],
        traps: [{ value: frac(P / 2), feedback: "That's half a rotation (bottom to top)." }],
      },
      {
        prompt: "What is the rider's maximum height, and when do they first reach it?",
        answer: { kind: "multi", fields: [{ value: frac(mid + R), pre: "max height =", post: " m" }, { value: frac(P / 2), pre: "at t =", post: " s" }] },
        hints: ["Max = midline + amplitude.", "Starting at the bottom, the top comes half a rotation later."],
        steps: [st("Maximum.", `${mid} + ${R} = ${mid + R} m`), st("Time.", `half a period: ${P} ÷ 2 = ${P / 2} s`)],
      },
      {
        prompt: `How high is the rider at t = ${dec(tq)} seconds? Round to the nearest tenth of a meter.`,
        answer: num(hq, { tolerance: 0.1 }),
        hints: ["Substitute into the model (radian mode).", `cos({2π/${P}} × ${dec(tq)}) = cos(${dec((2 * tq) / P)}π).`],
        steps: [st("Substitute.", `h = −${R}cos(${dec((2 * tq) / P)}π) + ${mid}`), st("Evaluate.", `cos(${dec((2 * tq) / P)}π) = ${dec(Math.cos((2 * Math.PI * tq) / P), 4)}, so h ≈ ${dec(hq, 1)} m`)],
        traps: tolTraps(hq, 0.1, [[rnd(-R * Math.cos(rad((2 * Math.PI * tq) / P)) + mid, 1), "Check that your calculator is in radian mode."]]),
      },
    ];
    return { intro: "Model a Ferris wheel ride with a sinusoid and read its features in context.", parts };
  },
};

const poll: Challenge = {
  id: "m4.ch.school-poll",
  title: "Poll the School",
  needs: ["m4.study.sampling", "m4.ci.margin", "m4.ci.construct", "m4.ci.interpret"],
  build(r) {
    const n = r.pick([200, 250, 400, 500]);
    const x = r.int(Math.round(n * 0.45), Math.round(n * 0.7));
    const ph = x / n;
    const se = Math.sqrt((ph * (1 - ph)) / n);
    const me = rnd(1.96 * se, 3);
    const lo = rnd(ph - 1.96 * se, 3), hi = rnd(ph + 1.96 * se, 3);
    const majority = lo > 0.5;
    const parts: Problem[] = [
      {
        prompt: `The student council wants to know what share of the school's 2,000 students support a later start time. They randomly select 50 students from each grade (9–12). What kind of sample is this?`,
        answer: choice(r, "Stratified random sample", [["Cluster sample", "Clusters are whole groups surveyed entirely; here a random sample is taken within every grade."], ["Simple random sample", "Choosing a fixed number from each grade is stratifying."], ["Convenience sample", "The students were chosen at random within each grade."]]),
        hints: ["Was the population split into groups first?", "A random sample from every group is stratified."],
        steps: [st("Method.", "The grades are strata, and an SRS was taken from each: stratified random sample.")],
      },
      {
        prompt: `Of the ${n} students sampled, ${x} support a later start. Find p̂.`,
        answer: num(frac(x, n)),
        hints: ["p̂ = successes ÷ sample size.", `${x} ÷ ${n}.`],
        steps: [st("Sample proportion.", `p̂ = {${x}/${n}} = ${dec(ph, 4)}`)],
      },
      {
        prompt: "Find the margin of error for a 95% confidence interval (z* = 1.96). Round to three decimal places.",
        answer: num(me, { tolerance: 0.0015 }),
        hints: ["ME = z*·√(p̂(1 − p̂) ÷ n).", `1.96 × √(${dec(ph, 4)} × ${dec(1 - ph, 4)} ÷ ${n}).`],
        steps: [st("Standard error.", `√({${dec(ph, 4)}(${dec(1 - ph, 4)})/${n}}) ≈ ${dec(se, 4)}`), st("Margin.", `1.96 × ${dec(se, 4)} ≈ ${dec(me, 3)}`)],
        traps: tolTraps(me, 0.0015, [[se, "Multiply the standard error by z* = 1.96."]]),
      },
      {
        prompt: "Construct the 95% confidence interval. Round the endpoints to three decimal places.",
        answer: { kind: "multi", fields: [{ value: frac(Math.round(lo * 1000), 1000), pre: "from", tolerance: 0.002 }, { value: frac(Math.round(hi * 1000), 1000), pre: "to", tolerance: 0.002 }] },
        hints: ["p̂ ± ME.", `${dec(ph, 4)} ± ${dec(me, 3)}.`],
        steps: [st("Interval.", `${dec(ph, 4)} − ${dec(me, 3)} ≈ ${fix(lo, 3)} and ${dec(ph, 4)} + ${dec(me, 3)} ≈ ${fix(hi, 3)}`)],
      },
      {
        prompt: `The council president says "a majority of students support a later start." Based on the interval (${fix(lo, 3)}, ${fix(hi, 3)}), is that claim supported?`,
        answer: choice(r, majority ? "Yes: the entire interval is above 0.5, so a majority is convincing." : "Not convincingly: the interval includes values at or below 0.5.", [[majority ? "Not convincingly: the interval includes values at or below 0.5." : "Yes: the entire interval is above 0.5, so a majority is convincing.", `Compare 0.5 with the interval (${fix(lo, 3)}, ${fix(hi, 3)}).`], ["Yes: p̂ is above 0.5, so it's proven.", "A sample estimate above 0.5 isn't enough by itself; look at the whole interval."], ["No: the sample was only part of the school.", "Random samples let us estimate the whole population."]]),
        hints: ["A majority means p > 0.5.", "Is every plausible value in the interval above 0.5?"],
        steps: [st("Compare.", majority ? `Every value from ${fix(lo, 3)} to ${fix(hi, 3)} is above 0.5.` : `The interval reaches down to ${fix(lo, 3)}, which is not above 0.5.`), st("Conclusion.", majority ? "Convincing evidence of majority support." : "Not convincing evidence of a majority.")],
      },
    ];
    return { intro: "Design a fair survey, estimate support, and judge a claim with a confidence interval.", parts };
  },
};

const lootAudit: Challenge = {
  id: "m4.ch.loot-audit",
  title: "Loot Box Audit",
  needs: ["m4.dist.binomial-mean", "m4.test.hypotheses", "m4.test.z-stat", "m4.test.p-value", "m4.test.conclusion"],
  build(r) {
    const p0 = r.pick([0.1, 0.15, 0.2]);
    const n = r.pick([200, 300, 400]);
    const mu = rnd(n * p0, 4);
    const sd = Math.sqrt((p0 * (1 - p0)) / n);
    const x = Math.round(n * (p0 - r.pick([1.2, 1.8, 2.4, 2.9]) * sd));
    const ph = x / n;
    const z = rnd((ph - p0) / sd, 2);
    const pv = rnd(normCdf(z), 4);
    const reject = pv < 0.05;
    const P = Math.round(p0 * 100);
    const parts: Problem[] = [
      {
        prompt: `A game says ${P}% of its loot boxes contain a rare skin. Players open ${n} boxes. If the claim is true, how many rare skins should they expect?`,
        answer: num(mu),
        hints: ["Binomial mean: np.", `${n} × ${p0}.`],
        steps: [st("Mean.", `np = ${n}(${p0}) = ${dec(mu)}`)],
      },
      {
        prompt: "Players suspect the true rate is lower. Which hypotheses should they test?",
        answer: choice(r, `H_0: p = ${p0},  H_a: p < ${p0}`, [[`H_0: p = ${p0},  H_a: p > ${p0}`, "They suspect the rate is lower."], [`H_0: p̂ = ${p0},  H_a: p̂ < ${p0}`, "Hypotheses are about the true proportion p."], [`H_0: p = ${p0},  H_a: p ≠ ${p0}`, "They have a direction in mind: lower."]]),
        hints: ["The null is the claim.", "The alternative matches the suspicion."],
        steps: [st("Hypotheses.", `H_0: p = ${p0} (the claim), H_a: p < ${p0} (the suspicion)`)],
      },
      {
        prompt: `They found ${x} rare skins in ${n} boxes. Find the test statistic z. Round to two decimal places.`,
        answer: num(z, { tolerance: 0.015 }),
        hints: [`p̂ = ${x} ÷ ${n} = ${dec(ph, 4)}; SD = √(${p0}(${rnd(1 - p0, 2)}) ÷ ${n}).`, `z = (${dec(ph, 4)} − ${p0}) ÷ ${dec(sd, 4)}.`],
        steps: [st("Sample proportion.", `p̂ = ${dec(ph, 4)}`), st("SD under H_0.", `√({${p0}(${rnd(1 - p0, 2)})/${n}}) ≈ ${dec(sd, 4)}`), st("z.", `{${dec(ph, 4)} − ${p0}/${dec(sd, 4)}} ≈ ${dec(z)}`)],
        traps: tolTraps(z, 0.015, [[(ph - p0) / Math.sqrt((ph * (1 - ph)) / n), "Use p_0 in the standard deviation."]]),
      },
      {
        prompt: "Find the p-value. Round to four decimal places.",
        answer: num(pv, { tolerance: 0.0015 }),
        hints: ["H_a uses <, so use the left tail.", `P(Z < ${dec(z)}).`],
        steps: [st("Left tail.", `P(Z < ${dec(z)}) ≈ ${fix(pv)}`)],
        traps: tolTraps(pv, 0.0015, [[1 - pv, "H_a: p < p_0 uses the left tail."], [2 * pv, "This is a one-sided test; don't double."]]),
      },
      {
        prompt: "At α = 0.05, what should the players conclude?",
        answer: choice(r, reject ? `Reject H_0: convincing evidence that fewer than ${P}% of boxes have a rare skin.` : `Fail to reject H_0: not convincing evidence that fewer than ${P}% of boxes have a rare skin.`, [[reject ? `Fail to reject H_0: not convincing evidence that fewer than ${P}% of boxes have a rare skin.` : `Reject H_0: convincing evidence that fewer than ${P}% of boxes have a rare skin.`, `Compare ${fix(pv)} with 0.05.`], [reject ? "This proves the company lied." : `This proves the rate is exactly ${P}%.`, "Tests give evidence, not proof."]]),
        hints: ["p-value < α → reject H_0.", `${fix(pv)} vs. 0.05.`],
        steps: [st("Compare.", `${fix(pv)} ${reject ? "<" : "≥"} 0.05`), st("Conclusion.", reject ? "Reject H_0." : "Fail to reject H_0.")],
      },
    ];
    return { intro: "Is the game being honest about its drop rate? Run a one-proportion z-test.", parts };
  },
};

const rescue: Challenge = {
  id: "m4.ch.rescue",
  title: "Search and Rescue",
  needs: ["m4.trig.law-cosines", "m4.trig.law-sines", "m4.num.vectors"],
  build(r) {
    const s1 = r.int(8, 20), s2 = r.int(8, 20), C = r.int(40, 120);
    const a = Math.min(s1, s2), b = Math.max(s1, s2) + (s1 === s2 ? 2 : 0);
    const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad(C)));
    const cr = rnd(c, 1);
    const Aang = rnd((Math.asin((a * Math.sin(rad(C))) / c) * 180) / Math.PI, 1);
    const [p, q, h] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]] as [number, number, number][]);
    const k = r.pick([2, 3, 4]);
    const wind = [r.int(-5, 5), r.int(-5, 5)];
    const res = [p * k, q * k];
    const drone = [res[0] - wind[0], res[1] - wind[1]];
    const parts: Problem[] = [
      {
        prompt: `Two rescue boats leave the same station. Boat 1 travels ${a} km and Boat 2 travels ${b} km, and the angle between their paths is ${C}°. How far apart are the boats, to the nearest tenth of a km?`,
        answer: num(cr, { tolerance: 0.1 }),
        hints: ["SAS: use the Law of Cosines.", `d² = ${a}² + ${b}² − 2(${a})(${b})cos ${C}°.`],
        steps: [st("Law of Cosines.", `d² = ${a * a} + ${b * b} − ${2 * a * b}cos ${C}° ≈ ${dec(c * c, 2)}`), st("Square root.", `d ≈ ${dec(cr, 1)} km`)],
        traps: tolTraps(cr, 0.1, [[Math.sqrt(a * a + b * b), "The angle isn't 90°; include −2ab cos C."]]),
      },
      {
        prompt: `At Boat 2, what is the angle between the station and Boat 1? (It's opposite Boat 1's ${a}-km path.) Round to the nearest tenth of a degree.`,
        answer: num(Aang, { tolerance: 0.2 }),
        hints: ["Use the Law of Sines with the angle you know.", `sin θ = ${a} sin ${C}° ÷ ${dec(c, 2)}.`],
        steps: [st("Law of Sines.", `sin θ = {${a} sin ${C}°/${dec(c, 2)}} ≈ ${dec((a * Math.sin(rad(C))) / c, 4)}`), st("Inverse sine.", `θ ≈ ${dec(Aang, 1)}° (acute, since it's opposite the shorter path)`)],
      },
      {
        prompt: `A drone flies to help with velocity ⟨${drone[0]}, ${drone[1]}⟩ km/h relative to the air, while the wind is ⟨${wind[0]}, ${wind[1]}⟩ km/h. Find its actual velocity and its speed.`.replace(/-/g, "−"),
        answer: { kind: "multi", fields: [{ value: frac(res[0]), pre: "⟨" }, { value: frac(res[1]), pre: ",", post: "⟩" }, { value: frac(h * k), pre: "speed =", post: " km/h" }] },
        hints: ["Add the vectors component by component.", `Speed = √(x² + y²) of the sum.`],
        steps: [st("Add.", `⟨${res[0]}, ${res[1]}⟩`), st("Magnitude.", `√(${res[0] ** 2} + ${res[1] ** 2}) = ${h * k} km/h`)],
      },
    ];
    return { intro: "Coordinate a rescue with the Laws of Cosines and Sines, then account for wind with vectors.", parts };
  },
};

export default [viral, ferris, poll, lootAudit, rescue] satisfies Challenge[];
