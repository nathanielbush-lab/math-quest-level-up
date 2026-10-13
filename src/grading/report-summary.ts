// Kept separate from report-claude.ts so the report can offer a summary without loading the Anthropic SDK up front.
import type { ReportStats } from "../engine/report";

export interface ReportSummary {
  /** One paragraph for the teacher or parent (≤ 120 words). */
  summary: string;
  /** Two or three concrete ideas for next week. */
  suggestions: string[];
}

export interface SummaryOutcome {
  summary: ReportSummary | null;
  error?: string;
}

/** Loads the SDK on first use and asks Claude for a short note about the week. Sends only aggregated numbers. Never throws. */
export async function writeSummary(apiKey: string, model: string, stats: ReportStats): Promise<SummaryOutcome> {
  try {
    const mod = await import("./report-claude");
    try {
      return { summary: await mod.summarizeWeek(apiKey, model, stats) };
    } catch (e) {
      return { summary: null, error: mod.describeSummaryError(e) };
    }
  } catch {
    return { summary: null, error: "Couldn't load the Claude helper. Check the internet connection and try again." };
  }
}
