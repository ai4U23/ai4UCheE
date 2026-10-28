---
title: "Phase 2: Perry's 9th Ed. 25-Section Indexer, PyMuPDF Visual Crop Engine & Dual-Track Chart Verifier (WB1)"
status: todo
---

# Phase 2: Perry's 9th Ed. 25-Section Indexer, PyMuPDF Visual Crop Engine & Dual-Track Chart Verifier (WB1)

## Overview

Build the deterministic `Sec-Page` (`S-P`, e.g., `2-165`, `6-10`, `13-28`, `14-55`) to PDF page resolver across all 25 sections + Alphabetical Index (`pp. 2244–2274`) of *Perry's 9th Ed.*, implement the `get_drawings() >= 8` vector figure detector, high-DPI bounding-box & composite table header+row crop engine with calibrated SVG crosshair overlay (`x, y`), and expose Workbench 1 (`VisualVerifierWorkbench`) with `DeepTutor`-style interactive chart-reading practice (including the `fanning_darcy_4x_detected` coaching diagnostic). Every code file MUST remain `< 200` lines.

## Requirements

- [ ] 25-Section + Index (`pp. 2244–2274`) offset cache and `resolve_sec_page()` verifier (`pdf/section_map.py`) with `±2` page header/footer token confirmation (`verified_header: True`).
- [ ] `PyMuPDF` vector figure detector (`len(page.get_drawings()) >= 8`), high-DPI calibrated crop renderer, and **Composite Table Header + Highlighted Row Cropper** (`pdf/crop_engine.py`).
- [ ] FastAPI PDF router (`routers/pdf_router.py`) exposing `/api/v1/pdf/resolve`, `/api/v1/pdf/search-index`, `/api/v1/pdf/crop`, and `/api/v1/pdf/verify-chart-reading` (with `fanning_darcy_4x_detected` diagnostic when a user enters $4 \times f_F$ on Fig. 6-9).
- [ ] Workbench 1 frontend (`src/components/workbenches/visual-verifier-workbench.tsx`) & Zod action (`src/actions/search-perry-pdf.ts`).

## Implementation Steps

### Task 2.1 — Implement 25-Section Offset Map & `Sec-Page` Resolver (`pdf/section_map.py`)
- **Goal**: Build `services/perry-engine/pdf/section_map.py` (`< 200` lines) that dynamically scans and caches the exact starting PDF page for all 25 sections + Index (`pp. 2244–2274`) from `/Users/nad/ai4u/ai4UCheE/Perry's Chemical Engineers' Handbook, 9th Edition.pdf` and resolves any `S-P` string (e.g., `"6-10"`, `"14-55"`) to its exact 1-based PDF page number and vice versa.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/pdf/section_map.py` (`SECTION_TITLES`, `build_or_load_section_offsets()`, `resolve_sec_page()`, `resolve_pdf_page_to_sec_page()`, `search_index_entries()`, `verify_page_contains()`)
- **Steps**:
  1. Define `SECTION_TITLES` dictionary mapping sections `1` through `25` to their canonical *Perry's 9th Ed.* titles (Sec 1: *Conversion Factors and Mathematical Symbols*, Sec 2: *Physical and Chemical Data*, Sec 3: *Mathematics*, Sec 4: *Thermodynamics*, Sec 5: *Heat and Mass Transfer*, Sec 6: *Fluid and Particle Dynamics*, Sec 7: *Reaction Kinetics*, Sec 8: *Process Control*, Sec 9: *Process Economics*, Sec 10: *Transport and Storage of Fluids*, Sec 11: *Heat-Transfer Equipment*, Sec 12: *Psychrometry, Evaporative Cooling, and Solids Drying*, Sec 13: *Distillation*, Sec 14: *Equipment for Distillation, Gas Absorption, Phase Dispersion, and Phase Separation*, Sec 15: *Liquid-Liquid Extraction and Other Liquid-Liquid Operations*, Sec 16: *Adsorption and Ion Exchange*, Sec 17: *Gas-Solid Operations and Equipment*, Sec 18: *Liquid-Solid Operations and Equipment*, Sec 19: *Reactors*, Sec 20: *Bioreactions and Bioprocessing*, Sec 21: *Solids Processing and Particle Technology*, Sec 22: *Waste Management*, Sec 23: *Process Safety*, Sec 24: *Energy Resources, Conversion, and Utilization*, Sec 25: *Materials of Construction*) plus `"Index": (2244, 2274)`. (Titles verified against the live PDF TOC in Validation Session 1 + kongming Phase-2 checkpoint — the 9th Ed. TOC is flat: 30 level-1 entries = 4 front-matter + 25 sections + Index; Sec 1 is *Unit Conversion Factors and Symbols* per the TOC, though its first printed page 1-1 is headed "UNITS AND SYMBOLS".)
  2. Implement `build_or_load_section_offsets(pdf_path: str)` reading the PDF TOC first (`doc.get_toc()` — verified to return 30 entries covering all 25 section start pages, e.g. Sec 2 → pdf p. 36, Sec 6 → p. 584, Sec 14 → p. 1234) and falling back to scanning running header/footer tokens matching `^\s*(\d{1,2})-1\s*$`. **TOC alignment strategy (kongming Phase-2 checkpoint): the TOC is flat (all level 1) and titles drift from print (en-dashes, trailing spaces, renamed sections), so align by ORDER, not by title**: drop the 4 front-matter entries (Cover/Title Page/Copyright/Contents), assign the next 25 entries in order to sections 1..25, and treat the last entry (p. 2244) as the Index — with a normalized fuzzy title sanity check (lowercase/strip/keyword containment) that *warns* instead of raising. Cache the resulting JSON map (`services/perry-engine/pdf/section_offsets_cache.json`, stamped with PDF size+mtime for staleness) mapping each section `S` (`1..25`) to its 1-based starting PDF page `pdf_start_page`.
  3. Implement `resolve_sec_page(sec_page: str) -> dict` that parses `"S-P"` (e.g. `"6-10"`), computes `pdf_page = section_start[S] + (P - 1)`, then verifies by searching the **whole page text** (`doc[pdf_page - 1].get_text("text")`) for the token `f"{S}-{P}"` — header, footer, or caption region (only ~280 of 2,274 pages expose a clean header-line token, so whole-page search is the primary check; use a `±2` page local window scan as fallback when the exact page has no text token, e.g. image-heavy table pages). Return `{"sec_page": "6-10", "section": 6, "section_title": "Fluid and Particle Dynamics", "page_in_section": 10, "pdf_page_1based": int, "verified_header": bool}` where `verified_header` means "token confirmed on the resolved page (or its ±2 window)".
  4. Implement `search_index_entries(query: str, max_results: int = 15) -> list[dict]` scanning PDF pages `2244..2274` (and matching section pages) for `query` and extracting referenced `S-P` coordinates with regex `\b([1-9]|1\d|2[0-5])-(\d{1,3})\b`.
  5. Implement `verify_page_contains(sec_page: str, token: str) -> bool` resolving `sec_page` and returning whether `token` (e.g. `"TABLE 2-8"`, `"FIG. 14-32"`) appears in that page's text — the shared citation-verification primitive used by the Phase 4/5/6 test suites.
- **Success criteria**: `resolve_sec_page("6-10")` resolves to pdf page `593` (whose text contains `FIG. 6-9`), `resolve_sec_page("2-53")` resolves to the `TABLE 2-8` vapor-pressure page, and `resolve_sec_page("14-37")` resolves to pdf page `1270` (whose text contains `FIG. 14-32`).
- **Verify**: `PYTHONPATH=/Users/nad/ai4u/ai4UCheE/services/perry-engine /Users/nad/ai4u/ai4UCheE/services/perry-engine/.venv/bin/python -c "from pdf.section_map import resolve_sec_page, verify_page_contains; r6 = resolve_sec_page('6-10'); r14 = resolve_sec_page('14-37'); assert r6['pdf_page_1based'] == 593 and r14['pdf_page_1based'] == 1270 and verify_page_contains('6-10', 'FIG. 6-9') and verify_page_contains('14-37', 'FIG. 14-32'); print('SEC_MAP_OK', r6['pdf_page_1based'], r14['pdf_page_1based'])"` exits `0` and prints `SEC_MAP_OK 593 1270`.

### Task 2.2 — Implement `PyMuPDF` `get_drawings() >= 8` Detector, Composite Table Row Cropper & Calibrated Crosshair (`pdf/crop_engine.py`)
- **Goal**: Build `services/perry-engine/pdf/crop_engine.py` (`< 200` lines) that detects vector figures/charts (`len(page.get_drawings()) >= 8`), renders high-DPI calibrated crops with SVG crosshair coordinates (`x_pct, y_pct`), and supports **Composite Table Header + Highlighted Compound Row Cropping** for dense Sec 2 DIPPR pages.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/pdf/crop_engine.py` (`detect_vector_figures()`, `render_calibrated_crop()`, `render_table_row_composite_crop()`, `compute_axis_crosshair()`)
- **Steps**:
  1. Implement `detect_vector_figures(sec_page: str) -> dict` opening the resolved PDF page via `fitz`, calling `drawings = page.get_drawings()`, verifying `len(drawings) >= 8`, clustering drawing rects within 18 pt margins to identify figure/chart bounding boxes, and matching nearby text blocks starting with `"FIG."` or `"TABLE"` (e.g., `"FIG. 6-9"`, `"FIG. 14-32"`, `"TABLE 2-8"`).
  2. Implement `compute_axis_crosshair(x_val: float, y_val: float, axis_cal: dict) -> dict` supporting both `"linear"` and `"log10"` scales:
     - For `"linear"`: `u = (val - val_min) / (val_max - val_min)`.
     - For `"log10"`: `u = (math.log10(val) - math.log10(val_min)) / (math.log10(val_max) - math.log10(val_min))`.
     - Map `(u_x, u_y)` into plot-box percentages `(x_pct, y_pct)` within `[0, 100]` (with `y` inverted for top-left SVG origin).
  3. Implement `render_calibrated_crop(sec_page: str, clip_rect_norm: tuple[float, float, float, float] | None = None, dpi: int = 220, crosshair: dict | None = None) -> dict` that renders `page.get_pixmap(dpi=dpi, clip=clip_rect)` to PNG bytes, encodes as `data:image/png;base64,...`, and returns image dimensions, drawing count, and calibrated SVG crosshair metadata.
  4. Implement `render_table_row_composite_crop(sec_page: str, search_term: str, dpi: int = 200) -> dict`: uses `page.search_for(search_term)` to locate the target compound row `y`-band on a dense table page, adds a translucent highlight rect over the matching row, and returns the cropped row strip (along with the top table header band crop so column labels $C_1..C_5$ remain visible).
- **Success criteria**: `render_calibrated_crop("6-10", dpi=150)` returns a valid base64 PNG (`data:image/png;base64,iVBOR...`), drawing count, and calibrated crosshair percentages.
- **Verify**: `PYTHONPATH=/Users/nad/ai4u/ai4UCheE/services/perry-engine /Users/nad/ai4u/ai4UCheE/services/perry-engine/.venv/bin/python -c "from pdf.crop_engine import render_calibrated_crop, compute_axis_crosshair; c = render_calibrated_crop('6-10', dpi=150); ch = compute_axis_crosshair(1e5, 0.0045, {'x_min':1e3,'x_max':1e7,'x_scale':'log10','y_min':0.001,'y_max':0.02,'y_scale':'log10'}); assert c['image_base64'].startswith('data:image/png;base64,') and 45 < ch['x_pct'] < 55; print('CROP_ENGINE_OK')"` exits `0` and prints `CROP_ENGINE_OK`.

### Task 2.3 — Expose FastAPI PDF Router & Dual-Track Chart Verification Challenge Endpoint (`routers/pdf_router.py`)
- **Goal**: Mount `/api/v1/pdf/resolve`, `/api/v1/pdf/search-index`, `/api/v1/pdf/crop`, and `/api/v1/pdf/verify-chart-reading` in FastAPI (`< 200` lines) and add `test_phase2_pdf.py`.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/routers/pdf_router.py` (`router`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/main.py` (mount `pdf_router`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/tests/test_phase2_pdf.py`
- **Steps**:
  1. Create `routers/pdf_router.py` with endpoints:
     - `GET /api/v1/pdf/resolve?sec_page=6-10`
     - `GET /api/v1/pdf/search-index?q=flooding`
     - `POST /api/v1/pdf/crop` (accepts `sec_page`, `clip_rect_norm`, `dpi`, `axis_calibration`, `point_x`, `point_y`, `search_term`)
     - `POST /api/v1/pdf/verify-chart-reading`: `DeepTutor`-style interactive chart verifier comparing a student/engineer's visually read value `user_value` from a Perry's chart against `exact_value`, computing `% error`, returning `"PASS"` if within tolerance (`±5%` default), and checking `fanning_darcy_4x_detected = abs(user_value - 4.0 * exact_value) / (4.0 * exact_value) <= 0.15` (returning a targeted coaching message explaining *Perry's* Fanning $f_F$ vs. Moody Darcy $f_D = 4 f_F$ convention).
  2. Mount `pdf_router` in `services/perry-engine/main.py`.
  3. Write `services/perry-engine/tests/test_phase2_pdf.py` testing all 4 endpoints (including the `fanning_darcy_4x_detected` flag) via `fastapi.testclient.TestClient`.
- **Success criteria**: `pytest tests/test_phase2_pdf.py` passes all tests in `< 5` seconds.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE/services/perry-engine && .venv/bin/pytest tests/test_phase2_pdf.py -v` exits `0` and prints `passed`.

### Task 2.4 — Build Workbench 1 Frontend (`VisualVerifierWorkbench`) & Shared Action (`src/actions/search-perry-pdf.ts`)
- **Goal**: Implement the Zod-typed action `src/actions/search-perry-pdf.ts` and React component `src/components/workbenches/visual-verifier-workbench.tsx` (`< 200` lines each) featuring the 25-Section navigator, high-DPI Perry's crop viewer with SVG crosshair overlay, and `DeepTutor` Chart-Reading Practice mode.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/src/actions/search-perry-pdf.ts` (`searchPerryPdfAction`, `cropPerryPageAction`, `verifyChartReadingAction`)
  - `/Users/nad/ai4u/ai4UCheE/src/components/workbenches/visual-verifier-workbench.tsx` (`VisualVerifierWorkbench`)
- **Steps**:
  1. Write `src/actions/search-perry-pdf.ts` using Zod schemas for `sec_page`, `clip_rect_norm`, `point_x`, `point_y`, and `user_value`, calling `http://127.0.0.1:8001/api/v1/pdf/*`.
  2. Write `src/components/workbenches/visual-verifier-workbench.tsx` (`< 200` lines) rendering:
     - Section `1..25` + `Index` quick-jump selector and `Sec-Page` input (e.g. `6-10`, `14-55`, `2-165`).
     - High-DPI PNG canvas wrapped in a relative container with an SVG overlay `<svg viewBox="0 0 100 100">` drawing the calibrated target crosshair (`<line>`, `<circle>`, coordinate badge) when revealed or in `Plant` mode.
     - In `Learn` mode: a `DeepTutor` interactive challenge card asking the user to read a value off the chart (e.g., Fanning friction factor $f_F$ on Fig. 6-9 or flooding capacity $C_{sb}$ on Fig. 14-32) before clicking **"Verify & Reveal Crosshair"**, surfacing the `fanning_darcy_4x_detected` coaching callout if triggered.
     - `data-agent-select="figure:perry-crop"` attribute for Point-and-Ask integration.
- **Success criteria**: TypeScript compiles cleanly (`tsc --noEmit`) and `visual-verifier-workbench.tsx` is `< 200` lines.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE && npx tsc --noEmit && awk 'END{if (NR>=200) exit 1}' src/components/workbenches/visual-verifier-workbench.tsx && echo "WB1_OK"` exits `0` and prints `WB1_OK`.

## Todo

- [x] Task 2.1: Implement 25-Section Offset Map & `Sec-Page` Resolver (`pdf/section_map.py` + `pdf/index_search.py` split at 194+34 LOC) — `SEC_MAP_OK 593 1270`
- [x] Task 2.2: Implement `PyMuPDF` `get_drawings() >= 8` Detector, Composite Table Row Cropper & Calibrated Crosshair (`pdf/crop_engine.py` + `pdf/figure_detector.py` split at 144+72 LOC) — `CROP_ENGINE_OK` + `Y_INVERT_OK 23.138`
- [x] Task 2.3: Expose FastAPI PDF Router & Dual-Track Chart Verification Challenge Endpoint (`routers/pdf_router.py`) — 12 passed (one Failure-Protocol stop: Sec 2 rotated-page `to_display` transform per kongming counsel)
- [x] Task 2.4: Build Workbench 1 Frontend (`VisualVerifierWorkbench`, 165 LOC) & Shared Action (`src/actions/search-perry-pdf.ts`) — `WB1_OK`

## Success Criteria

- `resolve_sec_page('6-10')` and `resolve_sec_page('14-37')` resolve to pdf pages `593` / `1270` with whole-page token confirmation against the 2,274-page PDF (`SEC_MAP_OK 593 1270`).
- `pytest tests/test_phase2_pdf.py -v` passes all PDF resolution, high-DPI crop, and chart-reading verification tests (`passed`).
- `VisualVerifierWorkbench` compiles cleanly (`WB1_OK`) and stays strictly `< 200` lines.

## Failure Protocol
If any Verify step does not meet its stated pass condition, STOP this phase.
Do not improvise a fix, retry blindly, or reason around the failure.
Spawn the `kongming` subagent for next-step counsel and pass:
- the phase and task id,
- what you attempted (the steps you ran),
- the exact command and its full output,
- the pass condition it failed to meet.
Apply kongming's guidance, then re-run the Verify step.
If `kongming` cannot be spawned in this environment, STOP and report the same
failure evidence to the user. Never continue by self-reasoning.

<!-- Updated: Validation Session 1 - TOC-first offsets (30-entry TOC verified), whole-page-token verified_header fallback (~280/2274 pages expose clean header tokens), added verify_page_contains() citation primitive, SEC_MAP_OK pinned to ground-truth pdf pages 593/1270, WB1 challenge chart re-anchored to Fig. 14-32 -->
