#!/usr/bin/env node
// Single-file builder for the Quick-Calcs gadget (Phase 2, Task 2.4).
//
// Emits ONE self-contained gadget/dist/index.html:
//   1. katex.min.css with EVERY url(fonts/KaTeX_*.woff2) rewritten to a
//      data:font/woff2;base64 URI (woff/ttf alternates dropped);
//   2. the five equations pre-rendered by KaTeX (renderToString, output html)
//      and injected as the KATEX_EQS map consumed by ui.js's data-eq slots;
//   3. gadget/src/{dippr,npsha,ui}.js concatenated in dependency order
//      (export keywords stripped) inside one IIFE — nothing on window;
//   4. a small handwritten stylesheet for the shell.
//
// Zero external references, zero network/storage APIs by construction — the
// builder hard-fails if any of those invariants is violated.
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const katexDist = resolve(repoRoot, 'node_modules', 'katex', 'dist');

// --- 1. Pre-rendered equations ---------------------------------------------
const katexOpts = { output: 'html', displayMode: true, throwOnError: false };
const EQUATIONS = {
  eq101: katex.renderToString(
    String.raw`P_{vp} = \exp\!\left(C_1 + \frac{C_2}{T} + C_3 \ln T + C_4\, T^{C_5}\right)\;\; [\mathrm{Pa}]`,
    katexOpts,
  ),
  eq106: katex.renderToString(
    String.raw`\Delta H_{vap} = C_1 \left(1 - T_r\right)^{C_2 + C_3 T_r + C_4 T_r^2 + C_5 T_r^3}\;\; [\mathrm{J/kmol}]`,
    katexOpts,
  ),
  eq105: katex.renderToString(
    String.raw`\rho_{L} = \frac{C_1}{C_2^{\,1 + \left(1 - T/C_3\right)^{C_4}}}\;\; [\mathrm{kmol/m^3}]`,
    katexOpts,
  ),
  npsha: katex.renderToString(
    String.raw`\mathrm{NPSH}_{A} = \frac{P_{\mathrm{suction,abs}} - P_{vp}}{\rho\, g} + z_{\mathrm{suction}} - h_{f,\mathrm{suction}}\;\; [\mathrm{m}]`,
    katexOpts,
  ),
  gauge: katex.renderToString(
    String.raw`P_{\mathrm{abs}} = P_{\mathrm{gauge}} + P_{\mathrm{atm}}\;\; (P_{\mathrm{atm}} = 14{,}6959\ \mathrm{psia})`,
    katexOpts,
  ),
};

// --- 2. katex.min.css + woff2 inlining -------------------------------------
function inlineFonts(cssText) {
  const inlined = new Set();
  let out = cssText.replace(
    /url\((fonts\/KaTeX_[A-Za-z0-9-]+\.woff2)\)/g,
    (_match, relPath) => {
      inlined.add(relPath);
      const buf = readFileSync(join(katexDist, relPath));
      return `url(data:font/woff2;base64,${buf.toString('base64')})`;
    },
  );
  if (inlined.size === 0) {
    throw new Error('No url(fonts/KaTeX_*.woff2) references found in katex.min.css');
  }
  // Drop the woff/ttf alternates (and their preceding comma) from each src list.
  out = out.replace(
    /,?\s*url\((fonts\/KaTeX_[A-Za-z0-9-]+\.(?:woff|ttf))\)\s*format\("(?:woff|truetype)"\)/g,
    '',
  );
  if (/url\(fonts\//.test(out)) {
    throw new Error('Unresolved url(fonts/...) reference remains after inlining');
  }
  return { css: out, fonts: inlined };
}

const { css: katexCss, fonts: inlinedFonts } = inlineFonts(
  readFileSync(join(katexDist, 'katex.min.css'), 'utf8'),
);

// --- 3. Inline the ES-module sources as one IIFE ----------------------------
function loadSrc(name) {
  const code = readFileSync(join(here, 'src', name), 'utf8');
  // Strip `export ` prefixes so the files concatenate as a classic script.
  const stripped = code.replace(/^export\s+(?=(?:const|let|var|function|class)\b)/gm, '');
  if (/^export\s/m.test(stripped)) {
    throw new Error(`${name}: unsupported export form after stripping`);
  }
  return stripped;
}

const bundle = [
  `const KATEX_EQS = ${JSON.stringify(EQUATIONS)};`,
  loadSrc('dippr.js'),
  loadSrc('npsha.js'),
  loadSrc('ui.js'),
].join('\n');

const script = `(function () {\n'use strict';\n${bundle}\n})();`;

for (const [name, re] of [
  ['inlined JS closing tag', /<\/script/i],
  ['forbidden storage/network API', /\b(fetch\s*\(|localStorage|sessionStorage|document\.cookie)/],
]) {
  if (re.test(script)) throw new Error(`Builder invariant violated: ${name} present`);
}

// --- 4. Shell stylesheet ----------------------------------------------------
const appCss = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body {
  margin: 0; padding: 16px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  font-size: 15px; line-height: 1.45; color: #1c2430; background: #f4f6f9;
}
h1 { font-size: 1.25rem; margin: 0 0 4px; }
.sub { margin: 0 0 14px; color: #5a6675; font-size: .9rem; }
.tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.tab {
  flex: 1; padding: 10px 12px; border: 1px solid #c6cfdb; border-radius: 8px;
  background: #fff; cursor: pointer; font-size: .95rem; color: #35414f;
}
.tab.active { background: #14532d; border-color: #14532d; color: #fff; font-weight: 600; }
.panel {
  background: #fff; border: 1px solid #d4dbe4; border-radius: 10px;
  padding: 14px 16px 16px; max-width: 760px;
}
.panel.hidden, .hidden { display: none; }
.field { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 10px 0; }
.field label { min-width: 190px; color: #35414f; }
.field input, .field select {
  padding: 7px 9px; border: 1px solid #c6cfdb; border-radius: 6px;
  font: inherit; background: #fff; color: #1c2430;
}
.field input { width: 130px; }
.field.row input { width: 130px; }
.hint { color: #6b7686; font-size: .82rem; }
.hint-block {
  background: #eef4fb; border: 1px solid #cadcf0; border-radius: 8px;
  padding: 8px 10px; margin: 8px 0 4px; font-size: .85rem; color: #2c3e57;
}
.warn {
  background: #fff7e6; border: 1px solid #f0d48a; color: #7a5200;
  border-radius: 8px; padding: 8px 10px; margin: 8px 0; font-size: .87rem;
}
.err {
  background: #fdecec; border: 1px solid #efb0b0; color: #8c1d1d;
  border-radius: 8px; padding: 8px 10px; margin: 8px 0; font-size: .87rem;
}
.results { margin-top: 12px; border-top: 1px solid #e3e8ef; padding-top: 6px; }
.res { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; padding: 6px 0; }
.res .k { color: #35414f; min-width: 210px; }
.res .v { font-weight: 600; font-variant-numeric: tabular-nums; }
.res .u { color: #6b7686; }
.res .v2 { color: #6b7686; font-size: .85rem; }
.badge {
  display: inline-block; margin-top: 10px; padding: 7px 12px; border-radius: 8px;
  font-weight: 700; font-size: .9rem; letter-spacing: .2px;
}
.badge.safe { background: #e7f6ec; border: 1px solid #9bd6b0; color: #14532d; }
.badge.danger { background: #fdecec; border: 1px solid #efb0b0; color: #8c1d1d; }
.cite { color: #6b7686; font-size: .8rem; margin-top: 8px; }
.cite.datum { font-variant-numeric: tabular-nums; }
.eq { margin: 10px 0 2px; overflow-x: auto; }
.eq .katex-display { margin: 0.4em 0; font-size: .95em; }
.eq-missing::after { content: '(thiếu phương trình — build lại)'; color: #8c1d1d; font-size: .8rem; }
.foot { margin-top: 14px; color: #6b7686; font-size: .78rem; max-width: 760px; }
`;

// --- 5. Assemble + audit + write --------------------------------------------
const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PVU CHE Quick-Calcs</title>
<style>${katexCss}</style>
<style>${appCss}</style>
</head>
<body>
<div id="app"></div>
<script>${script}</script>
</body>
</html>
`;

const externalRefs = html.match(/(?:src|href)="https?:\/\//);
if (externalRefs) {
  throw new Error('Builder invariant violated: external src/href reference present');
}
if (/url\((?!data:)[^)]*\)/.test(appCss)) {
  throw new Error('Builder invariant violated: non-data url() in app stylesheet');
}

mkdirSync(join(here, 'dist'), { recursive: true });
const outPath = join(here, 'dist', 'index.html');
writeFileSync(outPath, html);
const bytes = statSync(outPath).size;

console.log(`gadget/dist/index.html written: ${bytes} bytes (${(bytes / 1024).toFixed(1)} KiB)`);
console.log(`fonts inlined (woff2): ${inlinedFonts.size} -> ${[...inlinedFonts].sort().join(', ')}`);
console.log(`equations pre-rendered: ${Object.keys(EQUATIONS).join(', ')}`);
if (bytes > 10 * 1024 * 1024) {
  throw new Error('Artifact exceeds the 10 MB budget');
}
