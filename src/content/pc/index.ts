// Units and skills for this course. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import composeInverse from "./compose-inverse";
import transformations from "./transformations";
import rational from "./rational";
import explog from "./explog";
import unitCircle from "./unit-circle";
import trigGraphs from "./trig-graphs";

const topics: Topic[] = [
  { id: "pc-compose-inverse", course: "pc", unit: 1, strand: "algebra", family: "functions", title: "Composition & Inverses", standards: "PC.F.5.1–F.5.7", blurb: "Chain functions together, take them apart, and undo them.", icon: "∘" },
  { id: "pc-transformations", course: "pc", unit: 2, strand: "algebra", family: "functions", title: "Transformations & Piecewise Functions", standards: "PC.F.4.7, PC.F.5.2", blurb: "Shift, stretch and flip power functions, and read functions built from pieces.", icon: "↔" },
  { id: "pc-rational", course: "pc", unit: 3, strand: "algebra", family: "functions", title: "Polynomial & Rational Functions", standards: "PC.F.4.5–F.4.6, PC.A.1.1–A.1.2", blurb: "Asymptotes, holes, sign charts and the best possible box.", icon: "÷" },
  { id: "pc-explog", course: "pc", unit: 4, strand: "algebra", family: "functions", title: "Exponential & Logarithmic Functions", standards: "PC.F.4.1–F.4.4, F.4.7, PC.A.2.1–A.2.2", blurb: "Growth, decay, half-lives and the logs that undo them.", icon: "eˣ" },
  { id: "pc-unit-circle", course: "pc", unit: 5, strand: "geo-stats", family: "trig", title: "Radians & the Unit Circle", standards: "PC.F.2.1–F.2.2, PC.F.3.3", blurb: "Measure angles in radians and read all six trig values off the unit circle.", icon: "◯" },
  { id: "pc-trig-graphs", course: "pc", unit: 6, strand: "algebra", family: "trig", title: "Graphs of Trig Functions", standards: "PC.F.1.1–F.1.4", blurb: "Amplitude, period and phase shift, the other four trig graphs, and models for things that repeat.", icon: "∿" },
];
const skills: Skill[] = [...composeInverse, ...transformations, ...rational, ...explog, ...unitCircle, ...trigGraphs];

const content: CourseContent = { topics, skills };
export default content;
