// Boss-level challenges for NC Math 3: multi-part problems in context.
import { choice, exact, expr, money, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Challenge, Problem } from "../types";
import { dn, piReduce, piText, trapsTol } from "./util";

const r2 = (x: number) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------------------
const viralVideo: Challenge = {
  id: "m3.ch.viral-video",
  title: "Going Viral",
  needs: ["m3.exp.build", "m3.exp.solve", "m3.exp.rates"],
  build(r) {
    const a = r.pick([500, 800, 1200, 2000]);
    const pct = r.pick([20, 25, 30, 40, 50]);
    const b = 1 + pct / 100;
    const d = r.int(4, 8);
    const N = r.pick([100000, 250000, 500000, 1000000]);
    const name = r.pick(["Maya", "Diego", "Priya", "Kai", "Zoe"]);
    const vd = r2(a * b ** d);
    const t = Math.log(N / a) / Math.log(b);
    const weekly = r2((b ** 7 - 1) * 100);
    const parts: Problem[] = [
      {
        prompt: `${name}'s video had ${a} views when it was posted, and the views grow ${pct}% per day. Write V(t), the number of views t days after posting.`,
        answer: expr(`${a}*${b}^t`, { vars: ["t"], lhs: "V(t)", display: `${a}(${b})^t` }),
        hints: [`Start value ${a}; growth factor 1 + ${pct / 100}.`],
        steps: [st("Model.", `V(t) = ${a}(${b})^t`)],
      },
      {
        prompt: `How many views will the video have after ${d} days? Round to the nearest whole view.`,
        answer: num(Math.round(vd), { tolerance: 1 }),
        hints: [`Compute ${a}(${b})^${d}.`],
        steps: [st("Evaluate.", `${a}(${b})^${d} ≈ ${dn(vd)}, about ${Math.round(vd).toLocaleString("en-US")} views`)],
        traps: trapsTol(Math.round(vd), 1, [[a + a * (pct / 100) * d, "That's linear growth: the same number of new views each day."]]),
      },
      {
        prompt: `When will the video reach ${N.toLocaleString("en-US")} views? Round to the nearest hundredth of a day.`,
        answer: num(r2(t), { tolerance: 0.01, unit: " days" }),
        hints: [`Solve ${a}(${b})^t = ${N}: divide by ${a}, then take logs.`],
        steps: [st("Isolate the power.", `(${b})^t = ${dn(N / a, 4)}`), st("Take logs.", `t = {log(${dn(N / a, 4)})/log(${b})} ≈ ${dn(r2(t))} days`)],
        traps: trapsTol(r2(t), 0.01, [[Math.log(N) / Math.log(b), `Divide by ${a} before taking logs.`]]),
      },
      {
        prompt: `${name} wants to describe the growth per week instead of per day. What is the weekly growth rate, as a percent to two decimal places?`,
        answer: num(weekly, { tolerance: 0.01, unit: "%" }),
        hints: [`One week is 7 days, so the weekly factor is (${b})^7.`],
        steps: [st("Weekly factor.", `(${b})^7 ≈ ${dn(b ** 7, 4)}`), st("Rate.", `${dn(b ** 7, 4)} − 1 ≈ ${dn(b ** 7 - 1, 4)}, about ${dn(weekly)}% per week`)],
        traps: trapsTol(weekly, 0.01, [[7 * pct, `${7 * pct}% ignores compounding.`]]),
      },
    ];
    return { intro: `${name} posts a video that starts spreading fast. Model its views and make predictions.`, parts };
  },
};

// ---------------------------------------------------------------------------
const boxDesign: Challenge = {
  id: "m3.ch.box-design",
  title: "Design the Box",
  needs: ["m3.geo.design", "m3.poly.end-behavior"],
  build(r) {
    const W = r.pick([10, 12, 14]), L = W + r.pick([4, 6, 8]);
    const V = (x: number) => x * (L - 2 * x) * (W - 2 * x);
    const xq = r.int(1, W / 2 - 1);
    const xs = Array.from({ length: W / 2 - 1 }, (_, i) => i + 1);
    const vs = xs.map(V);
    const best = xs[vs.indexOf(Math.max(...vs))];
    const parts: Problem[] = [
      {
        prompt: `A ${W} in by ${L} in sheet of cardboard becomes an open box by cutting x-inch squares from each corner and folding up the sides. Write the volume V(x).`,
        answer: expr(`x(${L}-2x)(${W}-2x)`, { lhs: "V(x)", display: `x(${L} − 2x)(${W} − 2x)` }),
        hints: ["The box's height is x. Each side of the base loses 2x."],
        steps: [st("Dimensions.", `height x, length ${L} − 2x, width ${W} − 2x`), st("Volume.", `V(x) = x(${L} − 2x)(${W} − 2x)`)],
      },
      {
        prompt: "Which domain makes sense for this situation?",
        answer: choice(r, `0 < x < ${W / 2}`, [[`0 < x < ${L / 2}`, `The width ${W} − 2x would be negative for x > ${W / 2}.`], ["x > 0", "x can't be so large that a side length becomes negative."], [`0 < x < ${W}`, "Squares are cut from both sides of the width."]]),
        hints: [`Every dimension must be positive: x > 0 and ${W} − 2x > 0.`],
        steps: [st("Constraints.", `x > 0 and ${W} − 2x > 0, so x < ${W / 2}. (The length constraint x < ${L / 2} is weaker.)`)],
      },
      {
        prompt: `Find the volume when x = ${xq}.`,
        answer: num(V(xq), { unit: " in^3" }),
        hints: [`${xq} · ${L - 2 * xq} · ${W - 2 * xq}.`],
        steps: [st("Evaluate.", `V(${xq}) = ${xq} · ${L - 2 * xq} · ${W - 2 * xq} = ${V(xq)} in^3`)],
        traps: traps(frac(V(xq)), [trap(xq * (L - xq) * (W - xq), "Subtract 2x from each side, not x.")]),
      },
      {
        prompt: "Using the table, which whole-number cut gives the largest volume?",
        answer: num(best, { unit: " in" }),
        hints: ["Find the largest V(x) value."],
        steps: [st("Compare.", xs.map((x, i) => `V(${x}) = ${vs[i]}`).join(", ")), st("Best.", `x = ${best}`)],
        traps: traps(frac(best), [trap(Math.max(...vs), "That's the volume; the question asks for x.")]),
        visual: { type: "table", headers: ["x (in)", ...xs.map(String)], rows: [["V(x)", ...vs]] },
      },
    ];
    return { intro: `You're designing a shipping box from one sheet of cardboard.`, parts };
  },
};

// ---------------------------------------------------------------------------
const ferrisWheel: Challenge = {
  id: "m3.ch.ferris-wheel",
  title: "Ferris Wheel Physics",
  needs: ["m3.trig.model", "m3.trig.features"],
  build(r) {
    const D = r.pick([40, 50, 60, 80]), p = r.pick([2, 3, 4]), Tm = r.pick([6, 8, 10, 12]);
    const A = D / 2, C = A + p;
    const b = piReduce(2, Tm);
    const t = r.int(1, Tm - 1);
    const h = r2(A * Math.sin((2 * Math.PI * t) / Tm) + C);
    const parts: Problem[] = [
      {
        prompt: `A Ferris wheel is ${D} m across, its lowest point is ${p} m off the ground, and it turns once every ${Tm} minutes. Find the amplitude and the midline height of your height function.`,
        answer: { kind: "multi", fields: [{ value: frac(A), pre: "amplitude:" }, { value: frac(C), pre: "midline:" }] },
        hints: ["Amplitude is the radius. Midline is the height of the center."],
        steps: [st("Amplitude.", `${D} ÷ 2 = ${A}`), st("Midline.", `${p} + ${A} = ${C}`)],
      },
      {
        prompt: "What is b in h(t) = a·sin(bt) + k? Give an exact answer in terms of π.",
        answer: exact(`${b.n === 1 ? "" : b.n}pi/${b.d}`, piText(b.n, b.d)),
        hints: [`b = {2π/period} = {2π/${Tm}}.`],
        steps: [st("Period to b.", `b = {2π/${Tm}} = ${piText(b.n, b.d)}`)],
      },
      {
        prompt: "You board at the height of the center, moving up. Write h(t), your height after t minutes.",
        answer: expr(`${A}sin(${b.n === 1 ? "" : b.n}pi/${b.d}*t)+${C}`, { vars: ["t"], lhs: "h(t)", display: `${A} sin(${piText(b.n, b.d)}t) + ${C}` }),
        hints: ["Starting at the midline going up means sine with a positive amplitude."],
        steps: [st("Model.", `h(t) = ${A} sin(${piText(b.n, b.d)}t) + ${C}`)],
      },
      {
        prompt: `How high are you after ${t} minute${t === 1 ? "" : "s"}? Round to the nearest hundredth of a meter.`,
        answer: num(h, { tolerance: 0.01, unit: " m" }),
        hints: ["Substitute and use radian mode."],
        steps: [st("Evaluate.", `h(${t}) = ${A} sin(${piText(2 * t, Tm)}) + ${C} ≈ ${dn(h)} m`)],
        traps: trapsTol(h, 0.01, [[A * Math.sin(((2 * Math.PI * t) / Tm) * (Math.PI / 180)) + C, "Your calculator is in degree mode."]]),
      },
    ];
    return { intro: "Model a ride on a Ferris wheel with a sine function.", parts };
  },
};

// ---------------------------------------------------------------------------
const cellTower: Challenge = {
  id: "m3.ch.cell-tower",
  title: "Cell Tower Coverage",
  needs: ["m3.circ.equation", "m3.circ.arc-sector", "m3.circ.complete-square"],
  build(r) {
    const h = r.int(-6, 6), k = r.int(-6, 6), rad = r.pick([5, 10, 13, 15]);
    const r2v = rad * rad;
    const inside = r.chance(0.5);
    const [dx, dy] = inside ? r.pick([[3, 4], [2, 3], [1, 4], [4, 1]] as [number, number][]) : [rad, r.int(1, 3)];
    const hx = h + dx, hy = k + dy;
    const d2 = dx * dx + dy * dy;
    const deg = r.pick([60, 90, 120]);
    const sec = frac(deg * r2v, 360);
    const secT = sec.d === 1 ? `${sec.n}pi` : `${sec.n}pi/${sec.d}`, secD = sec.d === 1 ? `${sec.n}π` : `{${sec.n}π/${sec.d}}`;
    const D = -2 * h, E = -2 * k, F = h * h + k * k - r2v;
    const sgn = (c: number, v: string) => (c === 0 ? "" : `${c < 0 ? " − " : " + "}${Math.abs(c)}${v}`);
    const gen = `x^2 + y^2${sgn(D, "x")}${sgn(E, "y")}${F === 0 ? "" : F < 0 ? ` − ${-F}` : ` + ${F}`} = 0`;
    const sq = (v: string, c: number) => (c === 0 ? `${v}^2` : `(${v} ${c > 0 ? "−" : "+"} ${Math.abs(c)})^2`);
    const parts: Problem[] = [
      {
        prompt: `On a map grid in miles, a tower's coverage boundary is ${gen}. Where is the tower? Give its center (h, k) and the coverage radius.`,
        answer: { kind: "multi", fields: [{ value: frac(h), pre: "h =" }, { value: frac(k), pre: "k =" }, { value: frac(rad), pre: "radius =" }] },
        hints: ["Complete the square in x and in y."],
        steps: [st("Complete the squares.", `${sq("x", h)} + ${sq("y", k)} = ${r2v}`), st("Read off.", `Center (${h}, ${k}), radius ${rad} miles`.replace(/-/g, "−"))],
      },
      {
        prompt: `A house is at (${hx}, ${hy}). Is it inside the coverage area?`.replace(/-/g, "−"),
        answer: choice(r, d2 < r2v ? `Yes: its squared distance from the tower is ${d2}, less than ${r2v}.` : `No: its squared distance from the tower is ${d2}, more than ${r2v}.`, [[d2 < r2v ? `No: its squared distance from the tower is ${d2}, more than ${r2v}.` : `Yes: its squared distance from the tower is ${d2}, less than ${r2v}.`, "Compare (x − h)^2 + (y − k)^2 with r^2."]]),
        hints: ["Substitute the point into the left side of the circle's equation and compare with r^2."],
        steps: [st("Squared distance.", `${dx}^2 + ${dy}^2 = ${d2}`), st("Compare.", `${d2} ${d2 < r2v ? "<" : ">"} ${r2v}`)],
      },
      {
        prompt: "What area does the tower cover? Give an exact answer in terms of π (square miles).",
        answer: exact(`${r2v}pi`, `${r2v}π`),
        hints: ["Area of a circle: πr^2."],
        steps: [st("Area.", `π · ${rad}^2 = ${r2v}π mi^2`)],
      },
      {
        prompt: `A directional antenna covers only a ${deg}° sector of the same circle. What area does it cover? Give an exact answer in terms of π.`,
        answer: exact(secT, secD),
        hints: [`The sector is {${deg}/360} of the circle.`],
        steps: [st("Fraction of the circle.", `{${deg}/360} · ${r2v}π = ${secD} mi^2`)],
      },
    ];
    return { intro: "A phone company is planning coverage for a new tower.", parts };
  },
};

// ---------------------------------------------------------------------------
const printShop: Challenge = {
  id: "m3.ch.print-shop",
  title: "Hoodie Fundraiser",
  needs: ["m3.rat.context", "m3.rat.features", "m3.model.combine"],
  build(r) {
    for (;;) {
      const F = r.pick([300, 400, 500, 600, 800]), v = r.pick([10, 12, 14, 15]), p = r.pick([25, 28, 30, 35]);
      const n = r.pick([40, 50, 80, 100]);
      const target = v + F / n;
      const be = F / (p - v);
      if (!Number.isInteger(target * 2) || !Number.isInteger(be)) continue;
      const parts: Problem[] = [
        {
          prompt: `The art club orders hoodies: a $${F} setup fee plus $${v} per hoodie. Write A(x), the average cost per hoodie when x are made.`,
          answer: expr(`(${F}+${v}x)/x`, { lhs: "A(x)", display: `{${F} + ${v}x/x}` }),
          hints: ["Average cost = total cost ÷ number made."],
          steps: [st("Total cost.", `C(x) = ${F} + ${v}x`), st("Average.", `A(x) = {${F} + ${v}x/x}`)],
        },
        {
          prompt: "What is the horizontal asymptote of A(x)? Enter the value of k in y = k.",
          answer: num(v, { pre: "y = " }),
          hints: [`A(x) = {${F}/x} + ${v}. What happens to {${F}/x} when x is huge?`],
          steps: [st("Rewrite.", `A(x) = {${F}/x} + ${v}`), st("Long run.", `{${F}/x} → 0, so A(x) → ${v}: the average cost approaches the $${v} per-hoodie cost.`)],
          traps: traps(frac(v), [trap(F, "The setup fee is spread over more hoodies, so it fades away.")]),
        },
        {
          prompt: `How many hoodies must they make for the average cost to be ${money(target)}?`,
          answer: num(n, { unit: " hoodies" }),
          hints: [`Solve {${F} + ${v}x/x} = ${target}.`],
          steps: [st("Clear the denominator.", `${F} + ${v}x = ${target}x`), st("Solve.", `${F} = ${dn(target - v)}x, so x = ${n}`)],
          traps: traps(frac(n), [trap(r2(F / target), `Remember the $${v} per hoodie.`)]),
        },
        {
          prompt: `They sell each hoodie for $${p}. Write the profit P(x).`,
          answer: expr(`${p - v}x-${F}`, { lhs: "P(x)", display: `${p - v}x − ${F}` }),
          hints: ["Profit = revenue − cost."],
          steps: [st("Profit.", `${p}x − (${F} + ${v}x) = ${p - v}x − ${F}`)],
        },
        {
          prompt: "How many hoodies must they sell to break even?",
          answer: num(be, { unit: " hoodies" }),
          hints: ["Break even means P(x) = 0."],
          steps: [st("Solve.", `${p - v}x − ${F} = 0, so x = ${F} ÷ ${p - v} = ${be}`)],
          traps: traps(frac(be), [trap(r2(F / p), "Use the profit per hoodie, price minus cost.")]),
        },
      ];
      return { intro: "Your club is running a hoodie fundraiser. Figure out the costs before you order.", parts };
    }
  },
};

// ---------------------------------------------------------------------------
const clinicalTrial: Challenge = {
  id: "m3.ch.study-app",
  title: "Does the App Work?",
  needs: ["m3.stat.rand-test", "m3.stat.study-type", "m3.stat.margin-prop"],
  build(r) {
    const ctl = r.int(70, 80), diff = r.int(2, 5), trt = ctl + diff;
    const counts = [1, 2, 4, 8, 13, 22, 22, 13, 8, 4, 2, 1];
    const bins = counts.map((c, i) => ({ from: i - 6, to: i - 5, count: c }));
    const total = counts.reduce((s, c) => s + c, 0);
    const extreme = bins.filter((b) => b.from >= diff).reduce((s, b) => s + b.count, 0);
    const prop = extreme / total;
    const sig = prop < 0.05;
    const p = r.int(55, 75), sd = r.pick([3, 3.5, 4]);
    const parts: Problem[] = [
      {
        prompt: "Forty volunteers are randomly assigned: 20 use a new study app for two weeks and 20 study as usual. What type of study is this?",
        answer: choice(r, "An experiment", [["An observational study", "The researchers assigned the treatment."], ["A survey", "Subjects were given a treatment, not just asked questions."]], true),
        hints: ["Did the researchers impose a treatment?"],
        steps: [st("Answer.", "The researchers randomly assigned treatments, so it's an experiment.")],
      },
      {
        prompt: `The app group averaged ${trt} on the final quiz and the other group averaged ${ctl}. What is the observed difference (app − usual)?`,
        answer: num(diff),
        hints: ["Subtract the means."],
        steps: [st("Difference.", `${trt} − ${ctl} = ${diff}`)],
        traps: traps(frac(diff), [trap(-diff, "Subtract in the order app − usual.")]),
      },
      {
        prompt: `The histogram shows ${total} re-randomized differences, assuming the app has no effect. What proportion are at least ${diff}?`,
        visual: { type: "histogram", bins, xLabel: "difference in means (points)", yLabel: "count" },
        answer: num(frac(extreme, total), { tolerance: 0.005 }),
        hints: [`Add the counts of bars starting at ${diff} or more, then divide by ${total}.`],
        steps: [st("Count.", `${extreme} of ${total}`), st("Proportion.", `≈ ${dn(prop, 3)}`)],
        traps: trapsTol(prop, 0.005, [[extreme, "Divide the count by the total."]]),
      },
      {
        prompt: "What should the researchers conclude?",
        answer: choice(r, sig ? "The difference is statistically significant: it would rarely happen by chance alone." : "The difference is not statistically significant: chance alone could easily produce it.", [[sig ? "The difference is not statistically significant: chance alone could easily produce it." : "The difference is statistically significant: it would rarely happen by chance alone.", "Compare the proportion with about 5%."]]),
        hints: ["Results that happen less than about 5% of the time by chance are called significant."],
        steps: [st("Compare.", `${dn(prop * 100, 1)}% ${sig ? "<" : ">"} 5%`)],
      },
      {
        prompt: `In a separate random survey of 300 students, ${p}% say they'd use the app. Simulated samples have a standard deviation of ${sd}%. What is the margin of error (2 standard deviations)?`,
        answer: num(frac(2 * sd * 10, 10), { unit: "%" }),
        hints: ["Margin of error ≈ 2 · SD."],
        steps: [st("Margin.", `2 · ${sd} = ${dn(2 * sd)}%, so plausible values are ${dn(p - 2 * sd)}% to ${dn(p + 2 * sd)}%`)],
        traps: traps(frac(2 * sd * 10, 10), [trap(frac(sd * 10, 10), "Use two standard deviations.")]),
      },
    ];
    return { intro: "A tech company claims its study app raises quiz scores. Test the claim with data.", parts };
  },
};

const challenges: Challenge[] = [viralVideo, boxDesign, ferrisWheel, cellTower, printShop, clinicalTrial];
export default challenges;
