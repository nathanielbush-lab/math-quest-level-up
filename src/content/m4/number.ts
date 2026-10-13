// Unit 6: Complex numbers, matrices and vectors (NC.M4.N.1, NC.M4.N.2).
import { ms, sn } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Answer, Skill, Visual } from "../types";
import { PEOPLE } from "./util";

const T = "m4-number";

/** "3 − 2i", "−i", "4i", "5". */
export function cx(a: number, b: number): string {
  const im = b === 0 ? "" : `${Math.abs(b) === 1 ? "" : Math.abs(b)}i`;
  if (a === 0) return b === 0 ? "0" : `${b < 0 ? "−" : ""}${im}`;
  return b === 0 ? ms(a) : `${ms(a)} ${b < 0 ? "−" : "+"} ${im}`;
}
const cxAnswer = (re: number, im: number): Answer => ({ kind: "multi", fields: [{ value: frac(re) }, { value: frac(im), pre: "+", post: "i" }] });

type M2 = [[number, number], [number, number]];
const mText = (m: number[][]) => `[${m.map((row) => row.map(ms).join("  ")).join(" ; ")}]`;
function mTable(names: string[], ms_: number[][][]): Visual {
  const headers: string[] = [];
  names.forEach((n, i) => { headers.push(n, ...Array(ms_[i][0].length - 1).fill("")); if (i < names.length - 1) headers.push(" "); });
  const rows = Array.from({ length: Math.max(...ms_.map((m) => m.length)) }, (_, r) => {
    const row: (string | number)[] = [];
    ms_.forEach((m, i) => { row.push(...(m[r] ?? Array(m[0].length).fill(""))); if (i < ms_.length - 1) row.push(""); });
    return row;
  });
  return { type: "table", headers, rows };
}
const CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"];
const m2Answer = (m: M2): Answer => ({ kind: "multi", fields: [m[0][0], m[0][1], m[1][0], m[1][1]].map((v, i) => ({ value: frac(v), pre: `${CORNERS[i]}:` })) });
const rm2 = (r: { int: (a: number, b: number) => number }, lo: number, hi: number): M2 => [[r.int(lo, hi), r.int(lo, hi)], [r.int(lo, hi), r.int(lo, hi)]];

const complexAdd: Skill = {
  id: "m4.num.complex-add",
  title: "Add and subtract complex numbers",
  topic: T,
  standards: ["NC.M4.N.1.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A complex number a + bi has a real part a and an imaginary part b. Add or subtract real parts with real parts and imaginary parts with imaginary parts.",
    explain: [
      "i is the number with i^2 = −1. Numbers like 3 − 2i combine a real part (3) and an imaginary part (−2).",
      "(4 + 3i) + (2 − 5i) = (4 + 2) + (3 − 5)i = **6 − 2i**.",
      "Subtracting: distribute the minus to both parts. (4 + 3i) − (2 − 5i) = 4 − 2 + 3i + 5i = **2 + 8i**.",
    ],
    tip: "It's just like combining like terms: treat i like a variable.",
  },
  why: [
    { kind: "choice", prompt: "Why can't 3 + 2i be simplified to 5i?", choices: ["3 is real and 2i is imaginary; they aren't like terms.", "Because i is negative.", "It can; 3 + 2i = 5i."], correct: 0, explain: "Just as 3 + 2x isn't 5x, real and imaginary parts stay separate." },
    { kind: "written", prompt: "Explain the most common mistake when computing (5 + 2i) − (1 − 4i), and how to avoid it.", keyIdeas: ["the minus applies to both parts of the second number", "−(1 − 4i) = −1 + 4i", "result 4 + 6i, not 4 − 2i"], exemplar: "People subtract the real part but forget to subtract the imaginary part too. The minus sign distributes: −(1 − 4i) = −1 + 4i. So the answer is 4 + 6i, not 4 − 2i." },
  ],
  generate(r, lv) {
    const a = r.int(-9, 9), b = r.nonzero(-9, 9), c = r.int(-9, 9), d = r.nonzero(-9, 9);
    if (lv === 3) {
      const k = r.int(2, 4), m = r.int(2, 4);
      const re = k * a - m * c, im = k * b - m * d;
      return {
        prompt: `Simplify ${k}(${cx(a, b)}) − ${m}(${cx(c, d)}). Write the answer as a + bi.`,
        answer: cxAnswer(re, im),
        hints: ["Distribute each number first.", `${k}(${cx(a, b)}) = ${cx(k * a, k * b)} and −${m}(${cx(c, d)}) = ${cx(-m * c, -m * d)}.`],
        steps: [st("Distribute.", `${cx(k * a, k * b)} + (${cx(-m * c, -m * d)})`), st("Combine real parts.", `${ms(k * a)} + ${sn(-m * c)} = ${ms(re)}`), st("Combine imaginary parts.", `${ms(k * b)}i + ${sn(-m * d)}i = ${ms(im)}i`), st("Answer.", cx(re, im))],
      };
    }
    const sub = lv === 2;
    const re = sub ? a - c : a + c, im = sub ? b - d : b + d;
    return {
      prompt: `Simplify (${cx(a, b)}) ${sub ? "−" : "+"} (${cx(c, d)}). Write the answer as a + bi.`,
      answer: cxAnswer(re, im),
      hints: [sub ? "Distribute the minus sign to both parts of the second number." : "Add the real parts, then add the imaginary parts.", `Real: ${ms(a)} ${sub ? "−" : "+"} ${sn(c)}. Imaginary: ${ms(b)} ${sub ? "−" : "+"} ${sn(d)}.`],
      steps: [
        ...(sub ? [st("Distribute the minus.", `${cx(a, b)} + (${cx(-c, -d)})`)] : []),
        st("Real parts.", `${ms(a)} ${sub ? "−" : "+"} ${sn(c)} = ${ms(re)}`),
        st("Imaginary parts.", `${ms(b)}i ${sub ? "−" : "+"} ${sn(d)}i = ${ms(im)}i`),
        st("Answer.", cx(re, im)),
      ],
    };
  },
};

const complexMult: Skill = {
  id: "m4.num.complex-mult",
  title: "Multiply complex numbers",
  topic: T,
  standards: ["NC.M4.N.1.2"],
  prereqs: ["m4.num.complex-add"],
  lesson: {
    bigIdea: "Multiply complex numbers like binomials (distribute every term), then replace i^2 with −1 and combine.",
    explain: [
      "(2 + 3i)(4 − i) = 8 − 2i + 12i − 3i^2.",
      "Since i^2 = −1, −3i^2 = +3. So the product is 8 + 3 + 10i = **11 + 10i**.",
      "Conjugates: (a + bi)(a − bi) = a^2 − b^2i^2 = a^2 + b^2, a real number. For example (3 + 4i)(3 − 4i) = 9 + 16 = 25.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does −3i^2 become +3?", choices: ["i^2 = −1, so −3i^2 = −3(−1) = 3.", "Because squares are always positive.", "Because i = 1."], correct: 0, explain: "That one substitution is what makes complex multiplication different from binomial multiplication." },
    { kind: "written", prompt: "Explain why multiplying a complex number by its conjugate always gives a real number.", keyIdeas: ["(a + bi)(a − bi) = a^2 − abi + abi − b^2i^2", "the middle terms cancel", "−b^2i^2 = +b^2, so the result is a^2 + b^2 with no i"], exemplar: "(a + bi)(a − bi) = a^2 − abi + abi − b^2i^2. The ±abi terms cancel, and −b^2i^2 = +b^2. What's left is a^2 + b^2, which has no imaginary part." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const b = r.nonzero(-6, 6), c = r.int(-7, 7), d = r.nonzero(-7, 7);
      // bi(c + di) = bci + bd i^2 = −bd + bc i
      const re = -b * d, im = b * c;
      return {
        prompt: `Multiply ${cx(0, b)}(${cx(c, d)}). Write the answer as a + bi.`,
        answer: cxAnswer(re, im),
        hints: ["Distribute to both terms inside.", `${cx(0, b)} · ${sn(d)}i = ${b * d}i^2. Replace i^2 with −1.`],
        steps: [st("Distribute.", `${cx(0, b)} · ${sn(c)} + ${cx(0, b)} · ${d < 0 ? `(${cx(0, d)})` : cx(0, d)} = ${cx(0, b * c)} ${b * d < 0 ? "−" : "+"} ${Math.abs(b * d)}i^2`), st("Replace i^2 with −1.", `${ms(b * d)}i^2 = ${ms(b * d)}(−1) = ${ms(re)}, so the result is ${ms(re)} + ${sn(im)}i`), st("Answer.", cx(re, im))],
      };
    }
    if (lv === 2) {
      const a = r.int(-6, 6), b = r.nonzero(-6, 6), c = r.int(-6, 6), d = r.nonzero(-6, 6);
      const re = a * c - b * d, im = a * d + b * c;
      return {
        prompt: `Multiply (${cx(a, b)})(${cx(c, d)}). Write the answer as a + bi.`,
        answer: cxAnswer(re, im),
        hints: ["Use FOIL (distribute each term).", `The last terms give ${ms(b)}i · ${sn(d)}i = ${ms(b * d)}i^2 = ${ms(-b * d)}.`],
        steps: [
          st("Distribute (FOIL).", `${ms(a * c)} + ${sn(a * d)}i + ${sn(b * c)}i + ${sn(b * d)}i^2`),
          st("Replace i^2 with −1.", `${sn(b * d)}i^2 = ${ms(-b * d)}`),
          st("Combine real parts.", `${ms(a * c)} + ${sn(-b * d)} = ${ms(re)}`),
          st("Combine imaginary parts.", `${ms(a * d)}i + ${sn(b * c)}i = ${ms(im)}i`),
          st("Answer.", cx(re, im)),
        ],
      };
    }
    const a = r.nonzero(-7, 7), b = r.nonzero(-7, 7);
    if (r.chance(0.5)) {
      return {
        prompt: `Multiply (${cx(a, b)})(${cx(a, -b)}). Write the answer as a + bi.`,
        answer: cxAnswer(a * a + b * b, 0),
        hints: ["These are conjugates: the middle terms cancel.", `The last terms: (${ms(b)}i)(${ms(-b)}i) = ${ms(-b * b)}i^2 = +${b * b}. The result is a^2 + b^2.`],
        steps: [st("Distribute.", `${a * a} ${-a * b < 0 ? "−" : "+"} ${Math.abs(a * b)}i ${a * b < 0 ? "−" : "+"} ${Math.abs(a * b)}i ${-b * b < 0 ? "−" : "+"} ${b * b}i^2`), st("The i terms cancel.", `${ms(-a * b)}i + ${sn(a * b)}i = 0`), st("Replace i^2 with −1.", `−${b * b}i^2 = +${b * b}`), st("Answer.", `${a * a} + ${b * b} = ${a * a + b * b} (so the imaginary part is 0)`)],
      };
    }
    const re = a * a - b * b, im = 2 * a * b;
    return {
      prompt: `Simplify (${cx(a, b)})^2. Write the answer as a + bi.`,
      answer: cxAnswer(re, im),
      hints: [`Write it as (${cx(a, b)})(${cx(a, b)}) and distribute. Don't just square each part.`, `You'll get ${a * a} + ${2 * a * b < 0 ? "(" + ms(2 * a * b) + ")" : 2 * a * b}i + ${b * b}i^2.`],
      steps: [st("Write as a product.", `(${cx(a, b)})(${cx(a, b)})`), st("Distribute.", `${a * a} + ${ms(a * b)}i + ${ms(a * b)}i + ${b * b}i^2`), st("Replace i^2 with −1.", `${b * b}i^2 = −${b * b}`), st("Combine.", `(${a * a} − ${b * b}) + ${sn(2 * a * b)}i = ${cx(re, im)}`)],
    };
  },
};

const matrixAdd: Skill = {
  id: "m4.num.matrix-add",
  title: "Add, subtract and scale matrices",
  topic: T,
  standards: ["NC.M4.N.2.1"],
  prereqs: [],
  lesson: {
    bigIdea: "Matrices of the same size add and subtract entry by entry. A scalar multiplies every entry.",
    explain: [
      "We write matrices by rows, with semicolons between rows: [2  −1 ; 3  4] has row 1 = 2, −1 and row 2 = 3, 4.",
      "[2  −1 ; 3  4] + [5  0 ; −2  1] = [7  −1 ; 1  5]: add matching positions.",
      "3[2  −1 ; 3  4] = [6  −3 ; 9  12]. To find 2A − B, scale A first, then subtract B entry by entry.",
    ],
    visual: { type: "table", headers: ["A", "", " ", "B", ""], rows: [[2, -1, "", 5, 0], [3, 4, "", -2, 1]] },
  },
  why: [
    { kind: "choice", prompt: "Why can't you add a 2×2 matrix and a 2×3 matrix?", choices: ["Some entries would have no partner in the same position.", "Because 2 × 3 = 6 is too big.", "You can; just add zeros wherever needed."], correct: 0, explain: "Addition is entry-by-entry, so the sizes must match." },
    { kind: "written", prompt: "Two stores track sales of three products for January (matrix J) and February (matrix F). Explain what J + F and F − J would tell you.", keyIdeas: ["J + F gives total sales for both months, product by product and store by store", "F − J gives the change from January to February", "positive entries mean increases, negative mean decreases"], exemplar: "J + F adds matching entries, so it's each store's total sales of each product over the two months. F − J subtracts January from February, so each entry is the change; a negative entry means sales dropped." },
  ],
  generate(r, lv) {
    const A = rm2(r, -9, 9), B = rm2(r, -9, 9);
    if (lv === 3) {
      const X = rm2(r, -6, 6);
      const k = r.pick([2, 3]);
      const C = X.map((row, i) => row.map((v, j) => k * v + A[i][j])) as M2;
      return {
        prompt: `Solve for the matrix X: ${k}X + A = C, where A = ${mText(A)} and C = ${mText(C)}. Enter X.`,
        visual: mTable(["A", "C"], [A, C]),
        answer: m2Answer(X),
        hints: [`Subtract A from both sides: ${k}X = C − A.`, `C − A = ${mText(C.map((row, i) => row.map((v, j) => v - A[i][j])))}. Now divide every entry by ${k}.`],
        steps: [st("Subtract A.", `${k}X = C − A = ${mText(C.map((row, i) => row.map((v, j) => v - A[i][j])))}`), st(`Divide each entry by ${k}.`, `X = ${mText(X)}`), st("Check one entry.", `${k}(${ms(X[0][0])}) + ${sn(A[0][0])} = ${ms(C[0][0])} ✓`)],
      };
    }
    const k = lv === 2 ? r.pick([2, 3, -2]) : 1;
    const R = A.map((row, i) => row.map((v, j) => (lv === 1 ? v + B[i][j] : k * v - B[i][j]))) as M2;
    const op = lv === 1 ? "A + B" : `${k === -2 ? "−2" : k}A − B`;
    return {
      prompt: `A = ${mText(A)} and B = ${mText(B)}. Find ${op}.`,
      visual: mTable(["A", "B"], [A, B]),
      answer: m2Answer(R),
      hints: [lv === 1 ? "Add entries in matching positions." : `Multiply every entry of A by ${ms(k)} first.`, lv === 1 ? `Top-left: ${ms(A[0][0])} + ${sn(B[0][0])} = ${ms(R[0][0])}.` : `${ms(k)}A = ${mText(A.map((row) => row.map((v) => k * v)))}. Now subtract B entry by entry.`],
      steps: [
        ...(lv === 2 ? [st(`Scale A by ${ms(k)}.`, `${ms(k)}A = ${mText(A.map((row) => row.map((v) => k * v)))}`)] : []),
        st(lv === 1 ? "Add matching entries." : "Subtract B entry by entry.", R.flatMap((row, i) => row.map((v, j) => `${lv === 1 ? `${ms(A[i][j])} + ${sn(B[i][j])}` : `${ms(k * A[i][j])} − ${sn(B[i][j])}`} = ${ms(v)}`)).join("; ")),
        st("Answer.", `${op} = ${mText(R)}`),
      ],
    };
  },
};

const matrixMult: Skill = {
  id: "m4.num.matrix-mult",
  title: "Multiply matrices",
  topic: T,
  standards: ["NC.M4.N.2.1"],
  prereqs: ["m4.num.matrix-add"],
  lesson: {
    bigIdea: "Entry (row i, column j) of AB = row i of A \"dotted\" with column j of B: multiply matching entries and add.",
    explain: [
      "A = [1  2 ; 3  4] and B = [5  6 ; 7  8]. Top-left of AB: row 1 of A with column 1 of B: 1·5 + 2·7 = **19**.",
      "Top-right: 1·6 + 2·8 = 22. Bottom-left: 3·5 + 4·7 = 43. Bottom-right: 3·6 + 4·8 = 50. So AB = [19  22 ; 43  50].",
      "Sizes: an (m × n) matrix times an (n × p) matrix gives (m × p). The inside numbers must match. Order matters: usually AB ≠ BA.",
    ],
    visual: { type: "table", headers: ["A", "", " ", "B", ""], rows: [[1, 2, "", 5, 6], [3, 4, "", 7, 8]] },
  },
  why: [
    { kind: "choice", prompt: "Why can you multiply a 2×3 matrix by a 3×1 matrix but not by a 2×1 matrix?", choices: ["Each row of the first (3 entries) must pair with a column of the second, which needs 3 entries.", "Because 2×3 matrices can only be added.", "You can multiply any two matrices."], correct: 0, explain: "The number of columns of A must equal the number of rows of B." },
    { kind: "written", prompt: "Explain why AB and BA are usually different, using what each entry of a product means.", keyIdeas: ["an entry of AB uses rows of A and columns of B", "BA uses rows of B and columns of A", "different numbers get paired, so the results differ"], exemplar: "Each entry of AB pairs a row of A with a column of B. In BA, it's rows of B with columns of A instead, so completely different numbers get multiplied together. Except in special cases, the products come out different." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const items = r.pick([["T-shirts", "hoodies", "hats", 15, 35, 12], ["burgers", "fries", "drinks", 6, 3, 2], ["tickets", "popcorn", "drinks", 12, 7, 5]] as [string, string, string, number, number, number][]);
      const Q = [[r.int(10, 40), r.int(5, 25), r.int(5, 30)], [r.int(10, 40), r.int(5, 25), r.int(5, 30)]];
      const P = [items[3], items[4], items[5]];
      const rev = Q.map((row) => row[0] * P[0] + row[1] * P[1] + row[2] * P[2]);
      const name = r.pick(PEOPLE);
      return {
        prompt: `${name}'s club sold ${items[0]}, ${items[1]} and ${items[2]} on Friday and Saturday. Matrix Q (rows: Friday, Saturday) shows quantities; matrix P shows prices: $${P[0]}, $${P[1]}, $${P[2]}. Find the product QP (the revenue each day).`,
        visual: { type: "table", headers: ["Q", items[0], items[1], items[2], " ", "P ($)"], rows: [["Friday", ...Q[0], "", P[0]], ["Saturday", ...Q[1], "", P[1]], ["", "", "", "", "", P[2]]] },
        answer: { kind: "multi", fields: [{ value: frac(rev[0]), pre: "Friday: $" }, { value: frac(rev[1]), pre: "Saturday: $" }] },
        hints: ["Q is 2 × 3 and P is 3 × 1, so QP is 2 × 1: one number per day.", `Friday: ${Q[0][0]}(${P[0]}) + ${Q[0][1]}(${P[1]}) + ${Q[0][2]}(${P[2]}).`],
        steps: [
          st("Check the sizes.", "(2 × 3)(3 × 1) → 2 × 1."),
          st("Row 1 (Friday) times P.", `${Q[0][0]}(${P[0]}) + ${Q[0][1]}(${P[1]}) + ${Q[0][2]}(${P[2]}) = ${Q[0][0] * P[0]} + ${Q[0][1] * P[1]} + ${Q[0][2] * P[2]} = ${rev[0]}`),
          st("Row 2 (Saturday) times P.", `${Q[1][0]}(${P[0]}) + ${Q[1][1]}(${P[1]}) + ${Q[1][2]}(${P[2]}) = ${Q[1][0] * P[0]} + ${Q[1][1] * P[1]} + ${Q[1][2] * P[2]} = ${rev[1]}`),
          st("Answer.", `QP = [${rev[0]} ; ${rev[1]}]: $${rev[0]} on Friday and $${rev[1]} on Saturday.`),
        ],
      };
    }
    const A = rm2(r, -5, 6), B = rm2(r, -5, 6);
    const P = [0, 1].map((i) => [0, 1].map((j) => A[i][0] * B[0][j] + A[i][1] * B[1][j])) as M2;
    const entry = (i: number, j: number) => `${ms(A[i][0])}·${sn(B[0][j])} + ${sn(A[i][1])}·${sn(B[1][j])} = ${ms(A[i][0] * B[0][j])} + ${sn(A[i][1] * B[1][j])} = ${ms(P[i][j])}`;
    if (lv === 1) {
      const i = r.int(0, 1), j = r.int(0, 1);
      const pos = CORNERS[2 * i + j];
      const wrong = A[i][0] * B[i][0] + A[i][1] * B[i][1];
      return {
        prompt: `A = ${mText(A)} and B = ${mText(B)}. Find the ${pos} entry of AB (row ${i + 1}, column ${j + 1}).`,
        visual: mTable(["A", "B"], [A, B]),
        answer: { kind: "number", value: frac(P[i][j]) },
        hints: [`Use row ${i + 1} of A and column ${j + 1} of B.`, `Row ${i + 1} of A: ${ms(A[i][0])}, ${ms(A[i][1])}. Column ${j + 1} of B: ${ms(B[0][j])}, ${ms(B[1][j])}. Multiply in pairs and add.`],
        steps: [st("Pick the row and column.", `Row ${i + 1} of A: (${ms(A[i][0])}, ${ms(A[i][1])}). Column ${j + 1} of B: (${ms(B[0][j])}, ${ms(B[1][j])}).`), st("Multiply pairs and add.", entry(i, j))],
        traps: [
          ...(A[i][j] * B[i][j] !== P[i][j] ? [{ value: frac(A[i][j] * B[i][j]), feedback: "Matrix multiplication isn't entry-by-entry. Use a whole row of A and a whole column of B." }] : []),
          ...(wrong !== P[i][j] && wrong !== A[i][j] * B[i][j] ? [{ value: frac(wrong), feedback: `That pairs row ${i + 1} of A with row ${i + 1} of B. Use column ${j + 1} of B.` }] : []),
        ],
      };
    }
    return {
      prompt: `A = ${mText(A)} and B = ${mText(B)}. Find AB.`,
      visual: mTable(["A", "B"], [A, B]),
      answer: m2Answer(P),
      hints: ["Each entry: row of A times column of B, multiply pairs and add.", `Top-left: ${entry(0, 0)}.`],
      steps: [st("Top-left (row 1, column 1).", entry(0, 0)), st("Top-right (row 1, column 2).", entry(0, 1)), st("Bottom-left (row 2, column 1).", entry(1, 0)), st("Bottom-right (row 2, column 2).", entry(1, 1)), st("Answer.", `AB = ${mText(P)}`)],
    };
  },
};

const vectors: Skill = {
  id: "m4.num.vectors",
  title: "Add, subtract and scale vectors",
  topic: T,
  standards: ["NC.M4.N.2.2"],
  prereqs: [],
  lesson: {
    bigIdea: "Vectors in component form ⟨x, y⟩ add and subtract component by component; a scalar multiplies both components.",
    explain: [
      "u = ⟨3, −2⟩ and v = ⟨1, 5⟩. u + v = ⟨4, 3⟩ and u − v = ⟨2, −7⟩.",
      "2u − 3v = ⟨6, −4⟩ − ⟨3, 15⟩ = **⟨3, −19⟩**.",
      "Geometrically, u + v means: walk along u, then along v (tip to tail). The result points from the start to the finish. Its length is √(x^2 + y^2).",
    ],
    visual: { type: "plot", xMin: -1, xMax: 6, yMin: -3, yMax: 5, points: [{ x: 0, y: 0, label: "start" }, { x: 3, y: -2, label: "after u" }, { x: 4, y: 3, label: "u + v = ⟨4, 3⟩" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is u − v the same as u + (−v)?", choices: ["−v has the same length as v but points the opposite way, so adding it undoes v.", "Because subtraction of vectors isn't allowed.", "Because vectors only have positive parts."], correct: 0, explain: "Each component of −v is the opposite of v's." },
    { kind: "written", prompt: "A drone flies with velocity ⟨12, 0⟩ km/h while wind blows ⟨0, 5⟩ km/h. Explain how to find its actual velocity and speed.", keyIdeas: ["add the vectors: ⟨12, 5⟩", "speed is the magnitude", "√(12² + 5²) = 13 km/h"], exemplar: "The actual velocity is the sum ⟨12, 0⟩ + ⟨0, 5⟩ = ⟨12, 5⟩. The speed is its length: √(144 + 25) = √169 = 13 km/h." },
  ],
  generate(r, lv) {
    const vt = (x: number, y: number) => `⟨${ms(x)}, ${ms(y)}⟩`;
    const vecAns = (x: number, y: number): Answer => ({ kind: "multi", fields: [{ value: frac(x), pre: "⟨" }, { value: frac(y), pre: ",", post: "⟩" }] });
    if (lv === 3) {
      const [p, q, h] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15]] as [number, number, number][]);
      const k = r.pick([10, 20, 5].filter((m) => h * m <= 300));
      const R = [p * k, q * k];
      const wind = [r.int(-30, 30), r.int(-30, 30)].map((v) => v - (v % 5));
      const plane = [R[0] - wind[0], R[1] - wind[1]];
      return {
        prompt: `A small plane's velocity relative to the air is ${vt(plane[0], plane[1])} km/h, and the wind's velocity is ${vt(wind[0], wind[1])} km/h. Find the plane's actual velocity (the sum) and its speed (the magnitude).`,
        answer: { kind: "multi", fields: [{ value: frac(R[0]), pre: "⟨" }, { value: frac(R[1]), pre: ",", post: "⟩" }, { value: frac(h * k), pre: "speed =", post: " km/h" }] },
        hints: ["Add the two vectors component by component.", `The sum is ${vt(R[0], R[1])}. Its magnitude is √(${R[0]}² + ${R[1]}²).`],
        steps: [st("Add the vectors.", `${vt(plane[0], plane[1])} + ${vt(wind[0], wind[1])} = ${vt(R[0], R[1])}`), st("Magnitude.", `√(${R[0]}² + ${R[1]}²) = √(${R[0] ** 2} + ${R[1] ** 2}) = √${(h * k) ** 2} = ${h * k} km/h`)],
      };
    }
    const u = [r.int(-8, 8), r.int(-8, 8)], v = [r.int(-8, 8), r.int(-8, 8)];
    if (lv === 1) {
      const sub = r.chance(0.5);
      const R = sub ? [u[0] - v[0], u[1] - v[1]] : [u[0] + v[0], u[1] + v[1]];
      return {
        prompt: `u = ${vt(u[0], u[1])} and v = ${vt(v[0], v[1])}. Find u ${sub ? "−" : "+"} v.`,
        answer: vecAns(R[0], R[1]),
        hints: [`${sub ? "Subtract" : "Add"} the x-components, then the y-components.`, `x: ${ms(u[0])} ${sub ? "−" : "+"} ${sn(v[0])}.`],
        steps: [st("x-components.", `${ms(u[0])} ${sub ? "−" : "+"} ${sn(v[0])} = ${ms(R[0])}`), st("y-components.", `${ms(u[1])} ${sub ? "−" : "+"} ${sn(v[1])} = ${ms(R[1])}`), st("Answer.", vt(R[0], R[1]))],
      };
    }
    const a = r.pick([2, 3, -2]), b = r.pick([2, 3, 4]);
    const R = [a * u[0] - b * v[0], a * u[1] - b * v[1]];
    return {
      prompt: `u = ${vt(u[0], u[1])} and v = ${vt(v[0], v[1])}. Find ${a === -2 ? "−2" : a}u − ${b}v.`,
      answer: vecAns(R[0], R[1]),
      hints: ["Scale each vector first.", `${ms(a)}u = ${vt(a * u[0], a * u[1])} and ${b}v = ${vt(b * v[0], b * v[1])}.`],
      steps: [st("Scale.", `${ms(a)}u = ${vt(a * u[0], a * u[1])}; ${b}v = ${vt(b * v[0], b * v[1])}`), st("Subtract components.", `⟨${ms(a * u[0])} − ${sn(b * v[0])}, ${ms(a * u[1])} − ${sn(b * v[1])}⟩ = ${vt(R[0], R[1])}`)],
    };
  },
};

export default [complexAdd, complexMult, matrixAdd, matrixMult, vectors] satisfies Skill[];
