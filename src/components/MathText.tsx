import { Fragment, type ReactNode } from "react";

// Markup: {a/b} stacked fraction, **bold**, *italic*, ^2 / ^-3 / ^x / ^(x+1) superscripts, _1 / _n / _(n−1) subscripts.
const TOKEN = /(\{[^{}/]+\/[^{}]+\}|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\^\([^()]*\)|\^(?:[-−]?\d+(?:\.\d+)?|[a-zA-Z?θ])|_\([^()]*\)|_(?:\d+|[a-zA-Z]))/g;

export function renderMath(text: string): ReactNode[] {
  const parts = text.split(TOKEN);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith("{") && p.endsWith("}") && p.includes("/")) {
      const inner = p.slice(1, -1);
      const k = inner.indexOf("/");
      return (
        <span className="frac" key={i}>
          <span>{inner.slice(0, k)}</span>
          <span>{inner.slice(k + 1)}</span>
        </span>
      );
    }
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.startsWith("^(")) return <sup key={i}>{p.slice(2, -1).replace(/-/g, "−")}</sup>;
    if (p.startsWith("^")) return <sup key={i}>{p.slice(1).replace("-", "−")}</sup>;
    if (p.startsWith("_(")) return <sub key={i}>{p.slice(2, -1)}</sub>;
    if (p.startsWith("_")) return <sub key={i}>{p.slice(1)}</sub>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function MathText({ text, as = "span", className }: { text: string; as?: "span" | "p" | "div"; className?: string }) {
  const Tag = as;
  return <Tag className={className}>{renderMath(text)}</Tag>;
}

/** Plain-language version for text-to-speech. */
export function speakable(text: string): string {
  return text
    .replace(/\{([^{}/]+)\/([^{}]+)\}/g, "$1 over $2")
    .replace(/\*\*?/g, "")
    .replace(/\^2\b/g, " squared")
    .replace(/\^3\b/g, " cubed")
    .replace(/\^([-−]?\d+|[a-z])/g, " to the power $1")
    .replace(/−/g, " minus ")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/√/g, " square root of ")
    .replace(/≤/g, " less than or equal to ")
    .replace(/≥/g, " greater than or equal to ");
}

export function speak(text: string) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(speakable(text));
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch {
    // Speech isn't available in every browser.
  }
}
