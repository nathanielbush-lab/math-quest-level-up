import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import type { AtRule, Plugin as PostcssPlugin, Rule } from "postcss";

/**
 * Light/dark switch in the app. Every `@media (prefers-color-scheme: dark)` block keeps following
 * the computer's setting unless <html data-appearance="light"> is set, and is also copied out of the
 * media query under <html data-appearance="dark">, so the Teacher corner can force either one.
 */
function appearanceToggle(): PostcssPlugin {
  // :where() adds no specificity, so the cascade (shop themes over skins, etc.) stays exactly as before.
  const onRoot = (sel: string, cond: string) => {
    const add = `:where(${cond})`;
    const t = sel.trim();
    return t.startsWith(":root") ? `:root${add}${t.slice(5)}` : `:root${add} ${t}`;
  };
  const done = new WeakSet<AtRule>();
  return {
    postcssPlugin: "appearance-toggle",
    AtRule: {
      media(at) {
        if (done.has(at) || !/prefers-color-scheme:\s*dark/.test(at.params)) return;
        done.add(at);
        const forced: Rule[] = [];
        at.walkRules((rule) => {
          const parent = rule.parent as AtRule | undefined;
          if (parent?.type === "atrule" && /keyframes/.test(parent.name)) return;
          const copy = rule.clone();
          copy.selectors = rule.selectors.map((s) => onRoot(s, '[data-appearance="dark"]'));
          forced.push(copy);
          rule.selectors = rule.selectors.map((s) => onRoot(s, ':not([data-appearance="light"])'));
        });
        at.after(forced);
      },
    },
  };
}

// `npm run build` makes a normal static site (for GitHub Pages).
// `npm run build:single` makes one self-contained HTML file you can double-click.
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: mode === "single" ? [react(), viteSingleFile()] : [react()],
  css: { postcss: { plugins: [appearanceToggle()] } },
  build: { outDir: mode === "single" ? "dist-single" : "dist", chunkSizeWarningLimit: 900 },
}));
