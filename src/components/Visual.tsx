import { useId, useState } from "react";
import type { PlotCurve, Visual as V } from "../content/types";
import { evalExpr, parseExpr, type Node as ExprNode } from "../lib/expr";
import { MathText } from "./MathText";

const C = { ink: "var(--ink)", ink2: "var(--ink-2)", line: "var(--line)", primary: "var(--primary)", shade: "var(--shade)", shade2: "var(--shade-2)", surface: "var(--surface)", good: "var(--good)", bad: "var(--bad)" };

const fmt = (v: number) => String(Number(v.toFixed(3))).replace("-", "−");

export function Visual({ v }: { v: V }) {
  return <div className="visual">{render(v)}</div>;
}

function render(v: V) {
  switch (v.type) {
    case "numberline":
      return <NumberLine {...v} />;
    case "fractionbars":
      return <FractionBars bars={v.bars} />;
    case "grid":
      return <Grid min={v.min} max={v.max} points={v.points} polygon={v.polygon} lines={v.lines} />;
    case "table":
      return (
        <table>
          {v.caption && <caption>{v.caption}</caption>}
          <thead>
            <tr>{v.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {v.rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j}><MathText text={typeof c === "number" ? fmt(c) : c} /></td>)}</tr>
            ))}
          </tbody>
        </table>
      );
    case "dotplot":
      return <DotPlot {...v} />;
    case "scatter":
      return <Scatter {...v} />;
    case "tape":
      return <Tape rows={v.rows} />;
    case "boxplot":
      return <BoxPlot {...v} />;
    case "shape":
      return <Shape shape={v.shape} labels={v.labels} />;
    case "dicesim":
      return <DiceSim target={v.target} rolls={v.rolls} />;
    case "plot":
      return <Plot {...v} />;
    case "geo":
      return <Geo {...v} />;
    case "histogram":
      return <Histogram {...v} />;
    case "normal":
      return <Normal {...v} />;
  }
}

function NumberLine({ min, max, step, labelEvery, points = [], jumps = [], ray }: Extract<V, { type: "numberline" }>) {
  const W = 600, pad = 30, y = 60;
  const n = Math.round((max - min) / step);
  const every = labelEvery ?? (n > 14 ? 2 : 1);
  const x = (val: number) => pad + ((val - min) / (max - min)) * (W - 2 * pad);
  return (
    <svg viewBox={`0 0 ${W} 100`} width={W} role="img" aria-label="number line">
      <line x1={pad - 12} x2={W - pad + 12} y1={y} y2={y} stroke={C.ink} strokeWidth={2} />
      <polygon points={`${W - pad + 18},${y} ${W - pad + 8},${y - 5} ${W - pad + 8},${y + 5}`} fill={C.ink} />
      <polygon points={`${pad - 18},${y} ${pad - 8},${y - 5} ${pad - 8},${y + 5}`} fill={C.ink} />
      {Array.from({ length: n + 1 }, (_, i) => {
        const val = min + i * step;
        return (
          <g key={i}>
            <line x1={x(val)} x2={x(val)} y1={y - 7} y2={y + 7} stroke={C.ink} strokeWidth={1.5} />
            {i % every === 0 && <text x={x(val)} y={y + 26} textAnchor="middle" fontSize={14} fill={C.ink}>{fmt(val)}</text>}
          </g>
        );
      })}
      {ray && (
        <g>
          <line x1={x(ray.at)} x2={ray.dir === "right" ? W - pad + 14 : pad - 14} y1={y} y2={y} stroke={C.primary} strokeWidth={7} strokeLinecap="round" />
          <polygon points={ray.dir === "right" ? `${W - pad + 22},${y} ${W - pad + 8},${y - 9} ${W - pad + 8},${y + 9}` : `${pad - 22},${y} ${pad - 8},${y - 9} ${pad - 8},${y + 9}`} fill={C.primary} />
          <circle cx={x(ray.at)} cy={y} r={8} fill={ray.closed ? C.primary : C.surface} stroke={C.primary} strokeWidth={3} />
        </g>
      )}
      {jumps.map((j, i) => {
        const x1 = x(j.from), x2 = x(j.to), mid = (x1 + x2) / 2;
        return (
          <g key={i}>
            <path d={`M ${x1} ${y - 4} Q ${mid} ${y - 50} ${x2} ${y - 6}`} fill="none" stroke={C.shade2} strokeWidth={2.5} />
            {j.label && <text x={mid} y={y - 34} textAnchor="middle" fontSize={14} fontWeight={700} fill={C.ink}>{j.label}</text>}
          </g>
        );
      })}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(p.v)} cy={y} r={7} fill={C.primary} />
          {p.label && <text x={x(p.v)} y={y - 14} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.primary}>{p.label}</text>}
        </g>
      ))}
    </svg>
  );
}

function FractionBars({ bars }: { bars: { parts: number; shaded: number; label?: string }[] }) {
  const W = 480, h = 34, lab = 60;
  return (
    <svg viewBox={`0 0 ${W + lab} ${bars.length * (h + 10)}`} width={W + lab} role="img" aria-label="fraction bars">
      {bars.map((b, i) => (
        <g key={i} transform={`translate(0 ${i * (h + 10)})`}>
          <text x={0} y={h / 2 + 5} fontSize={15} fontWeight={700} fill={C.ink}>{b.label}</text>
          {Array.from({ length: b.parts }, (_, k) => (
            <rect key={k} x={lab + (k * W) / b.parts} y={0} width={W / b.parts} height={h} fill={k < b.shaded ? C.shade : C.surface} stroke={C.ink} strokeWidth={1.5} />
          ))}
        </g>
      ))}
    </svg>
  );
}

export interface GridProps {
  min: number;
  max: number;
  points?: { x: number; y: number; label?: string }[];
  polygon?: { x: number; y: number }[];
  lines?: { m: number; b: number; label?: string }[];
  selected?: { x: number; y: number } | null;
  onPick?: (p: { x: number; y: number }) => void;
  mark?: { x: number; y: number; ok: boolean } | null;
}

export function Grid({ min, max, points = [], polygon, lines = [], selected, onPick, mark }: GridProps) {
  const S = 380, pad = 26;
  const span = max - min;
  const u = (S - 2 * pad) / span;
  const X = (v: number) => pad + (v - min) * u;
  const Y = (v: number) => S - pad - (v - min) * u;
  const labelStep = span > 24 ? 5 : span > 12 ? 2 : 1;
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const toGrid = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * S;
    const sy = ((e.clientY - r.top) / r.height) * S;
    const gx = Math.round((sx - pad) / u + min);
    const gy = Math.round((S - pad - sy) / u + min);
    if (gx < min || gx > max || gy < min || gy > max) return null;
    return { x: gx, y: gy };
  };
  const clip = (m: number, b: number) => {
    const pts: [number, number][] = [];
    for (const xv of [min, max]) {
      const yv = m * xv + b;
      if (yv >= min && yv <= max) pts.push([xv, yv]);
    }
    if (m !== 0) for (const yv of [min, max]) {
      const xv = (yv - b) / m;
      if (xv > min && xv < max) pts.push([xv, yv]);
    }
    return pts.length >= 2 ? pts.slice(0, 2) : null;
  };
  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      width={S}
      role="img"
      aria-label="coordinate grid"
      style={{ cursor: onPick ? "crosshair" : undefined, touchAction: "manipulation" }}
      onMouseMove={onPick ? (e) => setHover(toGrid(e)) : undefined}
      onMouseLeave={() => setHover(null)}
      onClick={onPick ? (e) => { const g = toGrid(e); if (g) onPick(g); } : undefined}
    >
      {Array.from({ length: span + 1 }, (_, i) => {
        const v = min + i;
        return (
          <g key={i}>
            <line x1={X(v)} x2={X(v)} y1={Y(min)} y2={Y(max)} stroke={C.line} strokeWidth={1} />
            <line y1={Y(v)} y2={Y(v)} x1={X(min)} x2={X(max)} stroke={C.line} strokeWidth={1} />
          </g>
        );
      })}
      {min <= 0 && max >= 0 && (
        <g>
          <line x1={X(0)} x2={X(0)} y1={Y(min) + 8} y2={Y(max) - 8} stroke={C.ink} strokeWidth={2} />
          <line y1={Y(0)} y2={Y(0)} x1={X(min) - 8} x2={X(max) + 8} stroke={C.ink} strokeWidth={2} />
          <text x={X(max) + 2} y={Y(0) - 6} fontSize={13} fontStyle="italic" fill={C.ink} textAnchor="end">x</text>
          <text x={X(0) + 6} y={Y(max) + 4} fontSize={13} fontStyle="italic" fill={C.ink}>y</text>
        </g>
      )}
      {Array.from({ length: span + 1 }, (_, i) => {
        const v = min + i;
        if (v === 0 || v % labelStep !== 0) return null;
        const axisY = min <= 0 && max >= 0 ? Y(0) : Y(min);
        const axisX = min <= 0 && max >= 0 ? X(0) : X(min);
        return (
          <g key={`l${i}`} fontSize={11} fill={C.ink2}>
            <text x={X(v)} y={axisY + 14} textAnchor="middle">{fmt(v)}</text>
            <text x={axisX - 5} y={Y(v) + 4} textAnchor="end">{fmt(v)}</text>
          </g>
        );
      })}
      {polygon && <polygon points={polygon.map((p) => `${X(p.x)},${Y(p.y)}`).join(" ")} fill={C.shade} fillOpacity={0.35} stroke={C.primary} strokeWidth={2} />}
      {lines.map((l, i) => {
        const seg = clip(l.m, l.b);
        if (!seg) return null;
        return (
          <g key={i}>
            <line x1={X(seg[0][0])} y1={Y(seg[0][1])} x2={X(seg[1][0])} y2={Y(seg[1][1])} stroke={i === 0 ? C.primary : C.shade2} strokeWidth={2.5} />
            {l.label && <text x={X(seg[1][0]) - 4} y={Y(seg[1][1]) + (l.m > 0 ? 16 : -6)} fontSize={13} fontWeight={700} textAnchor="end" fill={i === 0 ? C.primary : C.shade2}>{l.label}</text>}
          </g>
        );
      })}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={5.5} fill={C.ink} />
          {p.label && <text x={X(p.x) + 8} y={Y(p.y) - 8} fontSize={13} fontWeight={700} fill={C.ink}>{p.label}</text>}
        </g>
      ))}
      {onPick && hover && !mark && <circle cx={X(hover.x)} cy={Y(hover.y)} r={7} fill={C.primary} fillOpacity={0.3} />}
      {selected && !mark && (
        <g>
          <circle cx={X(selected.x)} cy={Y(selected.y)} r={7} fill={C.primary} />
          <text x={X(selected.x) + 10} y={Y(selected.y) - 10} fontSize={13} fontWeight={800} fill={C.primary}>({fmt(selected.x)}, {fmt(selected.y)})</text>
        </g>
      )}
      {mark && (
        <g>
          <circle cx={X(mark.x)} cy={Y(mark.y)} r={8} fill={mark.ok ? C.good : C.bad} />
          <text x={X(mark.x) + 10} y={Y(mark.y) - 10} fontSize={13} fontWeight={800} fill={mark.ok ? C.good : C.bad}>({fmt(mark.x)}, {fmt(mark.y)})</text>
        </g>
      )}
    </svg>
  );
}

function DotPlot({ values, min, max, label }: Extract<V, { type: "dotplot" }>) {
  const W = 560, pad = 24, base = 150;
  const x = (v: number) => pad + ((v - min) / (max - min)) * (W - 2 * pad);
  const counts = new Map<number, number>();
  return (
    <svg viewBox={`0 0 ${W} 190`} width={W} role="img" aria-label="dot plot">
      <line x1={pad} x2={W - pad} y1={base} y2={base} stroke={C.ink} strokeWidth={2} />
      {Array.from({ length: max - min + 1 }, (_, i) => (
        <g key={i}>
          <line x1={x(min + i)} x2={x(min + i)} y1={base} y2={base + 6} stroke={C.ink} />
          {(max - min <= 20 || i % 2 === 0) && <text x={x(min + i)} y={base + 22} fontSize={12} textAnchor="middle" fill={C.ink}>{min + i}</text>}
        </g>
      ))}
      {values.map((v, i) => {
        const k = (counts.get(v) ?? 0) + 1;
        counts.set(v, k);
        return <circle key={i} cx={x(v)} cy={base - 10 - (k - 1) * 16} r={6.5} fill={C.primary} />;
      })}
      {label && <text x={W / 2} y={186} textAnchor="middle" fontSize={13} fill={C.ink2}>{label}</text>}
    </svg>
  );
}

function Scatter({ points, xLabel, yLabel, line }: Extract<V, { type: "scatter" }>) {
  const W = 420, H = 300, pad = 44;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const x0 = 0, x1 = Math.ceil(Math.max(...xs) + 1);
  const y0 = Math.max(0, Math.floor(Math.min(...ys) / 10) * 10 - 10), y1 = Math.ceil(Math.max(...ys) / 10) * 10 + 10;
  const X = (v: number) => pad + ((v - x0) / (x1 - x0)) * (W - pad - 12);
  const Y = (v: number) => H - pad - ((v - y0) / (y1 - y0)) * (H - pad - 12);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label="scatterplot">
      <line x1={pad} x2={W - 8} y1={H - pad} y2={H - pad} stroke={C.ink} strokeWidth={2} />
      <line x1={pad} x2={pad} y1={8} y2={H - pad} stroke={C.ink} strokeWidth={2} />
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const v = Math.round(y0 + f * (y1 - y0));
        return <text key={f} x={pad - 6} y={Y(v) + 4} fontSize={11} textAnchor="end" fill={C.ink2}>{v}</text>;
      })}
      {Array.from({ length: x1 + 1 }, (_, i) => (i % Math.ceil(x1 / 8) === 0 ? <text key={i} x={X(i)} y={H - pad + 16} fontSize={11} textAnchor="middle" fill={C.ink2}>{i}</text> : null))}
      {line && <line x1={X(x0)} y1={Y(line.m * x0 + line.b)} x2={X(x1)} y2={Y(line.m * x1 + line.b)} stroke={C.shade2} strokeWidth={2.5} />}
      {points.map((p, i) => <circle key={i} cx={X(p.x)} cy={Y(p.y)} r={5} fill={C.primary} />)}
      <text x={(W + pad) / 2} y={H - 8} textAnchor="middle" fontSize={13} fill={C.ink}>{xLabel}</text>
      <text x={14} y={(H - pad) / 2} textAnchor="middle" fontSize={13} fill={C.ink} transform={`rotate(-90 14 ${(H - pad) / 2})`}>{yLabel}</text>
    </svg>
  );
}

function Tape({ rows }: { rows: Extract<V, { type: "tape" }>["rows"] }) {
  const W = 480, lab = 90, h = 38;
  const unit = W / Math.max(...rows.map((r) => r.segments.reduce((a, s) => a + s.size, 0)));
  return (
    <svg viewBox={`0 0 ${W + lab} ${rows.length * (h + 10)}`} width={W + lab} role="img" aria-label="tape diagram">
      {rows.map((row, i) => {
        let at = lab;
        return (
          <g key={i} transform={`translate(0 ${i * (h + 10)})`}>
            <text x={0} y={h / 2 + 5} fontSize={14} fontWeight={700} fill={C.ink}>{row.label}</text>
            {row.segments.map((s, k) => {
              const x = at;
              at += s.size * unit;
              return (
                <g key={k}>
                  <rect x={x} y={0} width={s.size * unit} height={h} fill={s.shade ? C.shade : C.surface} stroke={C.ink} strokeWidth={1.5} />
                  <text x={x + (s.size * unit) / 2} y={h / 2 + 5} fontSize={14} textAnchor="middle" fill={C.ink}>{s.text}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function BoxPlot({ min, q1, median, q3, max, scaleMin, scaleMax }: Extract<V, { type: "boxplot" }>) {
  const W = 560, pad = 24, y = 50;
  const x = (v: number) => pad + ((v - scaleMin) / (scaleMax - scaleMin)) * (W - 2 * pad);
  const step = scaleMax - scaleMin > 30 ? 5 : scaleMax - scaleMin > 15 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} 120`} width={W} role="img" aria-label="box plot">
      <line x1={x(min)} x2={x(q1)} y1={y} y2={y} stroke={C.ink} strokeWidth={2} />
      <line x1={x(q3)} x2={x(max)} y1={y} y2={y} stroke={C.ink} strokeWidth={2} />
      <line x1={x(min)} x2={x(min)} y1={y - 12} y2={y + 12} stroke={C.ink} strokeWidth={2} />
      <line x1={x(max)} x2={x(max)} y1={y - 12} y2={y + 12} stroke={C.ink} strokeWidth={2} />
      <rect x={x(q1)} y={y - 22} width={x(q3) - x(q1)} height={44} fill={C.shade} fillOpacity={0.35} stroke={C.ink} strokeWidth={2} />
      <line x1={x(median)} x2={x(median)} y1={y - 22} y2={y + 22} stroke={C.ink} strokeWidth={3} />
      <line x1={pad} x2={W - pad} y1={95} y2={95} stroke={C.ink} />
      {Array.from({ length: Math.floor((scaleMax - scaleMin) / step) + 1 }, (_, i) => {
        const v = scaleMin + i * step;
        return (
          <g key={i}>
            <line x1={x(v)} x2={x(v)} y1={95} y2={100} stroke={C.ink} />
            <text x={x(v)} y={114} fontSize={12} textAnchor="middle" fill={C.ink}>{v}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Shape({ shape, labels }: { shape: string; labels: Record<string, string | undefined> }) {
  const t = (x: number, y: number, s?: string, anchor: "start" | "middle" | "end" = "middle") => s ? <text x={x} y={y} fontSize={15} fontWeight={700} textAnchor={anchor} fill={C.ink}>{s}</text> : null;
  const dash = { stroke: C.ink2, strokeDasharray: "5 4", strokeWidth: 1.5 };
  const body = { fill: C.shade, fillOpacity: 0.25, stroke: C.ink, strokeWidth: 2 };
  let content;
  switch (shape) {
    case "triangle":
      content = <><polygon points="40,170 280,170 190,40" {...body} /><line x1={190} y1={40} x2={190} y2={170} {...dash} /><rect x={190} y={158} width={12} height={12} fill="none" stroke={C.ink2} />{t(160, 192, labels.base)}{t(198, 110, labels.height, "start")}</>;
      break;
    case "parallelogram":
      content = <><polygon points="40,170 250,170 300,50 90,50" {...body} /><line x1={90} y1={50} x2={90} y2={170} {...dash} />{t(145, 192, labels.base)}{t(98, 115, labels.height, "start")}{t(290, 120, labels.side, "start")}</>;
      break;
    case "trapezoid":
      content = <><polygon points="30,170 310,170 240,50 100,50" {...body} /><line x1={100} y1={50} x2={100} y2={170} {...dash} />{t(170, 192, labels.base)}{t(170, 40, labels.top)}{t(108, 115, labels.height, "start")}</>;
      break;
    case "prism":
      content = <><polygon points="40,80 230,80 230,180 40,180" {...body} /><polygon points="40,80 100,30 290,30 230,80" {...body} /><polygon points="230,80 290,30 290,130 230,180" {...body} />{t(135, 200, labels.l)}{t(270, 170, labels.w, "start")}{t(30, 135, labels.h, "end")}</>;
      break;
    case "cylinder":
      content = <><ellipse cx={160} cy={160} rx={90} ry={22} {...body} /><rect x={70} y={50} width={180} height={110} fill={C.shade} fillOpacity={0.25} stroke="none" /><line x1={70} y1={50} x2={70} y2={160} stroke={C.ink} strokeWidth={2} /><line x1={250} y1={50} x2={250} y2={160} stroke={C.ink} strokeWidth={2} /><ellipse cx={160} cy={50} rx={90} ry={22} {...body} /><line x1={160} y1={50} x2={250} y2={50} {...dash} />{t(205, 44, labels.r)}{t(262, 110, labels.h, "start")}</>;
      break;
    case "cone":
      content = <><ellipse cx={160} cy={170} rx={90} ry={22} {...body} /><polygon points="70,170 250,170 160,30" fill={C.shade} fillOpacity={0.25} stroke={C.ink} strokeWidth={2} /><line x1={160} y1={30} x2={160} y2={170} {...dash} /><line x1={160} y1={170} x2={250} y2={170} {...dash} />{t(205, 164, labels.r)}{t(166, 105, labels.h, "start")}</>;
      break;
    case "sphere":
    case "circle":
      content = <><circle cx={160} cy={110} r={85} {...body} />{shape === "sphere" && <ellipse cx={160} cy={110} rx={85} ry={22} fill="none" {...dash} />}<line x1={160} y1={110} x2={245} y2={110} stroke={C.ink} strokeWidth={2} /><circle cx={160} cy={110} r={3} fill={C.ink} />{t(202, 102, labels.r)}{labels.d && t(160, 220, labels.d)}</>;
      break;
    case "righttriangle":
      content = <><polygon points="60,170 260,170 60,40" {...body} /><rect x={60} y={156} width={14} height={14} fill="none" stroke={C.ink} />{t(160, 192, labels.b)}{t(50, 110, labels.a, "end")}{t(172, 96, labels.c, "start")}</>;
      break;
    case "angles":
      content = <><line x1={30} y1={160} x2={300} y2={160} stroke={C.ink} strokeWidth={2} /><line x1={165} y1={160} x2={250} y2={40} stroke={C.ink} strokeWidth={2} /><path d="M 195 160 A 30 30 0 0 0 183 135" fill="none" stroke={C.primary} strokeWidth={2} /><path d="M 145 160 A 20 20 0 0 1 177 143" fill="none" stroke={C.shade2} strokeWidth={2} />{t(210, 150, labels.a, "start")}{t(140, 140, labels.b, "end")}</>;
      break;
    default:
      content = <rect x={40} y={40} width={240} height={130} {...body} />;
  }
  return <svg viewBox="0 0 330 225" width={330} role="img" aria-label={shape}>{content}</svg>;
}

function DiceSim({ target, rolls }: { target: number; rolls: number }) {
  const [counts, setCounts] = useState<number[] | null>(null);
  const roll = () => {
    const c = Array(13).fill(0);
    for (let i = 0; i < rolls; i++) c[Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2]++;
    setCounts(c);
  };
  const W = 480, H = 170, bw = 32;
  const max = counts ? Math.max(...counts) : 1;
  return (
    <div>
      <button className="btn primary" onClick={roll}>🎲 Roll {rolls} times{counts ? " again" : ""}</button>
      {counts && (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label="simulation results" style={{ marginTop: 10 }}>
            {Array.from({ length: 11 }, (_, i) => {
              const s = i + 2;
              const h = (counts[s] / max) * 110;
              return (
                <g key={s}>
                  <rect x={20 + i * (bw + 8)} y={130 - h} width={bw} height={h} fill={s === target ? "var(--accent)" : "var(--shade)"} rx={4} />
                  <text x={20 + i * (bw + 8) + bw / 2} y={148} fontSize={13} textAnchor="middle" fill="var(--ink)">{s}</text>
                  <text x={20 + i * (bw + 8) + bw / 2} y={125 - h} fontSize={11} textAnchor="middle" fill="var(--ink-2)">{counts[s]}</text>
                </g>
              );
            })}
            <text x={W / 2} y={166} fontSize={12} textAnchor="middle" fill="var(--ink-2)">sum of two dice</text>
          </svg>
          <p className="small"><strong>{target}</strong> came up <strong>{counts[target]}</strong> times out of {rolls} ({((counts[target] / rolls) * 100).toFixed(1)}%).</p>
        </>
      )}
    </div>
  );
}

// ---------- Shared helpers for the coordinate figures (plot, geo, histogram, normal) ----------

type Pt = [number, number];
type Box = { x: number; y: number; w: number; h: number };
type Anchor = "start" | "middle" | "end";

/** A light outline in the card color so labels stay readable where they cross lines. */
const halo = { stroke: C.surface, strokeWidth: 3, strokeLinejoin: "round" as const, paintOrder: "stroke" };
const CURVE_COLORS = [C.primary, C.shade2, C.good];
const curveColor = (c?: 1 | 2 | 3) => CURVE_COLORS[(c ?? 1) - 1] ?? C.primary;
const textW = (s: string, size: number) => s.length * size * 0.58;
const px = (v: number) => Number(v.toFixed(1));
const pathOf = (pts: Pt[]) => "M " + pts.map(([x, y]) => `${px(x)} ${px(y)}`).join(" L ");
const svgId = (id: string) => "v" + id.replace(/[^a-zA-Z0-9_-]/g, "");

/** A step of 1, 2 or 5 × 10^k giving about 8 intervals across the span. */
function niceStep(span: number, target = 8) {
  if (!(span > 0)) return 1;
  let best = 1, score = Infinity;
  const e0 = Math.floor(Math.log10(span));
  for (let e = e0 - 2; e <= e0 + 1; e++) {
    for (const m of [1, 2, 5]) {
      const s = m * 10 ** e;
      const d = Math.abs(span / s - target);
      if (d < score - 1e-9) { score = d; best = s; }
    }
  }
  return best;
}

function tickValues(min: number, max: number, step: number) {
  const out: number[] = [];
  if (!(step > 0)) return out;
  const k0 = Math.ceil(min / step - 1e-9), k1 = Math.floor(max / step + 1e-9);
  for (let k = k0; k <= k1 && out.length < 200; k++) out.push(Math.abs(k * step) < step * 1e-9 ? 0 : k * step);
  return out;
}

const PI4 = Math.PI / 4;
const isPiMultiple = (v: number) => v !== 0 && Math.abs(v / PI4 - Math.round(v / PI4)) < 1e-6 && !Number.isInteger(v);
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
/** 3π/2, −π/4, 2π … for multiples of π/4. */
function piLabel(v: number) {
  const n = Math.round(v / PI4);
  if (n === 0) return "0";
  const g = gcd(Math.abs(n), 4), num = Math.abs(n) / g, den = 4 / g;
  return `${n < 0 ? "−" : ""}${num === 1 ? "" : num}π${den > 1 ? "/" + den : ""}`;
}
function autoStep(min: number, max: number) {
  if (isPiMultiple(min) || isPiMultiple(max)) {
    for (const s of [PI4, 2 * PI4, 4 * PI4, 8 * PI4]) if ((max - min) / s <= 10 + 1e-9) return s;
  }
  return niceStep(max - min);
}

function boxDist(b: Box, [x, y]: Pt) {
  const dx = Math.max(b.x - x, 0, x - (b.x + b.w));
  const dy = Math.max(b.y - y, 0, y - (b.y + b.h));
  return Math.hypot(dx, dy);
}
const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
function textBox(x: number, y: number, text: string, size: number, anchor: Anchor): Box {
  const w = textW(text, size);
  return { x: anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2, y: y - size * 0.8, w, h: size };
}

/** Picks the candidate spot farthest (up to `cap` px) from the drawn lines, inside the frame and clear of other labels. */
function placeLabel(at: Pt, text: string, size: number, cands: [number, number, Anchor][], obstacles: Pt[], taken: Box[], frame: Box, cap = 9) {
  let best = { x: at[0] + cands[0][0], y: at[1] + cands[0][1], anchor: cands[0][2], box: textBox(at[0] + cands[0][0], at[1] + cands[0][1], text, size, cands[0][2]) };
  let bestScore = -Infinity;
  for (const [dx, dy, anchor] of cands) {
    const x = at[0] + dx, y = at[1] + dy;
    const box = textBox(x, y, text, size, anchor);
    let d = cap;
    for (const o of obstacles) {
      d = Math.min(d, boxDist(box, o));
      if (d === 0) break;
    }
    let score = d;
    if (box.x < frame.x || box.y < frame.y || box.x + box.w > frame.x + frame.w || box.y + box.h > frame.y + frame.h) score -= 100;
    if (taken.some((t) => overlaps(t, box))) score -= 50;
    if (score > bestScore + 1e-9) { bestScore = score; best = { x, y, anchor, box }; }
  }
  taken.push(best.box);
  return best;
}

/** Offset from a point along unit direction `n` far enough that a text box of w×h clears it by `gap`. */
const clearOffset = (n: Pt, w: number, h: number, gap: number) => gap + (Math.abs(n[0]) * w) / 2 + (Math.abs(n[1]) * h) / 2;

// ---------- plot: graphs of functions of x ----------

/**
 * Samples y = f(x) on [a, b] and splits it into pieces wherever f is undefined or jumps across the window
 * (vertical asymptotes), so 1/(x − 2) and tan x never get a false vertical line. Values far outside the
 * window are clamped (the drawing is clipped to the window anyway).
 */
export function sampleCurve(node: ExprNode, a: number, b: number, yMin: number, yMax: number, n = 400): Pt[][] {
  const span = yMax - yMin, lo = yMin - span, hi = yMax + span;
  const f = (x: number) => {
    try {
      const y = evalExpr(node, { x });
      return Number.isFinite(y) ? y : NaN;
    } catch {
      return NaN;
    }
  };
  const clampY = (y: number) => Math.min(hi, Math.max(lo, y));
  /** Bisects toward the edge of where f is defined, between a defined x and an undefined one. */
  const edge = (good: number, bad: number) => {
    for (let i = 0; i < 40; i++) {
      const m = (good + bad) / 2;
      if (Number.isFinite(f(m))) good = m;
      else bad = m;
    }
    return good;
  };
  const jumps = (x1: number, y1: number, x2: number, y2: number) => {
    const big = Math.abs(y2 - y1) > span || (y1 > yMax && y2 < yMin) || (y1 < yMin && y2 > yMax);
    if (!big) return false;
    const ym = f((x1 + x2) / 2);
    const tol = span * 1e-6;
    return !Number.isFinite(ym) || ym < Math.min(y1, y2) - tol || ym > Math.max(y1, y2) + tol;
  };
  const pieces: Pt[][] = [];
  let cur: Pt[] = [];
  let lastX = NaN, lastY = NaN;
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n, y = f(x);
    if (!Number.isFinite(y)) {
      if (cur.length) {
        const e = edge(lastX, x);
        if (e > lastX) cur.push([e, clampY(f(e))]);
        pieces.push(cur);
        cur = [];
      }
      lastX = x;
      lastY = NaN;
      continue;
    }
    if (!cur.length && i > 0 && Number.isNaN(lastY)) {
      const e = edge(x, lastX);
      if (e < x) cur.push([e, clampY(f(e))]);
    } else if (cur.length && jumps(lastX, lastY, x, y)) {
      pieces.push(cur);
      cur = [];
    }
    cur.push([x, clampY(y)]);
    lastX = x;
    lastY = y;
  }
  if (cur.length) pieces.push(cur);
  return pieces.filter((p) => p.length > 1);
}

function Plot({ xMin, xMax, yMin, yMax, xStep, yStep, curves = [], points = [], vlines = [], hlines = [] }: Extract<V, { type: "plot" }>) {
  const cid = svgId(useId());
  const W = 360, H = 260;
  const xs = xStep && xStep > 0 ? xStep : autoStep(xMin, xMax);
  const ys = yStep && yStep > 0 ? yStep : autoStep(yMin, yMax);
  const xPi = Math.abs(xs / PI4 - Math.round(xs / PI4)) < 1e-6 && !Number.isInteger(xs);
  const yPi = Math.abs(ys / PI4 - Math.round(ys / PI4)) < 1e-6 && !Number.isInteger(ys);
  const xLab = (v: number) => (xPi ? piLabel(v) : fmt(v));
  const yLab = (v: number) => (yPi ? piLabel(v) : fmt(v));
  const xT = tickValues(xMin, xMax, xs), yT = tickValues(yMin, yMax, ys);
  const ax0 = Math.min(xMax, Math.max(xMin, 0)), ay0 = Math.min(yMax, Math.max(yMin, 0));
  const yLabW = Math.max(0, ...yT.map((v) => textW(yLab(v), 11)));
  // Leave a left margin only when the y-axis labels would otherwise run off the edge.
  const yAxisFrac = (ax0 - xMin) / (xMax - xMin);
  const L = yAxisFrac * (W - 30) < yLabW + 8 ? Math.ceil(yLabW + 12) : 14;
  const R = W - 14, T = 12, B = H - 22;
  const X = (v: number) => L + ((v - xMin) / (xMax - xMin)) * (R - L);
  const Y = (v: number) => B - ((v - yMin) / (yMax - yMin)) * (B - T);
  const axisX = X(ax0), axisY = Y(ay0);
  const originInside = xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0;
  const xGap = xT.length > 1 ? Math.abs(X(xT[1]) - X(xT[0])) : R - L;
  const xLabelEvery = Math.max(1, Math.ceil((Math.max(...xT.map((v) => textW(xLab(v), 11)), 8) + 5) / xGap));
  const yLabelEvery = Math.max(1, Math.ceil((yT.length * 16) / (B - T)));
  const frame: Box = { x: L, y: T, w: R - L, h: B - T };
  const inWin = ([x, y]: Pt) => x >= L - 0.5 && x <= R + 0.5 && y >= T - 0.5 && y <= B + 0.5;

  const drawn = curves.map((c: PlotCurve) => {
    let node: ExprNode;
    try {
      node = parseExpr(c.expr, ["x"]);
    } catch {
      return null;
    }
    const a = Math.max(xMin, c.domain?.[0] ?? xMin), b = Math.min(xMax, c.domain?.[1] ?? xMax);
    if (!(b > a)) return null;
    const pieces = sampleCurve(node, a, b, yMin, yMax).map((p) => p.map(([x, y]) => [X(x), Y(y)] as Pt));
    return { c, pieces };
  });
  const ySpan = yMax - yMin;
  const shadeEdge = (dir: "above" | "below") => Y(dir === "above" ? yMax + ySpan : yMin - ySpan);

  // Everything a label should keep clear of.
  const obstacles: Pt[] = [];
  for (const d of drawn) if (d) for (const p of d.pieces) for (const q of p) if (inWin(q)) obstacles.push(q);
  for (let x = L; x <= R; x += 4) obstacles.push([x, axisY]);
  for (let y = T; y <= B; y += 4) obstacles.push([axisX, y]);
  for (const l of vlines) for (let y = T; y <= B; y += 4) obstacles.push([X(l.x), y]);
  for (const l of hlines) for (let x = L; x <= R; x += 4) obstacles.push([x, Y(l.y)]);
  // Tick labels; when only every other one fits, keep the even multiples of the step (so 0 stays in the pattern).
  const xLabels = xT
    .filter((v) => Math.round(v / xs) % xLabelEvery === 0 || xLabelEvery === 1)
    .filter((v) => !(v === 0 && xMin < 0 && yMin < 0 && yMax > 0))
    .map((v) => ({ v, x: X(v), y: axisY + 15, text: xLab(v), anchor: "middle" as Anchor }));
  const yLabels = yT
    .filter((v) => Math.round(v / ys) % yLabelEvery === 0 || yLabelEvery === 1)
    .filter((v) => !(v === 0 && originInside))
    .map((v) => ({ v, x: axisX - 6, y: Y(v) + 4, text: yLab(v), anchor: "end" as Anchor }));
  const taken: Box[] = [
    ...[...xLabels, ...yLabels].map((l) => textBox(l.x, l.y, l.text, 11, l.anchor)),
    textBox(R + 4, axisY - 6, "x", 13, "end"),
    textBox(axisX + 6, T + 4, "y", 13, "start"),
  ];

  const lineLabels = [
    ...vlines.filter((l) => l.label && l.x >= xMin && l.x <= xMax).map((l, i) => {
      const x = X(l.x);
      const at = placeLabel([x, T], l.label!, 12, [[4, 12, "start"], [-4, 12, "end"], [4, B - T - 6, "start"], [-4, B - T - 6, "end"], [4, (B - T) / 2, "start"], [-4, (B - T) / 2, "end"]], obstacles.filter((o) => Math.abs(o[0] - x) > 1), taken, frame);
      return { key: `v${i}`, ...at, text: l.label! };
    }),
    ...hlines.filter((l) => l.label && l.y >= yMin && l.y <= yMax).map((l, i) => {
      const y = Y(l.y);
      const at = placeLabel([R, y], l.label!, 12, [[-4, -5, "end"], [-4, 15, "end"], [L - R + 4, -5, "start"], [L - R + 4, 15, "start"], [(L - R) / 2, -5, "middle"], [(L - R) / 2, 15, "middle"]], obstacles.filter((o) => Math.abs(o[1] - y) > 1), taken, frame);
      return { key: `h${i}`, ...at, text: l.label! };
    }),
  ];

  const pointMarks = points
    .filter((p) => p.x >= xMin && p.x <= xMax && p.y >= yMin && p.y <= yMax)
    .map((p) => ({ p, at: [X(p.x), Y(p.y)] as Pt }));
  for (const { at } of pointMarks) taken.push({ x: at[0] - 5, y: at[1] - 5, w: 10, h: 10 });
  const pointLabels = pointMarks.map(({ p, at }) =>
    p.label ? placeLabel(at, p.label, 12, [[7, -7, "start"], [-7, -7, "end"], [7, 16, "start"], [-7, 16, "end"], [0, -11, "middle"], [0, 20, "middle"], [9, 4, "start"], [-9, 4, "end"]], obstacles, taken, frame) : null,
  );
  const curveLabels = drawn.map((d) => {
    if (!d || !d.c.label) return null;
    const vis = d.pieces.flat().filter(inWin);
    if (!vis.length) return null;
    // Near the right end of the visible curve; if that spot is crowded, try a little further left along it.
    const xEnd = Math.max(...vis.map((q) => q[0]));
    const xStart = Math.min(...vis.map((q) => q[0]));
    const nearX = (tx: number) => vis.reduce((m, q) => (Math.abs(q[0] - tx) < Math.abs(m[0] - tx) ? q : m), vis[0]);
    const offs: [number, number, Anchor][] = [[-4, -8, "end"], [-4, 18, "end"], [6, -8, "start"], [6, 18, "start"], [-10, 4, "end"], [-4, -16, "end"], [-4, 26, "end"]];
    const spots = [xEnd - 6, xEnd - 0.15 * (xEnd - xStart), xEnd - 0.3 * (xEnd - xStart)].map(nearX);
    const cands = spots.flatMap((sp) => offs.map(([dx, dy, an]) => [sp[0] - spots[0][0] + dx, sp[1] - spots[0][1] + dy, an] as [number, number, Anchor]));
    return placeLabel(spots[0], d.c.label, 13, cands, obstacles, taken, frame);
  });

  const aria = [
    curves.length ? "graph of " + curves.map((c) => `y = ${c.expr}${c.shade ? ` (shaded ${c.shade})` : ""}${c.dashed ? " (dashed)" : ""}`).join(" and ") : "coordinate graph",
    points.length ? "points " + points.map((p) => p.label ?? `(${fmt(p.x)}, ${fmt(p.y)})`).join(", ") : "",
    ...vlines.map((l) => `${l.dashed ? "dashed " : ""}vertical line x = ${fmt(l.x)}`),
    ...hlines.map((l) => `${l.dashed ? "dashed " : ""}horizontal line y = ${fmt(l.y)}`),
    `x from ${xLab(xMin)} to ${xLab(xMax)}, y from ${yLab(yMin)} to ${yLab(yMax)}`,
  ].filter(Boolean).join("; ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={aria}>
      <defs>
        <clipPath id={cid}>
          <rect x={L} y={T} width={R - L} height={B - T} />
        </clipPath>
      </defs>
      <g stroke={C.line} strokeWidth={1}>
        {xT.map((v) => <line key={`gx${v}`} x1={px(X(v))} x2={px(X(v))} y1={T} y2={B} />)}
        {yT.map((v) => <line key={`gy${v}`} y1={px(Y(v))} y2={px(Y(v))} x1={L} x2={R} />)}
      </g>
      <g clipPath={`url(#${cid})`}>
        {drawn.map((d, i) =>
          d && d.c.shade
            ? d.pieces.map((p, k) => {
                const e = shadeEdge(d.c.shade!);
                return <path key={`s${i}-${k}`} d={pathOf([...p, [p[p.length - 1][0], e], [p[0][0], e]]) + " Z"} fill={curveColor(d.c.color)} fillOpacity={0.18} stroke="none" />;
              })
            : null,
        )}
      </g>
      <g stroke={C.ink} strokeWidth={1.6}>
        <line x1={L} x2={R + 6} y1={px(axisY)} y2={px(axisY)} />
        <line x1={px(axisX)} x2={px(axisX)} y1={B} y2={T - 6} />
        {xT.map((v) => <line key={`tx${v}`} x1={px(X(v))} x2={px(X(v))} y1={px(axisY - 3)} y2={px(axisY + 3)} strokeWidth={1.2} />)}
        {yT.map((v) => <line key={`ty${v}`} y1={px(Y(v))} y2={px(Y(v))} x1={px(axisX - 3)} x2={px(axisX + 3)} strokeWidth={1.2} />)}
      </g>
      <g fontSize={11} fill={C.ink2} {...halo}>
        {[...xLabels, ...yLabels].map((l, i) => <text key={i} x={px(l.x)} y={px(l.y)} textAnchor={l.anchor}>{l.text}</text>)}
      </g>
      <text x={R + 4} y={px(axisY - 6)} fontSize={13} fontStyle="italic" fill={C.ink} textAnchor="end" {...halo}>x</text>
      <text x={px(axisX + 6)} y={T + 4} fontSize={13} fontStyle="italic" fill={C.ink} {...halo}>y</text>
      <g clipPath={`url(#${cid})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {vlines.map((l, i) => <line key={`vl${i}`} x1={px(X(l.x))} x2={px(X(l.x))} y1={T} y2={B} stroke={C.ink2} strokeWidth={1.6} strokeDasharray={l.dashed ? "6 4" : undefined} />)}
        {hlines.map((l, i) => <line key={`hl${i}`} y1={px(Y(l.y))} y2={px(Y(l.y))} x1={L} x2={R} stroke={C.ink2} strokeWidth={1.6} strokeDasharray={l.dashed ? "6 4" : undefined} />)}
        {drawn.map((d, i) => d && d.pieces.map((p, k) => <path key={`c${i}-${k}`} d={pathOf(p)} stroke={curveColor(d.c.color)} strokeWidth={2.6} strokeDasharray={d.c.dashed ? "7 5" : undefined} />))}
      </g>
      {lineLabels.map((l) => <text key={l.key} x={px(l.x)} y={px(l.y)} textAnchor={l.anchor} fontSize={12} fontWeight={700} fill={C.ink2} {...halo}>{l.text}</text>)}
      {curveLabels.map((l, i) => l && <text key={`cl${i}`} x={px(l.x)} y={px(l.y)} textAnchor={l.anchor} fontSize={13} fontWeight={800} fill={curveColor(drawn[i]!.c.color)} {...halo}>{drawn[i]!.c.label}</text>)}
      {pointMarks.map(({ p, at }, i) => (
        <g key={`p${i}`}>
          <circle cx={px(at[0])} cy={px(at[1])} r={4.5} fill={p.open ? C.surface : C.ink} stroke={C.ink} strokeWidth={p.open ? 2 : 0} />
          {pointLabels[i] && <text x={px(pointLabels[i]!.x)} y={px(pointLabels[i]!.y)} textAnchor={pointLabels[i]!.anchor} fontSize={12} fontWeight={700} fill={C.ink} {...halo}>{p.label}</text>}
        </g>
      ))}
    </svg>
  );
}

// ---------- geo: a geometry figure drawn from coordinates ----------

const unit = ([x, y]: Pt): Pt => {
  const l = Math.hypot(x, y);
  return l > 1e-9 ? [x / l, y / l] : [0, 0];
};
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt, k = 1): Pt => [a[0] + b[0] * k, a[1] + b[1] * k];

function Geo({ points, polygons = [], segments = [], circles = [], angles = [], showLabels, grid }: Extract<V, { type: "geo" }>) {
  const W = 360, pad = 30, maxH = 300, minH = 170;
  const names = Object.keys(points).filter((k) => Number.isFinite(points[k]?.x) && Number.isFinite(points[k]?.y));
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const grow = (x: number, y: number) => {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  };
  for (const k of names) grow(points[k].x, points[k].y);
  for (const c of circles) {
    const o = points[c.center];
    if (o && c.r > 0) { grow(o.x - c.r, o.y - c.r); grow(o.x + c.r, o.y + c.r); }
  }
  if (!Number.isFinite(minX)) { minX = 0; maxX = 1; minY = 0; maxY = 1; }
  if (grid) {
    // Coordinate figures: show the axes (include the origin) and a one-unit margin so labels have room.
    minX = Math.floor(Math.min(minX, 0)) - 1; maxX = Math.ceil(Math.max(maxX, 0)) + 1;
    minY = Math.floor(Math.min(minY, 0)) - 1; maxY = Math.ceil(Math.max(maxY, 0)) + 1;
    // Keep the grid roughly square so shapes aren't squashed.
    const span = Math.max(maxX - minX, maxY - minY);
    minX -= Math.floor((span - (maxX - minX)) / 2); maxX = minX + span;
    minY -= Math.floor((span - (maxY - minY)) / 2); maxY = minY + span;
  }
  if (maxX - minX < 1e-9) { minX -= 0.5; maxX += 0.5; }
  if (maxY - minY < 1e-9) { minY -= 0.5; maxY += 0.5; }
  const bw = maxX - minX, bh = maxY - minY;
  const s = Math.min((W - 2 * pad) / bw, (maxH - 2 * pad) / bh);
  const H = Math.round(Math.min(maxH, Math.max(minH, bh * s + 2 * pad)));
  const ox = (W - bw * s) / 2, oy = (H + bh * s) / 2;
  const P = (p: { x: number; y: number }): Pt => [ox + (p.x - minX) * s, oy - (p.y - minY) * s];
  const at = (k: string) => (points[k] && names.includes(k) ? P(points[k]) : null);
  const all = names.map((k) => P(points[k]));
  const centroid: Pt = all.length ? [all.reduce((a, p) => a + p[0], 0) / all.length, all.reduce((a, p) => a + p[1], 0) / all.length] : [W / 2, H / 2];

  // Which points each point is joined to (for placing its letter outside the corner).
  const nbrs = new Map<string, string[]>();
  const link = (a: string, b: string) => {
    if (a === b) return;
    nbrs.set(a, [...(nbrs.get(a) ?? []), b]);
    nbrs.set(b, [...(nbrs.get(b) ?? []), a]);
  };
  for (const poly of polygons) poly.forEach((k, i) => link(k, poly[(i + 1) % poly.length]));
  for (const sg of segments) link(sg.from, sg.to);
  const inPolygon = new Set(polygons.flat());

  const labelSize = 13;
  const segs = segments.flatMap((sg, i) => {
    const a = at(sg.from), b = at(sg.to);
    if (!a || !b) return [];
    const u = unit(sub(b, a));
    let n: Pt = [-u[1], u[0]];
    const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const side = (m[0] - centroid[0]) * n[0] + (m[1] - centroid[1]) * n[1];
    if (side < -0.5 || (Math.abs(side) <= 0.5 && n[1] > 0)) n = [-n[0], -n[1]];
    const ticks = sg.tick ? Array.from({ length: sg.tick }, (_, t) => {
      const c = add(m, u, (t - (sg.tick! - 1) / 2) * 5);
      return [add(c, n, -6), add(c, n, 6)] as [Pt, Pt];
    }) : [];
    const label = sg.label ? add(m, n, clearOffset(n, textW(sg.label, labelSize), labelSize, sg.tick ? 10 : 7)) : null;
    return [{ key: i, sg, a, b, ticks, label }];
  });

  const angleMarks = angles.flatMap((an, i) => {
    const v = at(an.at), f = at(an.from), t = at(an.to);
    if (!v || !f || !t) return [];
    const d1 = sub(f, v), d2 = sub(t, v);
    const l1 = Math.hypot(...d1), l2 = Math.hypot(...d2);
    if (l1 < 1e-6 || l2 < 1e-6) return [];
    const u1 = unit(d1), u2 = unit(d2);
    let bis = unit(add(u1, u2));
    if (bis[0] === 0 && bis[1] === 0) bis = [u1[1], -u1[0]];
    const theta = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1])));
    const short = Math.min(l1, l2);
    let mark: string;
    let r: number;
    if (an.right) {
      r = Math.min(12, short * 0.3);
      const p1 = add(v, u1, r), p2 = add(p1, u2, r), p3 = add(v, u2, r);
      mark = `M ${px(p1[0])} ${px(p1[1])} L ${px(p2[0])} ${px(p2[1])} L ${px(p3[0])} ${px(p3[1])}`;
      r *= Math.SQRT2;
    } else {
      r = Math.min(20, short * 0.35);
      const cross = u1[0] * u2[1] - u1[1] * u2[0];
      const p1 = add(v, u1, r), p2 = add(v, u2, r);
      mark = `M ${px(p1[0])} ${px(p1[1])} A ${px(r)} ${px(r)} 0 0 ${cross > 0 ? 1 : 0} ${px(p2[0])} ${px(p2[1])}`;
    }
    let label: Pt | null = null;
    if (an.label) {
      const w = textW(an.label, labelSize), h = labelSize;
      const needWide = (Math.hypot(w, h) / 2 + 2) / Math.max(Math.sin(theta / 2), 0.05);
      const d = Math.min(Math.max(r + clearOffset(bis, w, h, 4), needWide), Math.max(r + clearOffset(bis, w, h, 4), short * 0.75));
      label = add(v, bis, d);
    }
    return [{ key: i, an, mark, label }];
  });

  const vertexLabels = showLabels
    ? names.map((k) => {
        const p = P(points[k]);
        let dir: Pt = [0, 0];
        for (const o of nbrs.get(k) ?? []) {
          const q = at(o);
          if (q) dir = sub(dir, unit(sub(q, p)));
        }
        if (Math.hypot(...dir) < 0.3) dir = sub(p, centroid);
        dir = unit(dir);
        if (dir[0] === 0 && dir[1] === 0) dir = [0.6, -0.8];
        return { k, at: add(p, dir, clearOffset(dir, textW(k, 14), 14, 7)) };
      })
    : [];

  let gridEls = null;
  if (grid) {
    const span = Math.max(bw, bh);
    const step = span > 30 ? 5 : 1;
    const labelStep = span > 24 ? 10 : span > 12 ? 2 : 1;
    const gx = tickValues(minX, maxX, step), gy = tickValues(minY, maxY, step);
    const x0 = P({ x: 0, y: minY })[0], y0 = P({ x: minX, y: 0 })[1];
    const top = P({ x: 0, y: maxY })[1], bottom = P({ x: 0, y: minY })[1], left = P({ x: minX, y: 0 })[0], right = P({ x: maxX, y: 0 })[0];
    gridEls = (
      <g>
        <g stroke={C.line} strokeWidth={1}>
          {gx.map((v) => <line key={`gx${v}`} x1={px(P({ x: v, y: 0 })[0])} x2={px(P({ x: v, y: 0 })[0])} y1={px(top)} y2={px(bottom)} />)}
          {gy.map((v) => <line key={`gy${v}`} y1={px(P({ x: 0, y: v })[1])} y2={px(P({ x: 0, y: v })[1])} x1={px(left)} x2={px(right)} />)}
        </g>
        {minX <= 0 && maxX >= 0 && <line x1={px(x0)} x2={px(x0)} y1={px(top - 6)} y2={px(bottom)} stroke={C.ink2} strokeWidth={1.5} />}
        {minY <= 0 && maxY >= 0 && <line y1={px(y0)} y2={px(y0)} x1={px(left)} x2={px(right + 6)} stroke={C.ink2} strokeWidth={1.5} />}
        <g fontSize={10} fill={C.ink2} {...halo}>
          {minY <= 0 && maxY >= 0 && gx.filter((v) => v !== 0 && v % labelStep === 0).map((v) => <text key={`lx${v}`} x={px(P({ x: v, y: 0 })[0])} y={px(y0 + 12)} textAnchor="middle">{fmt(v)}</text>)}
          {minX <= 0 && maxX >= 0 && gy.filter((v) => v !== 0 && v % labelStep === 0).map((v) => <text key={`ly${v}`} x={px(x0 - 4)} y={px(P({ x: 0, y: v })[1] + 3.5)} textAnchor="end">{fmt(v)}</text>)}
        </g>
      </g>
    );
  }

  const polyName = (p: string[]) => `${p.length === 3 ? "triangle" : p.length === 4 ? "quadrilateral" : "polygon"} ${p.join("")}`;
  const aria = [
    "geometry figure",
    ...polygons.map(polyName),
    ...segments.filter((sg) => sg.label || sg.tick || sg.dashed).map((sg) => `${sg.dashed ? "dashed " : ""}segment ${sg.from}${sg.to}${sg.label ? ` labeled ${sg.label}` : ""}${sg.tick ? ` with ${sg.tick} tick mark${sg.tick > 1 ? "s" : ""}` : ""}`),
    ...circles.map((c) => `circle centered at ${c.center} with radius ${fmt(c.r)}`),
    ...angles.map((a) => (a.right ? `right angle at ${a.at}` : `angle ${a.from}${a.at}${a.to}${a.label ? ` labeled ${a.label}` : ""}`)),
  ].join("; ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={aria}>
      {gridEls}
      {circles.map((c, i) => {
        const o = at(c.center);
        return o && c.r > 0 ? <circle key={`c${i}`} cx={px(o[0])} cy={px(o[1])} r={px(c.r * s)} fill={C.shade} fillOpacity={0.12} stroke={C.ink} strokeWidth={2} /> : null;
      })}
      {polygons.map((poly, i) => {
        const pts = poly.map(at).filter((p): p is Pt => !!p);
        return pts.length >= 2 ? <polygon key={`pg${i}`} points={pts.map((p) => `${px(p[0])},${px(p[1])}`).join(" ")} fill={C.shade} fillOpacity={0.22} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" /> : null;
      })}
      {segs.map(({ key, sg, a, b, ticks }) => (
        <g key={`s${key}`}>
          <line x1={px(a[0])} y1={px(a[1])} x2={px(b[0])} y2={px(b[1])} stroke={sg.dashed ? C.ink2 : C.ink} strokeWidth={sg.dashed ? 1.6 : 2} strokeDasharray={sg.dashed ? "6 4" : undefined} strokeLinecap="round" />
          {ticks.map(([p, q], t) => <line key={t} x1={px(p[0])} y1={px(p[1])} x2={px(q[0])} y2={px(q[1])} stroke={C.ink} strokeWidth={1.8} />)}
        </g>
      ))}
      {angleMarks.map(({ key, an, mark }) => <path key={`a${key}`} d={mark} fill="none" stroke={an.right ? C.ink : C.primary} strokeWidth={an.right ? 1.6 : 2} />)}
      {names.filter((k) => !inPolygon.has(k)).map((k) => {
        const p = P(points[k]);
        return <circle key={`d${k}`} cx={px(p[0])} cy={px(p[1])} r={3} fill={C.ink} />;
      })}
      <g fontSize={labelSize} fontWeight={700} textAnchor="middle" {...halo}>
        {segs.map(({ key, sg, label }) => label && <text key={`sl${key}`} x={px(label[0])} y={px(label[1] + labelSize * 0.35)} fill={C.ink}>{sg.label}</text>)}
        {angleMarks.map(({ key, an, label }) => label && <text key={`al${key}`} x={px(label[0])} y={px(label[1] + labelSize * 0.35)} fill={C.primary}>{an.label}</text>)}
        {vertexLabels.map(({ k, at: p }) => <text key={`vl${k}`} x={px(p[0])} y={px(p[1] + 14 * 0.35)} fontSize={14} fontStyle="italic" fill={C.ink}>{k}</text>)}
      </g>
    </svg>
  );
}

// ---------- histogram ----------

function Histogram({ bins, xLabel, yLabel }: Extract<V, { type: "histogram" }>) {
  const W = 360, H = 240 + (xLabel ? 16 : 0);
  const sorted = bins.filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to) && b.to > b.from).sort((a, b) => a.from - b.from);
  const x0 = sorted.length ? sorted[0].from : 0, x1 = sorted.length ? Math.max(...sorted.map((b) => b.to)) : 1;
  const maxC = Math.max(1, ...sorted.map((b) => b.count));
  let step = 1;
  for (const s of [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000]) {
    step = s;
    if (maxC / s <= 6) break;
  }
  const top = Math.ceil(maxC / step) * step;
  const yT = tickValues(0, top, step);
  const yLabW = Math.max(...yT.map((v) => textW(fmt(v), 11)));
  const L = Math.ceil(yLabW + 14 + (yLabel ? 16 : 0)), R = W - 14, T = 14, B = 210;
  const X = (v: number) => L + ((v - x0) / (x1 - x0 || 1)) * (R - L);
  const Y = (v: number) => B - (v / top) * (B - T);
  const edges = [...new Set(sorted.flatMap((b) => [b.from, b.to]))].sort((a, b) => a - b);
  const every = Math.max(1, Math.ceil((edges.length * (Math.max(...edges.map((e) => textW(fmt(e), 11)), 8) + 6)) / (R - L)));
  const aria = `histogram${xLabel ? ` of ${xLabel}` : ""}: ` + sorted.map((b) => `${fmt(b.from)} to ${fmt(b.to)}: ${b.count}`).join(", ") + (yLabel ? `; y-axis ${yLabel}` : "");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={aria}>
      <g stroke={C.line} strokeWidth={1}>
        {yT.map((v) => <line key={v} x1={L} x2={R} y1={px(Y(v))} y2={px(Y(v))} />)}
      </g>
      {sorted.map((b, i) => (
        <rect key={i} x={px(X(b.from))} y={px(Y(b.count))} width={px(X(b.to) - X(b.from))} height={px(B - Y(b.count))} fill={C.shade} fillOpacity={0.55} stroke={C.ink} strokeWidth={1.5} />
      ))}
      <line x1={L} x2={R + 4} y1={B} y2={B} stroke={C.ink} strokeWidth={2} />
      <line x1={L} x2={L} y1={B} y2={T - 6} stroke={C.ink} strokeWidth={2} />
      <g fontSize={11} fill={C.ink2}>
        {yT.map((v) => (
          <g key={v}>
            <line x1={L - 4} x2={L} y1={px(Y(v))} y2={px(Y(v))} stroke={C.ink} />
            <text x={L - 7} y={px(Y(v) + 4)} textAnchor="end">{fmt(v)}</text>
          </g>
        ))}
        {edges.map((e, i) => (
          <g key={e}>
            <line x1={px(X(e))} x2={px(X(e))} y1={B} y2={B + 5} stroke={C.ink} />
            {i % every === 0 && <text x={px(X(e))} y={B + 18} textAnchor="middle">{fmt(e)}</text>}
          </g>
        ))}
      </g>
      {xLabel && <text x={(L + R) / 2} y={H - 8} textAnchor="middle" fontSize={13} fill={C.ink}>{xLabel}</text>}
      {yLabel && <text x={13} y={(T + B) / 2} textAnchor="middle" fontSize={13} fill={C.ink} transform={`rotate(-90 13 ${(T + B) / 2})`}>{yLabel}</text>}
    </svg>
  );
}

// ---------- normal curve ----------

function Normal({ mean, sd: sdIn, shadeFrom, shadeTo, label }: Extract<V, { type: "normal" }>) {
  const sd = sdIn > 0 ? sdIn : 1;
  const W = 360, padX = 18, T = 16, base = 150;
  const lo = mean - 3.5 * sd, hi = mean + 3.5 * sd;
  const X = (v: number) => padX + ((v - lo) / (hi - lo)) * (W - 2 * padX);
  const Y = (v: number) => base - Math.exp(-(((v - mean) / sd) ** 2) / 2) * (base - T);
  const curve = (a: number, b: number, n: number): Pt[] => Array.from({ length: n + 1 }, (_, i) => {
    const v = a + ((b - a) * i) / n;
    return [X(v), Y(v)];
  });
  const shaded = shadeFrom != null || shadeTo != null;
  const a = Math.max(lo, shadeFrom ?? lo), b = Math.min(hi, shadeTo ?? hi);
  const ks = [-3, -2, -1, 0, 1, 2, 3];
  const onTick = (v: number) => Math.abs((v - mean) / sd - Math.round((v - mean) / sd)) < 1e-6 && Math.abs((v - mean) / sd) <= 3 + 1e-6;
  const bounds = [shadeFrom, shadeTo].filter((v): v is number => v != null && Number.isFinite(v) && v > lo && v < hi);
  const extra = bounds.filter((v) => !onTick(v));
  const H = base + 26 + (extra.length ? 16 : 0) + (label ? 20 : 0);
  const near = (v: number) => bounds.some((bv) => Math.abs(bv - v) < sd * 1e-6);
  const aria = `normal curve with mean ${fmt(mean)} and standard deviation ${fmt(sd)}` +
    (shaded && b > a ? `, shaded ${shadeFrom == null ? `below ${fmt(b)}` : shadeTo == null ? `above ${fmt(a)}` : `from ${fmt(a)} to ${fmt(b)}`}` : "") + (label ? `; ${label}` : "");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={aria}>
      {shaded && b > a && <path d={pathOf([[X(a), base], ...curve(a, b, 120), [X(b), base]]) + " Z"} fill={C.shade} fillOpacity={0.45} stroke="none" />}
      <line x1={px(X(mean))} x2={px(X(mean))} y1={base} y2={T} stroke={C.line} strokeWidth={1.2} strokeDasharray="4 4" />
      {bounds.map((v) => <line key={`b${v}`} x1={px(X(v))} x2={px(X(v))} y1={base} y2={px(Y(v))} stroke={C.primary} strokeWidth={2} />)}
      <path d={pathOf(curve(lo, hi, 200))} fill="none" stroke={C.ink} strokeWidth={2.4} strokeLinejoin="round" />
      <line x1={padX - 6} x2={W - padX + 6} y1={base} y2={base} stroke={C.ink} strokeWidth={2} />
      <g fontSize={11} fill={C.ink2}>
        {ks.map((k) => {
          const v = mean + k * sd;
          const hot = near(v);
          return (
            <g key={k}>
              <line x1={px(X(v))} x2={px(X(v))} y1={base} y2={base + 5} stroke={C.ink} />
              <text x={px(X(v))} y={base + 18} textAnchor="middle" fontWeight={hot ? 800 : undefined} fill={hot ? C.primary : undefined}>{fmt(v)}</text>
            </g>
          );
        })}
        {extra.map((v) => (
          <g key={`e${v}`}>
            <line x1={px(X(v))} x2={px(X(v))} y1={base} y2={base + 22} stroke={C.primary} strokeWidth={1.5} />
            <text x={px(X(v))} y={base + 34} textAnchor="middle" fontSize={12} fontWeight={800} fill={C.primary}>{fmt(v)}</text>
          </g>
        ))}
      </g>
      {label && <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={13} fill={C.ink2}>{label}</text>}
    </svg>
  );
}
