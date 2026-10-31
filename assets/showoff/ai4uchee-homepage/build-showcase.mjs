#!/usr/bin/env node
/**
 * Assembles the self-contained English-only ai4UCheE Showcase & Remotion Guide HTML page
 * (`assets/showoff/ai4uchee-homepage/index.html` and `public/showcase.html`)
 * embedding the compiled ak:diagram fragment (`architecture.fragment.html`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const archFragment = fs
  .readFileSync(path.join(__dirname, 'architecture.fragment.html'), 'utf8')
  .replace('width="100%" height="auto"', 'style="width:100%;height:auto;display:block"');

const buildHtml = (videoSrc) => `<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ai4UCheE — ChemEng's Intelligent Workbench | Feature Showcase &amp; Remotion Guide</title>
  <meta name="description" content="Bi-directional agent-native chemical engineering workbench blending 6 canonical textbooks (Perry's 9th Ed., Fogler 7th Ed., BSL, SVNA, Seader, Crowl) with 55+ interactive SVG nomographs, 24 real-life plant problems, and a Remotion user guide." />
  <link rel="canonical" href="https://chemeng.ai4u.now/" />
  <link rel="alternate" type="text/markdown" href="https://chemeng.ai4u.now/index.md" title="Markdown twin" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ai4UCheE — ChemEng's Intelligent Workbench" />
  <meta property="og:title" content="ai4UCheE — ChemEng's Intelligent Workbench | Feature Showcase &amp; Remotion Guide" />
  <meta property="og:description" content="6-book chemical engineering solver &amp; AI Co-Pilot with 55+ interactive SVG nomographs, 3-stage White-Box KaTeX proofs, and 24 plant problems." />
  <meta property="og:url" content="https://chemeng.ai4u.now/" />
  <meta property="og:image" content="https://chemeng.ai4u.now/og-card.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="ai4UCheE — ChemEng's Intelligent Workbench" />
  <meta name="twitter:description" content="6-book chemical engineering solver &amp; AI Co-Pilot with 55+ interactive SVG nomographs, 3-stage White-Box KaTeX proofs, and 24 plant problems." />
  <meta name="twitter:image" content="https://chemeng.ai4u.now/og-card.png" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23E8C547'/%3E%3Ctext x='32' y='41' text-anchor='middle' font-family='monospace' font-weight='800' font-size='26' fill='%23071A33'%3EChE%3C/text%3E%3C/svg%3E" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://chemeng.ai4u.now/#organization",
          "name": "AI4U.now",
          "url": "https://chemeng.ai4u.now/",
          "logo": "https://chemeng.ai4u.now/ai4u-logo.png"
        },
        {
          "@type": "WebSite",
          "@id": "https://chemeng.ai4u.now/#website",
          "url": "https://chemeng.ai4u.now/",
          "name": "ai4UCheE — ChemEng's Intelligent Workbench",
          "publisher": { "@id": "https://chemeng.ai4u.now/#organization" }
        },
        {
          "@type": "SoftwareApplication",
          "@id": "https://chemeng.ai4u.now/#app",
          "name": "ai4UCheE — ChemEng's Intelligent Workbench",
          "applicationCategory": "EducationalApplication, EngineeringApplication",
          "operatingSystem": "Web",
          "url": "https://chemeng.ai4u.now/app",
          "description": "Bi-directional agent-native chemical engineering workbench blending Perry's 9th Ed., Fogler 7th Ed., Bird-Stewart-Lightfoot 2nd Ed., Smith-Van Ness-Abbott 9th Ed., Seader 4th Ed., and Crowl & Louvar 4th Ed. with 55+ interactive charts and 24 real-life plant problems.",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        }
      ]
    }
  </script>
  <style>
    :root, [data-theme="light"] {
      --navy-deep: #071a33;
      --navy: #0f1b3d;
      --navy-mid: #1e2f5c;
      --maize: #e8c547;
      --maize-soft: #f7dca6;
      --ivory: #fbf6ec;
      --paper: #f5f0e0;
      --bg-canvas: #fbf6ec;
      --bg-panel: #f5f0e0;
      --bg-card: #ffffff;
      --ink-primary: #071a33;
      --ink-muted: #3b455d;
      --border-grid: #dfd6c0;
      --status-pass: #146c32;
      --status-warn: #92400e;
      --status-danger: #991b1b;
      --shadow-lift: 0 1px 2px rgba(7,26,51,0.06), 0 12px 32px -10px rgba(7,26,51,0.14);
      --font-display: 'Cormorant Garamond', 'Georgia', 'Times New Roman', ui-serif, serif;
      --font-sans: 'Karla', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace;
    }
    [data-theme="dark"] {
      --bg-canvas: #071a33;
      --bg-panel: #0f1b3d;
      --bg-card: #15254d;
      --ink-primary: #fbf6ec;
      --ink-muted: #cbd5e1;
      --border-grid: rgba(232, 197, 71, 0.32);
      --status-pass: #4ade80;
      --status-warn: #fbbf24;
      --status-danger: #f87171;
      --shadow-lift: 0 14px 36px rgba(0,0,0,0.45);
    }
    @media (prefers-color-scheme: dark) {
      [data-theme="system"] {
        --bg-canvas: #071a33;
        --bg-panel: #0f1b3d;
        --bg-card: #15254d;
        --ink-primary: #fbf6ec;
        --ink-muted: #cbd5e1;
        --border-grid: rgba(232, 197, 71, 0.32);
        --status-pass: #4ade80;
        --status-warn: #fbbf24;
        --status-danger: #f87171;
      }
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: var(--bg-canvas);
      color: var(--ink-primary);
      font-family: var(--font-sans);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* Top Sticky Masthead */
    .showcase-masthead {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--navy-deep);
      color: var(--ivory);
      border-bottom: 1px solid rgba(232, 197, 71, 0.35);
      padding: 0.55rem 1.25rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.65rem;
      box-shadow: 0 8px 24px rgba(7, 26, 51, 0.28);
    }
    .brand-cluster { display: flex; align-items: center; gap: 0.65rem; }
    .brand-badge {
      width: 34px; height: 34px; border-radius: 8px;
      background: var(--maize); color: var(--navy-deep);
      font-family: var(--font-mono); font-weight: 800; font-size: 0.9rem;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .brand-cluster h1 {
      font-family: var(--font-display);
      font-size: 1.25rem; margin: 0; color: var(--ivory);
    }
    .brand-cluster small {
      display: block; font-size: 0.68rem; color: var(--maize-soft); font-family: var(--font-mono);
    }
    .nav-links { display: flex; flex-wrap: wrap; align-items: center; gap: 0.35rem; }
    .nav-links a, .ctrl-btn {
      font-family: var(--font-sans);
      font-size: 0.78rem; font-weight: 700;
      color: var(--ivory); background: var(--navy);
      border: 1px solid rgba(232, 197, 71, 0.35);
      border-radius: 999px; padding: 0.45rem 0.85rem;
      text-decoration: none; cursor: pointer;
      min-height: 44px; min-width: 44px;
      display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem;
      transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
    }
    .nav-links a:hover, .ctrl-btn:hover, .ctrl-btn.active {
      background: var(--maize); color: var(--navy-deep); border-color: var(--maize);
    }
    .ctrl-btn:focus-visible, .nav-links a:focus-visible, .cta-btn:focus-visible {
      outline: 2px solid var(--maize); outline-offset: 2px;
    }
    .ak-diagram-btn, .ak-diagram-search-input {
      min-height: 44px !important;
      min-width: 44px !important;
    }
    .showcase-footer a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      padding: 0 0.25rem;
      color: var(--maize-soft);
    }

    /* Section Containers — fit cleanly across 16:9, 9:16, and 1:1 viewports */
    .showcase-section {
      min-height: 92vh;
      padding: 2.2rem clamp(1rem, 4vw, 3.5rem);
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-bottom: 1px solid var(--border-grid);
      position: relative;
    }
    .section-inner {
      max-width: 1320px;
      width: 100%;
      margin: 0 auto;
    }
    .eyebrow-pill {
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700;
      padding: 0.25rem 0.75rem; border-radius: 999px;
      background: rgba(232, 197, 71, 0.22);
      border: 1px solid var(--maize);
      color: var(--ink-primary);
      margin-bottom: 0.65rem;
    }
    .section-title {
      font-family: var(--font-display);
      font-size: clamp(1.85rem, 3.4vw, 3.1rem);
      line-height: 1.12;
      margin: 0 0 0.45rem;
      letter-spacing: -0.015em;
    }
    .section-lead {
      font-size: clamp(0.95rem, 1.25vw, 1.12rem);
      max-width: 880px;
      margin: 0 0 1.25rem;
      color: var(--ink-muted);
    }

    /* Grids & Cards */
    .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.15rem; align-items: stretch; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; align-items: stretch; }
    .grid-6 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.85rem; }
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-grid);
      border-radius: 12px;
      padding: 1.1rem 1.25rem;
      box-shadow: var(--shadow-lift);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0;
    }
    .card-navy {
      background: var(--navy-deep);
      color: var(--ivory);
      border: 1.5px solid var(--maize);
    }
    .card h3 {
      font-family: var(--font-display);
      font-size: 1.32rem;
      margin: 0 0 0.35rem;
    }
    .mono-badge {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      background: var(--bg-panel);
      border: 1px solid var(--border-grid);
      color: var(--ink-primary);
      display: inline-block;
    }
    .card-navy .mono-badge {
      background: rgba(232, 197, 71, 0.18);
      border-color: var(--maize);
      color: var(--maize-soft);
    }
    .cta-row { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 1rem; }
    .cta-btn {
      display: inline-flex; align-items: center; gap: 0.45rem;
      font-weight: 800; font-size: 0.9rem;
      padding: 0.6rem 1.15rem; border-radius: 9px;
      text-decoration: none; cursor: pointer;
      border: 1.5px solid var(--maize);
      background: var(--maize); color: var(--navy-deep);
      min-height: 44px;
    }
    .cta-btn.secondary {
      background: var(--navy-deep); color: var(--ivory);
    }

    /* Video Player Frame */
    .video-stage {
      background: var(--navy-deep);
      border: 2px solid var(--maize);
      border-radius: 14px;
      padding: 0.75rem;
      box-shadow: var(--shadow-lift);
    }
    .video-stage video {
      width: 100%;
      max-height: 460px;
      border-radius: 9px;
      display: block;
      background: #071a33;
    }
    .chapter-btn {
      text-align: left;
      width: 100%;
      padding: 0.65rem 0.85rem;
      border-radius: 9px;
      background: var(--bg-card);
      color: var(--ink-primary);
      border: 1px solid var(--border-grid);
      cursor: pointer;
      font-family: var(--font-sans);
      transition: border-color 150ms ease, background 150ms ease;
    }
    .chapter-btn:hover, .chapter-btn.active {
      border-color: var(--maize);
      background: rgba(232, 197, 71, 0.16);
    }

    /* White-Box 3-Stage Demo */
    .stage-pill {
      background: var(--bg-panel);
      border: 1px dashed var(--maize);
      border-radius: 9px;
      padding: 0.65rem 0.8rem;
      margin-top: 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.8rem;
    }
    .card-navy .stage-pill {
      background: var(--navy);
      color: var(--ivory);
    }

    /* Diagram Wrapper */
    .diagram-shell {
      margin-top: 1rem;
      border: 1px solid var(--border-grid);
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
    }

    /* Footnotes Footer */
    .showcase-footer {
      padding: 2rem clamp(1rem, 4vw, 3.5rem);
      background: var(--navy-deep);
      color: var(--ivory);
      font-size: 0.82rem;
    }
    .showcase-footer ol { padding-left: 1.2rem; margin: 0.5rem 0 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.35rem 1.5rem; }

    @media (max-width: 1024px) {
      .grid-2, .grid-3, .grid-6, .showcase-footer ol { grid-template-columns: 1fr; }
      .showcase-section { min-height: auto; padding: 1.75rem 1rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
    }
  </style>
</head>
<body>
  <header class="showcase-masthead">
    <div class="brand-cluster">
      <span class="brand-badge">ChE</span>
      <div>
        <h1>ai4UCheE — ChemEng's Intelligent Workbench</h1>
        <small>6 Canonical Textbooks · 55+ Interactive SVG Charts · 24 Plant Problems</small>
      </div>
    </div>
    <nav class="nav-links" aria-label="Showcase Sections">
      <a href="#hero">01 · Studio</a>
      <a href="#video-guide">02 · Video Guide</a>
      <a href="#six-books-labs">03 · 5 Labs &amp; 6 Books</a>
      <a href="#problem-solving">04 · 24 Plant Problems</a>
      <a href="#whitebox-copilot">05 · White-Box &amp; AI</a>
      <a href="#calc-sheet-cta">06 · EPC Calc Sheet</a>
    </nav>
    <div class="nav-links" role="group" aria-label="Theme and Workbench Controls">
      <button type="button" class="ctrl-btn" id="theme-toggle-btn" onclick="cycleTheme()">☀️ Theme: Light</button>
      <a class="ctrl-btn active" href="/app">🚀 Launch Workbench</a>
    </div>
  </header>

  <main>
    <!-- SECTION 1: HERO -->
    <section id="hero" class="showcase-section">
      <div class="section-inner">
        <span class="eyebrow-pill">✨ SOVEREIGN CHEMICAL ENGINEERING WORKBENCH · 1 BAR · 1 CANVAS · 1 AGENT</span>
        <h2 class="section-title">Where 6 Canonical Chemical Engineering Textbooks Meet an Agent-Native Interactive Studio.</h2>
        <p class="section-lead">
          <strong>ai4UCheE</strong> pairs <em>Perry's 9th Ed.</em>, <em>Fogler 7th Ed.</em>, <em>Bird-Stewart-Lightfoot</em>, <em>Smith-Van Ness-Abbott</em>, <em>Seader</em>, and <em>Crowl &amp; Louvar</em> with <strong>55+ bi-directional SVG nomographs</strong>, <strong>3-Stage White-Box KaTeX proofs</strong>, and <strong>24 real-life plant problems</strong>.
        </p>

        <div class="grid-2">
          <div class="card card-navy">
            <div>
              <span class="mono-badge">3-ZONE AI-NATIVE STUDIO ARCHITECTURE</span>
              <h3 style="margin-top:0.55rem; color: var(--maize);">1 Top Studio Bar · 1 Interactive SVG Canvas · 1 Sticky AI Co-Pilot</h3>
              <ul style="padding-left: 1.2rem; margin: 0.5rem 0; font-size: 0.92rem;">
                <li><strong>Zone 1 (Top Bar):</strong> Switch 5 Subject Labs, launch 24 L1–L4 Plant Problems, toggle <code>🎓 Learn</code> ↔ <code>🏭 Plant</code>, or open <code>📐 Charts</code> &amp; <code>📄 Calc Sheet</code>.</li>
                <li><strong>Zone 2 (Engineering Canvas):</strong> Drag duty points on SVG curves and scrub 34px number dials with zero-latency client solvers.</li>
                <li><strong>Zone 3 (AI Co-Pilot):</strong> Live <code>&lt;current-screen&gt;</code> sync, <code>+ Ask</code> chips, and natural-language slider mutations.</li>
              </ul>
            </div>
            <div class="cta-row">
              <a class="cta-btn" href="/app">🚀 Launch Live Workbench (/app)</a>
              <a class="cta-btn secondary" href="#video-guide">🎬 Watch 5-Step Video Guide</a>
            </div>
          </div>

          <div class="card">
            <div>
              <span class="mono-badge">6 CANONICAL REFERENCE TEXTBOOKS INDEXED</span>
              <h3 style="margin-top:0.55rem;">Every Equation &amp; Chart Grounded in Verbatim Page Citations</h3>
              <div class="grid-6" style="margin-top: 0.65rem;">
                <div class="stage-pill"><strong>1. Perry's 9th Ed.</strong><br/>25 Sections · 2,274 pp. PDF<br/><code>[Sec 1–25 + S-P Index]</code></div>
                <div class="stage-pill"><strong>2. Fogler 7th Ed.</strong><br/>Reaction Engineering<br/><code>[19 Ch. EPUB · CSTR/PFR]</code></div>
                <div class="stage-pill"><strong>3. BSL Revised 2nd Ed.</strong><br/>Transport Phenomena<br/><code>[Momentum · Heat · Mass]</code></div>
                <div class="stage-pill"><strong>4. SVNA 9th Ed.</strong><br/>ChE Thermodynamics<br/><code>[VLE · Cubic EOS · Cycles]</code></div>
                <div class="stage-pill"><strong>5. Seader 4th Ed.</strong><br/>Separation Principles<br/><code>[McCabe · Kremser · LLE]</code></div>
                <div class="stage-pill"><strong>6. Crowl &amp; Louvar 4e</strong><br/>Process Safety<br/><code>[Semenov · LOC · Reliefs]</code></div>
              </div>
            </div>
            <div style="margin-top: 0.75rem; font-family: var(--font-mono); font-size: 0.78rem; color: var(--status-pass); font-weight: 700;">
              ✓ DoF = 0 Verified · Explicit psig ↔ psia · Explicit Fanning f_F vs. Darcy f_D = 4·f_F
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 2: REMOTION VIDEO GUIDE -->
    <section id="video-guide" class="showcase-section">
      <div class="section-inner">
        <span class="eyebrow-pill">🎬 PROGRAMMATIC REMOTION VIDEO GUIDE · 1920×1080 · 30 FPS</span>
        <h2 class="section-title">Master the Workbench in 5 Guided Video Chapters.</h2>
        <p class="section-lead">
          Rendered with <code>/ak:remotion</code> in React—click any chapter on the right to seek the video directly to that workflow step.
        </p>

        <div class="grid-2">
          <div class="video-stage">
            <video id="guide-video-el" src="${videoSrc}" controls playsinline preload="metadata"></video>
            <div style="display:flex; justify-content:space-between; align-items:center; color:var(--ivory); padding: 0.5rem 0.35rem 0.1rem; font-family:var(--font-mono); font-size:0.78rem;">
              <span id="video-status-label">▶ Chapter 01 · 3-Zone AI-Native Studio (00:00)</span>
              <span>1920×1080 H.264 · Remotion 4</span>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.55rem; justify-content:space-between;">
            <button type="button" class="chapter-btn active" onclick="seekGuideVideo(0, 'Chapter 01 · 3-Zone AI-Native Studio (00:00)', this)">
              <strong>01 · 00:00 — 3-Zone AI-Native Studio ("1 Bar · 1 Canvas · 1 Agent")</strong>
              <div style="font-size:0.82rem; margin-top:0.2rem; color:var(--ink-muted);">Overview of the Top Studio Masthead, Interactive SVG Canvas, and Sticky Co-Pilot Inspector.</div>
            </button>
            <button type="button" class="chapter-btn" onclick="seekGuideVideo(3, 'Chapter 02 · Dual Persona & 5 Subject Labs (00:03)', this)">
              <strong>02 · 00:03 — Dual Persona (🎓 Learn ↔ 🏭 Plant) &amp; 5 Subject Labs</strong>
              <div style="font-size:0.82rem; margin-top:0.2rem; color:var(--ink-muted);">Switch between Socratic student coaching and 3-case EPC plant engineering across WB2–WB6.</div>
            </button>
            <button type="button" class="chapter-btn" onclick="seekGuideVideo(6, 'Chapter 03 · 24 Plant Problems & Fogler 6-Stage Flow (00:06)', this)">
              <strong>03 · 00:06 — 24 Real-Life Plant Problems &amp; Fogler 6-Stage Detective Board</strong>
              <div style="font-size:0.82rem; margin-top:0.2rem; color:var(--ink-muted);">Walk through Observation, K-T IS/IS NOT, Theory, Handbook, and Rule #12 Hypothesis Falsification.</div>
            </button>
            <button type="button" class="chapter-btn" onclick="seekGuideVideo(9, 'Chapter 04 · Interactive SVG Scrubbing & 3-Stage Proofs (00:09)', this)">
              <strong>04 · 00:09 — Interactive SVG Handle Scrubbing &amp; 3-Stage White-Box Proofs</strong>
              <div style="font-size:0.82rem; margin-top:0.2rem; color:var(--ink-muted);">Drag Pump P-101 out of cavitation while inspecting Symbolic → Substituted → Result KaTeX cards.</div>
            </button>
            <button type="button" class="chapter-btn" onclick="seekGuideVideo(12, 'Chapter 05 · AI Co-Pilot & Senior EPC QA/QC Sheet (00:12)', this)">
              <strong>05 · 00:12 — Point-and-Ask (+ Ask), What-If Mutations &amp; EPC QA/QC Export</strong>
              <div style="font-size:0.82rem; margin-top:0.2rem; color:var(--ink-muted);">Attach context chips, mutate sliders in plain English, and export a Rev 0 QA/QC Calculation Sheet.</div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3: 5 SUBJECT WORKBENCHES + 25-SECTION PERRY ATLAS -->
    <section id="six-books-labs" class="showcase-section">
      <div class="section-inner">
        <span class="eyebrow-pill">🔧 5 SUBJECT WORKBENCHES + CROSS-SUBJECT CHARTS VERIFIER</span>
        <h2 class="section-title">Every Core Chemical Engineering Subject—Interactive &amp; Citation-Backed.</h2>

        <div class="grid-3">
          <div class="card">
            <div>
              <span class="mono-badge">SUBJECT 1 · WB2</span>
              <h3>Thermodynamics, Phase Equilibria &amp; DIPPR</h3>
              <p style="font-size:0.86rem; margin:0.35rem 0;">Exact DIPPR Eq. 101/106 correlations, Carlson property decision tree, Binary VLE <em>T-x-y</em> Azeotrope Explorer, Peng-Robinson EOS <em>Z(P_r, T_r)</em> dome, and Rankine/Van 't Hoff cycles.</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-top:0.5rem;">
              <div class="stage-pill" style="margin-top:0; flex:1;">[Perry's 9e Table 2-8, p. 2-53 · SVNA 9e]</div>
              <a class="ctrl-btn" href="/app?wb=wb2-thermo-dippr">Open Lab →</a>
            </div>
          </div>

          <div class="card">
            <div>
              <span class="mono-badge">SUBJECT 2 · WB3</span>
              <h3>Fluid Mechanics, Transport &amp; Piping Hydraulics</h3>
              <p style="font-size:0.86rem; margin:0.35rem 0;">Commercial Sch 40/80 pipe sizing, explicit <em>f_D = 4·f_F</em> guardrail, 3-case pump <em>NPSH_A</em> vs. <em>NPSH_R</em>, BSL Non-Newtonian velocity profiles, ISA-75.01 valves, and Bowman <em>F_T</em> heat exchangers.</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-top:0.5rem;">
              <div class="stage-pill" style="margin-top:0; flex:1;">[Perry's 9e Fig. 6-9, p. 6-10 · BSL Ch. 2]</div>
              <a class="ctrl-btn" href="/app?wb=wb3-hydraulics">Open Lab →</a>
            </div>
          </div>

          <div class="card">
            <div>
              <span class="mono-badge">SUBJECT 3 · WB4</span>
              <h3>Separations, McCabe-Thiele &amp; Column Hydraulics</h3>
              <p style="font-size:0.86rem; margin:0.35rem 0;">Bi-directional 5-handle McCabe-Thiele canvas, Fenske-Underwood-Gilliland shortcuts, Fair's Souders-Brown flooding, Eckert GPDC, Kremser <em>N_OG</em> absorption, and Ternary LLE.</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-top:0.5rem;">
              <div class="stage-pill" style="margin-top:0; flex:1;">[Seader 4e Ch. 6–8 · Perry's 9e p. 14-37]</div>
              <a class="ctrl-btn" href="/app?wb=wb4-distillation">Open Lab →</a>
            </div>
          </div>

          <div class="card">
            <div>
              <span class="mono-badge">SUBJECT 4 · WB6</span>
              <h3>Kinetics, Catalysis &amp; Chemical Reactor Design</h3>
              <p style="font-size:0.86rem; margin:0.35rem 0;">Interactive Levenspiel CSTR rectangle vs. PFR integral plot, Ergun PBR pressure drop, Thiele modulus <em>φ</em> &amp; effectiveness <em>η</em>, Semenov thermal runaway S-curve, LHHW &amp; Butler-Volmer.</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-top:0.5rem;">
              <div class="stage-pill" style="margin-top:0; flex:1;">[Fogler 7e Ch. 2, 5, 12, 15 · Crowl 4e]</div>
              <a class="ctrl-btn" href="/app?wb=wb6-kinetics-reactors">Open Lab →</a>
            </div>
          </div>

          <div class="card">
            <div>
              <span class="mono-badge">SUBJECT 5 · WB5</span>
              <h3>25-Section Perry Atlas &amp; 6-Book Search</h3>
              <p style="font-size:0.86rem; margin:0.35rem 0;">Dedicated interactive SVG solvers for all 25 sections of <em>Perry's 9th Ed.</em> (from Unit Conversions &amp; Economics to API 520 Relief Sizing &amp; Corrosion PREN) plus Back-of-Book Index (pp. 2244–2274).</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-top:0.5rem;">
              <div class="stage-pill" style="margin-top:0; flex:1;">[Perry's 9e Sec 1–25 · pp. 2244–2274]</div>
              <a class="ctrl-btn" href="/app?wb=wb5-handbook-atlas">Open Lab →</a>
            </div>
          </div>

          <div class="card card-navy">
            <div>
              <span class="mono-badge">UTILITY TOOL · WB1</span>
              <h3 style="color:var(--maize);">📐 10 Calibrated Nomographs &amp; High-DPI Verifier</h3>
              <p style="font-size:0.86rem; margin:0.35rem 0;">Cross-subject header utility auto-syncing the active lab's chart (<code>6-10</code> Moody, <code>14-37</code> Fair, <code>14-57</code> Eckert, <code>2-53</code> DIPPR, <code>19-6</code> Levenspiel, <code>6-52</code> Sphere Drag, <code>4-18</code> Lee-Kesler, <code>15-10</code> Thiele, <code>14-15</code> Kremser, <code>23-42</code> Semenov).</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-top:0.5rem;">
              <div class="stage-pill" style="margin-top:0; flex:1;">✓ DeepTutor Chart Verifier</div>
              <a class="ctrl-btn active" href="/app?wb=wb1-visual-verifier">Open Charts →</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 4: PROBLEM-FIRST 6-STAGE FOGLER & LEBLANC FLOW -->
    <section id="problem-solving" class="showcase-section">
      <div class="section-inner">
        <span class="eyebrow-pill">🕵️ 24 REAL-LIFE PLANT PROBLEMS · FOGLER &amp; LEBLANC 6-STAGE FLOW</span>
        <h2 class="section-title">Start from a Real Plant Upset—Not a Disconnected Textbook Formula.</h2>

        <div class="grid-2">
          <div class="card">
            <div>
              <span class="mono-badge">4 ENGINEERING PROGRESSION TIERS (24 PROBLEMS)</span>
              <h3 style="margin-top:0.5rem;">From Unit-Conversion Traps to Coupled Runaway Hazards</h3>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.65rem; margin-top:0.65rem;">
                <div class="stage-pill">
                  <strong>🌱 Tier L1 · Unit/Concept Trap</strong><br/>
                  Catch 4× Fanning/Darcy &amp; psig/psia datum traps before sizing equipment.
                </div>
                <div class="stage-pill">
                  <strong>🔧 Tier L2 · Equipment Bottleneck</strong><br/>
                  Resolve Pump P-101 suction cavitation &amp; sieve-tray flooding bottlenecks.
                </div>
                <div class="stage-pill">
                  <strong>🕵️ Tier L3 · Multi-Hypothesis Upset</strong><br/>
                  Diagnose Fogler Ch. 10 Boiler Feedwater Heater drop (70°C → 42°C) with ⏱️ Δt clues.
                </div>
                <div class="stage-pill">
                  <strong>🚨 Tier L4 · Coupled Safety/Design</strong><br/>
                  Stabilize Semenov reactor runaway (ψ &gt; 1/e) &amp; API 520 relief sizing.
                </div>
              </div>
            </div>
            <div style="margin-top:0.75rem; font-family:var(--font-mono); font-size:0.78rem;">
              8 Equipment Categories · 5 Symptom Archetypes · Multi-Student Adaptive Scorecard
            </div>
          </div>

          <div class="card card-navy">
            <div>
              <span class="mono-badge">FOGLER RULE #12 · HYPOTHESIS FALSIFICATION STUDIO</span>
              <h3 style="margin-top:0.5rem; color:var(--maize);">The 6-Stage Creative Problem-Solving Checklist</h3>
              <ol style="padding-left:1.25rem; margin:0.5rem 0; font-size:0.88rem; line-height:1.55;">
                <li><strong>Stage 1 · Problem Observation:</strong> Inspect Normal vs. Faulty plant telemetry &amp; <code>⏱️ Δt</code> temporal clues.</li>
                <li><strong>Stage 2 · Problem Definition:</strong> Kepner-Tregoe <code>IS / IS NOT</code> matrix &amp; Real Root Problem statement.</li>
                <li><strong>Stage 3 · Fundamental Theory:</strong> Cite governing transport, thermodynamic, or kinetic equations.</li>
                <li><strong>Stage 4 · Applicable Handbook:</strong> Verify empirical parameters against <em>Perry's 9th Ed.</em> page crops.</li>
                <li><strong>Stage 5 · Hypotheses (Prove ✅ / Disprove ❌):</strong> Enforce Rule #12 (<em>"seek to reject as well as to accept"</em>).</li>
                <li><strong>Stage 6 · Actual Solution Verified:</strong> Restore safe plant margins &amp; earn a <code>FOG-WB*-DIY-XXXXXX</code> stamp.</li>
              </ol>
            </div>
            <div class="stage-pill">✓ DIY Solve (+35% Mastery) · 💡 Socratic Hint · 🔧 Auto-Fix Rescue (+12% Mastery)</div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 5: WHITE-BOX RIGOR, ERROR GUARDRAILS & SYSTEM ARCHITECTURE DIAGRAM -->
    <section id="whitebox-copilot" class="showcase-section">
      <div class="section-inner">
        <span class="eyebrow-pill">📐 WHITE-BOX PROOFS · ERROR-SIGNATURE DETECTOR · SYSTEM TOPOLOGY</span>
        <h2 class="section-title">3-Stage White-Box Proofs &amp; Validated Agent-Native System Architecture.</h2>

        <div class="grid-3" style="margin-bottom: 1rem;">
          <div class="card">
            <span class="mono-badge">STAGE 1 · SYMBOLIC EQUATION</span>
            <h3 style="margin-top:0.4rem;">Exact First-Principles Form</h3>
            <div class="stage-pill">f_D = 4 · f_F &nbsp;|&nbsp; NPSH_A = (P_suc,abs - P_vp)/(ρg) + z_s - h_f,s</div>
            <p style="font-size:0.82rem; margin:0.4rem 0 0;">Every equation states its symbol basis and textbook equation number before any numbers are plugged in.</p>
          </div>
          <div class="card">
            <span class="mono-badge">STAGE 2 · SUBSTITUTED WITH UNITS</span>
            <h3 style="margin-top:0.4rem;">Explicit Unit &amp; Datum Guardrails</h3>
            <div class="stage-pill">P_suc,abs = 15.0 psig + 14.696 psi = 29.70 psia · T = 373.15 K</div>
            <p style="font-size:0.82rem; margin:0.4rem 0 0;">Automatic ChE Error-Signature Detector flags <code>4×</code> Fanning/Darcy, <code>±14.7 psi</code> gauge/abs, <code>±273.15</code> K/°C, and <code>2.303×</code> ln/log10 mistakes.</p>
          </div>
          <div class="card">
            <span class="mono-badge">STAGE 3 · EVALUATED RESULT &amp; CITATION</span>
            <h3 style="margin-top:0.4rem;">Deterministic Verdict Badge</h3>
            <div class="stage-pill" style="color:var(--status-pass); font-weight:700;">NPSH_A = 21.82 m ≥ NPSH_R (3.0 m) → SAFE [Perry's 9e p. 10-28]</div>
            <p style="font-size:0.82rem; margin:0.4rem 0 0;">Click <code>📖 Cite Stage 3 Theory</code> or <code>+ Ask</code> on any card to send the live proof straight into the AI Co-Pilot.</p>
          </div>
        </div>

        <!-- Embedded ak:diagram Interactive Architecture Reader -->
        <div class="diagram-shell" aria-label="Interactive System Architecture Diagram">
          ${archFragment}
        </div>
      </div>
    </section>

    <!-- SECTION 6: SENIOR EPC QA/QC CALC SHEET & LAUNCH CTA -->
    <section id="calc-sheet-cta" class="showcase-section">
      <div class="section-inner">
        <span class="eyebrow-pill">📄 SENIOR EPC QA/QC CALCULATION SHEETS · AX / GEO READY</span>
        <h2 class="section-title">From Classroom Intuition to Print-Ready EPC Deliverables.</h2>

        <div class="grid-2">
          <div class="card">
            <div>
              <span class="mono-badge">REV 0 — ISSUED FOR REVIEW · SQLITE PERSISTED</span>
              <h3 style="margin-top:0.5rem;">One-Click Senior Engineer Calculation Sheet Compiler</h3>
              <p style="font-size:0.9rem;">Click <code>📄 Calc Sheet</code> in the studio header to compile a complete QA/QC package containing:</p>
              <ul style="padding-left:1.2rem; font-size:0.88rem; line-height:1.55;">
                <li><strong>Document Control Header:</strong> Equipment Tag (<code>P-101A/B</code>, <code>T-201-DIST</code>, <code>R-401-PBR</code>), Revision <code>Rev 0</code>, and Basis of Design.</li>
                <li><strong>3-Case Operating Matrix:</strong> 70% Turndown, 100% Normal, and 120% Design/Relief cases.</li>
                <li><strong>3-Stage White-Box Derivations &amp; 6-Stage Root-Cause Audit:</strong> Complete with Fogler Detective Stamp &amp; Markdown download.</li>
              </ul>
            </div>
            <div class="stage-pill">✓ Persisted to SQLite <code>saved_calculations</code> · Printable &amp; Markdown Exportable</div>
          </div>

          <div class="card card-navy">
            <div>
              <span class="mono-badge">READY TO SOLVE? · START IN 1 CLICK</span>
              <h3 style="margin-top:0.5rem; color:var(--maize);">Explore ai4UCheE Live or Share with Any AI Agent</h3>
              <p style="font-size:0.9rem;">Built with full AI-Experience (AX) discovery surfaces (<code>/index.md</code>, <code>/llms.txt</code>, <code>/llms-full.txt</code>) and a header <code>🔗 Share / AI</code> menu for ChatGPT, Claude, and Perplexity.</p>
            </div>
            <div class="cta-row">
              <a class="cta-btn" href="/app">🚀 Open Interactive Workbench (/app)</a>
              <a class="cta-btn secondary" href="/index.md">📄 View Markdown Twin (/index.md)</a>
              <a class="cta-btn secondary" href="/llms-full.txt">🤖 Read /llms-full.txt</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="showcase-footer">
    <strong>References &amp; Canonical Textbook Citations (ai4UCheE · https://chemeng.ai4u.now)</strong>
    <ol>
      <li>Green, D. W., &amp; Southard, M. Z. (2019). <em>Perry's Chemical Engineers' Handbook</em> (9th ed.). McGraw-Hill. <a href="https://www.accessengineeringlibrary.com/content/book/9780071834087" target="_blank" rel="noreferrer">AccessEngineering</a></li>
      <li>Fogler, H. S., Goldsmith, B. R., Nikolla, E., &amp; Singh, N. (2025). <em>Elements of Chemical Reaction Engineering</em> (7th ed.). Pearson. <a href="https://www.pearson.com/en-us/subject-catalog/p/elements-of-chemical-reaction-engineering/P200000010287" target="_blank" rel="noreferrer">Pearson Catalog</a></li>
      <li>Fogler, H. S., &amp; LeBlanc, S. E. (2008). <em>Strategies for Creative Problem Solving</em> (2nd ed.). Prentice Hall. <a href="https://umich.edu/~scps/" target="_blank" rel="noreferrer">UMich SCPS</a></li>
      <li>Bird, R. B., Stewart, W. E., &amp; Lightfoot, E. N. (2006). <em>Transport Phenomena</em> (Revised 2nd ed.). Wiley. <a href="https://www.wiley.com/en-us/Transport+Phenomena%2C+Revised+2nd+Edition-p-9780470115398" target="_blank" rel="noreferrer">Wiley</a></li>
      <li>Smith, J. M., Van Ness, H. C., Abbott, M. M., &amp; Swihart, M. T. (2021). <em>Introduction to Chemical Engineering Thermodynamics</em> (9th ed.). McGraw-Hill.</li>
      <li>Seader, J. D., Henley, E. J., &amp; Roper, D. K. (2016). <em>Separation Process Principles</em> (4th ed.). Wiley. · Crowl, D. A., &amp; Louvar, J. F. (2019). <em>Chemical Process Safety</em> (4th ed.). Pearson.</li>
    </ol>
  </footer>

  <script>
    var themes = ['light', 'dark', 'system'];
    var themeIdx = 0;
    function cycleTheme() {
      themeIdx = (themeIdx + 1) % themes.length;
      var next = themes[themeIdx];
      document.documentElement.setAttribute('data-theme', next);
      var btn = document.getElementById('theme-toggle-btn');
      var icons = { light: '☀️ Theme: Light', dark: '🌙 Theme: Dark', system: '💻 Theme: System' };
      if (btn) btn.textContent = icons[next];
      var diag = document.querySelector('.ak-diagram-root');
      if (diag) diag.setAttribute('data-theme', next === 'dark' ? 'dark' : 'light');
    }
    function seekGuideVideo(sec, label, btnEl) {
      var v = document.getElementById('guide-video-el');
      if (v) {
        v.currentTime = sec;
        v.play().catch(function(){});
      }
      var status = document.getElementById('video-status-label');
      if (status) status.textContent = '▶ ' + label;
      document.querySelectorAll('.chapter-btn').forEach(function(b) { b.classList.remove('active'); });
      if (btnEl) btnEl.classList.add('active');
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), buildHtml('./ai4uchee-guide.mp4'), 'utf8');
fs.writeFileSync(path.join(repoRoot, 'public/showcase.html'), buildHtml('/ai4uchee-guide.mp4'), 'utf8');
console.log('Built English-only assets/showoff/ai4uchee-homepage/index.html and public/showcase.html');
