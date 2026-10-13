import { it } from "vitest";
import { writeFileSync } from "fs";
import m4 from "../src/content/m4";
import { makeRng } from "../src/lib/rng";
import { answerText } from "../src/engine/check";
import type { Level } from "../src/content/types";

it("dump m4", () => {
  const only = process.env.M4_ONLY ?? "";
  const out: string[] = [];
  for (const s of m4.skills) {
    if (only && !s.id.includes(only)) continue;
    out.push(`\n######## ${s.id} — ${s.title}`);
    for (const lv of [1, 2, 3] as Level[]) for (const seed of [11, 202]) {
      const p = s.generate(makeRng(seed * 7919 + lv), lv);
      out.push(`\n--- L${lv} seed ${seed}\nQ: ${p.prompt}`);
      if (p.visual) out.push(`VIS: ${JSON.stringify(p.visual).slice(0, 400)}`);
      if (p.answer.kind === "choice") out.push(`CHOICES: ${p.answer.choices.map((c, i) => (i === p.answer.correct ? "[*] " : "[ ] ") + c).join("\n         ")}`);
      out.push(`A: ${answerText(p.answer)}${p.answer.kind === "number" && p.answer.tolerance ? ` (tol ${p.answer.tolerance})` : ""}`);
      p.hints.forEach((h) => out.push(`H: ${h}`));
      p.steps.forEach((h) => out.push(`S: ${h}`));
      (p.traps ?? []).forEach((t) => out.push(`T: ${t.value.n}/${t.value.d} ${t.feedback}`));
    }
  }
  if (!only) for (const c of m4.challenges ?? []) {
    const b = c.build(makeRng(5));
    out.push(`\n######## CHALLENGE ${c.id} — ${c.title}\nINTRO: ${b.intro}`);
    for (const p of b.parts) {
      out.push(`\nQ: ${p.prompt}`);
      if (p.answer.kind === "choice") out.push(`CHOICES: ${p.answer.choices.join(" | ")}`);
      out.push(`A: ${answerText(p.answer)}`);
      p.hints.forEach((h) => out.push(`H: ${h}`));
      p.steps.forEach((h) => out.push(`S: ${h}`));
    }
  }
  writeFileSync(process.env.M4_OUT ?? "/tmp/claude-0/-home-user/44fd04f3-830a-5126-8a6e-878c2b1fd65f/scratchpad/m4-dump/dump.txt", out.join("\n"));
});
