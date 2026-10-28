# Session Journal — 2026-10-28 — Perry's Intelligent Workbench V1 (`ak:cook --advice --auto`)

## Summary
Completed all 7 phases of [plan.md](../261027-2242-perrys-intelligent-workbench/plan.md) on branch `feat/perrys-agent-workbench-v1` under `kongming` advisory supervision (`FINAL SIGN-OFF GRANTED`).

## Key Technical Lessons & Resolutions
1. **White-Box AST Precedence (`services/perry-engine/core/handcalcs_katex.py`)**: LaTeX braces `{...}` group tokens for macros (`\frac`, `^`) but are visually invisible on screen, so `a - (b + c)` rendered as `{a} - {{b} + {c}}` displays as $a - b + c$. Added `_child()` wrapping `ast.Add`/`ast.Sub` children in `\left(...\right)` whenever they appear under subtraction, multiplication, or unary minus.
2. **PyMuPDF Display-Space vs. Unrotated Coordinates (`services/perry-engine/pdf/figure_detector.py`, `crop_engine.py`)**: Roughly 200 pages of *Perry's 9th Ed.* (notably Section 2 DIPPR tables such as `p. 2-53`) are stored with `page.rotation == 90`. `page.search_for()` and `page.get_drawings()` return coordinates in unrotated space while `page.rect` and `page.get_pixmap(clip=...)` operate in display space. Transforming via `r * page.rotation_matrix` whenever `page.rotation != 0` eliminated zero-height clip raster errors and silent bounding-box drift.
3. **Browser Bundle vs. Native SQLite Boundary (`src/actions/view-screen.ts`, `src/actions/generate-calc-sheet.ts`)**: Kept client-imported action modules 100% browser-safe (zero top-level `better-sqlite3` import) and exposed injectable persister hooks (`setCalcSheetPersister`) registered from Node/Vitest or the Express host server.
