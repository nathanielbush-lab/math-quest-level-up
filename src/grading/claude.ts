import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import { MAX_ROUNDS, type ExplanationToGrade, type GradeResult } from "./types";

const GradeSchema = z.object({
  verdict: z.enum(["got_it", "almost", "not_yet"]),
  feedback_for_student: z.string(),
  guiding_question: z.string(),
  how_to_improve: z.string(),
  model_explanation: z.string(),
  note_for_parent: z.string(),
});

const SYSTEM = `You coach a high-school student (about 14–18 years old) taking North Carolina high-school math (NC Math 1, NC Math 2, NC Math 3, NC Math 4 or Pre-Calculus) to write short explanations of WHY a math idea works, the kind of reasoning the NC EOC tests and later courses expect. This is a short revision conversation: the student writes, you respond, and they may revise. There are at most ${MAX_ROUNDS} rounds, but stop as soon as the explanation is good. Never ask for revisions just to use up rounds.

Grade the LATEST explanation, using the key ideas as a guide:
- "got_it": the reasoning is correct and explains why, even if worded informally or not every key idea is spelled out. Spelling, grammar, length and formal notation don't matter.
- "almost": on the right track but missing an important step or containing a small error.
- "not_yet": incorrect reasoning, only restates the answer or procedure with no "why", or off topic.
If the student revised, judge whether the new version fixed what was missing, and notice the improvement.

Every field is a string; use "" for a field that doesn't apply this round.
- feedback_for_student: 1–3 short, direct, respectful sentences written to the student ("you"), with no baby talk or over-the-top praise. Name something specific they did well. If it isn't "got_it", say what is still missing or unclear without giving away the full explanation. Max 60 words.
- guiding_question: ONLY when the verdict is not "got_it" AND this is not the final round: one Socratic question that points the student toward the missing idea so they can revise. Otherwise "".
- how_to_improve and model_explanation: ONLY when the verdict is "got_it" OR this is the final round (the wrap-up). Otherwise "".
  - how_to_improve: 1–2 concrete suggestions that would make THEIR explanation even stronger (a missing step, a more precise math term, a counterexample, an example or a sketch or graph to add). Even a "got_it" answer can be improved a little. Max 50 words.
  - model_explanation: a complete, correct explanation in clear, plain language a strong high-school student could write, using correct vocabulary and built from the student's own wording and ideas where possible. Max 80 words.
- note_for_parent: one sentence for the student's teacher or parent naming what the student understands, any misconception, and how the revisions went if there were any. Refer to the learner as "the student" (they/them).`;

function userMessage(item: ExplanationToGrade): string {
  const prev = item.previous ?? [];
  const round = prev.length + 1;
  const drafts = prev
    .map((p, i) => `<draft round="${i + 1}" verdict="${p.verdict}">\n${p.response}\n</draft>\n<your_feedback round="${i + 1}">${p.feedback}${p.guidingQuestion ? ` Question: ${p.guidingQuestion}` : ""}</your_feedback>`)
    .join("\n");
  return `Topic: ${item.skillTitle}
Question: ${item.prompt}
Key ideas: ${item.keyIdeas.join("; ")}
Example of a strong answer (for you; don't copy it word for word): ${item.exemplar}
${drafts ? `\nEarlier rounds:\n${drafts}\n` : ""}
This is round ${round} of at most ${MAX_ROUNDS}.${round >= MAX_ROUNDS ? " It is the FINAL round: wrap up with how_to_improve and model_explanation whatever the verdict." : ""}

<student_explanation round="${round}">
${item.response}
</student_explanation>`;
}

/** Grades one explanation with Claude. Throws on network/auth problems so the caller can keep it for parent review. */
export async function gradeExplanation(apiKey: string, model: string, item: ExplanationToGrade): Promise<GradeResult> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 });
  const message = await client.messages.parse({
    model,
    max_tokens: 2000,
    output_config: { effort: "low", format: zodOutputFormat(GradeSchema) },
    system: SYSTEM,
    messages: [{ role: "user", content: userMessage(item) }],
  });
  if (message.stop_reason === "refusal" || !message.parsed_output) throw new Error("No grade returned");
  const g = message.parsed_output;
  const opt = (s: string) => (s.trim() ? s.trim() : undefined);
  return {
    verdict: g.verdict,
    feedbackForStudent: g.feedback_for_student,
    guidingQuestion: opt(g.guiding_question),
    howToImprove: opt(g.how_to_improve),
    modelExplanation: opt(g.model_explanation),
    noteForParent: g.note_for_parent,
  };
}

export function describeError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "The API key was rejected. Check it in the Teacher corner.";
  if (e instanceof Anthropic.PermissionDeniedError) return "This API key isn't allowed to use that model.";
  if (e instanceof Anthropic.RateLimitError) return "Claude is busy right now (rate limit). It'll be saved for later.";
  if (e instanceof Anthropic.APIConnectionError) return "Couldn't reach Claude (no internet?). It'll be saved for later.";
  if (e instanceof Anthropic.APIError) {
    const body = e.error as { error?: { message?: string } } | undefined;
    return `Claude returned an error (${e.status}${body?.error?.message ? `: ${body.error.message}` : ""}). It'll be saved for later.`;
  }
  return "Couldn't grade it right now. It'll be saved for later.";
}
