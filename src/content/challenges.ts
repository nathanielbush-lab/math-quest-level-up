// Boss-level challenges and missions, gathered from every course.
import { COURSES, COURSE_CONTENT } from "./topics";
import type { Challenge, Mission } from "./types";

export type { Challenge, Mission };

export const CHALLENGES: Challenge[] = COURSES.flatMap((c) => COURSE_CONTENT[c.id].challenges ?? []);
export const MISSIONS: Mission[] = COURSES.flatMap((c) => COURSE_CONTENT[c.id].missions ?? []);
