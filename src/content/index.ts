import { COURSES, COURSE_CONTENT, COURSE_ORDER, TOPICS, TOPIC_BY_ID } from "./topics";
import type { Skill } from "./types";

export const SKILLS: Skill[] = COURSES.flatMap((c) => COURSE_CONTENT[c.id].skills);

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export { TOPICS, TOPIC_BY_ID };

export function skillsInTopic(topicId: string): Skill[] {
  return ORDERED.filter((s) => s.topic === topicId);
}

export function topicOf(skillId: string) {
  return TOPIC_BY_ID[SKILL_BY_ID[skillId].topic];
}

/** All prerequisites, direct and indirect. */
export function ancestors(skillId: string, seen = new Set<string>()): Set<string> {
  for (const p of SKILL_BY_ID[skillId]?.prereqs ?? []) {
    if (!seen.has(p)) {
      seen.add(p);
      ancestors(p, seen);
    }
  }
  return seen;
}

/** Skills in an order where every prerequisite comes first (stable by course and unit, then listing order). */
function topoSort(skills: Skill[]): Skill[] {
  const out: Skill[] = [];
  const done = new Set<string>();
  const visit = (s: Skill, stack: string[]) => {
    if (done.has(s.id)) return;
    if (stack.includes(s.id)) throw new Error(`Prerequisite cycle: ${[...stack, s.id].join(" → ")}`);
    for (const p of s.prereqs) {
      const ps = SKILL_BY_ID[p];
      if (!ps) throw new Error(`Unknown prerequisite ${p} for ${s.id}`);
      visit(ps, [...stack, s.id]);
    }
    done.add(s.id);
    out.push(s);
  };
  const orderOf = (s: Skill) => COURSE_ORDER[TOPIC_BY_ID[s.topic].course] * 100 + TOPIC_BY_ID[s.topic].unit;
  [...skills].sort((a, b) => orderOf(a) - orderOf(b)).forEach((s) => visit(s, []));
  return out;
}

export const ORDERED: Skill[] = topoSort(SKILLS);
