import { it } from "vitest";
import { writeFileSync } from "fs";
import { SKILLS } from "../src/content";
import { makeRng } from "../src/lib/rng";
import { answerText } from "../src/engine/check";
import type { Level } from "../src/content/types";
import { CHALLENGES } from "../src/content/challenges";

it("dump m3", () => {
  const pre = process.env.M3P ?? "m3.";
  const out: string[] = [];
  for (const s of SKILLS.filter((s) => s.id.startsWith(pre))) {
    out.push(`\n######## ${s.id} — ${s.title}`);
    for (const lv of [1, 2, 3] as Level[]) for (const seed of [3, 11]) {
      const p = s.generate(makeRng(seed * 7919 + lv), lv);
      out.push(`--- L${lv} s${seed}: ${p.prompt}`);
      if (p.visual) out.push(`  [visual] ${JSON.stringify(p.visual).slice(0, 300)}`);
      if (p.answer.kind === "choice") p.answer.choices.forEach((c, i) => out.push(`  ${i === (p.answer as any).correct ? "*" : " "} ${c}`));
      out.push(`  ANSWER: ${answerText(p.answer)}`);
      p.hints.forEach((h) => out.push(`  hint: ${h}`));
      p.steps.forEach((h) => out.push(`  step: ${h}`));
      (p.traps ?? []).forEach((t) => out.push(`  trap ${t.value.n}/${t.value.d}: ${t.feedback}`));
    }
  }
  if (pre === "m3.ch") for (const c of CHALLENGES.filter((c) => c.id.startsWith("m3."))) for (const seed of [1, 2]) {
    const b = c.build(makeRng(seed));
    out.push(`\n######## ${c.id} seed ${seed}: ${b.intro}`);
    for (const p of b.parts) { out.push(`--- ${p.prompt}`); out.push(`  ANSWER: ${answerText(p.answer)}`); p.hints.forEach((h) => out.push(`  hint: ${h}`)); p.steps.forEach((h) => out.push(`  step: ${h}`)); }
  }
  writeFileSync(`/tmp/claude-0/-home-user/44fd04f3-830a-5126-8a6e-878c2b1fd65f/scratchpad/m3-dump/${pre}txt`, out.join("\n"));
});
