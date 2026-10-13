// NC Math 2: units in teaching order (Open Up NC order: transformations and geometry first,
// then quadratics, variation and square-root functions, and probability). One file per unit.
import type { CourseContent, Skill, Topic } from "../types";
import transformations from "./transformations";

const topics: Topic[] = [
  { id: "m2-transformations", course: "m2", unit: 1, strand: "geo-stats", family: "geometry", title: "Transformations & Symmetry", standards: "G-CO.2–5, F-IF.1–2", blurb: "Slide, flip and turn figures on the plane, write transformations as functions, and find symmetry.", icon: "transform" },
];
const skills: Skill[] = [...transformations];

const content: CourseContent = { topics, skills };
export default content;
