// Unit 10: Complex numbers and matrices (PC.N.1.1–N.1.2, PC.N.2.1–N.2.5).
import { choice, ms, num, sn, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Answer, Skill, Visual } from "../types";

const T = "pc-complex-matrices";

// ---------- Complex numbers ----------
const cx = (a: number, b: number) => (b === 0 ? ms(a) : a === 0 ? `${b === 1 ? "" : b === -1 ? "−" : ms(b)}i` : `${ms(a)} ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}i`);
/** Signed sum of terms like [[12, ""], [−18, "i"]] → "12 − 18i". */
const sumT = (ts: [number, string][]) => ts.filter(([c]) => c !== 0).map(([c, v], i) => `${i === 0 ? (c < 0 ? "−" : "") : c < 0 ? " − " : " + "}${Math.abs(c) === 1 && v ? "" : Math.abs(c)}${v}`).join("") || "0";
const cxP = (a: number, b: number) => `(${cx(a, b)})`;
const cxAns = (a: number, b: number): Answer => ({ kind: "multi", fields: [{ value: frac(a) }, { value: frac(b), pre: "+", post: "i" }] });

const complexAdd: Skill = {
  id: "pc.cxmat.complex-add",
  title: "Add and subtract complex numbers",
  topic: T,
  standards: ["PC.N.1.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A complex number a + bi has a real part a and an imaginary part b. Add or subtract real parts with real parts and imaginary parts with imaginary parts, like combining like terms.",
    explain: [
      "(3 + 5i) + (2 − 7i) = (3 + 2) + (5 − 7)i = **5 − 2i**.",
      "Subtracting distributes the minus to both parts: (4 − i) − (6 + 3i) = 4 − 6 + (−1 − 3)i = **−2 − 4i**.",
      "Picture a + bi as the point (a, b): adding complex numbers works exactly like adding vectors.",
    ],
    visual: { type: "geo", grid: true, showLabels: true, points: { O: { x: 0, y: 0 }, P: { x: 3, y: 5 }, Q: { x: 2, y: -7 }, S: { x: 5, y: -2 } }, segments: [{ from: "O", to: "P", label: "3 + 5i" }, { from: "O", to: "Q", label: "2 − 7i" }, { from: "O", to: "S", label: "sum", dashed: true }] },
    tip: "Type the answer as two numbers: the real part, then the coefficient of i.",
  },
  why: [
    { kind: "choice", prompt: "Why can't 3 + 5i be combined into a single term like 8i?", choices: ["3 is real and 5i is imaginary: they're unlike terms, like 3 and 5x.", "Because i is negative.", "They can: 3 + 5i = 8i.", "Because complex numbers can't be added."], correct: 0, explain: "Real and imaginary parts are different kinds of quantities, just as constants and x-terms are. They stay separate." },
    { kind: "written", prompt: "Explain the most common mistake in (5 + 2i) − (3 − 4i) and how to avoid it.", keyIdeas: ["the minus applies to both parts of the second number", "−(3 − 4i) = −3 + 4i", "answer 2 + 6i, not 2 − 2i"], exemplar: "The minus sign has to be distributed to both parts: −(3 − 4i) = −3 + 4i. Then 5 − 3 = 2 and 2i + 4i = 6i, so the answer is 2 + 6i. Forgetting to flip the sign on −4i gives the wrong answer 2 − 2i." },
  ],
  generate(r, lv) {
    const a = r.int(-9, 9), b = r.nonzero(-9, 9), c = r.int(-9, 9), d = r.nonzero(-9, 9);
    if (lv < 3) {
      const sub = lv === 2;
      const re = sub ? a - c : a + c, im = sub ? b - d : b + d;
      return {
        prompt: `Simplify ${cxP(a, b)} ${sub ? "−" : "+"} ${cxP(c, d)}. Write it as a + bi.`,
        answer: cxAns(re, im),
        hints: ["Combine real parts with real parts and imaginary parts with imaginary parts.", sub ? `Distribute the minus: −${cxP(c, d)} = ${cx(-c, -d)}.` : `Real: ${ms(a)} + ${sn(c)}. Imaginary: ${ms(b)} + ${sn(d)}.`],
        steps: [
          ...(sub ? [st("Distribute the minus sign.", `${cx(a, b)} + ${cxP(-c, -d)}`)] : []),
          st("Real parts.", `${ms(a)} ${sub ? "−" : "+"} ${sn(c)} = ${ms(re)}`),
          st("Imaginary parts.", `${ms(b)} ${sub ? "−" : "+"} ${sn(d)} = ${ms(im)}`),
          st("Answer.", cx(re, im)),
        ],
      };
    }
    const k = r.pick([2, 3, -2]), m = r.pick([2, 3, 4]);
    const re = k * a - m * c, im = k * b - m * d;
    return {
      prompt: `Simplify ${ms(k)}${cxP(a, b)} − ${m}${cxP(c, d)}. Write it as a + bi.`,
      answer: cxAns(re, im),
      hints: ["Distribute each number first.", `${ms(k)}${cxP(a, b)} = ${cx(k * a, k * b)} and −${m}${cxP(c, d)} = ${cx(-m * c, -m * d)}.`],
      steps: [st("Distribute.", `${cx(k * a, k * b)} + ${cxP(-m * c, -m * d)}`), st("Combine real parts.", `${ms(k * a)} + ${sn(-m * c)} = ${ms(re)}`), st("Combine imaginary parts.", `${ms(k * b)} + ${sn(-m * d)} = ${ms(im)}`), st("Answer.", cx(re, im))],
    };
  },
};

const complexMult: Skill = {
  id: "pc.cxmat.complex-mult",
  title: "Multiply complex numbers",
  topic: T,
  standards: ["PC.N.1.2"],
  prereqs: ["pc.cxmat.complex-add"],
  lesson: {
    bigIdea: "Multiply like binomials (FOIL), then replace i^2 with −1 and combine.",
    explain: [
      "(2 + 3i)(4 − i) = 8 − 2i + 12i − 3i^2 = 8 + 10i − 3(−1) = **11 + 10i**.",
      "Conjugates: (a + bi)(a − bi) = a^2 + b^2, a real number. (3 + 4i)(3 − 4i) = 9 + 16 = 25.",
      "Powers of i cycle every 4: i, −1, −i, 1. So i^23 = i^(20 + 3) = i^3 = −i.",
    ],
    tip: "The i^2 term changes sign when it becomes real: −3i^2 = +3.",
  },
  why: [
    { kind: "choice", prompt: "Why is (a + bi)(a − bi) always a real number?", choices: ["The imaginary terms −abi and +abi cancel, and −b^2 i^2 = +b^2.", "Because conjugates are equal.", "Because i times i is 1.", "It isn't always real."], correct: 0, explain: "FOIL gives a^2 − abi + abi − b^2 i^2. The middle terms cancel and i^2 = −1 turns the last term into +b^2." },
    { kind: "written", prompt: "Explain how to find i^50 without multiplying i by itself 50 times.", keyIdeas: ["powers of i repeat every 4", "50 = 4 · 12 + 2", "i^50 = i^2 = −1"], exemplar: "The powers of i cycle: i^1 = i, i^2 = −1, i^3 = −i, i^4 = 1, then repeat. Since 50 = 4 · 12 + 2, i^50 = (i^4)^12 · i^2 = 1 · (−1) = −1." },
  ],
  generate(r, lv) {
    if (lv === 3 && r.chance(0.4)) {
      const n = r.int(10, 99);
      const cyc = ["1", "i", "−1", "−i"];
      return {
        prompt: `Simplify i^${n}.`,
        answer: choice(r, cyc[n % 4], cyc.filter((c) => c !== cyc[n % 4]).map((c) => [c, `Divide ${n} by 4: the remainder is ${n % 4}, so i^${n} = i^${n % 4}.`] as [string, string]), true),
        hints: ["Powers of i repeat every 4.", `${n} ÷ 4 = ${Math.floor(n / 4)} remainder ${n % 4}.`],
        steps: [st("Cycle.", "i^1 = i, i^2 = −1, i^3 = −i, i^4 = 1"), st("Reduce the exponent.", `${n} = 4 · ${Math.floor(n / 4)} + ${n % 4}, so i^${n} = i^${n % 4} = ${cyc[n % 4]}`)],
      };
    }
    const a = r.int(-6, 6), b = r.nonzero(-6, 6);
    let c: number, d: number;
    if (lv === 1) { c = 0; d = r.nonzero(-5, 5); }
    else if (lv === 3) { c = a; d = r.chance(0.5) ? -b : b; }
    else { c = r.int(-6, 6); d = r.nonzero(-6, 6); }
    const re = a * c - b * d, im = a * d + b * c;
    const second = lv === 1 ? cx(0, d) : cxP(c, d);
    const square = lv === 3 && d === b;
    return {
      prompt: square ? `Simplify ${cxP(a, b)}^2. Write it as a + bi.` : `Simplify ${cxP(a, b)}${lv === 1 ? " · " : ""}${second}. Write it as a + bi.`,
      answer: cxAns(re, im),
      hints: [lv === 1 ? `Distribute ${second} to both terms.` : "Multiply like binomials: first, outer, inner, last.", `The i^2 term: ${ms(b)}i · ${sn(d)}i = ${ms(b * d)}i^2 = ${ms(-b * d)}.`],
      steps: [
        st(lv === 1 ? "Distribute." : "FOIL.", lv === 1 ? sumT([[a * d, "i"], [b * d, "i^2"]]) : sumT([[a * c, ""], [a * d, "i"], [b * c, "i"], [b * d, "i^2"]])),
        st("Replace i^2 with −1.", `${sumT([[b * d, "i^2"]])} = ${ms(-b * d)}`),
        st("Combine.", `real: ${ms(a * c)} + ${sn(-b * d)} = ${ms(re)}; imaginary: ${ms(a * d)} + ${sn(b * c)} = ${ms(im)}`),
        st("Answer.", cx(re, im)),
      ],
    };
  },
};

// ---------- Matrices ----------
type M = number[][];
const mat = (m: M) => `[${m.map((row) => row.map(ms).join("  ")).join("; ")}]`;
const mAdd = (a: M, b: M, s = 1) => a.map((row, i) => row.map((v, j) => v + s * b[i][j]));
const mScale = (k: number, a: M) => a.map((row) => row.map((v) => k * v));
const mMul = (a: M, b: M) => a.map((row) => b[0].map((_, j) => row.reduce((s, v, k) => s + v * b[k][j], 0)));
const rand = (r: { int: (a: number, b: number) => number }, rows: number, cols: number, lo = -6, hi = 8): M => Array.from({ length: rows }, () => Array.from({ length: cols }, () => r.int(lo, hi)));
const POS = ["top left", "top right", "bottom left", "bottom right"];
const m2Ans = (m: M): Answer => ({ kind: "multi", fields: [m[0][0], m[0][1], m[1][0], m[1][1]].map((v, i) => ({ value: frac(v), pre: POS[i] })) });
const matTable = (named: [string, M][]): Visual => ({ type: "table", headers: named.flatMap(([n, m], k) => [...m[0].map((_, j) => (j === 0 ? n : "")), ...(k < named.length - 1 ? [" "] : [])]), rows: named[0][1].map((_, i) => named.flatMap(([, m], k) => [...m[i], ...(k < named.length - 1 ? [""] : [])])), caption: "Each matrix is shown in its own block of columns." });

const MAT_NOTE = "Matrices are written row by row, with a semicolon between rows: [1  2; 3  4] has top row 1, 2 and bottom row 3, 4.";

const matrixAdd: Skill = {
  id: "pc.cxmat.matrix-add",
  title: "Add, subtract and scale matrices",
  topic: T,
  standards: ["PC.N.2.1", "PC.N.2.4"],
  prereqs: [],
  lesson: {
    bigIdea: "Matrices of the same dimensions add and subtract entry by entry. A scalar multiplies every entry.",
    explain: [
      MAT_NOTE,
      "[2  −1; 3  4] + [5  0; −2  6] = [7  −1; 1  10]: add matching positions.",
      "3[2  −1; 3  4] = [6  −3; 9  12]. Then 3A − B combines both ideas.",
      "A 2 × 3 matrix and a 3 × 2 matrix can't be added: the positions don't match up.",
    ],
    visual: { type: "table", headers: ["A", "", " ", "B", ""], rows: [[2, -1, "", 5, 0], [3, 4, "", -2, 6]], caption: "A = [2  −1; 3  4] and B = [5  0; −2  6]" },
  },
  why: [
    { kind: "choice", prompt: "Why must two matrices have the same dimensions to be added?", choices: ["Addition pairs up entries in matching positions, so every entry needs a partner.", "Because matrices are always square.", "Because the result must be square.", "They don't; you can add any two matrices."], correct: 0, explain: "Matrix addition is defined position by position. If one matrix has a position the other doesn't, that sum isn't defined." },
    { kind: "written", prompt: "A store's weekly sales of small and large shirts in two colors are stored in matrices for Week 1 and Week 2. Explain what the sum and 2 × (Week 1) would mean.", keyIdeas: ["the sum gives total sales over both weeks for each size and color", "scalar 2 doubles every entry", "2 × Week 1 predicts sales if every number doubled"], exemplar: "Adding the matrices adds matching entries, so each entry of the sum is the total for that size and color over both weeks. Multiplying Week 1 by 2 doubles every entry, which would be the sales if each kind of shirt sold twice as many." },
  ],
  generate(r, lv) {
    const A = rand(r, 2, 2), B = rand(r, 2, 2);
    if (lv === 3 && r.chance(0.35)) {
      const cA = r.pick([[2, 3], [3, 2], [2, 2]]), cB = r.pick([[3, 2], [2, 3], [3, 3]]);
      const ok = cA[0] === cB[0] && cA[1] === cB[1];
      return {
        prompt: `A is a ${cA[0]} × ${cA[1]} matrix and B is a ${cB[0]} × ${cB[1]} matrix. What can you say about A + B?`,
        answer: choice(r, ok ? `It is defined and is ${cA[0]} × ${cA[1]}` : "It is not defined", [ok ? ["It is not defined", "Same dimensions means every entry has a partner."] : [`It is defined and is ${cA[0]} × ${cA[1]}`, "The dimensions don't match, so some entries have no partner."], [`It is defined and is ${cA[0]} × ${cB[1]}`, "That's how matrix multiplication works, not addition."], [`It is defined and is ${cA[0] + cB[0]} × ${cA[1] + cB[1]}`, "Adding doesn't add dimensions."]]),
        hints: ["To add, both matrices must have exactly the same number of rows and columns."],
        steps: [st("Compare dimensions.", `${cA[0]} × ${cA[1]} vs ${cB[0]} × ${cB[1]}`), st("Conclusion.", ok ? `Same dimensions: A + B is ${cA[0]} × ${cA[1]}.` : "Different dimensions: A + B is not defined.")],
      };
    }
    const k = lv === 1 ? 1 : r.pick([2, 3, -2]);
    const m = lv === 1 ? r.pick([1, -1]) : lv === 2 ? r.pick([0, -1]) : r.pick([-2, -3, 3]);
    const res = mAdd(mScale(k, A), B, m);
    const expr = `${k === 1 ? "" : ms(k)}A${m === 0 ? "" : ` ${m < 0 ? "−" : "+"} ${Math.abs(m) === 1 ? "" : Math.abs(m)}B`}`;
    return {
      prompt: `A = ${mat(A)} and B = ${mat(B)}. Find ${expr}.`,
      visual: matTable([["A", A], ["B", B]]),
      answer: m2Ans(res),
      hints: [k !== 1 ? `First multiply every entry of A by ${ms(k)}.` : "Work position by position.", m !== 0 ? `Then ${m < 0 ? "subtract" : "add"} ${Math.abs(m) === 1 ? "" : Math.abs(m) + " times "}the matching entry of B.` : "That's all: a scalar multiplies every entry.", `Top left: ${k === 1 ? "" : `${ms(k)} · `}${sn(A[0][0])}${m === 0 ? "" : ` ${m < 0 ? "−" : "+"} ${Math.abs(m) === 1 ? "" : `${Math.abs(m)} · `}${sn(B[0][0])}`} = ${ms(res[0][0])}.`],
      steps: [
        ...(k !== 1 ? [st(`Scale A by ${ms(k)}.`, `${ms(k)}A = ${mat(mScale(k, A))}`)] : []),
        ...(m !== 0 && Math.abs(m) !== 1 ? [st(`Scale B by ${Math.abs(m)}.`, `${Math.abs(m)}B = ${mat(mScale(Math.abs(m), B))}`)] : []),
        ...(m !== 0 ? [st(`${m < 0 ? "Subtract" : "Add"} entry by entry.`, POS.map((p, i) => `${p}: ${ms(k * A[Math.floor(i / 2)][i % 2])} ${m < 0 ? "−" : "+"} ${sn(Math.abs(m) * B[Math.floor(i / 2)][i % 2])} = ${ms(res[Math.floor(i / 2)][i % 2])}`).join("; "))] : []),
        st("Result.", mat(res)),
      ],
    };
  },
};

const matrixMult: Skill = {
  id: "pc.cxmat.matrix-mult",
  title: "Multiply matrices",
  topic: T,
  standards: ["PC.N.2.5"],
  prereqs: ["pc.cxmat.matrix-add"],
  lesson: {
    bigIdea: "Entry (i, j) of AB is row i of A times column j of B: multiply matching entries and add. AB exists only when A's number of columns equals B's number of rows.",
    explain: [
      MAT_NOTE,
      "[1  2; 3  4] · [5  6; 7  8]: top left = 1 · 5 + 2 · 7 = 19, top right = 1 · 6 + 2 · 8 = 22, bottom left = 3 · 5 + 4 · 7 = 43, bottom right = 3 · 6 + 4 · 8 = 50. So AB = [19  22; 43  50].",
      "Dimensions: (m × n)(n × p) gives m × p. The inside numbers must match; the outside numbers are the size of the answer.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does a 2 × 3 matrix times a 3 × 4 matrix work, but a 3 × 4 times a 2 × 3 doesn't?", choices: ["Each row of the first must pair with each column of the second; that needs (columns of first) = (rows of second).", "Because the bigger matrix must come first.", "Both products work.", "Because 4 is bigger than 3."], correct: 0, explain: "A row of a 2 × 3 matrix has 3 entries and a column of a 3 × 4 matrix has 3 entries, so they pair up. A row of a 3 × 4 has 4 entries but a column of a 2 × 3 has only 2." },
    { kind: "written", prompt: "A snack bar sells small and large drinks at $2 and $3. Monday it sold 40 small and 25 large. Explain how a matrix product gives the revenue.", keyIdeas: ["row [40  25] times column [2; 3]", "40 · 2 + 25 · 3", "= $155", "row-times-column means multiply matching items and add"], exemplar: "Put the quantities in a row [40  25] and the prices in a column [2; 3]. The product is 40 · 2 + 25 · 3 = 80 + 75 = 155, which is the revenue: each quantity times its price, added up." },
  ],
  generate(r, lv) {
    if (lv === 1 && r.chance(0.5)) {
      const m = r.int(1, 4), n = r.int(1, 4), p = r.int(1, 4);
      return {
        prompt: `A is ${m} × ${n} and B is ${n} × ${p}. What are the dimensions of AB?`,
        answer: { kind: "multi", fields: [{ value: frac(m), pre: "rows" }, { value: frac(p), pre: "columns" }] },
        hints: ["(m × n)(n × p) = m × p.", "The inside numbers match; the outside numbers give the size."],
        steps: [st("Check the inside numbers.", `${n} = ${n} ✓, so AB exists.`), st("Outside numbers.", `${m} × ${p}`)],
      };
    }
    if (lv < 3) {
      const A = rand(r, 2, 2, -4, 6), B = rand(r, 2, 2, -4, 6);
      const P = mMul(A, B);
      return {
        prompt: `A = ${mat(A)} and B = ${mat(B)}. Find AB.`,
        visual: matTable([["A", A], ["B", B]]),
        answer: m2Ans(P),
        hints: ["Each entry is a row of A times a column of B.", `Top left: row 1 of A with column 1 of B: ${ms(A[0][0])} · ${sn(B[0][0])} + ${ms(A[0][1])} · ${sn(B[1][0])}.`],
        steps: [0, 1, 2, 3].map((i) => {
          const ri = Math.floor(i / 2), cj = i % 2;
          return st(`${POS[i]} (row ${ri + 1}, column ${cj + 1}).`, `${ms(A[ri][0])} · ${sn(B[0][cj])} + ${sn(A[ri][1])} · ${sn(B[1][cj])} = ${ms(P[ri][cj])}`);
        }).concat([st("Result.", `AB = ${mat(P)}`)]),
      };
    }
    const A = rand(r, 2, 3, -3, 5), B = rand(r, 3, 2, -3, 5);
    const P = mMul(A, B);
    const i = r.int(0, 1), j = r.int(0, 1);
    return {
      prompt: `A = ${mat(A)} (2 × 3) and B = ${mat(B)} (3 × 2). Find the entry of AB in row ${i + 1}, column ${j + 1}.`,
      answer: num(P[i][j]),
      hints: ["AB is 2 × 2. The entry in row i, column j uses row i of A and column j of B.", `Row ${i + 1} of A: ${A[i].map(ms).join(", ")}. Column ${j + 1} of B: ${B.map((row) => ms(row[j])).join(", ")}.`],
      steps: [st("Pick the row and column.", `row ${i + 1} of A = (${A[i].map(ms).join(", ")}); column ${j + 1} of B = (${B.map((row) => ms(row[j])).join(", ")})`), st("Multiply and add.", `${A[i].map((v, k) => `${k ? sn(v) : ms(v)} · ${sn(B[k][j])}`).join(" + ")} = ${ms(P[i][j])}`)],
      traps: traps(frac(P[i][j]), [trap(A[i].reduce((s, v, k) => s + v * B[k][1 - j], 0), "You used the wrong column of B."), trap(A[i][0] * B[0][j], "Add all three products, not just the first.")]),
    };
  },
};

const matrixProps: Skill = {
  id: "pc.cxmat.matrix-props",
  title: "Properties of matrix operations",
  topic: T,
  standards: ["PC.N.2.2", "PC.N.2.3"],
  prereqs: ["pc.cxmat.matrix-mult"],
  lesson: {
    bigIdea: "Matrix addition is commutative (A + B = B + A). Multiplication is associative ((AB)C = A(BC)) and distributes over addition (A(B + C) = AB + AC), but it is NOT commutative: usually AB ≠ BA.",
    explain: [
      "A = [1  2; 0  1], B = [1  0; 3  1]. AB = [7  2; 3  1] but BA = [1  2; 3  7]. Different!",
      "Because order matters, A(B + C) = AB + AC keeps A on the left, while (B + C)A = BA + CA keeps it on the right.",
      "Associativity means you can multiply ABC in either grouping, as long as you keep the order.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is matrix addition commutative but matrix multiplication isn't?", choices: ["Addition just adds matching entries (and a + b = b + a), but multiplication pairs rows of the first with columns of the second, so swapping changes which rows meet which columns.", "Because multiplication is harder.", "Both are commutative.", "Neither is commutative."], correct: 0, explain: "Each entry of A + B is a sum of two numbers, which commutes. An entry of AB uses a row of A and a column of B; in BA it uses a row of B and a column of A, a different calculation." },
    { kind: "written", prompt: "Explain how you could show someone that AB = BA is not always true.", keyIdeas: ["one counterexample is enough", "pick two 2 × 2 matrices", "compute both products and show an entry differs"], exemplar: "To show a rule isn't always true, one counterexample is enough. Take A = [1  2; 0  1] and B = [1  0; 3  1]. AB has top-left entry 7 but BA has top-left entry 1, so AB ≠ BA." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const items: [string, string][] = [["A + B = B + A", "Commutative property of addition"], ["(A + B) + C = A + (B + C)", "Associative property of addition"], ["A(B + C) = AB + AC", "Distributive property"], ["(AB)C = A(BC)", "Associative property of multiplication"], ["k(A + B) = kA + kB", "Distributive property (scalar)"]];
      const [eq, name] = r.pick(items);
      return {
        prompt: `Which property of matrices does ${eq} show?`,
        answer: choice(r, name, items.filter((x) => x[1] !== name).map((x) => [x[1], `That property says ${x[0]}.`] as [string, string]).slice(0, 3)),
        hints: ["Is the equation about the order of the matrices, their grouping, or multiplying across a sum?"],
        steps: [st("Read the pattern.", eq), st("Name it.", name)],
      };
    }
    if (lv === 2) {
      return {
        prompt: "For 2 × 2 matrices A, B and C, which statement is NOT always true?",
        answer: choice(r, "AB = BA", [["A + B = B + A", "Addition of matrices is always commutative."], ["(AB)C = A(BC)", "Matrix multiplication is associative."], ["A(B + C) = AB + AC", "Multiplication distributes over addition (keeping A on the left)."]]),
        hints: ["Three of these are properties that always hold. One fails for most matrices.", "Try A = [1  2; 0  1] and B = [1  0; 3  1]."],
        steps: [st("Test AB and BA.", "With A = [1  2; 0  1], B = [1  0; 3  1]: AB = [7  2; 3  1] but BA = [1  2; 3  7]."), st("Conclusion.", "Matrix multiplication is not commutative, so AB = BA is not always true.")],
      };
    }
    const A = rand(r, 2, 2, -3, 4), B = rand(r, 2, 2, -3, 4);
    let AB = mMul(A, B), BA = mMul(B, A);
    if (AB[0][0] === BA[0][0]) { A[0][1] += 1; AB = mMul(A, B); BA = mMul(B, A); }
    return {
      prompt: `A = ${mat(A)} and B = ${mat(B)}. Find the top-left entry of AB and the top-left entry of BA.`,
      visual: matTable([["A", A], ["B", B]]),
      answer: { kind: "multi", fields: [{ value: frac(AB[0][0]), pre: "AB:" }, { value: frac(BA[0][0]), pre: "BA:" }] },
      hints: ["Top left of AB: row 1 of A times column 1 of B.", "Top left of BA: row 1 of B times column 1 of A."],
      steps: [st("AB, top left.", `${ms(A[0][0])} · ${sn(B[0][0])} + ${sn(A[0][1])} · ${sn(B[1][0])} = ${ms(AB[0][0])}`), st("BA, top left.", `${ms(B[0][0])} · ${sn(A[0][0])} + ${sn(B[0][1])} · ${sn(A[1][0])} = ${ms(BA[0][0])}`), st("Notice.", "They differ, so AB ≠ BA: matrix multiplication is not commutative.")],
    };
  },
};

export default [complexAdd, complexMult, matrixAdd, matrixMult, matrixProps];
