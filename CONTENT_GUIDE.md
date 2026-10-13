# Writing course content for Math Quest: Level Up

Level Up teaches NC high-school math (Math 1, 2, 3, 4 and Pre-Calculus) to teenagers. Every skill
has a short lesson, a problem **generator** (fresh numbers every time, three difficulty levels),
hints, a full worked solution, and two "why does it work?" questions. The engine handles
spaced review, mastery levels, sessions and practice tests; content files only describe the math.

## Where things go

- One folder per course: `src/content/m1/`, `m2/`, `m3/`, `m4/`, `pc/`.
- One file per unit (for example `src/content/m1/linear-functions.ts`), default-exporting `Skill[]`.
- The course's `index.ts` lists the units (`Topic[]`) and gathers the skills, challenges and missions
  into a `CourseContent` (see `src/content/types.ts`). Only edit files inside your course folder.
- `src/content/m1/examples.ts` holds four reference skills that pass the tests. Copy their patterns.
  (The Math 1 author replaces this file and its "Examples" topic with real units.)
- Standards, EOC blueprints and typical pacing: `docs/nc-standards.md`.

## Ids and structure

- Topic ids: `<course>-<slug>`, for example `m1-linear-functions`. Set `course`, `unit` (1, 2, 3… in
  teaching order), `strand` (`"algebra"` for number/algebra/functions, `"geo-stats"` for geometry,
  statistics, probability), `family` (`algebra | functions | geometry | stats | trig | number`, used for
  colors and icons), `title`, `standards` (a short code range), `blurb` (one sentence), `icon` (any short string).
- Skill ids: `<course>.<unit-slug>.<skill-slug>`, for example `m1.linfn.slope-intercept`. **Every skill id
  must start with its course id and a dot** (the tests check this).
- `standards`: the exact NC codes, for example `["NC.M1.F-IF.4"]`.
- `prereqs`: ids of skills **in your own course** only (no cycles; earlier units first). Leave a
  course's first skills with `prereqs: []`. Cross-course links are added later.
- Cover **every** standard in the course. Aim for 4–9 skills per unit; split a standard into several
  skills when it has distinct procedures.

## A skill

```ts
const s: Skill = {
  id, title, topic, standards, prereqs,
  lesson: { bigIdea, explain: [/* 2–4 short paragraphs with a worked example */], visual?, tip? },
  why: [ { kind: "choice", … }, { kind: "written", prompt, keyIdeas, exemplar } ],  // at least one of each
  generate(r, lv) { return { prompt, visual?, answer, hints, steps, traps? }; },
};
```

- `r` is a seeded random generator: `r.int(a, b)`, `r.nonzero(a, b)`, `r.pick(list)`, `r.shuffle(list)`,
  `r.chance(p)`, `r.sign()`. Never use `Math.random()`.
- `lv` is 1 (introductory), 2 (typical), 3 (stretch: harder numbers, an extra step, or a twist).
- **Design numbers so the answer is clean** (integers or simple fractions) unless the skill is about
  rounding; pick the answer first and build the problem from it.
- `hints`: 2–3, from a gentle nudge to nearly the whole method. Never just restate the question.
- `steps`: the full worked solution, one step per line, using `st("What we do.", "the actual work")`
  from `../steps`.
- `traps`: common wrong numeric answers with feedback that names the mistake (`trap(value, text)`,
  wrapped in `traps(answer, [...])` to drop accidental matches). Number answers only.

## Answers

| Kind | Helper | Use for |
| --- | --- | --- |
| number | `num(7)`, `num(frac(3, 4))`, `num(2.35, { tolerance: 0.01 })` | single numeric answers (typed as 12, −3, 0.75, 3/4) |
| multi | `{ kind: "multi", fields: [{ value, pre: "x =" }, …], anyOrder: [0, 1] }` | several numbers (both solutions of a quadratic, a point) |
| choice | `choice(r, correct, [[wrong, feedback], …])` | concepts, descriptions, graphs, inequalities, intervals |
| expr | `expr("x^2+5x+6", { form: "expanded" })` | typed expressions; checked by **equivalence** |
| exact | `exact("3sqrt(2)", "3√2")` | exact constants with √ or π (a typed decimal gets a nudge) |
| point | see `types.ts` | click a point on a grid |

`expr` options: `vars` (default `["x"]`; use `[]` for constants, `["a", "b"]` for several),
`form: "factored" | "expanded" | "vertex"`, `lhs: "y"` (lets students type `y = …`), `display`
(how the answer is shown after a miss; defaults to a pretty version of `value`).

**Typed syntax** (for `expr` values and plot curves): `2x^2-3x+1`, `(x+2)(x-3)`, `3sqrt(2)`, `sqrt(x+1)`,
`2^(x+1)`, `abs(x-3)` or `|x-3|`, `log(x)` (base 10), `log_2(x)`, `ln(x)`, `e^x`, `pi`, `sin(x)` (radians).
Implied multiplication works (`2x`, `3(x+1)`, `x(x+1)`). Helpers: `polyExpr([2, -3, 1])` → `"2x^2-3x+1"`,
`binomExpr(3)` → `"(x-3)"`.

## Display markup (prompts, lessons, hints, steps, choices)

- `{a/b}` stacked fraction (`fr(...)` helper), `**bold**`, `*italic*`.
- Superscripts `x^2`, `x^-3`, `x^n`, `2^(x+1)`; subscripts `a_1`, `a_n`, `a_(n-1)`.
- Use the true minus `−` in text (`ms(x)`, `sn(x)` wrap negatives), `×`, `÷`, `√`, `π`, `≤`, `≥`, `≠`, `θ`.
- Helpers: `poly([2, -3, 1])` → `2x^2 − 3x + 1`, `binom(3)` → `(x − 3)`, `linear(m, b)`, `term`, `cst`,
  `radical(18)` → `{ a: 3, b: 2 }`, `radText(3, 2)` → `3√2`.
- No emoji, no HTML.

## Visuals

Existing: `numberline`, `grid` (points, polygon, lines y = mx + b), `table`, `dotplot`, `scatter`,
`boxplot`, `tape`, `shape` (rect, triangle, righttriangle, circle, prism, cylinder, cone, sphere, angles; `labels`).
New for high school:

- `plot`: function graphs. `{ type: "plot", xMin, xMax, yMin, yMax, xStep?, yStep?, curves: [{ expr: "x^2-4", domain?, dashed?, label?, shade?: "above"|"below", color?: 1|2|3 }], points?: [{ x, y, label?, open? }], vlines?: [{ x, dashed?, label? }], hlines? }`
- `geo`: a figure from coordinates (no axes unless `grid: true`): `points: { A: {x, y}, … }`, `polygons: [["A","B","C"]]`, `segments: [{ from, to, label?, dashed?, tick? }]`, `circles: [{ center, r }]`, `angles: [{ at, from, to, label?, right? }]`, `showLabels` (vertex letters).
- `histogram`: `{ bins: [{ from, to, count }], xLabel?, yLabel? }`
- `normal`: `{ mean, sd, shadeFrom?, shadeTo?, label? }`

If a question says "shown", "below" or "in the graph", it **must** have the visual.

## Voice

Students are 14–18. Be direct and respectful: no baby talk, no "Great job, superstar!". Real contexts
they care about: part-time jobs, phone plans, streaming, sports stats, music, games, driving,
saving and loans, science, social media growth. Use varied names (`NAMES` in helpers or your own list).
Keep prompts short; put the math in the problem, not in long stories.

## EOC alignment

Math 1 and Math 3 end with state EOC tests (50 items: multiple choice, typed numeric answers and
interactive items; a Desmos-style graphing calculator is available, and Math 1 has a short no-calculator
section). Write problems in those styles: about half typed answers, half multiple choice, many in context.

## Testing

- `npx vitest run tests/content.test.ts -t "<course>\\."` runs your course's generators (250 seeds × 3
  levels each): every answer must check as correct, no `undefined`/`NaN`, visuals must be valid.
- `npx tsc -p . --noEmit 2>&1 | grep "src/content/<course>/"` type-checks your files (ignore errors
  elsewhere; other parts of the app are being built at the same time).
- Read a sample of generated problems end to end (a scratch script that prints prompts, answers,
  hints and steps for a few seeds) and fix anything that reads oddly or is mathematically wrong.
