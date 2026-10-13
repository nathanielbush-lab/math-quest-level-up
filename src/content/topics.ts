import m1 from "./m1";
import m2 from "./m2";
import m3 from "./m3";
import m4 from "./m4";
import pc from "./pc";
import type { CourseId, Topic, TopicFamily } from "./types";

export type { TopicFamily };

export interface Course {
  id: CourseId;
  name: string;
  short: string;
  /** NC gives an End-of-Course test for this course. */
  eoc: boolean;
  blurb: string;
}

export const COURSES: Course[] = [
  { id: "m1", name: "NC Math 1", short: "Math 1", eoc: true, blurb: "Linear and exponential functions, equations and systems, quadratics, and statistics." },
  { id: "m2", name: "NC Math 2", short: "Math 2", eoc: false, blurb: "Quadratics in depth, radicals and exponents, transformations, similarity, right-triangle trig, and probability." },
  { id: "m3", name: "NC Math 3", short: "Math 3", eoc: true, blurb: "Functions and inverses, exponentials and logarithms, polynomials, rational functions, circles, and statistics." },
  { id: "m4", name: "NC Math 4", short: "Math 4", eoc: false, blurb: "Functions and modeling, trigonometry, and a deep dive into statistics." },
  { id: "pc", name: "Pre-Calculus", short: "Pre-Calc", eoc: false, blurb: "Functions of all kinds, trigonometry, conics, vectors, and parametric equations." },
];

export const COURSE_BY_ID = Object.fromEntries(COURSES.map((c) => [c.id, c])) as Record<CourseId, Course>;

export const COURSE_CONTENT = { m1, m2, m3, m4, pc };

export const TOPICS: Topic[] = COURSES.flatMap((c) => [...COURSE_CONTENT[c.id].topics].sort((a, b) => a.unit - b.unit));

export const TOPIC_BY_ID: Record<string, Topic> = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

export function familyOf(topicId: string): TopicFamily {
  return TOPIC_BY_ID[topicId]?.family ?? "algebra";
}

export const COURSE_ORDER: Record<CourseId, number> = { m1: 1, m2: 2, m3: 3, m4: 4, pc: 4 };
