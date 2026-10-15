import { describe, expect, it } from "vitest";
import type { Problem } from "../src/content/types";
import { SKILLS } from "../src/content";
import { makeRng } from "../src/lib/rng";
import { buildMessages, describeVisual, normalize, revealsAnswer, tutorContext, tutorUsedToday, TUTOR_SYSTEM } from "../src/grading/tutor";
import { frac } from "../src/lib/rational";
import type { TutorChat } from "../src/engine/state";

const base = { hints: ["Think about what “of” means.", "Multiply."], steps: ["Write it as 6 × 6.", "6 × 6 = 36."] };

const area: Problem = { ...base, prompt: "A square garden is 6 m on each side. What is its area?", answer: { kind: "number", value: frac(36), unit: " m²" } };
const fracAdd: Problem = { ...base, prompt: "What is {1/4} + {1/2}?", answer: { kind: "number", value: frac(3, 4), simplest: true } };
const mixed: Problem = { ...base, prompt: "What is {3/4} + {3/4}? Write it as a mixed number.", answer: { kind: "number", value: frac(3, 2) } };
const money: Problem = { ...base, prompt: "A shirt costs $18 and is 25% off. What is the sale price?", answer: { kind: "number", value: frac(27, 2), pre: "$" } };
const percent: Problem = { ...base, prompt: "What percent of 40 is 10?", answer: { kind: "number", value: frac(25), unit: "%" } };
const negative: Problem = { ...base, prompt: "What is −3 − 4?", answer: { kind: "number", value: frac(-7) } };
const inPrompt: Problem = { ...base, prompt: "Which is greater, 12 or 8? Type the greater number.", answer: { kind: "number", value: frac(12) } };
const solve: Problem = { ...base, prompt: "Solve: x + 5 = 12", answer: { kind: "number", value: frac(7) } };
const choice: Problem = {
  ...base,
  prompt: "Which expression is equivalent to 3(x + 2)?",
  answer: { kind: "choice", choices: ["3x + 2", "3x + 6", "x + 6"], correct: 1 },
};
const wordChoice: Problem = {
  ...base,
  prompt: "Which shows a positive association?",
  answer: { kind: "choice", choices: ["Hours studied and test score", "Age of a car and its value", "Shoe size and favorite color"], correct: 0 },
};
const ratio: Problem = { ...base, prompt: "There are 4 dogs and 8 cats. What is the ratio of dogs to cats?", answer: { kind: "choice", choices: ["8 : 4", "4 : 8", "4 : 12"], correct: 1 } };
const greatest: Problem = { ...base, prompt: "Which is greatest: 0.7, 0.76 or 0.67? Type it.", answer: { kind: "number", value: frac(76, 100) } };
const buy: Problem = { ...base, prompt: "Which is the better buy?", answer: { kind: "choice", choices: ["6 pencils for $1.44", "4 pencils for $2.56"], correct: 0 } };
const point: Problem = { ...base, prompt: "Plot the point 3 units right and 2 units down from the origin.", answer: { kind: "point", x: 3, y: -2, min: -5, max: 5 } };
const line: Problem = {
  ...base,
  prompt: "A plan costs $20 to join plus $5 per month. Write the equation.",
  answer: { kind: "multi", fields: [{ value: frac(5), pre: "y =", post: "x" }, { value: frac(20), pre: "+" }] },
};

const factor: Problem = { ...base, prompt: "Factor: x^2 − x − 6", answer: { kind: "expr", value: "(x+2)(x-3)", vars: ["x"], form: "factored" } };
const radical: Problem = { ...base, prompt: "Simplify √18.", answer: { kind: "expr", value: "3sqrt(2)", vars: [], exact: true } };
const slopeLine: Problem = { ...base, prompt: "Write the line through (0, 3) with slope 2.", answer: { kind: "expr", value: "2x+3", vars: ["x"], lhs: "y" } };

describe("leak guard: catches give-aways", () => {
  it.each([
    [area, "Great thinking! 6 × 6 = 36, so the area is 36 square meters."],
    [area, "The answer is 36."],
    [area, "So it's 36 m²!"],
    [area, "Yes, 36 is right!"],
    [fracAdd, "Nice! {1/4} + {2/4} = {3/4}."],
    [fracAdd, "1/4 + 2/4 = 3/4"],
    [fracAdd, "When you add them you get **{3/4}**."],
    [mixed, "Six fourths is the same as 1 1/2."],
    [mixed, "{3/4} + {3/4} = 1.5"],
    [money, "25% of $18 is $4.50, so the sale price is $13.50."],
    [money, "$18 − $4.50 = $13.50"],
    [percent, "10 out of 40 equals 25%."],
    [negative, "−3 − 4 = −7"],
    [solve, "So x = 7."],
    [inPrompt, "The answer is 12."],
    [choice, "The correct answer is choice 2."],
    [choice, "You should pick option 2!"],
    [choice, "The answer is 3x + 6 because you multiply both."],
    [choice, "3x + 6 is correct!"],
    [wordChoice, "The right answer is “Hours studied and test score”."],
    [ratio, "Dogs come first, so dogs to cats is 4 : 8."],
    [greatest, "Right, 0.76 is the greatest!"],
    [buy, "Each pencil costs $0.24 there, so the better buy is 6 pencils for $1.44."],
    [point, "The point is (3, −2)."],
    [point, "You land at (3,-2)!"],
    [line, "The equation is y = 5x + 20."],
    [factor, "So it factors as (x + 2)(x − 3)."],
    [factor, "The answer is (x+2)(x-3)."],
    [radical, "√18 = √9 · √2 = 3√2."],
    [radical, "That makes 3 √(2)."],
    [slopeLine, "The answer is y = 2x + 3."],
  ])("%#: %s", (problem, reply) => {
    expect(revealsAnswer(reply, problem)).toBe(true);
  });

  it("catches a 'yes' to a bare correct guess typed in the chat", () => {
    expect(revealsAnswer("Yes! Great job.", area, "is it 36?")).toBe(true);
    expect(revealsAnswer("You got it!", choice, "is it 2")).toBe(true);
    expect(revealsAnswer("Yes, exactly.", factor, "is it (x+2)(x-3)?")).toBe(true);
  });
});

describe("leak guard: allows real tutoring (no false positives)", () => {
  it.each([
    [area, "A square has 4 equal sides. What do you multiply to find the area of a square that is 6 m on each side?"],
    [area, "Area means how many 1-by-1 squares fit inside. How many rows of squares are there?"],
    [area, "Try it and check! What is 6 rows of 6?"],
    [area, "You wrote 24. That's what you get when you add all four sides. Is that area or perimeter?"],
    [fracAdd, "To add {1/4} and {1/2}, the bottoms need to match. How many fourths is {1/2}?"],
    [fracAdd, "{1/2} = {2/4}. Now what do you get when you add {1/4} and {2/4}?"],
    [mixed, "How many fourths do you have altogether? Then think: how many wholes is that?"],
    [money, "25% is the same as {1/4}. What is {1/4} of $18?"],
    [money, "First find the discount: 25% of $18. Then what do you do with it?"],
    [percent, "Write 10 out of 40 as a fraction: {10/40}. Can you simplify it?"],
    [negative, "Start at −3 on the number line. Which way do you move when you subtract 4?"],
    [solve, "What number plus 5 = 12? You can undo the + 5 by subtracting 5 from both sides."],
    [solve, "x + 5 = 12. What could you do to both sides?"],
    [inPrompt, "Which number is farther to the right on a number line, 12 or 8?"],
    [choice, "Use the distributive property: multiply 3 by x and 3 by 2. What do you get for each part?"],
    [choice, "Look at choice 1. Did the 3 get multiplied by the 2 too?"],
    [wordChoice, "Positive association means when one goes up, the other goes up too. Which pair does that?"],
    [ratio, "A ratio compares two amounts in order. Which animal is named first in the question?"],
    [ratio, "Look at 8 : 4. Which number counts the dogs?"],
    [greatest, "Line up the decimal points. Which has the most tenths: 0.7, 0.76 or 0.67?"],
    [buy, "Find the cost of one pencil for each deal. What is $1.44 ÷ 6?"],
    [point, "Start at the origin (0, 0). Which way is right? Which way is down?"],
    [line, "What stays the same every month, and what is the starting cost?"],
    [line, "The $20 is paid once. Which part of y = mx + b is the starting amount?"],
    [factor, "Look for two numbers that multiply to −6 and add to −1. What pairs multiply to −6?"],
    [factor, "Try (x + 3)(x − 2). Expand it: does the middle term match?"],
    [radical, "What is the largest perfect square that divides 18?"],
    [slopeLine, "In y = mx + b, which number is the slope, and where does the line cross the y-axis?"],
  ])("%#: %s", (problem, reply) => {
    expect(revealsAnswer(reply, problem)).toBe(false);
  });

  it("lets the tutor say 'you're right' once the student has worked it out", () => {
    expect(revealsAnswer("Yes, 36 m². Enter it and press Check.", area, ["I think it's 36 because 6 times 6 is 36"])).toBe(false);
    expect(revealsAnswer("That's right, x = 7. Enter it.", solve, ["I don't know how to start", "12 - 5", "7"])).toBe(false);
    expect(revealsAnswer("You got it: 36 is right.", area, ["is it 36?", "because 6 rows of 6"])).toBe(false);
    expect(revealsAnswer("Yes, choice 2 is correct.", choice, ["3 times x is 3x and 3 times 2 is 6 so 3x + 6"])).toBe(false);
    expect(revealsAnswer("Exactly, (3, −2).", point, ["right 3 then down 2 so (3, -2)"])).toBe(false);
    expect(revealsAnswer("Right, (x + 2)(x − 3). Enter it and press Check.", factor, ["2 and -3 multiply to -6 and add to -1 so (x+2)(x-3)"])).toBe(false);
    expect(revealsAnswer("Yes, 3√2. Enter it.", radical, ["18 is 9 times 2 and the square root of 9 is 3 so 3√2"])).toBe(false);
    // They answered the one step the tutor set up.
    expect(revealsAnswer("Yes, 36. You've got it, so enter it.", area, [{ role: "student", text: "help" }, { role: "tutor", text: "There are 6 rows with 6 squares in each. What is 6 × 6?" }, { role: "student", text: "36" }])).toBe(false);
    expect(revealsAnswer("Right, x = 7. Enter it.", solve, [{ role: "student", text: "help" }, { role: "tutor", text: "Subtract 5 from both sides. What is 12 − 5?" }, { role: "student", text: "7?" }])).toBe(false);
  });

  it("still won't confirm an answer typed with no work, or a list of guesses", () => {
    expect(revealsAnswer("Yes, 36 is right!", area, ["36"])).toBe(true);
    expect(revealsAnswer("Yes, 36 is right!", area, ["I don't know", "help", "36"])).toBe(true);
    expect(revealsAnswer("Yes, 36 is right!", area, ["is it 24 or 36", "please just tell me"])).toBe(true);
    expect(revealsAnswer("You got it!", choice, ["idk", "3x + 6"])).toBe(true);
    expect(revealsAnswer("Yes, exactly.", factor, ["no idea", "(x+2)(x-3)"])).toBe(true);
    expect(revealsAnswer("Yes, 36 is right!", area, [{ role: "student", text: "help" }, { role: "tutor", text: "Area means how many squares fit inside. Can you picture it?" }, { role: "student", text: "36" }])).toBe(true);
    expect(revealsAnswer("The answer is 12.", inPrompt, ["I don't get what 12 or 8 means"])).toBe(true);
    expect(revealsAnswer("The answer is 36.", area, ["6 + 6 + 6 + 6 = 24"])).toBe(true);
  });

  it("doesn't flag encouragement when the guess in chat was wrong", () => {
    expect(revealsAnswer("Good try! Let's check it together.", area, "is it 24?")).toBe(false);
  });
});

describe("leak guard on generated problems", () => {
  it("flags 'The answer is <answer>' for every skill, and never flags a plain guiding question", async () => {
    const { answerText } = await import("../src/engine/check");
    for (const s of SKILLS) {
      for (const level of [1, 2, 3] as const) {
        const p = s.generate(makeRng(7 + level), level);
        expect(revealsAnswer(`The answer is ${answerText(p.answer)}.`, p), `${s.id} L${level}: ${answerText(p.answer)}`).toBe(true);
        expect(revealsAnswer("What is the first thing you would do? Look closely at the numbers in the problem.", p), s.id).toBe(false);
      }
    }
  });
});

describe("prompt building", () => {
  it("describes visuals in words", () => {
    expect(describeVisual({ type: "table", headers: ["x", "y"], rows: [[1, 3], [2, 6]], caption: "Cost" })).toContain("x | y");
    expect(describeVisual({ type: "numberline", min: -5, max: 5, step: 1, points: [{ v: -2, label: "A" }] })).toContain("A at −2");
    expect(describeVisual({ type: "shape", shape: "triangle", labels: { base: "8 cm", h: "5 cm", c: undefined } })).toBe("A picture of a triangle labeled base = 8 cm, h = 5 cm.");
    expect(describeVisual({ type: "fractionbars", bars: [{ parts: 4, shaded: 3 }] })).toContain("4 equal parts with 3 shaded");
    expect(describeVisual({ type: "boxplot", min: 1, q1: 2, median: 3, q3: 4, max: 5, scaleMin: 0, scaleMax: 6 })).toContain("median 3");
  });

  it("puts everything the tutor needs in the first message", () => {
    const ctx = tutorContext({ ...choice, visual: { type: "table", headers: ["a"], rows: [[1]] } }, ["3x + 2"], 1);
    expect(ctx).toContain("Which expression is equivalent");
    expect(ctx).toContain("1) 3x + 2\n2) 3x + 6");
    expect(ctx).toContain("<hints_already_shown>\n1. Think about");
    expect(ctx).not.toContain("2. Multiply.");
    expect(ctx).toContain("<student_wrong_answers>\n3x + 2");
    expect(ctx).toMatch(/<for_the_tutor_only_never_reveal>\nCorrect answer: choice 2\) 3x \+ 6\nWorked solution:\n1\. Write/);
    expect(ctx).toContain("<picture_shown_with_the_problem>");
    expect(tutorContext(area, [], 0)).toContain("none yet");
    const fctx = tutorContext(factor, [], 0);
    expect(fctx).toContain("an expression in x");
    expect(fctx).toContain("factored form");
    expect(fctx).toContain("Correct answer: (x + 2)(x − 3)");
  });

  it("alternates user/assistant and wraps the first student message", () => {
    const msgs = buildMessages("CTX", [
      { role: "student", text: "I don't know how to start" },
      { role: "tutor", text: "What shape is it?" },
      { role: "student", text: "a square" },
    ]);
    expect(msgs.map((m) => m.role)).toEqual(["user", "assistant", "user"]);
    expect(msgs[0].content).toBe("CTX\n\n<student_message>\nI don't know how to start\n</student_message>");
    expect(msgs[2].content).toBe("a square");
  });

  it("has the key rules in the system prompt", () => {
    for (const s of ["ONE", "60 words", "NEVER state the final answer", "Try it and check", "enter their answer", "how the skill sticks", "trusted adult", "NC Math 1", "EOC", "no headings, lists, tables, LaTeX or links"]) expect(TUTOR_SYSTEM).toContain(s);
    expect(TUTOR_SYSTEM).not.toMatch(/\b(she|her|daughter|grown-up|middle school)\b/i);
  });

  it("normalizes markup", () => {
    expect(normalize("**{3/4}** − 1,200 and 2.5 x 10^3")).toBe("3/4 - 1200 and 2.5×10^3");
  });
});

describe("daily usage", () => {
  it("counts only student messages in chats from that day", () => {
    const chats: TutorChat[] = [
      { id: "a", date: "2026-10-12", prompt: "p", messages: [{ role: "student", text: "x" }, { role: "tutor", text: "y" }, { role: "student", text: "z" }, { role: "tutor", text: "w" }] },
      { id: "b", date: "2026-10-11", prompt: "p", messages: [{ role: "student", text: "x" }, { role: "tutor", text: "y" }] },
      { id: "c", date: "2026-10-12", prompt: "p", messages: [{ role: "student", text: "x" }, { role: "tutor", text: "y" }] },
    ];
    expect(tutorUsedToday(chats, "2026-10-12")).toBe(3);
    expect(tutorUsedToday(chats, "2026-10-13")).toBe(0);
  });
});
