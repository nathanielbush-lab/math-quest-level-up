import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import type { ReportStats } from "../engine/report";
import type { ReportSummary } from "./report-summary";

const SummarySchema = z.object({
  summary: z.string(),
  suggestions: z.array(z.string()),
});

const SYSTEM = `You write a short weekly progress note for the teacher or parent of a high-school student (about 14–18 years old) who practices North Carolina high-school math (NC Math 1–4 and Pre-Calculus) in an adaptive practice app.

You get ONLY aggregated numbers for one week as JSON. Write:
- summary: one honest, specific, encouraging paragraph of at most 120 words for the adult. Refer to the learner only as "the student" (they/them). Never guess a name, gender or family role. Lead with what went well, then what to keep an eye on. Use the real numbers sparingly (two or three). No headings, lists or emoji. Don't invent anything that isn't in the data; if the week was quiet, say so plainly and briefly.
- suggestions: 2 or 3 concrete things the teacher or parent could do in the next week, each one sentence of at most 30 words, tied to specific skills or patterns in the data (for example, asking the student to explain a step out loud on a named skill, or reviewing a weak unit before the EOC).

Background on the numbers: "first try" means right on the first attempt with no hint, worked steps or tutor. Levels go Exploring → Practicing (solves on their own) → Independent (still right on a later day) → Can explain & apply. "tests" are practice assessments taken in the app (such as EOC-style practice tests and checkpoints). Pace compares new skills per week lately with the number needed to cover every skill by the target date; depth matters more than coverage.`;

export async function summarizeWeek(apiKey: string, model: string, stats: ReportStats): Promise<ReportSummary> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 });
  const message = await client.messages.parse({
    model,
    max_tokens: 1200,
    output_config: { effort: "low", format: zodOutputFormat(SummarySchema) },
    system: SYSTEM,
    messages: [{ role: "user", content: `<week_stats>\n${JSON.stringify(stats, null, 1)}\n</week_stats>` }],
  });
  if (message.stop_reason === "refusal" || !message.parsed_output) throw new Error("No summary returned");
  const out = message.parsed_output;
  return { summary: out.summary.trim(), suggestions: out.suggestions.map((s) => s.trim()).filter(Boolean).slice(0, 3) };
}

export function describeSummaryError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "The API key was rejected. Check it in Settings.";
  if (e instanceof Anthropic.PermissionDeniedError) return "This API key isn't allowed to use that model.";
  if (e instanceof Anthropic.RateLimitError) return "Claude is busy right now. Try again in a minute.";
  if (e instanceof Anthropic.APIConnectionError) return "Couldn't reach Claude (no internet?). Try again later.";
  if (e instanceof Anthropic.APIError) return `Claude returned an error (${e.status}). Try again later.`;
  return "Couldn't write a summary right now. The report above has everything it would cover.";
}
