import { useState } from "react";

/** Simple four-function calculator (only shown when the parent allows it). */
export function Calculator({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const press = (k: string) => {
    if (k === "C") {
      setExpr("");
      setResult(null);
      return;
    }
    if (k === "⌫") {
      setExpr((e) => e.slice(0, -1));
      return;
    }
    if (k === "=") {
      try {
        const js = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
        if (!/^[\d+\-*/.() ]+$/.test(js)) throw new Error();
        // eslint-disable-next-line no-new-func
        const v = Function(`"use strict"; return (${js})`)() as number;
        setResult(Number.isFinite(v) ? String(Number(v.toFixed(8))) : "Error");
      } catch {
        setResult("Error");
      }
      return;
    }
    if (result !== null && /[\d.]/.test(k)) {
      setExpr(k);
      setResult(null);
      return;
    }
    if (result !== null && result !== "Error") setExpr(result + k);
    else setExpr((e) => e + k);
    setResult(null);
  };
  const keys = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "=", "+", "(", ")", "⌫", "C"];
  return (
    <div className="calc" role="dialog" aria-label="calculator">
      <div className="row" style={{ marginBottom: 6 }}>
        <strong className="grow">Calculator</strong>
        <button className="btn ghost" style={{ padding: "2px 10px" }} onClick={onClose} aria-label="close calculator">✕</button>
      </div>
      <div className="screen">{result ?? (expr || "0")}</div>
      <div className="keys">
        {keys.map((k) => (
          <button key={k} className={"÷×−+=".includes(k) ? "op" : ""} onClick={() => press(k)}>{k}</button>
        ))}
      </div>
    </div>
  );
}
