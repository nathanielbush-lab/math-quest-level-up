# North Carolina High School Math: Standards, EOC Tests and Pacing

Research date: 2026-10-13. Written for a practice-app skill list.

## How this was researched (read first)

- This sandbox could not open `dpi.nc.gov` directly. WebFetch failed for every host, and the proxy refused curl to dpi.nc.gov, files.nc.gov, docs.google.com, ednc.org and others. That leaves three kinds of source:
  1. **Standards text (Part 2):** taken word for word from a markdown copy of NC DPI's official *K-12 Mathematics Standard Course of Study* Google Doc. The copy was crawled on 2026-06-03 and is stored in a public GitHub repo (`clarkdjcr/EduAssistall`, `docs/nc-standard-course-of-study/`). DPI's "Standard Course of Study & Supporting Resources" page links to this Google Doc as the official standards document. I checked the English and Spanish copies against each other. Every Math 1–4 code matches between them. The English copy is cut off partway through Precalculus, so the missing objectives (PC.F.5.6–PC.F.7.2) come from the Spanish copy and I translated them.
  2. **Test specifications and timing (Part 3):** taken from web-search summaries of DPI documents (the April 2026 test specifications and the May 2026 EOC Assessment Brief). I could not open the PDFs myself. Before shipping, verify the exact numbers against the PDF.
  3. **News coverage** (WRAL, Carolina Journal, WFAE/WUNC, EdNC) for the 2026 standards revision.
- Wherever a fact could not be confirmed, it is marked **UNCONFIRMED**.

---

## 1. Which standards are in force

### Current standards (in force for 2026-27 and 2027-28)

| Course | Standards in force | Adopted | Implemented | EOC? |
|---|---|---|---|---|
| NC Math 1 (course 2109) | 2016 NCSCOS for Mathematics (DPI also calls it the "2017 K-12 Math SCOS") | SBE, June 2016 | 2017-18 (likely, **UNCONFIRMED** from primary text) | **Yes** |
| NC Math 2 (2209) | Same 2016 HS standards | June 2016 | 2017-18 (likely) | No |
| NC Math 3 (2309) | Same 2016 HS standards | June 2016 | 2017-18 (likely) | **Yes** |
| NC Math 4 (2409) | 2019 "fourth-level" standards | SBE, Aug 2019 | 2020-21 | No |
| Precalculus Honors (2403) | 2019 fourth-level standards | Aug 2019 | 2020-21 | No |
| Discrete Mathematics for Computer Science (2401) | 2019 fourth-level standards | Aug 2019 | 2020-21 | No |

- The April 2026 EOC test specifications say the tests "measure proficiency on the NCSCOS for Mathematics adopted in 2016."
- The CMS (Charlotte-Mecklenburg Schools) HS math page says its course of study "is based on NC Math Standards adopted by the North Carolina State Board of Education in June 2016."
- DPI's glossaries for NC Math 4 and Precalculus say they are "for the new Standard Course of Study that will be effective in all North Carolina schools in the 2020-21 School Year."
- **Graduation rule:** students need 4 math credits: NC Math 1, 2 and 3, plus a fourth course that fits their post-high-school plans. Under a rare principal exemption, the requirement is NC Math 1 and 2 plus two courses from the options chart. Source: DPI Math Options Charts, updated 4/2026.

### Was there a 2023 revision? No.
- NC did **not** adopt revised math standards in 2023. The 2023 adoption was the *science* standards.
- The math review began in early 2024, and drafting began in early 2025. Draft 2 came out in April 2026 and Draft 3 (the final draft) in August 2026.
- **On October 1, 2026, the State Board adopted the 2026 Mathematics Standard Course of Study** by block vote, with no opposition.
- **Timeline:** current standards stay in place through 2027-28. The 2026-27 and 2027-28 school years are an "installation" period. The new standards take effect in **2028-29**, and state tests are re-aligned at the same time.
- **High school changes under the 2026 standards:**
  - Revised Math 1 and Math 2 become the common foundation for everyone.
  - The Math 3 requirement is dropped. Students still earn 4 credits, picking two courses above Math 2.
  - New or reorganized options include Applied Statistics and Data Science, and Mathematical and Statistical Modeling. These reorganize content that is currently in NC Math 3 and NC Math 4.
  - Discrete Mathematics for Computer Science is renamed Applied Logic and Reasoning.
  - I could not read the final adopted course list or standards text. **UNCONFIRMED** in detail.
- **App implication:** for students testing through spring 2028, the 2016 Math 1/Math 3 standards and the current EOCs are what count.
- **Separate item, UNCONFIRMED:** NC House Bill 415 (2025) proposed splitting Math 1 and Math 2 into four "Extended Math" courses. I could not confirm whether it was enacted.

### Precalculus vs. NC Math 4
- They are separate courses with separate standards. Both are 2019 "fourth-level" courses.
- **Precalculus** (2403) is offered at the Honors level only. It goes deeper: all six trig functions, the unit circle, inverse functions, rational and polynomial inequalities, conic sections, recursive functions and parametric equations.
- **NC Math 4** (2409) is a broader course for students headed to college or a career. It mixes a lighter set of precalculus topics with a large statistics strand (inference, z-test, binomial and normal distributions).
- Both count as a fourth-math credit that meets UNC System admission requirements. AP Precalculus (2A04) is also on the 2026-27 options chart.

Sources:
- DPI Standard Course of Study & Supporting Resources page: https://www.dpi.nc.gov/districts-schools/classroom-resources/office-teaching-and-learning/standard-course-study/mathematics/standard-course-study-supporting-resources
- DPI standards listing: https://www.dpi.nc.gov/teach-nc/curriculum-instruction/standard-course-study/mathematics
- K-12 Math SCOS (English), official Google Doc: https://docs.google.com/document/d/1ZCt83aTtuev58rHlZkakK989vziGI3eLk2xNXi8u_4o/edit , mirrored at https://github.com/clarkdjcr/EduAssistall/blob/HEAD/docs/nc-standard-course-of-study/mathematics--001--k-12-mathematics-standard-course-of-study-english.md
- NC Math Options Chart, students entering HS in 2026-27 (rev. 4/2026): https://docs.google.com/document/d/1D6sTWX1LlIxQv7ATiJgLiM7n601ikxYKXw9WundXMA0/edit
- WRAL, "NC approves new school math requirements, standards" (Oct 2026): https://www.wral.com/news/education/changes-to-nc-school-math-requirements-standards-vote-october-2026/
- Carolina Journal, "State board adopts new math standards, drops Math 3 requirement": https://www.carolinajournal.com/state-board-adopts-new-math-standards-drops-math-3-requirement/
- WUNC/WFAE coverage of the proposed standards (Apr 2026): https://www.wunc.org/2026-04-01/proposed-new-math-standards-for-nc-students-could-give-more-flexibility-ties-to-careers
- DPI SBE Draft 3 presentation (Aug 2026), hosted by EdNC: https://www.ednc.org/wp-content/uploads/2026/09/Math-Standards-Draft-3-August-2026-SBE-Presentation_485690xjxiilzqqmqjeeiat2od1q2m.pdf
- CMS High School Mathematics page: https://www.cmsk12.org/learning-teaching/curriculum-and-instruction/middle-and-high-school-curriculum/high-school-mathematics
- DPI slides on the 2019 fourth-level adoption: https://www.dpi.nc.gov/media/10490/download?attachment
- 2019 Precalculus SCOS: https://www.dpi.nc.gov/media/8286/open

---

## 2. Standards by course

Notes on the format:
- Codes are given as published. Descriptions are my one-line paraphrases.
- In Math 1–3, the domain prefix tells you the topic:
  - N-RN = Real Number System; N-CN = Complex Numbers
  - A-SSE = Seeing Structure in Expressions; A-APR = Arithmetic with Polynomials and Rational Expressions; A-CED = Creating Equations; A-REI = Reasoning with Equations and Inequalities
  - F-IF = Interpreting Functions; F-BF = Building Functions; F-LE = Linear, Quadratic and Exponential Models; F-TF = Trigonometric Functions
  - G-CO = Congruence; G-SRT = Similarity, Right Triangles and Trigonometry; G-C = Circles; G-GPE = Expressing Geometric Properties with Equations; G-GMD = Geometric Measurement and Dimension; G-MG = Modeling with Geometry
  - S-ID = Interpreting Data; S-IC = Making Inferences; S-CP = Conditional Probability
- Every course also lists the 8 Standards for Mathematical Practice. They are not repeated here.
- Typos in the DPI source are corrected here: "NC.MI.F-IF.3" is NC.M1.F-IF.3, and "NC.M3.S-IC1" is NC.M3.S-IC.1.

### NC Math 1 (EOC course)

**Number & Quantity**
- *Real Number System: extend properties of exponents*
  - NC.M1.N-RN.2: Rewrite algebraic expressions with integer exponents using the exponent rules.

**Algebra**
- *Seeing Structure in Expressions: interpret the structure of expressions*
  - NC.M1.A-SSE.1: Interpret expressions that represent a quantity in context.
  - NC.M1.A-SSE.1a: Identify and interpret the parts (terms, factors, coefficients, exponents) of linear, exponential and quadratic expressions.
  - NC.M1.A-SSE.1b: Interpret a multi-part linear, exponential or quadratic expression as a combination of pieces with meaning.
- *Write expressions in equivalent forms*
  - NC.M1.A-SSE.3: Factor ax²+bx+c (a an integer) to reveal the solutions or zeros.
- *Arithmetic with Polynomials*
  - NC.M1.A-APR.1: Add and subtract quadratics; add, subtract and multiply linear expressions. Polynomials work like integers.
  - NC.M1.A-APR.3: Connect the factors of a quadratic, the solutions of the equation, and the zeros of the function.
- *Creating Equations*
  - NC.M1.A-CED.1: Write one-variable equations or inequalities (linear, exponential, quadratic) and solve problems with them.
  - NC.M1.A-CED.2: Write and graph two-variable equations for linear, exponential and quadratic relationships.
  - NC.M1.A-CED.3: Write systems of linear equations or inequalities to model a context.
  - NC.M1.A-CED.4: Solve a formula for a variable of interest (literal equations).
- *Reasoning with Equations & Inequalities*
  - NC.M1.A-REI.1: Justify each step and the chosen method when solving linear and quadratic equations.
  - NC.M1.A-REI.3: Solve linear equations and inequalities in one variable.
  - NC.M1.A-REI.4: Solve quadratics for real solutions by square roots and by factoring.
  - NC.M1.A-REI.5: Explain why elimination (adding a multiple of one equation to another) keeps the same solution set.
  - NC.M1.A-REI.6: Solve linear systems with tables, graphs, substitution or elimination, and interpret the solution in context.
  - NC.M1.A-REI.10: A graph of a two-variable equation is the set of all its solutions.
  - NC.M1.A-REI.11: Solutions of f(x)=g(x) are the x-coordinates where the graphs intersect (linear, exponential, quadratic). Approximate them with technology or tables.
  - NC.M1.A-REI.12: Graph a linear inequality or a system of inequalities as a half-plane or region.

**Functions**
- *Interpreting Functions: concept and notation*
  - NC.M1.F-IF.1: A function assigns each domain input exactly one output. f(x) is the output, and the graph of f is y=f(x).
  - NC.M1.F-IF.2: Evaluate linear, quadratic and exponential functions in function notation and interpret in context.
  - NC.M1.F-IF.3: Sequences are functions on the integers. Arithmetic sequences are linear, and geometric sequences are exponential.
- *Interpret functions in context*
  - NC.M1.F-IF.4: Interpret key features from graphs, tables or words: intercepts, increasing/decreasing, positive/negative, max/min.
  - NC.M1.F-IF.5: Relate domain and range to the graph and the context.
  - NC.M1.F-IF.6: Calculate and interpret average rate of change over an interval.
- *Analyze functions using different representations*
  - NC.M1.F-IF.7: Graph and analyze linear, exponential and quadratic functions: domain, range, intercepts, intervals, extrema, end behavior.
  - NC.M1.F-IF.8: Use equivalent expressions to reveal properties of a function.
  - NC.M1.F-IF.8a: Rewrite a quadratic (for example, factored form) to reveal key features.
  - NC.M1.F-IF.8b: Interpret growth and decay rates in exponential functions.
  - NC.M1.F-IF.9: Compare two functions (linear, quadratic, exponential) given in different representations.
- *Building Functions*
  - NC.M1.F-BF.1: Write a function for a relationship between two quantities.
  - NC.M1.F-BF.1a: Build linear and exponential functions, and arithmetic and geometric sequences, from a graph, a description, two points or a table.
  - NC.M1.F-BF.1b: Combine functions by adding or subtracting (linear, exponential, quadratic) or by multiplying two linear functions.
  - NC.M1.F-BF.2: Translate between explicit and recursive forms of arithmetic and geometric sequences.
- *Linear, Quadratic & Exponential Models*
  - NC.M1.F-LE.1: Decide whether a situation is linear or exponential using change over equal intervals.
  - NC.M1.F-LE.3: Show that exponential growth eventually exceeds linear and quadratic growth.
  - NC.M1.F-LE.5: Interpret the parameters a and b in f(x)=ax+b and g(x)=a·bˣ in context.

**Geometry**
- *Expressing Geometric Properties with Equations: coordinate geometry*
  - NC.M1.G-GPE.4: Use coordinates to compute perimeters and areas (triangles, rectangles) and to classify triangles and quadrilaterals.
  - NC.M1.G-GPE.5: Slope criteria for parallel and perpendicular lines. Write the parallel or perpendicular line through a point.
  - NC.M1.G-GPE.6: Find the midpoint, or a missing endpoint, of a segment.

**Statistics & Probability**
- *Interpreting Data: one variable*
  - NC.M1.S-ID.1: Make histograms and box plots, using technology.
  - NC.M1.S-ID.2: Compare center (mean, median) and spread (IQR, SD) of data sets, choosing statistics suited to the distribution's shape.
  - NC.M1.S-ID.3: Describe how outliers affect shape, center and spread.
- *Interpreting Data: two variables*
  - NC.M1.S-ID.6: Make scatter plots and describe how the two variables are related.
  - NC.M1.S-ID.6a: Fit a least-squares regression line with technology and use it.
  - NC.M1.S-ID.6b: Assess linear fit by analyzing residuals.
  - NC.M1.S-ID.6c: Fit an exponential model with technology and use it.
- *Interpret linear models*
  - NC.M1.S-ID.7: Interpret slope and intercept in context. Interpolate or extrapolate, and judge whether a prediction is valid.
  - NC.M1.S-ID.8: Compute and interpret the correlation coefficient r. Use r, the scatter plot and the residual plot to judge whether a linear model fits.
  - NC.M1.S-ID.9: Distinguish association from causation.

### NC Math 2 (no EOC)

**Number & Quantity**
- NC.M2.N-RN.1: Explain how rational exponents correspond to radicals.
- NC.M2.N-RN.2: Rewrite radical and rational-exponent expressions using exponent properties.
- NC.M2.N-RN.3: Explain closure of the rationals; rational + irrational is irrational; nonzero rational × irrational is irrational.
- NC.M2.N-CN.1: i² = −1, and complex numbers have the form a+bi.

**Algebra**
- NC.M2.A-SSE.1 / 1a / 1b: Interpret parts of quadratic, square-root, inverse-variation and right-triangle-trig expressions (including radicands) and combined expressions in context.
- NC.M2.A-SSE.3: Complete the square on ax²+bx+c to reveal the max or min.
- NC.M2.A-APR.1: Add, subtract and multiply polynomials.
- NC.M2.A-CED.1: Write one-variable equations or inequalities (quadratic, square root, inverse variation, right-triangle trig) and solve.
- NC.M2.A-CED.2: Write and graph two-variable quadratic, square-root and inverse-variation equations.
- NC.M2.A-CED.3: Write systems of linear, quadratic, square-root and inverse-variation equations for a context.
- NC.M2.A-REI.1: Justify the solving steps for quadratic, square-root and inverse-variation equations.
- NC.M2.A-REI.2: Solve inverse-variation and square-root equations and explain extraneous solutions.
- NC.M2.A-REI.4: Solve any quadratic, with all solutions.
- NC.M2.A-REI.4a: The quadratic formula comes from completing the square.
- NC.M2.A-REI.4b: Recognize non-real solutions and write them as a ± bi.
- NC.M2.A-REI.7: Solve linear-quadratic systems with tables, graphs or algebra, and interpret.
- NC.M2.A-REI.11: Intersections of square-root and inverse-variation graphs solve f(x)=g(x). Approximate with technology.

**Functions**
- NC.M2.F-IF.1: Transformations are functions: domain and range are sets of points, and the image is a function of the pre-image.
- NC.M2.F-IF.2: Use function notation for translations, rotations by multiples of 90° about the origin, reflections over an axis, and dilations.
- NC.M2.F-IF.4: Interpret key features in context: domain, range, rate of change, symmetries, end behavior.
- NC.M2.F-IF.7: Analyze quadratic, square-root and inverse-variation functions: intercepts, intervals, extrema, symmetry, end behavior.
- NC.M2.F-IF.8: Complete the square to find zeros, extreme values and symmetry of a quadratic, and interpret.
- NC.M2.F-IF.9: Compare linear, quadratic, square-root and inverse-variation functions given in different representations.
- NC.M2.F-BF.1: Build quadratic functions (real solutions) and inverse-variation functions from a graph, a description or points.
- NC.M2.F-BF.3: Effects of k·f(x), f(x)+k and f(x+k) on linear, quadratic, square-root and inverse-variation functions.

**Geometry**
- *Congruence: transformations*
  - NC.M2.G-CO.2: Represent transformations. Rigid motions preserve distance and angle (giving congruent figures); dilations give similar figures.
  - NC.M2.G-CO.3: Describe the reflection and rotation symmetry of triangles, quadrilaterals and regular polygons.
  - NC.M2.G-CO.4: Verify properties of rotations, reflections and translations experimentally.
  - NC.M2.G-CO.5: Find the image under a rigid motion, or specify a sequence of rigid motions that maps one figure to another.
- *Congruence via rigid motions*
  - NC.M2.G-CO.6: Show congruence by giving a rigid-motion sequence.
  - NC.M2.G-CO.7: Triangles are congruent if and only if corresponding sides and angles are congruent.
  - NC.M2.G-CO.8: Justify ASA, SAS and SSS. Use ASA, SAS, SSS and HL to decide congruence.
- *Prove theorems*
  - NC.M2.G-CO.9: Line and angle theorems: vertical angles; alternate interior and corresponding angles; perpendicular bisector; angle bisector.
  - NC.M2.G-CO.10: Triangle theorems: angle sum is 180°; exterior angle; isosceles base angles; midsegment.
- *Similarity, Right Triangles & Trig*
  - NC.M2.G-SRT.1 (a–d): Properties of dilations: lines map to parallel (or the same) lines, lengths scale by k, distances from the center scale by k, angles are preserved.
  - NC.M2.G-SRT.2 (a, b): Similarity via transformations. Similar triangles have proportional sides and congruent angles.
  - NC.M2.G-SRT.3: Justify AA similarity with transformations.
  - NC.M2.G-SRT.4: Use similarity to prove and solve: the side-splitter theorem and its converse, and the Pythagorean Theorem.
  - NC.M2.G-SRT.6: Side ratios of similar right triangles lead to the definitions of sin, cos and tan.
  - NC.M2.G-SRT.8: Solve right triangles in context using trig ratios and the Pythagorean Theorem.
  - NC.M2.G-SRT.12: Special right triangles (45-45-90 and 30-60-90).

**Statistics & Probability**
- NC.M2.S-IC.2: Use simulation to check whether experimental probability is consistent with theoretical probability.
- NC.M2.S-CP.1: Describe events as subsets of a sample space: union, intersection, complement.
- NC.M2.S-CP.3: Develop independence and conditional probability.
- NC.M2.S-CP.3a: Use two-way tables to find P(A|B).
- NC.M2.S-CP.3b: A and B are independent if P(A|B) = P(A).
- NC.M2.S-CP.4: Build two-way frequency tables. Find joint, marginal and conditional probabilities and test independence.
- NC.M2.S-CP.5: Explain conditional probability and independence in everyday situations.
- NC.M2.S-CP.6: Find P(A|B) as the fraction of B's outcomes that are also in A, and interpret.
- NC.M2.S-CP.7: Addition rule: P(A or B) = P(A) + P(B) − P(A and B).
- NC.M2.S-CP.8: Multiplication rule: P(A and B) = P(A)·P(B|A), including the independent case.

### NC Math 3 (EOC course)

**Number & Quantity**
- NC.M3.N-CN.9: Use the Fundamental Theorem of Algebra to find the number and types of polynomial solutions.

**Algebra**
- NC.M3.A-SSE.1 / 1a / 1b: Interpret parts of piecewise, absolute value, polynomial, exponential and rational expressions, and multi-part expressions, in context.
- NC.M3.A-SSE.2: Use structure to rewrite expressions in equivalent forms.
- NC.M3.A-SSE.3: Rewrite exponential expressions to reveal rates over different intervals (for example, annual to monthly).
- NC.M3.A-APR.2: Remainder Theorem.
- NC.M3.A-APR.3: Relate the factors, solutions and zeros of polynomials.
- NC.M3.A-APR.6: Rewrite a(x)/b(x) as q(x) + r(x)/b(x) (polynomial division).
- NC.M3.A-APR.7: Rational-expression arithmetic works like fraction arithmetic.
- NC.M3.A-APR.7a: Add and subtract rational expressions with linear denominators.
- NC.M3.A-APR.7b: Multiply and divide rational expressions.
- NC.M3.A-CED.1: Write and solve one-variable absolute value, polynomial, exponential and rational equations or inequalities, algebraically and graphically.
- NC.M3.A-CED.2: Write and graph two-variable absolute value, polynomial, exponential and rational equations.
- NC.M3.A-CED.3: Write systems of equations or inequalities for a context.
- NC.M3.A-REI.1: Justify the solution method and each step.
- NC.M3.A-REI.2: Solve rational equations in context and explain extraneous solutions.
- NC.M3.A-REI.11: Solve f(x)=g(x) through graph intersections, for any function types, using technology or tables.

**Functions**
- NC.M3.F-IF.1: Trig ratios are functions of angle measure.
- NC.M3.F-IF.2: Evaluate and interpret piecewise functions.
- NC.M3.F-IF.4: Interpret key features in context, including periodicity and discontinuities.
- NC.M3.F-IF.7: Analyze piecewise, absolute value, polynomial, exponential, rational and trig (sin, cos) functions: features, including period and discontinuities.
- NC.M3.F-IF.9: Compare two functions given in different representations.
- NC.M3.F-BF.1: Write a function that models a relationship.
- NC.M3.F-BF.1a: Build polynomial and exponential functions from a graph, a description or points.
- NC.M3.F-BF.1b: Combine standard function types with arithmetic operations in context.
- NC.M3.F-BF.3: Transformations k·f(x), f(x)+k, f(x+k) and f(kx).
- NC.M3.F-BF.4: Find inverse functions.
- NC.M3.F-BF.4a: Inverse pairs: exponential and logarithmic, quadratic and square root, linear and linear.
- NC.M3.F-BF.4b: Decide whether an inverse function exists, from a table, graph or equation.
- NC.M3.F-BF.4c: Represent the inverse of a linear, quadratic or exponential function and use it in context.
- NC.M3.F-LE.3: Exponential growth eventually exceeds polynomial growth.
- NC.M3.F-LE.4: Use logarithms to solve a·b^(ct) = d, evaluating with technology.
- NC.M3.F-TF.1: Radian measure is arc length divided by radius; it is a real number and the domain of the trig functions.
- NC.M3.F-TF.2 / 2a / 2b: Sine is the y-coordinate and cosine the x-coordinate on the unit circle. Represent them with tables, graphs and technology.
- NC.M3.F-TF.5: Investigate a, b and h in f(x) = a·sin(bx) + h to model periodic phenomena.

**Geometry**
- NC.M3.G-CO.10: Verify properties of triangle centers (centroid, incenter, circumcenter) experimentally.
- NC.M3.G-CO.11: Parallelogram theorems: opposite sides and angles congruent; diagonals bisect each other; congruent diagonals mean a rectangle.
- NC.M3.G-CO.14: Apply properties and theorems of 2-D figures to prove and solve problems.
- NC.M3.G-C.2: Circle theorems: central, inscribed and circumscribed angles; radii, diameters, secants, tangents and chords.
- NC.M3.G-C.5: Arc length is proportional to radius, and radian = s/r. Find arc lengths and sector areas.
- NC.M3.G-GPE.1: Derive the circle equation. Complete the square to find the center and radius.
- NC.M3.G-GMD.3: Volume of prisms, cylinders, pyramids, cones and spheres.
- NC.M3.G-GMD.4: Cross-sections of 3-D solids, and solids formed by rotating 2-D shapes.
- NC.M3.G-MG.1: Geometric modeling: model objects with shapes, density by area and volume, design and optimization.

**Statistics & Probability**
- NC.M3.S-IC.1: Inference about a population from a random sample.
- NC.M3.S-IC.3: Surveys vs. experiments vs. observational studies, and the role of randomization in each.
- NC.M3.S-IC.4: Use simulation to estimate a mean or proportion with a margin of error.
- NC.M3.S-IC.5: Use simulation to decide whether a difference between two samples is significant.
- NC.M3.S-IC.6: Evaluate reports of data: the source, the study design and the graphs.

### NC Math 4 (2019 standards; no EOC)
The format is standard, then numbered objectives.

**Number & Quantity**
- NC.M4.N.1: Complex numbers.
  - N.1.1: Add and subtract complex numbers.
  - N.1.2: Multiply complex numbers.
- NC.M4.N.2: Matrices and vectors.
  - N.2.1: Add, subtract and multiply matrices, and multiply by a scalar.
  - N.2.2: Add and subtract vectors, and multiply by a scalar.

**Algebra & Functions**
- NC.M4.AF.1: Function composition.
  - AF.1.1: Compose two functions algebraically.
  - AF.1.2: Evaluate a composite function from algebraic, graphical or tabular forms.
- NC.M4.AF.2: Trigonometry.
  - AF.2.1: Rewrite expressions with the reciprocal and Pythagorean identities.
  - AF.2.2: Law of Sines and Law of Cosines.
  - AF.2.3: Interpret amplitude, period, phase shift, vertical shift, midline, domain and range of sinusoidal models.
- NC.M4.AF.3: Logarithmic functions.
  - AF.3.1: Use log properties to simplify and solve.
  - AF.3.2: Solve log equations in context.
  - AF.3.3: Key features of log functions across representations.
- NC.M4.AF.4: Piecewise functions.
  - AF.4.1: Translate between algebraic and graphical forms (linear, exponential, quadratic, polynomial, square root pieces).
  - AF.4.2: Build piecewise models for a context.
- NC.M4.AF.5: Regression.
  - AF.5.1: Fit linear, quadratic, exponential, logarithmic and sinusoidal regressions with technology.
  - AF.5.2: Compare residuals and residual plots of nonlinear models to judge fit.

**Statistics & Probability**
- NC.M4.SP.1: Statistical investigations.
  - SP.1.1: Pose statistical questions.
  - SP.1.2: Design surveys and comparative experiments using sampling methods.
  - SP.1.3: Organize large datasets (3 or more measures, n > 200) with technology: variable types, outcomes, questions, and suitable summaries.
  - SP.1.4: Interpret non-standard data visualizations from the media or scientific papers.
- NC.M4.SP.2: Inference.
  - SP.2.1: Simulate a sampling distribution for informal inference.
  - SP.2.2: Confidence intervals for a proportion.
  - SP.2.3: One-proportion z-test.
- NC.M4.SP.3: Probability distributions.
  - SP.3.1: Discrete distributions and expected value for decisions.
  - SP.3.2: Binomial distribution.
  - SP.3.3: Use simulations to see when the normal approximates sampling distributions of means and proportions.
  - SP.3.4: Use the normal distribution to find probabilities.

### Precalculus (2019 standards; Honors; no EOC)

**Number & Quantity**
- PC.N.1: Complex numbers.
  - N.1.1: Add and subtract.
  - N.1.2: Multiply.
- PC.N.2: Matrices.
  - N.2.1: Add and subtract matrices of compatible dimensions.
  - N.2.2: Associative and distributive properties.
  - N.2.3: Commutative property of addition.
  - N.2.4: Scalar multiplication.
  - N.2.5: Matrix multiplication.
- PC.N.3: Vectors.
  - N.3.1: Represent magnitude and direction.
  - N.3.2: Add and subtract vectors.

**Algebra**
- PC.A.1: Rational and polynomial inequalities.
  - A.1.1: Solve by sign analysis.
  - A.1.2: Solve graphically.
- PC.A.2: Exponential, log and trig equations.
  - A.2.1: Rewrite with log properties.
  - A.2.2: Solve exponential and log equations.
  - A.2.3: Solve trig equations, including inverse trig, double-angle formulas and Pythagorean identities.
  - A.2.4: Eliminate the parameter to turn parametric equations into Cartesian form.

**Functions**
- PC.F.1: The six trig functions.
  - F.1.1: Key features of transformed sine and cosine.
  - F.1.2: Key features of tan, cot, sec and csc, including asymptotes.
  - F.1.3: Build a trig function with a given amplitude, period, phase shift and midline.
  - F.1.4: Solve trig equations and inequalities in context, with technology.
- PC.F.2: Unit circle.
  - F.2.1: Values of sin, cos and tan using reference angles.
  - F.2.2: Unit-circle symmetry explains periodicity.
- PC.F.3: Trig with all triangles.
  - F.3.1: Find all solutions of equations with inverse trig.
  - F.3.2: Law of Sines and Law of Cosines.
  - F.3.3: Pythagorean identity: find one trig value from another and the quadrant.
- PC.F.4: Exponential, log, rational and power functions, and conics.
  - F.4.1: Key features of exponential functions (including concavity, limits, asymptotes).
  - F.4.2: Build growth and decay models.
  - F.4.3: Key features of log functions.
  - F.4.4: Solve exponential and log equations in context.
  - F.4.5: Key features of rational functions.
  - F.4.6: Optimization with rational and polynomial functions.
  - F.4.7: Graph transformations of power, exponential and log functions.
  - F.4.8: Identify a conic (ellipse, hyperbola, parabola) from its standard form.
  - F.4.9: Key features of conics.
- PC.F.5: Composition and inverses.
  - F.5.1: Compose functions.
  - F.5.2: Evaluate composites from any representation.
  - F.5.3: Domain of a composite.
  - F.5.4: Model with composition.
  - F.5.5: Decompose a composite function.
  - F.5.6: Find inverses algebraically and graphically, restricting the domain if needed.
  - F.5.7: Use composition to verify inverses.
- PC.F.6: Recursive functions.
  - F.6.1: Build recursive functions from algebraic representations.
  - F.6.2: Build a recursive function for a numerically given sequence.
- PC.F.7: Parametric functions.
  - F.7.1: Write parametric equations in context.
  - F.7.2: Use technology to solve parametric problems in context.

*(F.5.6 through F.7.2 come from the Spanish copy of the DPI doc, translated. The English copy was truncated. The DPI Precalculus glossary also references PC.F.7.2.)*

### Discrete Mathematics for Computer Science (2401; for reference)
The domains are DCS.N.1–N.4 (matrices and vectors, matrix models including Leslie and Markov, set theory, number theory), DCS.F.1 (sequences, series, sigma notation, convergence), DCS.SP.1 (counting principle, permutations, combinations), DCS.GT.1–2 (graph theory: Euler and Hamilton paths, TSP, Kruskal and Prim, vertex coloring, critical path) and DCS.L.1 (truth tables, validity, Boolean circuits, equivalence). The full text is in the source doc.

Sources:
- DPI K-12 Mathematics SCOS (English and Spanish Google Docs, linked from the DPI Supporting Resources page above), via mirror: https://github.com/clarkdjcr/EduAssistall/tree/HEAD/docs/nc-standard-course-of-study (files `mathematics--001--…english.md` and `mathematics--002--…spanish.md`)
- DPI unpacking documents (revised June 2022), for example NC Math 2: https://www.dpi.nc.gov/nc-math-2-unpacking-rev-june-2022/open. Not read; these are recommended for writing item examples.

---

## 3. State tests (EOC)

**Which courses:** only **NC Math 1** and **NC Math 3** have EOCs. NC Math 2, NC Math 4 and Precalculus have no state test. The NC Final Exams (NCFEs), which once covered Math 2 and others, were removed from the statewide testing program starting in 2020-21 by the Testing Reduction Act of 2019. I did not confirm whether any local or optional version survives.

**General rules (April 2026 test specifications and May 2026 EOC Assessment Brief):**
- The tests measure the 2016 NCSCOS.
- They must be given **online** through NCTest, in English only.
- They are given in the last 5 days of a semester course, or the last 10 days of a yearlong course.
- Under SBE policy TEST-003, the EOC counts for **at least 20% of the final course grade**.
- Time: DPI estimates **180 minutes** for most students, with a **maximum of 240 minutes** (more only with accommodations such as Scheduled Extended Time). The administration guide lists about 196 minutes total for NC Math 1, including two 2-minute breaks and general instructions.
  - An older EdNC article says 150 minutes. That figure is outdated.

**Format**

| | NC Math 1 | NC Math 3 |
|---|---|---|
| Operational (scored) items | 50 | 50 |
| Calculator-inactive items | 15 | 0 (all calculator-active) |
| Calculator-active items | 35 | 50 |
| Embedded field-test items (unscored) | 10 | 10 |
| Total items | 60 | 60 |

- Item types: **four-option multiple choice**, **gridded response / numeric entry**, and **technology-enhanced** items. Each item is worth 1 point.
- The Math 1 calculator-inactive section comes first. Calculators are allowed only on the calculator-active part.

**Calculator policy:**
- Students **must be provided a graphing calculator**, either handheld or online.
- NCTest has an online calculator that meets the minimum calculator requirements for the test. DPI points students to a **Desmos-based** version for practice at https://www.desmos.com/testing/northcarolina/graphing.
- A handheld calculator is not required for online testing. However, students who routinely use a handheld in class, or who have not practiced enough with the online calculator, should be given one.
- DPI also publishes a separate "North Carolina Testing Program Calculator Requirements" brief, which lists the minimum features and prohibited devices. I did not read it.

**Reference or formula sheet: UNCONFIRMED.** No DPI source I could reach says whether a formula sheet is provided for NC Math 1 or NC Math 3. One third-party practice site claims a reference sheet is built into the test platform, but that is not verified. Check the DPI released forms, listed below, and the test administrator manual.

**Domain weights (blueprint; same in the July 2022 and April 2026 specifications)**

| Domain | NC Math 1 | NC Math 3 |
|---|---|---|
| Number & Quantity + Algebra (combined) | 36–40% | 32–36% |
| Functions | 32–36% | 32–36% |
| Geometry | 8–12% | 20–24% |
| Statistics & Probability | 18–20% | 8–12% |

- The 2018-19 specification gave approximate NC Math 3 item counts of about 17, 17, 11 and 5 out of 50. The current document likely has similar counts, but I did not confirm this.
- Depth of knowledge (both tests): DOK 1 is 20–30%, DOK 2 is 60–65%, and DOK 3 is 8–12%.

**Released forms**, useful as item models (not reviewed):
- NC Math 1: https://www.dpi.nc.gov/documents/accountability/testing/eoc/eoc-nc-math-1-released-form
- NC Math 3: https://www.dpi.nc.gov/documents/accountability/testing/eoc/eoc-nc-math-3-released-form/open

**Related:** NC Check-Ins 2.0 are DPI interim tests for Math 1 and 3 that share the EOC item bank. DPI says it lacks validity evidence to use Check-In results to predict EOC scores.

Sources:
- EOC NC Math 1 and NC Math 3 Test Specifications (April 2026): https://www.dpi.nc.gov/documents/accountability/testing/eoc/eoc-nc-math-1-and-nc-math-3-test-specifications (PDF: `.../open`)
- July 2022 specifications: https://www.dpi.nc.gov/media/10706/open
- 2018-19 specifications (district-hosted copy): https://www.jcpsnc.org/uploaded/Documents/Departments/Testing/2018-19_Updates/EOC_Math_Test_Specifications_091018.pdf
- EOC Assessment Brief (May 2026): https://www.dpi.nc.gov/documents/accountability/policyoperations/assessbriefs/eoc-assessment-brief/open
- DPI EOC page: https://www.dpi.nc.gov/districts-schools/accountability-and-testing/state-tests/end-course-eoc
- NC Check-Ins 2.0 specifications: https://www.dpi.nc.gov/documents/accountability/testing/nccheckin/nc-check-ins-20-nc-math-1-and-3-specifications/open
- Testing Reduction Act / NCFE removal: https://www.witn.com/content/news/Testing-Reduction-Act-to-begin-in-2020-2021-school-year-563169911.html

---

## 4. Sequencing and pacing

These are typical, not mandated. NC does not set a statewide pacing order.

**CMS NC Math 1** (CMS open-source HS curriculum; the "TW" unit set), 8 units:
1. One-Variable Statistics
2. Linear Equations & Inequalities
3. Coordinate Geometry & Systems
4. Two-Variable Statistics
5. (Introduction to) Functions
6. Exponential Functions
7. Quadratic Functions & Equations
8. Sequences & Functions

Notably, CMS **starts Math 1 with statistics** and puts quadratics late. CMS also offers "NC Math 1 with Foundational Supports" and a semester version. I did not find the CMS Math 2 and Math 3 unit lists.

**Open Up Resources HS Math (NC edition):**
- NC Math 1: Sequences → Linear & Exponential Functions → Features of Functions → Equations & Inequalities → Systems → Quadratic Functions → Structures of Quadratic Expressions → Connecting Algebra & Geometry → Modeling Data.
- NC Math 2: Transformations & Symmetry → Congruence, Construction & Proof → Geometric Figures → Dilation & Similarity → Quadratic Functions & Transformations → Solving Quadratic Equations → Variation & Square Root Functions → Probability.
  - Here **Math 2 opens with transformations and geometry**, and quadratics come mid-year.

**NC Math 3** (NC2ML content briefs; Forsyth County / Walch program):
- Unit 1 is Functions & Inverses. Exponential & Logarithmic Functions follows, then Unit 3 Polynomial Functions.
- Later units cover rational functions, geometry (circles, modeling), trigonometry and statistical inference.
- The exact Math 3 order beyond Unit 3 is **UNCONFIRMED**.

**App suggestion:**
- Order the skills by domain within each course.
- Weight practice by the EOC blueprint above. For Math 1, Algebra and Functions together are about 70%. For Math 3, Geometry is 20–24%.
- For Math 1, separate no-calculator skills (exponent rules, factoring, solving, function notation) from calculator skills (regression, correlation, intersections), because 15 of the 50 scored items are calculator-inactive.

Sources:
- CMS HS Mathematics: https://www.cmsk12.org/learning-teaching/curriculum-and-instruction/middle-and-high-school-curriculum/high-school-mathematics
- Open Up NC Math 1 family page: https://access.openupresources.org/curricula/our-hs-math-nc/en/nc/math-1/family.html
- Open Up NC Math 2 family page: https://access.openupresources.org/curricula/our-hs-math-nc/en/nc/math-2/family.html
- NC2ML NC Math 3 brief: https://www.nc2ml.org/wp-content/uploads/2021/01/BRIEF-15-V4.pdf
- Walch/Forsyth NC Math 3 program overview: https://store.bwwalch.com/wp-content/uploads/2022/12/Forsyth-NC-M3-Custom-PO-abbv.pdf
- NC2ML instructional frameworks (Math 1–3): https://www.nc2ml.org/wp-content/uploads/2018/07/Instr_Frameworks_HS_Complete_No-Feedback.pdf

---

## Open items to verify before shipping
1. Open the April 2026 test specification PDF and confirm the item counts, field-test count, time and item types. These came from search summaries, not my own reading of the PDF.
2. Find out whether a formula or reference sheet is provided, and what is on it (check the released forms and the test administrator manual).
3. Read the DPI Calculator Requirements brief for the exact online calculator (Desmos graphing and/or scientific) and the rules on handheld models.
4. Get the full text of the newly adopted 2026 standards (adopted Oct 1, 2026; effective 2028-29) if the app needs to outlast spring 2028.
5. Check whether House Bill 415 ("Extended Math") was enacted.
