import type { Frac } from "../lib/rational";
import type { Rng } from "../lib/rng";

export type Level = 1 | 2 | 3;

// ---------- Visual models shown with a problem or lesson ----------
export type Visual =
  | { type: "numberline"; min: number; max: number; step: number; /** Label every Nth tick, counting from min. */ labelEvery?: number; points?: { v: number; label?: string }[]; jumps?: { from: number; to: number; label?: string }[]; /** An inequality graph: a circle (filled = included) and a shaded ray. */ ray?: { at: number; dir: "left" | "right"; closed: boolean } }
  | { type: "fractionbars"; bars: { parts: number; shaded: number; label?: string }[] }
  | { type: "grid"; min: number; max: number; points?: { x: number; y: number; label?: string }[]; polygon?: { x: number; y: number }[]; lines?: { m: number; b: number; label?: string }[] }
  | { type: "table"; headers: string[]; rows: (string | number)[][]; caption?: string }
  | { type: "dotplot"; values: number[]; min: number; max: number; label?: string }
  | { type: "scatter"; points: { x: number; y: number }[]; xLabel: string; yLabel: string; line?: { m: number; b: number } }
  | { type: "tape"; rows: { label: string; segments: { text: string; size: number; shade?: boolean }[] }[] }
  | { type: "boxplot"; min: number; q1: number; median: number; q3: number; max: number; scaleMin: number; scaleMax: number }
  | { type: "dicesim"; target: number; rolls: number }
  /** Graph of one or more functions of x (expressions use the same syntax students type: "2x^2-3", "sqrt(x)", "2^x"). */
  | { type: "plot"; xMin: number; xMax: number; yMin: number; yMax: number; xStep?: number; yStep?: number; curves?: PlotCurve[]; points?: { x: number; y: number; label?: string; open?: boolean }[]; vlines?: { x: number; dashed?: boolean; label?: string }[]; hlines?: { y: number; dashed?: boolean; label?: string }[] }
  /** A geometry figure from coordinates (drawn to fit; no axes): polygons, segments, circles, angle marks, labels. */
  | { type: "geo"; points: Record<string, { x: number; y: number }>; polygons?: string[][]; segments?: { from: string; to: string; label?: string; dashed?: boolean; tick?: 1 | 2 | 3 }[]; circles?: { center: string; r: number }[]; angles?: { at: string; from: string; to: string; label?: string; right?: boolean }[]; showLabels?: boolean; grid?: boolean }
  | { type: "histogram"; bins: { from: number; to: number; count: number }[]; xLabel?: string; yLabel?: string }
  /** Normal curve with an optional shaded region (from/to in data units; omit one for a tail). */
  | { type: "normal"; mean: number; sd: number; shadeFrom?: number; shadeTo?: number; label?: string }
  | { type: "shape"; shape: "rect" | "triangle" | "trapezoid" | "parallelogram" | "prism" | "cylinder" | "cone" | "sphere" | "circle" | "righttriangle" | "angles"; labels: Record<string, string | undefined> };

export interface PlotCurve {
  expr: string;
  /** Only draw for x in this range. */
  domain?: [number, number];
  dashed?: boolean;
  label?: string;
  /** Shade the region above or below this curve (for inequalities). */
  shade?: "above" | "below";
  /** 1 = main color, 2 = second color, 3 = third. */
  color?: 1 | 2 | 3;
}

// ---------- Answers ----------
export interface NumberField {
  value: Frac;
  /** Accept anything within this distance (for rounded answers). */
  tolerance?: number;
  pre?: string;
  post?: string;
}

export type Answer =
  | { kind: "number"; value: Frac; tolerance?: number; simplest?: boolean; unit?: string; pre?: string }
  | { kind: "multi"; fields: NumberField[]; /** Indices of fields that may be entered in any order (like a + b). */ anyOrder?: number[] }
  | { kind: "choice"; choices: string[]; correct: number; feedback?: (string | undefined)[] }
  /**
   * A typed expression or exact value, marked right when it is equivalent to `value` (checked at sample points).
   * `vars` lists allowed letters ([] for an exact number like "3√2"). `form` adds a requirement:
   * "factored", "expanded" or "vertex" (a(x − h)^2 + k). `lhs` lets students type "y = …" (or "f(x) = …").
   * Constant answers marked `exact` nudge students who type a decimal toward the exact value.
   */
  | { kind: "expr"; value: string; vars: string[]; form?: "factored" | "expanded" | "vertex"; lhs?: string; pre?: string; post?: string; exact?: boolean; display?: string }
  | { kind: "point"; x: number; y: number; min: number; max: number; extraPoints?: { x: number; y: number; label?: string }[]; polygon?: { x: number; y: number }[]; lines?: { m: number; b: number; label?: string }[] };

export interface Trap {
  value: Frac;
  feedback: string;
}

export interface Problem {
  prompt: string;
  visual?: Visual;
  answer: Answer;
  /** Ordered from gentle nudge to nearly the whole method. */
  hints: string[];
  /** Full worked solution, one step per line. */
  steps: string[];
  /** Common wrong answers with feedback that names the mistake. */
  traps?: Trap[];
  /** Short estimate prompt shown first on multi-step word problems. */
  estimate?: string;
}

// ---------- "Why does it work?" items ----------
export interface WhyChoice {
  kind: "choice";
  prompt: string;
  choices: string[];
  correct: number;
  explain: string;
  /** Picture the question refers to ("Why is the shaded part the same?"). */
  visual?: Visual;
}

export interface WhyWritten {
  kind: "written";
  prompt: string;
  /** What a complete explanation should mention (used by the grader and the parent). */
  keyIdeas: string[];
  exemplar: string;
  visual?: Visual;
}

export type Why = WhyChoice | WhyWritten;

export interface Lesson {
  bigIdea: string;
  /** Short paragraphs; supports the same inline math markup as prompts. */
  explain: string[];
  visual?: Visual;
  tip?: string;
}

/** Sessions pair one algebra/functions focus with one geometry/statistics focus. */
export type Strand = "algebra" | "geo-stats";

export type CourseId = "m1" | "m2" | "m3" | "m4" | "pc";

/** Color family for a unit (cards, icons, question banners). */
export type TopicFamily = "algebra" | "functions" | "geometry" | "stats" | "trig" | "number";

export interface Skill {
  id: string;
  title: string;
  topic: string;
  standards: string[];
  prereqs: string[];
  lesson: Lesson;
  generate: (rng: Rng, level: Level) => Problem;
  why: Why[];
}

/** A unit of a course. */
export interface Topic {
  id: string;
  course: CourseId;
  /** Order within the course (1, 2, 3…). */
  unit: number;
  strand: Strand;
  family: TopicFamily;
  title: string;
  standards: string;
  blurb: string;
  icon: string;
}

/** A multi-step, in-context problem offered at the end of a session ("Boss level"). */
export interface Challenge {
  id: string;
  title: string;
  /** Skills that must be solid before this challenge is offered. */
  needs: string[];
  build: (r: Rng) => { intro: string; parts: Problem[] };
}

/** A longer project-style mission (several sections). */
export interface Mission {
  id: string;
  course: CourseId;
  title: string;
  blurb: string;
  needs: string[];
  build: (r: Rng) => { intro: string; parts: (Problem & { section: string })[] };
}

/** What each course folder's index.ts exports. */
export interface CourseContent {
  topics: Topic[];
  skills: Skill[];
  challenges?: Challenge[];
  missions?: Mission[];
}
