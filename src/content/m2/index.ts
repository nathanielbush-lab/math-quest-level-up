// NC Math 2: units in teaching order (Open Up NC order: transformations and geometry first,
// then quadratics, variation and square-root functions, and probability). One file per unit.
import type { CourseContent, Skill, Topic } from "../types";
import transformations from "./transformations";
import congruence from "./congruence";
import similarity from "./similarity";

const topics: Topic[] = [
  { id: "m2-transformations", course: "m2", unit: 1, strand: "geo-stats", family: "geometry", title: "Transformations & Symmetry", standards: "G-CO.2–5, F-IF.1–2", blurb: "Slide, flip and turn figures on the plane, write transformations as functions, and find symmetry.", icon: "transform" },
  { id: "m2-congruence", course: "m2", unit: 2, strand: "geo-stats", family: "geometry", title: "Congruence & Proof", standards: "G-CO.6–10", blurb: "Use rigid motions and SSS, SAS, ASA, AAS and HL to prove triangles congruent, and reason with angle and triangle theorems.", icon: "proof" },
  { id: "m2-similarity", course: "m2", unit: 3, strand: "geo-stats", family: "geometry", title: "Dilations & Similarity", standards: "G-SRT.1–4", blurb: "Dilate figures, use scale factors, prove triangles similar with AA, and split sides proportionally.", icon: "similar" },
];
const skills: Skill[] = [...transformations, ...congruence, ...similarity];

const content: CourseContent = { topics, skills };
export default content;
