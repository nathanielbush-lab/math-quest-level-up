// Units and skills for this course. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import composeInverse from "./compose-inverse";
import transformations from "./transformations";
import rational from "./rational";
import explog from "./explog";
import unitCircle from "./unit-circle";
import trigGraphs from "./trig-graphs";
import trigEquations from "./trig-equations";
import triangles from "./triangles";
import conics from "./conics";
import complexMatrices from "./complex-matrices";
import vectors from "./vectors";

const topics: Topic[] = [
  { id: "pc-compose-inverse", course: "pc", unit: 1, strand: "algebra", family: "functions", title: "Composition & Inverses", standards: "PC.F.5.1–F.5.7", blurb: "Chain functions together, take them apart, and undo them.", icon: "∘" },
  { id: "pc-transformations", course: "pc", unit: 2, strand: "algebra", family: "functions", title: "Transformations & Piecewise Functions", standards: "PC.F.4.7, PC.F.5.2", blurb: "Shift, stretch and flip power functions, and read functions built from pieces.", icon: "↔" },
  { id: "pc-rational", course: "pc", unit: 3, strand: "algebra", family: "functions", title: "Polynomial & Rational Functions", standards: "PC.F.4.5–F.4.6, PC.A.1.1–A.1.2", blurb: "Asymptotes, holes, sign charts and the best possible box.", icon: "÷" },
  { id: "pc-explog", course: "pc", unit: 4, strand: "algebra", family: "functions", title: "Exponential & Logarithmic Functions", standards: "PC.F.4.1–F.4.4, F.4.7, PC.A.2.1–A.2.2", blurb: "Growth, decay, half-lives and the logs that undo them.", icon: "eˣ" },
  { id: "pc-unit-circle", course: "pc", unit: 5, strand: "geo-stats", family: "trig", title: "Radians & the Unit Circle", standards: "PC.F.2.1–F.2.2, PC.F.3.3", blurb: "Measure angles in radians and read all six trig values off the unit circle.", icon: "◯" },
  { id: "pc-trig-graphs", course: "pc", unit: 6, strand: "algebra", family: "trig", title: "Graphs of Trig Functions", standards: "PC.F.1.1–F.1.4", blurb: "Amplitude, period and phase shift, the other four trig graphs, and models for things that repeat.", icon: "∿" },
  { id: "pc-trig-equations", course: "pc", unit: 7, strand: "algebra", family: "trig", title: "Inverse Trig, Identities & Equations", standards: "PC.F.3.1, F.3.3, PC.A.2.3", blurb: "Undo trig functions, simplify with identities, and find every solution.", icon: "θ" },
  { id: "pc-triangles", course: "pc", unit: 8, strand: "geo-stats", family: "trig", title: "Law of Sines & Law of Cosines", standards: "PC.F.3.2", blurb: "Solve any triangle, right or not, and use it to measure what you can't reach.", icon: "△" },
  { id: "pc-conics", course: "pc", unit: 9, strand: "geo-stats", family: "geometry", title: "Conic Sections", standards: "PC.F.4.8–F.4.9", blurb: "Circles, ellipses, parabolas and hyperbolas: tell them apart and find their key points.", icon: "⬭" },
  { id: "pc-complex-matrices", course: "pc", unit: 10, strand: "algebra", family: "number", title: "Complex Numbers & Matrices", standards: "PC.N.1.1–N.1.2, PC.N.2.1–N.2.5", blurb: "Compute with a + bi, and add, scale and multiply matrices.", icon: "i" },
  { id: "pc-vectors", course: "pc", unit: 11, strand: "geo-stats", family: "geometry", title: "Vectors", standards: "PC.N.3.1–N.3.2", blurb: "Quantities with size and direction: components, sums and real-world resultants.", icon: "→" },
];
const skills: Skill[] = [...composeInverse, ...transformations, ...rational, ...explog, ...unitCircle, ...trigGraphs, ...trigEquations, ...triangles, ...conics, ...complexMatrices, ...vectors];

const content: CourseContent = { topics, skills };
export default content;
