// Kept separate from claude.ts so screens can use these without loading the Anthropic SDK up front.

/** Most rounds of "feedback → revise" before the grader wraps up with a model explanation. */
export const MAX_ROUNDS = 3;

export type Verdict = "got_it" | "almost" | "not_yet";

/** One earlier attempt in a revision conversation. */
export interface PriorRound {
  response: string;
  verdict: Verdict;
  feedback: string;
  guidingQuestion?: string;
}

export interface ExplanationToGrade {
  skillTitle: string;
  prompt: string;
  keyIdeas: string[];
  exemplar: string;
  response: string;
  /** Earlier drafts and the feedback the student got on them, oldest first. */
  previous?: PriorRound[];
}

export interface GradeResult {
  verdict: Verdict;
  feedbackForStudent: string;
  /** Asked on a non-final round so the student can revise. */
  guidingQuestion?: string;
  /** Wrap-up (when the student has got it, or on the last round): how to make it stronger. */
  howToImprove?: string;
  /** Wrap-up: a complete explanation in clear, plain high-school language. */
  modelExplanation?: string;
  noteForParent: string;
}

export interface GradeOutcome {
  grade: GradeResult | null;
  error?: string;
}

/** Whether this grade ends the conversation: the student has got it, or has used every round. */
export function isFinalRound(g: GradeResult, round: number): boolean {
  return g.verdict === "got_it" || round >= MAX_ROUNDS;
}

/** Loads the SDK on first use and grades; never throws. */
export async function grade(apiKey: string, model: string, item: ExplanationToGrade): Promise<GradeOutcome> {
  const mod = await import("./claude");
  try {
    return { grade: await mod.gradeExplanation(apiKey, model, item) };
  } catch (e) {
    return { grade: null, error: mod.describeError(e) };
  }
}

/** Text a parent can paste into a Claude chat to have pending explanations graded there. */
export function reviewPrompt(items: (ExplanationToGrade & { id: string; date: string })[]): string {
  const body = items
    .map((it, i) => {
      const drafts = (it.previous ?? []).map((p, j) => `Draft ${j + 1}: """${p.response}"""\nFeedback given: ${p.feedback}${p.guidingQuestion ? ` ${p.guidingQuestion}` : ""}`).join("\n");
      return `### ${i + 1}. ${it.skillTitle} (${it.date})\nQuestion: ${it.prompt}\nKey ideas: ${it.keyIdeas.join("; ")}\nStrong answer example: ${it.exemplar}\n${drafts ? drafts + "\n" : ""}Student's ${drafts ? "latest " : ""}explanation: """${it.response}"""`;
    })
    .join("\n\n");
  return `A high-school student is practicing North Carolina high-school math (NC Math 1–4 or Pre-Calculus) with a practice app. Please grade each written explanation below.

For each one, say GOT IT, ALMOST or NOT YET (GOT IT = correct reasoning that explains why, even if simply worded; ignore spelling). Then give one direct, respectful sentence of feedback I can share with the student. If it isn't GOT IT, add one guiding question (not the answer) they could use to revise it. Finally, give one concrete suggestion for making it even stronger and a short model explanation in clear high-school-level language. Keep it short. A table is fine.

${body}`;
}
