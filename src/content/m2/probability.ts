// Unit 10: Probability (events and sample spaces, two-way tables, conditional probability, independence,
// addition and multiplication rules, simulation).
import { choice, num, trap, traps } from "../helpers";
import { frac, type Frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import type { Rng } from "../../lib/rng";
import { fracText } from "./util";

const T = "m2-probability";
const F = (n: number, d: number) => frac(n, d);
const ft = (n: number, d: number) => fracText(n, d);
const raw = (n: number, d: number) => `{${n}/${d}}`;
/** "{a/b}" followed by its simplified form when that differs. */
const rs = (n: number, d: number) => `${raw(n, d)}${frac(n, d).d !== d ? ` = ${ft(n, d)}` : ""}`;

interface Table2 {
  rows: [string, string];
  cols: [string, string];
  cells: [[number, number], [number, number]];
  title: string;
}
const CONTEXTS: { title: string; rows: [string, string]; cols: [string, string] }[] = [
  { title: "Students surveyed about their favorite way to spend free time", rows: ["9th grade", "10th grade"], cols: ["Gaming", "Streaming shows"] },
  { title: "Drivers surveyed at a gas station", rows: ["Uses a phone mount", "No mount"], cols: ["Under 25", "25 or older"] },
  { title: "Phone owners surveyed", rows: ["Has a part-time job", "No job"], cols: ["Pays own phone bill", "Doesn't"] },
  { title: "Athletes at a high school", rows: ["Plays a fall sport", "Doesn't"], cols: ["Plays a spring sport", "Doesn't"] },
  { title: "Concert-goers surveyed", rows: ["Bought merch", "No merch"], cols: ["Floor ticket", "Seat ticket"] },
];

function makeTable(r: Rng, independent = false): Table2 {
  const c = r.pick(CONTEXTS);
  let cells: [[number, number], [number, number]];
  if (independent) {
    const [pn, pd] = r.pick([[1, 2], [2, 5], [3, 5], [1, 4], [3, 4], [1, 5], [2, 3], [1, 3]]);
    const r1 = pd * r.int(3, 12), r2 = pd * r.int(3, 12);
    cells = [[(r1 * pn) / pd, (r1 * (pd - pn)) / pd], [(r2 * pn) / pd, (r2 * (pd - pn)) / pd]];
  } else {
    for (;;) {
      cells = [[r.int(8, 60), r.int(8, 60)], [r.int(8, 60), r.int(8, 60)]];
      if (cells[0][0] * cells[1][1] !== cells[0][1] * cells[1][0]) break;
    }
  }
  return { title: c.title, rows: c.rows, cols: c.cols, cells };
}
const rowT = (t: Table2, i: number) => t.cells[i][0] + t.cells[i][1];
const colT = (t: Table2, j: number) => t.cells[0][j] + t.cells[1][j];
const total = (t: Table2) => rowT(t, 0) + rowT(t, 1);
function tableVisual(t: Table2, hide?: [number, number]): Visual {
  const cell = (i: number, j: number) => (hide && hide[0] === i && hide[1] === j ? "?" : t.cells[i][j]);
  return {
    type: "table",
    caption: t.title,
    headers: ["", t.cols[0], t.cols[1], "Total"],
    rows: [
      [t.rows[0], cell(0, 0), cell(0, 1), rowT(t, 0)],
      [t.rows[1], cell(1, 0), cell(1, 1), rowT(t, 1)],
      ["Total", colT(t, 0), colT(t, 1), total(t)],
    ],
  };
}

// ---------- 1. Events and sample spaces ----------
const events: Skill = {
  id: "m2.prob.events",
  title: "Events, unions, intersections and complements",
  topic: T,
  standards: ["NC.M2.S-CP.1"],
  prereqs: [],
  lesson: {
    bigIdea: "An event is a subset of the sample space. A or B (union) contains outcomes in either; A and B (intersection) contains outcomes in both; not A (complement) contains everything outside A.",
    explain: [
      "Spin a spinner numbered 1–10. A = even = {2, 4, 6, 8, 10}, B = greater than 6 = {7, 8, 9, 10}.",
      "A and B = {8, 10}. A or B = {2, 4, 6, 7, 8, 9, 10} (7 outcomes; don't count 8 and 10 twice). Not A = {1, 3, 5, 7, 9}.",
      "With equally likely outcomes, P(event) = {outcomes in the event/outcomes in the sample space}. So P(A or B) = {7/10} and P(not A) = 1 − P(A) = {5/10} = {1/2}.",
    ],
    visual: { type: "table", headers: ["Outcome", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], rows: [["In A (even)?", "", "✓", "", "✓", "", "✓", "", "✓", "", "✓"], ["In B (> 6)?", "", "", "", "", "", "", "✓", "✓", "✓", "✓"]] },
  },
  why: [
    { kind: "choice", prompt: "Why is P(not A) = 1 − P(A)?", choices: ["Every outcome is either in A or not in A, never both, so the two probabilities add to 1.", "Because probabilities are always 1/2.", "Because A and not A overlap.", "It's 1 + P(A)."], correct: 0, explain: "A and its complement split the whole sample space." },
    { kind: "written", prompt: "Explain the difference between “A or B” and “A and B” using a deck of cards with A = heart and B = face card.", keyIdeas: ["A and B means the card is a heart AND a face card (J, Q, K of hearts)", "A or B means the card is a heart, a face card, or both", "A or B includes more outcomes than A and B"], exemplar: "“A and B” is only the cards that are both hearts and face cards: the jack, queen and king of hearts (3 cards). “A or B” is every card that is a heart or a face card or both: 13 hearts plus the 9 other face cards, 22 cards." },
  ],
  generate(r, lv) {
    const n = r.pick([10, 12, 15, 20]);
    const all = Array.from({ length: n }, (_, i) => i + 1);
    const mult = r.pick([2, 3, 4, 5].filter((m) => m < n / 2));
    const cut = r.int(Math.floor(n / 3), Math.floor((2 * n) / 3));
    const A = all.filter((x) => x % mult === 0);
    const B = all.filter((x) => x > cut);
    const aName = `a multiple of ${mult}`, bName = `greater than ${cut}`;
    const and = A.filter((x) => B.includes(x));
    const or = all.filter((x) => A.includes(x) || B.includes(x));
    if (lv === 1) {
      const notA = all.filter((x) => !A.includes(x));
      return {
        prompt: `A card is drawn at random from cards numbered 1 to ${n}. Event A: the number is ${aName}. Find P(not A).`,
        answer: num(F(notA.length, n)),
        hints: [`List A: {${A.join(", ")}}.`, `P(not A) = 1 − P(A) = 1 − ${raw(A.length, n)}.`],
        steps: [st("List event A.", `{${A.join(", ")}}: ${A.length} outcomes`), st("Use the complement.", `P(not A) = 1 − ${raw(A.length, n)} = ${raw(n - A.length, n)}${F(n - A.length, n).d !== n ? ` = ${ft(n - A.length, n)}` : ""}`)],
        traps: traps(F(notA.length, n), [trap(F(A.length, n), "That's P(A). The complement is everything NOT in A.")]),
      };
    }
    if (lv === 2) {
      const ask = r.pick(["and", "or"]);
      const set = ask === "and" ? and : or;
      return {
        prompt: `Cards numbered 1 to ${n}. A: the number is ${aName}. B: the number is ${bName}. How many outcomes are in A ${ask} B?`,
        answer: num(set.length),
        hints: [`A = {${A.join(", ")}}, B = {${B.join(", ")}}.`, ask === "and" ? "Keep only the numbers in BOTH lists." : "Combine the lists, but count numbers in both lists only once."],
        steps: [st("List each event.", `A = {${A.join(", ")}}; B = {${B.join(", ")}}`), st(ask === "and" ? "Intersection: in both." : "Union: in either.", `{${set.join(", ")}}`), st("Count.", `${set.length} outcomes`)],
        traps: traps(frac(set.length), ask === "or" ? [trap(A.length + B.length, "Numbers in both A and B were counted twice.")] : [trap(A.length + B.length, "“And” means in both lists, not the total of both.")]),
      };
    }
    const ask = r.pick(["or", "notB-and-A"]);
    if (ask === "or") {
      return {
        prompt: `A number is chosen at random from 1 to ${n}. A: it is ${aName}. B: it is ${bName}. Find P(A ∪ B).`,
        answer: num(F(or.length, n)),
        hints: ["A ∪ B means A or B (or both).", `A ∩ B = {${and.join(", ")}}. Count A, add B, subtract the overlap.`],
        steps: [st("Count each event.", `A: ${A.length}, B: ${B.length}, A ∩ B: ${and.length}`), st("Count the union.", `${A.length} + ${B.length} − ${and.length} = ${or.length}`), st("Probability.", `P(A ∪ B) = ${raw(or.length, n)}${F(or.length, n).d !== n ? ` = ${ft(or.length, n)}` : ""}`)],
        traps: traps(F(or.length, n), [trap(F(A.length + B.length, n), "The overlap A ∩ B was counted twice. Subtract it once."), trap(F(and.length, n), "That's A ∩ B (and), not A ∪ B (or).")]),
      };
    }
    const set = A.filter((x) => !B.includes(x));
    return {
      prompt: `A number is chosen at random from 1 to ${n}. A: it is ${aName}. B: it is ${bName}. Find P(A and not B).`,
      answer: num(F(set.length, n)),
      hints: [`Not B = numbers ${cut} or less.`, `Keep the numbers in A that are ${cut} or less.`],
      steps: [st("List A.", `{${A.join(", ")}}`), st("Remove those in B.", `{${set.join(", ")}}: ${set.length} outcomes`), st("Probability.", `${raw(set.length, n)}${F(set.length, n).d !== n ? ` = ${ft(set.length, n)}` : ""}`)],
      traps: traps(F(set.length, n), [trap(F(and.length, n), "That's A and B. You need the part of A outside B.")]),
    };
  },
};

// ---------- 2. Two-way tables ----------
const twoWay: Skill = {
  id: "m2.prob.two-way-tables",
  title: "Two-way tables: joint and marginal probabilities",
  topic: T,
  standards: ["NC.M2.S-CP.4"],
  prereqs: ["m2.prob.events"],
  lesson: {
    bigIdea: "A two-way table counts outcomes by two categories at once. Joint probabilities use one cell; marginal probabilities use a row or column total; both divide by the grand total.",
    explain: [
      "200 students: 45 are 9th graders who prefer gaming, and 110 students in all prefer gaming.",
      "Joint: P(9th grade and gaming) = {45/200}. Marginal: P(gaming) = {110/200} = {11/20}.",
      "Missing cells come from the totals: if a row total is 90 and one cell is 45, the other is 45.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why do you divide by the grand total for a joint probability like P(9th grade and gaming)?", choices: ["The question is about all the people surveyed, so the whole group is the sample space.", "Because the row total is always bigger.", "Because joint means divide by the column total.", "You divide by the cell count."], correct: 0, explain: "A joint probability picks one person from the entire group." },
    { kind: "written", prompt: "In a two-way table, explain why the four inside cells add to the grand total.", keyIdeas: ["each person is in exactly one row and one column", "so each person is counted in exactly one cell", "adding all cells counts everyone once"], exemplar: "Every person belongs to exactly one row category and one column category, so they're counted in exactly one inside cell. Adding all four cells counts each person once, which is the grand total." },
  ],
  generate(r, lv) {
    const t = makeTable(r);
    const N = total(t);
    if (lv === 1) {
      const j = r.int(0, 1);
      return {
        prompt: `Use the table. What is the probability that a randomly chosen person is in the “${t.cols[j]}” column?`,
        visual: tableVisual(t),
        answer: num(F(colT(t, j), N)),
        hints: ["This is a marginal probability: use the column total.", `${raw(colT(t, j), N)}.`],
        steps: [st("Use the column total over the grand total.", `${rs(colT(t, j), N)}`)],
        traps: traps(F(colT(t, j), N), [trap(F(t.cells[0][j], N), "That's only one cell. Use the whole column total."), trap(F(colT(t, j), colT(t, 1 - j)), "Divide by the grand total, not the other column.")]),
      };
    }
    if (lv === 2) {
      const i = r.int(0, 1), j = r.int(0, 1);
      return {
        prompt: `Use the table. Find P(${t.rows[i]} and ${t.cols[j]}).`,
        visual: tableVisual(t),
        answer: num(F(t.cells[i][j], N)),
        hints: ["“And” means one inside cell: the row and column both apply.", `That cell is ${t.cells[i][j]}. Divide by the grand total ${N}.`],
        steps: [st("Find the joint cell.", `${t.rows[i]} and ${t.cols[j]}: ${t.cells[i][j]}`), st("Divide by the grand total.", `${rs(t.cells[i][j], N)}`)],
        traps: traps(F(t.cells[i][j], N), [trap(F(t.cells[i][j], rowT(t, i)), "That divides by the row total, which is a conditional probability. Joint uses the grand total."), trap(F(rowT(t, i) + colT(t, j) - t.cells[i][j], N), "That's “or,” not “and.”")]),
      };
    }
    const hi = r.int(0, 1), hj = r.int(0, 1);
    const want = t.cells[hi][hj];
    return {
      prompt: `One cell of the table is missing. Find P(${t.rows[hi]} and ${t.cols[hj]}).`,
      visual: tableVisual(t, [hi, hj]),
      answer: num(F(want, N)),
      hints: [`Use the row total: ${rowT(t, hi)} − ${t.cells[hi][1 - hj]}.`, `The missing cell is ${want}. Divide by ${N}.`],
      steps: [st("Find the missing cell.", `${rowT(t, hi)} − ${t.cells[hi][1 - hj]} = ${want}`), st("Check with the column.", `${colT(t, hj)} − ${t.cells[1 - hi][hj]} = ${want} ✓`), st("Probability.", `${rs(want, N)}`)],
      traps: traps(F(want, N), [trap(want, "That's the count. Probability divides by the grand total.")]),
    };
  },
};

// ---------- 3. Conditional probability ----------
const conditional: Skill = {
  id: "m2.prob.conditional",
  title: "Conditional probability",
  topic: T,
  standards: ["NC.M2.S-CP.3", "NC.M2.S-CP.3a", "NC.M2.S-CP.6"],
  prereqs: ["m2.prob.two-way-tables"],
  lesson: {
    bigIdea: "P(A | B) is the probability of A given that B happened: the fraction of B's outcomes that are also in A. B becomes the new sample space.",
    explain: [
      "Of 120 students who stream shows, 48 are 9th graders. P(9th grade | streams) = {48/120} = **{2/5}**: divide by the streaming total, not by everyone.",
      "Order matters. P(streams | 9th grade) divides by the number of 9th graders instead, which is usually a different number.",
      "Formula version: P(A | B) = {P(A and B)/P(B)}.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is the denominator of P(A | B) the number of outcomes in B?", choices: ["“Given B” means we only look at outcomes where B happened.", "Because A is always smaller than B.", "Because B is the grand total.", "It should be the number in A."], correct: 0, explain: "The condition shrinks the sample space to B." },
    { kind: "written", prompt: "Explain with an example why P(A | B) and P(B | A) can be very different.", keyIdeas: ["they have the same numerator (A and B) but different denominators", "P(A | B) divides by B; P(B | A) divides by A", "example: P(basketball player | over 6 ft) is not P(over 6 ft | basketball player)"], exemplar: "Both use the overlap A and B on top, but P(A | B) divides by the count of B while P(B | A) divides by the count of A. For example, most pro basketball players are over 6 ft, so P(over 6 ft | player) is high, but very few people over 6 ft are pro players, so P(player | over 6 ft) is tiny." },
  ],
  generate(r, lv) {
    const t = makeTable(r);
    const N = total(t);
    const i = r.int(0, 1), j = r.int(0, 1);
    const cell = t.cells[i][j];
    if (lv === 1 || lv === 2) {
      const givenCol = lv === 1 ? true : r.chance(0.5);
      const den = givenCol ? colT(t, j) : rowT(t, i);
      const A = givenCol ? t.rows[i] : t.cols[j], B = givenCol ? t.cols[j] : t.rows[i];
      const other = givenCol ? rowT(t, i) : colT(t, j);
      return {
        prompt: `Use the table. Find P(${A} | ${B}).`,
        visual: tableVisual(t),
        answer: num(F(cell, den)),
        hints: [`“Given ${B}” means only look at the ${B} ${givenCol ? "column" : "row"}: ${den} people.`, `Of those, ${cell} are also ${A}.`],
        steps: [st("Restrict to the condition.", `${B}: ${den} people`), st("Count those also in A.", `${cell}`), st("Divide.", `${rs(cell, den)}`)],
        traps: traps(F(cell, den), [trap(F(cell, other), `That's P(${B} | ${A}). The condition (after the bar) gives the denominator.`), trap(F(cell, N), "That's the joint probability. Given B, divide by B's total.")]),
      };
    }
    const pB = F(r.pick([2, 3, 4, 5]), 10), pAB = F(r.pick([1, 2]), 10);
    const ans = F(pAB.n * pB.d, pAB.d * pB.n);
    const s = (f: Frac) => (f.n / f.d).toString();
    return {
      prompt: `For a randomly chosen student, P(plays an instrument) = ${s(pB)} and P(plays an instrument and is in the school musical) = ${s(pAB)}. Find P(in the musical | plays an instrument).`,
      answer: num(ans),
      hints: ["P(A | B) = P(A and B) ÷ P(B).", `${s(pAB)} ÷ ${s(pB)}.`],
      steps: [st("Use the formula.", "P(musical | instrument) = {P(musical and instrument)/P(instrument)}"), st("Substitute.", `{${s(pAB)}/${s(pB)}} = ${ft(ans.n, ans.d)}`)],
      traps: traps(ans, [trap(F(pAB.n * pB.n, pAB.d * pB.d), "Divide by P(B); don't multiply."), trap(F(pB.n * pAB.d, pB.d * pAB.n), "That's upside down: P(A and B) goes on top.")]),
    };
  },
};

// ---------- 4. Independence ----------
const independence: Skill = {
  id: "m2.prob.independence",
  title: "Independent events",
  topic: T,
  standards: ["NC.M2.S-CP.3b", "NC.M2.S-CP.4", "NC.M2.S-CP.5", "NC.M2.S-CP.3"],
  prereqs: ["m2.prob.conditional"],
  lesson: {
    bigIdea: "A and B are independent if knowing B happened doesn't change the probability of A: P(A | B) = P(A). Equivalently, P(A and B) = P(A) · P(B).",
    explain: [
      "From a table: P(seat belt) = {180/200} = 0.9. P(seat belt | under 25) = {54/60} = 0.9. They match, so in this data wearing a seat belt is independent of age group.",
      "If P(A | B) were 0.75 instead, knowing someone is under 25 would change the chances: not independent (dependent).",
      "Everyday language: “Your chance of being late given that it's raining is higher than your chance of being late overall” means late and rain are dependent.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does P(A | B) = P(A) mean A and B are independent?", choices: ["Learning that B happened gives no information about A; its probability stays the same.", "Because A and B can't both happen.", "Because P(B) = 0.", "Because A and B are the same event."], correct: 0, explain: "Independence means one event doesn't affect the chance of the other." },
    { kind: "written", prompt: "Explain the difference between independent events and mutually exclusive (disjoint) events.", keyIdeas: ["independent: one happening doesn't change the probability of the other", "mutually exclusive: they can't happen together, P(A and B) = 0", "disjoint events with positive probabilities are dependent, since one happening makes the other impossible"], exemplar: "Independent means knowing one happened doesn't change the chance of the other. Mutually exclusive means they can't both happen. If A and B are mutually exclusive and A happens, B's probability drops to 0, so they are actually dependent (unless one has probability 0)." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const scen = r.pick([
        { q: "P(a student is late to school | it is raining) = 0.30, while P(late) = 0.12. What does this tell you?", c: "Being late and rain are dependent: rain makes being late more likely.", w: [["Being late and rain are independent.", "Independent would need P(late | rain) = P(late)."], ["Rain makes being late less likely.", "0.30 > 0.12, so it's more likely."], ["30% of late students came on rainy days.", "That would be P(rain | late), a different conditional probability."]] },
        { q: "In a survey, P(likes pineapple pizza | plays video games) = 0.40 and P(likes pineapple pizza) = 0.40. What does this suggest?", c: "Liking pineapple pizza is independent of playing video games.", w: [["Gamers are more likely to like pineapple pizza.", "The two probabilities are equal."], ["The events are mutually exclusive.", "Mutually exclusive would mean P(both) = 0."], ["40% of pineapple fans are gamers.", "That would be P(gamer | pineapple), which isn't given."]] },
        { q: "P(gets an A | studied at least 3 hours) = 0.65 and P(gets an A) = 0.35. Which statement is supported?", c: "Getting an A and studying 3+ hours are dependent; studying is associated with higher chances of an A.", w: [["They are independent because both are probabilities of an A.", "Independence needs P(A | studied) = P(A)."], ["65% of students who got an A studied 3+ hours.", "That's P(studied | A), the reverse condition."], ["Studying lowers the chance of an A.", "0.65 > 0.35."]] },
      ]);
      return {
        prompt: scen.q,
        answer: choice(r, scen.c, scen.w as [string, string][]),
        hints: ["Compare the conditional probability with the overall probability.", "Equal means independent; different means the condition changes the chances (dependent)."],
        steps: [st("Compare.", "If P(A | B) = P(A), the events are independent; otherwise, dependent."), st("Conclude.", scen.c)],
      };
    }
    const indep = r.chance(0.5);
    const t = makeTable(r, indep);
    const N = total(t);
    const i = 0, j = 0;
    const pA = F(rowT(t, i), N), pAgB = F(t.cells[i][j], colT(t, j));
    const isIndep = pA.n * pAgB.d === pAgB.n * pA.d;
    const correct = isIndep ? "Independent" : "Not independent";
    if (lv === 1) {
      return {
        prompt: `Use the table. Find P(${t.rows[0]} | ${t.cols[0]}).`,
        visual: tableVisual(t),
        answer: num(pAgB),
        hints: [`Restrict to the ${t.cols[0]} column: ${colT(t, 0)} people.`, `${t.cells[0][0]} of them are ${t.rows[0]}.`],
        steps: [st("Conditional probability.", `${rs(t.cells[0][0], colT(t, 0))}`), st("Compare with the overall rate.", `P(${t.rows[0]}) = ${rs(rowT(t, 0), N)}: ${isIndep ? "the same, so the events are independent" : "different, so the events are dependent"}.`)],
        traps: traps(pAgB, [trap(pA, "That's P(A) overall, not given B."), trap(F(t.cells[0][0], rowT(t, 0)), "That's the reverse condition.")]),
      };
    }
    return {
      prompt: `Use the table. Are the events “${t.rows[0]}” and “${t.cols[0]}” independent?`,
      visual: tableVisual(t),
      answer: choice(r, correct, [[isIndep ? "Not independent" : "Independent", `Compare P(${t.rows[0]}) = ${ft(pA.n, pA.d)} with P(${t.rows[0]} | ${t.cols[0]}) = ${ft(pAgB.n, pAgB.d)}.`], ["You can't tell from a table", "A table gives every probability you need to compare."]], true),
      hints: [`Find P(${t.rows[0]}) using the row total and the grand total.`, `Find P(${t.rows[0]} | ${t.cols[0]}) using only the ${t.cols[0]} column. Are they equal?`],
      steps: [st("Overall probability.", `P(${t.rows[0]}) = ${rs(rowT(t, 0), N)}`), st("Conditional probability.", `P(${t.rows[0]} | ${t.cols[0]}) = ${rs(t.cells[0][0], colT(t, 0))}`), st("Compare.", isIndep ? "Equal, so the events are independent." : "Not equal, so the events are not independent.")],
    };
  },
};

// ---------- 5. Addition rule ----------
const addition: Skill = {
  id: "m2.prob.addition-rule",
  title: "The addition rule",
  topic: T,
  standards: ["NC.M2.S-CP.7"],
  prereqs: ["m2.prob.two-way-tables"],
  lesson: {
    bigIdea: "P(A or B) = P(A) + P(B) − P(A and B). Subtract the overlap so it isn't counted twice.",
    explain: [
      "P(student plays a sport) = 0.45, P(student is in band) = 0.30, P(both) = 0.10. P(sport or band) = 0.45 + 0.30 − 0.10 = **0.65**.",
      "In a two-way table: P(row A or column B) = (row total + column total − shared cell) ÷ grand total.",
      "If A and B can't both happen (mutually exclusive), P(A and B) = 0 and the rule is just P(A) + P(B).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why do you subtract P(A and B) in the addition rule?", choices: ["Outcomes in both A and B were counted once in P(A) and again in P(B).", "Because probabilities can't be more than 1.", "Because A and B are independent.", "You only subtract when A and B are disjoint."], correct: 0, explain: "The overlap is double-counted when you add." },
    { kind: "written", prompt: "P(A) = 0.6 and P(B) = 0.7. Explain why A and B can't be mutually exclusive.", keyIdeas: ["if they were, P(A or B) = 0.6 + 0.7 = 1.3", "a probability can't be more than 1", "so they must overlap: P(A and B) ≥ 0.3"], exemplar: "If they couldn't happen together, P(A or B) would be 0.6 + 0.7 = 1.3, but no probability is bigger than 1. So A and B must overlap, by at least 0.3." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.int(20, 60), b = r.int(15, 50), both = r.int(5, Math.min(a, b) - 2);
      const ans = (a + b - both) / 100;
      const ev = r.pick([["has a streaming subscription", "has a gaming console"], ["plays a sport", "has a part-time job"], ["owns a bike", "has a driver's license"]]);
      return {
        prompt: `For a randomly chosen teen, P(${ev[0]}) = ${a / 100}, P(${ev[1]}) = ${b / 100}, and P(both) = ${both / 100}. Find P(${ev[0]} or ${ev[1]}).`,
        answer: num(ans),
        hints: ["P(A or B) = P(A) + P(B) − P(A and B).", `${a / 100} + ${b / 100} − ${both / 100}.`],
        steps: [st("Use the addition rule.", `P(A or B) = ${a / 100} + ${b / 100} − ${both / 100}`), st("Compute.", `${ans}`)],
        traps: traps(frac(ans), [trap(frac((a + b) / 100), "The overlap was counted twice. Subtract P(both)."), trap(frac((a + b + both) / 100), "Subtract the overlap; don't add it.")]),
      };
    }
    if (lv === 2) {
      const t = makeTable(r);
      const N = total(t);
      const i = r.int(0, 1), j = r.int(0, 1);
      const n = rowT(t, i) + colT(t, j) - t.cells[i][j];
      return {
        prompt: `Use the table. Find P(${t.rows[i]} or ${t.cols[j]}).`,
        visual: tableVisual(t),
        answer: num(F(n, N)),
        hints: [`Add the ${t.rows[i]} row total and the ${t.cols[j]} column total, then subtract the cell they share.`, `${rowT(t, i)} + ${colT(t, j)} − ${t.cells[i][j]} = ${n}. Divide by ${N}.`],
        steps: [st("Add the totals.", `${rowT(t, i)} + ${colT(t, j)} = ${rowT(t, i) + colT(t, j)}`), st("Subtract the overlap.", `− ${t.cells[i][j]} = ${n}`), st("Probability.", `${rs(n, N)}`)],
        traps: traps(F(n, N), [trap(F(rowT(t, i) + colT(t, j), N), "The shared cell was counted twice."), trap(F(t.cells[i][j], N), "That's “and,” not “or.”")]),
      };
    }
    const a = r.int(30, 60), b = r.int(20, 50);
    const both = r.int(5, Math.min(a, b) - 5);
    const or = a + b - both;
    return {
      prompt: `P(A) = ${a / 100}, P(B) = ${b / 100} and P(A or B) = ${or / 100}. Find P(A and B).`,
      answer: num(both / 100),
      hints: ["Start from P(A or B) = P(A) + P(B) − P(A and B).", `${or / 100} = ${a / 100} + ${b / 100} − P(A and B).`],
      steps: [st("Write the addition rule.", `${or / 100} = ${a / 100} + ${b / 100} − P(A and B)`), st("Solve.", `P(A and B) = ${(a + b) / 100} − ${or / 100} = ${both / 100}`)],
      traps: traps(frac(both / 100), [trap(frac((a * b) / 10000), "Multiplying works only for independent events; use the addition rule here.")]),
    };
  },
};

// ---------- 6. Multiplication rule ----------
const multiplication: Skill = {
  id: "m2.prob.multiplication-rule",
  title: "The multiplication rule",
  topic: T,
  standards: ["NC.M2.S-CP.8"],
  prereqs: ["m2.prob.conditional"],
  lesson: {
    bigIdea: "P(A and B) = P(A) · P(B | A). If A and B are independent, P(B | A) = P(B), so P(A and B) = P(A) · P(B).",
    explain: [
      "A playlist has 5 rap and 7 pop songs. Two different songs are picked at random (no repeats). P(both rap) = {5/12} · {4/11} = {20/132} = **{5/33}**. After one rap song is gone, 4 of the remaining 11 are rap.",
      "With replacement (or independent events) the second probability doesn't change: P(rap, then rap) = {5/12} · {5/12} = {25/144}.",
      "Coin and die: P(heads and a 6) = {1/2} · {1/6} = {1/12}, because the coin doesn't affect the die.",
    ],
  },
  why: [
    { kind: "choice", prompt: "When drawing without replacement, why does the second probability change?", choices: ["The first item is gone, so there are fewer items and maybe fewer of the kind you want.", "Because probabilities always decrease.", "Because the events are independent.", "It doesn't change."], correct: 0, explain: "Removing an item changes both the numerator and the denominator." },
    { kind: "written", prompt: "Explain why P(A and B) = P(A) · P(B | A) makes sense, using fractions of a group.", keyIdeas: ["P(A) is the fraction of the group in A", "P(B | A) is the fraction of those A's that are also B", "a fraction of a fraction: multiply to get the fraction in both"], exemplar: "P(A) is the fraction of everyone that's in A. P(B | A) is the fraction of those A people who are also in B. Taking a fraction of a fraction means multiplying, which gives the fraction of everyone in both A and B." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const sides = r.pick([4, 6, 8, 10, 12]);
      const k = r.int(1, Math.floor(sides / 2));
      const ans = F(k, 2 * sides);
      return {
        prompt: `You flip a fair coin and roll a fair ${sides}-sided die. Find P(heads and a number ${k === 1 ? "equal to 1" : `from 1 to ${k}`}).`,
        answer: num(ans),
        hints: ["The coin and the die don't affect each other: independent.", `Multiply: {1/2} · {${k}/${sides}}.`],
        steps: [st("Independent events: multiply.", `P = {1/2} · ${raw(k, sides)} = ${raw(k, 2 * sides)}`), ...(ans.d !== 2 * sides ? [st("Simplify.", ft(ans.n, ans.d))] : [])],
        traps: traps(ans, [trap(F(sides + 2 * k, 2 * sides), "“And” for independent events multiplies; adding gives a different (wrong) value.")]),
      };
    }
    const a = r.int(3, 8), b = r.int(3, 9);
    const n = a + b;
    const items = r.pick([["red", "blue", "marbles in a bag"], ["rap", "pop", "songs on a playlist"], ["cherry", "lime", "candies in a jar"], ["senior", "junior", "names in a hat"]]);
    if (lv === 2) {
      const ans = F(a * (a - 1), n * (n - 1));
      return {
        prompt: `There are ${a} ${items[0]} and ${b} ${items[1]} ${items[2]}. Two are chosen at random without replacement. Find P(both ${items[0]}).`,
        visual: { type: "tape", rows: [{ label: "Start", segments: [{ text: `${a} ${items[0]}`, size: a, shade: true }, { text: `${b} ${items[1]}`, size: b }] }, { label: "After one " + items[0], segments: [{ text: `${a - 1} ${items[0]}`, size: a - 1, shade: true }, { text: `${b} ${items[1]}`, size: b }] }] },
        answer: num(ans),
        hints: [`First pick: ${raw(a, n)}.`, `After removing one ${items[0]}, there are ${a - 1} ${items[0]} out of ${n - 1}. Multiply.`],
        steps: [st("First pick.", `P(${items[0]}) = ${raw(a, n)}`), st("Second pick, given the first.", `P(${items[0]} | ${items[0]} first) = ${raw(a - 1, n - 1)}`), st("Multiply.", `${raw(a, n)} · ${raw(a - 1, n - 1)} = ${rs(a * (a - 1), n * (n - 1))}`)],
        traps: traps(ans, [trap(F(a * a, n * n), "That's with replacement. Without replacement, the second pick has one fewer of each."), trap(F(2 * a, n), "Multiply the two probabilities; don't add.")]),
      };
    }
    const ans = F(2 * a * b, n * (n - 1));
    return {
      prompt: `There are ${a} ${items[0]} and ${b} ${items[1]} ${items[2]}. Two are chosen at random without replacement. Find the probability of getting one of each.`,
      answer: num(ans),
      hints: [`One of each can happen two ways: ${items[0]} then ${items[1]}, or ${items[1]} then ${items[0]}.`, `${raw(a, n)} · ${raw(b, n - 1)} + ${raw(b, n)} · ${raw(a, n - 1)}.`],
      steps: [st(`${items[0]} then ${items[1]}.`, `${raw(a, n)} · ${raw(b, n - 1)} = ${raw(a * b, n * (n - 1))}`), st(`${items[1]} then ${items[0]}.`, `${raw(b, n)} · ${raw(a, n - 1)} = ${raw(a * b, n * (n - 1))}`), st("Add the two ways.", `${rs(2 * a * b, n * (n - 1))}`)],
      traps: traps(ans, [trap(F(a * b, n * (n - 1)), "That's only one order. One of each can happen in either order."), trap(F(2 * a * b, n * n), "Without replacement the second denominator is " + (n - 1) + ".")]),
    };
  },
};

// ---------- 7. Simulation ----------
const simulation: Skill = {
  id: "m2.prob.simulation",
  title: "Simulation: experimental vs. theoretical",
  topic: T,
  standards: ["NC.M2.S-IC.2"],
  prereqs: ["m2.prob.events"],
  lesson: {
    bigIdea: "Experimental probability = {times it happened/number of trials}. Simulations vary by chance, but with many trials the result should be close to the theoretical probability if the model is right.",
    explain: [
      "Theoretical: P(rolling a sum of 7 with two dice) = {6/36} = {1/6} ≈ 0.167.",
      "A class simulates 300 rolls and gets 52 sevens: {52/300} ≈ 0.173. That's close to 0.167, so the results are consistent with fair dice.",
      "If they got 120 sevens (0.40), that would be far too many to blame on chance: evidence the model (fair dice) is wrong.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why might 10 coin flips give 7 heads even though the coin is fair?", choices: ["Small samples vary a lot by chance; the long-run proportion is what approaches 1/2.", "Because the coin must be unfair.", "Because heads is more likely early on.", "Because theoretical probability is wrong."], correct: 0, explain: "Random variation is large for few trials and shrinks as trials increase." },
    { kind: "written", prompt: "A spinner is supposed to land on red 1/4 of the time. In 400 spins it lands on red 180 times. Explain whether the spinner seems fair.", keyIdeas: ["expected about 400 · 1/4 = 100 reds", "180/400 = 0.45, far from 0.25", "with so many trials that's too big a difference for chance: the spinner is probably not fair"], exemplar: "A fair spinner would land on red about 400 · 1/4 = 100 times. It landed on red 180 times, or 45% of the time, compared with the expected 25%. With 400 spins, a gap that big is very unlikely by chance, so the spinner probably isn't fair." },
  ],
  generate(r, lv) {
    const setup = r.pick([
      { what: "rolling a 1 or 2 on a fair six-sided die", p: F(1, 3) },
      { what: "a fair coin landing heads", p: F(1, 2) },
      { what: "a fair spinner with 4 equal sections landing on blue", p: F(1, 4) },
      { what: "a fair spinner with 5 equal sections landing on gold", p: F(1, 5) },
      { what: "rolling a sum of 7 with two fair dice", p: F(1, 6) },
    ]);
    const trials = r.pick([120, 180, 240, 300, 360, 600]);
    const expected = (trials * setup.p.n) / setup.p.d;
    if (lv === 1) {
      const got = Math.round(expected + r.int(-6, 6));
      return {
        prompt: `A simulation of ${setup.what} ran ${trials} trials and the event happened ${got} times. What is the experimental probability? (Give a fraction or decimal.)`,
        visual: { type: "table", headers: ["Trials", "Event happened", "Didn't happen"], rows: [[trials, got, trials - got]] },
        answer: num(F(got, trials)),
        hints: ["Experimental probability = (times it happened) ÷ (number of trials).", `${raw(got, trials)}.`],
        steps: [st("Divide.", `${raw(got, trials)} = ${(got / trials).toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}`), st("Compare.", `The theoretical probability is ${ft(setup.p.n, setup.p.d)} ≈ ${(setup.p.n / setup.p.d).toFixed(3)}, which is close.`)],
        traps: traps(F(got, trials), [trap(setup.p, "That's the theoretical probability. Use the simulation results."), trap(F(trials - got, trials), "That's the probability it didn't happen.")]),
      };
    }
    if (lv === 2) {
      return {
        prompt: `In ${trials} trials of ${setup.what}, about how many times would you expect the event to happen?`,
        answer: num(expected),
        hints: [`The theoretical probability is ${ft(setup.p.n, setup.p.d)}.`, `Expected count = ${trials} × ${ft(setup.p.n, setup.p.d)}.`],
        steps: [st("Theoretical probability.", ft(setup.p.n, setup.p.d)), st("Multiply by the number of trials.", `${trials} × ${ft(setup.p.n, setup.p.d)} = ${expected}`)],
        traps: traps(frac(expected), [trap(trials / 2, "Not every event has a 1/2 chance. Use this event's probability.")]),
      };
    }
    const consistent = r.chance(0.5);
    const got = consistent ? Math.round(expected + r.int(-5, 5)) : Math.round(expected * r.pick([1.6, 1.8, 0.45, 0.5]));
    const correct = consistent ? "Yes: the experimental probability is close to the theoretical probability." : "No: with this many trials, the result is too far from the theoretical probability to blame on chance.";
    return {
      prompt: `A game app claims to simulate ${setup.what}. In ${trials} trials the event happened ${got} times. Are the results consistent with the claim?`,
      visual: { type: "table", headers: ["Trials", "Event happened", "Experimental P", "Theoretical P"], rows: [[trials, got, (got / trials).toFixed(3), (setup.p.n / setup.p.d).toFixed(3)]] },
      answer: choice(r, correct, [[consistent ? "No: with this many trials, the result is too far from the theoretical probability to blame on chance." : "Yes: the experimental probability is close to the theoretical probability.", `Expected about ${expected}; got ${got}.`], ["You can't compare experimental and theoretical probability.", "Comparing them is exactly how you test a model."]]),
      hints: [`Expected count: ${trials} × ${ft(setup.p.n, setup.p.d)} = ${expected}.`, "Small differences are normal chance variation; a big difference over many trials suggests the model is wrong."],
      steps: [st("Expected count.", `${expected}`), st("Compare.", `Got ${got}: ${(got / trials).toFixed(3)} vs ${(setup.p.n / setup.p.d).toFixed(3)}.`), st("Decide.", correct)],
    };
  },
};

const skills: Skill[] = [events, twoWay, conditional, independence, addition, multiplication, simulation];
export default skills;
