---
title: "Phase 1: Workspace Foundation, Monorepo Scaffolding & Python PerryEngine Sidecar Bootstrap"
status: todo
---

# Phase 1: Workspace Foundation, Monorepo Scaffolding & Python PerryEngine Sidecar Bootstrap

## Overview

Initialize `/Users/nad/ai4u/ai4UCheE`, configure the Node/TypeScript + SQLite/Drizzle host workspace and the `services/perry-engine/` Python virtual environment (`FastAPI`, `PyMuPDF`, `chemicals`, `fluids`, `ht`, `thermo`, `CoolProp`, `scipy`, `pint`), and build the two foundational Python primitives: the `pint` Field-Unit Normalizer (with explicit `psig`/`psia` pressure datum enforcement) and the 3-Stage White-Box Equation Renderer (`handcalcs`-style Python AST-to-KaTeX serializer with mandatory *Perry's 9th Ed.* citation comments). Every source file created in this phase MUST remain strictly `< 200` lines of code.

## Requirements

- [ ] Root Node.js/TypeScript + Vite + Vitest + Drizzle/SQLite workspace initialized at `/Users/nad/ai4u/ai4UCheE`.
- [ ] Local Python virtual environment initialized at `/Users/nad/ai4u/ai4UCheE/services/perry-engine/.venv` with `fastapi`, `pymupdf` (`fitz`), `chemicals`, `fluids`, `ht`, `thermo`, `CoolProp`, `scipy`, `pint`, and `pytest`.
- [ ] `pint` Field-Unit Registry (`core/unit_registry.py`) enforces explicit `psig`/`psia` pressure datum conversion and rejects bare ambiguous `"psi"`.
- [ ] 3-Stage White-Box Equation Renderer (`core/handcalcs_katex.py`) serializes Python AST expressions + `pint` quantities into `Symbolic -> Substituted w/ Units -> Result + [Perry's 9th Ed., Eq. X-Y, p. S-P]`.
- [ ] FastAPI sidecar (`services/perry-engine/main.py`) exposes `GET /health`, `POST /api/v1/units/convert`, and `POST /api/v1/equations/render` and passes `tests/test_phase1_core.py`.

## Implementation Steps

### Task 1.1 — Initialize Root Node.js Workspace, TypeScript Config & SQLite/Drizzle Schema
- **Goal**: Create the root monorepo configuration and SQLite database schema (`saved_calculations`, `screen_states`, `pdf_anchors`) in `< 200` line modules.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/package.json`
  - `/Users/nad/ai4u/ai4UCheE/tsconfig.json`
  - `/Users/nad/ai4u/ai4UCheE/vite.config.ts`
  - `/Users/nad/ai4u/ai4UCheE/src/db/schema.ts` (`savedCalculations`, `screenStates`, `pdfAnchors`)
  - `/Users/nad/ai4u/ai4UCheE/src/db/client.ts` (`db`, `initDb`)
- **Steps**:
  1. Create directory `/Users/nad/ai4u/ai4UCheE` and subdirectories `src/db`, `src/actions`, `src/components`, `src/hooks`, `src/context`, `src/server`, `src/__tests__`, and `services/perry-engine/core`, `services/perry-engine/pdf`, `services/perry-engine/solvers`, `services/perry-engine/routers`, `services/perry-engine/tests`.
  2. Write `package.json` with dependencies: `react@^19.0.0`, `react-dom@^19.0.0`, `motion@^12.0.0`, `katex@^0.16.11`, `lucide-react@^0.468.0`, `zod@^3.24.1`, `drizzle-orm@^0.38.0`, `better-sqlite3@^11.7.0`, `express@^4.21.2`, `clsx@^2.1.1`, `tailwind-merge@^2.6.0`, and devDependencies: `vite@^6.0.0`, `@vitejs/plugin-react@^4.3.4`, `typescript@^5.7.2`, `vitest@^2.1.8`, `@testing-library/react@^16.1.0`, `jsdom@^25.0.1`, `tsx@^4.19.2`, `@types/better-sqlite3`, `@types/express`, `@types/katex`, `tailwindcss@^3.4.17`.
  3. Write `src/db/schema.ts` defining three SQLite tables via `drizzle-orm/sqlite-core`:
     - `screenStates`: `id` (text PK), `activeWorkbench` (text), `personaMode` (text `'learn' | 'plant'`), `themeMode` (text `'paper' | 'blueprint'`), `selectedChipsJson` (text), `payloadJson` (text), `updatedAt` (integer).
     - `savedCalculations`: `id` (text PK), `projectCode` (text), `equipmentTag` (text), `workbenchType` (text), `revision` (text), `inputsJson` (text), `outputsJson` (text), `equationsJson` (text), `createdAt` (integer).
     - `pdfAnchors`: `id` (text PK), `sectionNum` (integer), `secPageCode` (text), `pdfPageNumber` (integer), `caption` (text), `bboxJson` (text).
  4. Write `src/db/client.ts` initializing `better-sqlite3` (`perry_workbench.sqlite`) and running `CREATE TABLE IF NOT EXISTS` idempotently inside `initDb()`.
  5. Run `npm install` in `/Users/nad/ai4u/ai4UCheE`.
- **Success criteria**: `node_modules` is installed, `src/db/schema.ts` and `src/db/client.ts` are each `< 200` lines, and `initDb()` creates the SQLite tables cleanly.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE && npx tsx -e "import { initDb } from './src/db/client'; initDb(); console.log('SQLITE_OK');"` exits `0` and prints `SQLITE_OK`.

### Task 1.2 — Bootstrap Python `services/perry-engine` Virtual Environment & Dependencies
- **Goal**: Create `services/perry-engine/pyproject.toml` and install `fastapi`, `uvicorn`, `pymupdf`, `chemicals`, `fluids`, `ht`, `thermo`, `CoolProp`, `scipy`, `pint`, `pydantic`, `pytest`, and `httpx` in a local `.venv`.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/pyproject.toml`
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/__init__.py`
- **Steps**:
  1. Write `services/perry-engine/pyproject.toml` declaring project `perry-engine`, Python `>=3.10`, and dependencies: `fastapi>=0.115.0`, `uvicorn>=0.32.0`, `pymupdf>=1.24.0`, `chemicals>=1.3.0`, `fluids>=1.0.26`, `ht>=1.0.6`, `thermo>=0.4.0`, `CoolProp>=6.6.0`, `scipy>=1.14.0`, `pint>=0.24.0`, `pydantic>=2.10.0`, `pytest>=8.3.0`, `httpx>=0.28.0`.
  2. Create a virtual environment at `/Users/nad/ai4u/ai4UCheE/services/perry-engine/.venv` using `uv venv` (or `python3 -m venv .venv`) and install all packages via `uv pip install -e .` (or `.venv/bin/pip install -e .`).
  3. Verify the PDF path `/Users/nad/ai4u/ai4UCheE/Perry's Chemical Engineers' Handbook, 9th Edition.pdf` is readable by `fitz` (`PyMuPDF`) and reports `2274` pages.
- **Success criteria**: Python `.venv` imports `fitz`, `chemicals`, `fluids`, `ht`, `CoolProp`, `pint`, `scipy`, and `fastapi` without error and opens the 2,274-page PDF.
- **Verify**: `/Users/nad/ai4u/ai4UCheE/services/perry-engine/.venv/bin/python -c "import fitz, chemicals, fluids, ht, CoolProp, pint, scipy, fastapi; doc = fitz.open(\"/Users/nad/ai4u/ai4UCheE/Perry's Chemical Engineers' Handbook, 9th Edition.pdf\"); assert len(doc) == 2274; print('PERRY_ENV_OK', len(doc))"` exits `0` and prints `PERRY_ENV_OK 2274`.

### Task 1.3 — Implement `pint` Field-Unit Registry & Explicit `psig`/`psia` Guardrail
- **Goal**: Build `services/perry-engine/core/unit_registry.py` (`< 200` lines) handling mixed oilfield/plant units (`gpm`, `lb/hr`, `ft`, `in`, `cP`, `degF`, `degR`, `Btu/(hr*ft^2*degF)`, `psig`, `psia`, `bar`, `kPa`) with an explicit atmospheric pressure datum guardrail (`P_atm = 14.6959 psia` default, configurable for elevation).
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/core/unit_registry.py` (`ureg`, `Quantity`, `normalize_pressure_to_pa()`, `convert_field_unit()`, `UnitConversionResult`)
- **Steps**:
  1. Instantiate a singleton `pint.UnitRegistry()` (`ureg`) in `services/perry-engine/core/unit_registry.py` and register plant aliases if not present (`gpm = gallon / minute`, `cP = centipoise`, `lbm = pound`, `lbf = force_pound`).
  2. Implement `normalize_pressure_to_pa(value: float, unit_str: str, patm_psia: float = 14.6959) -> dict`:
     - If `unit_str.lower() in ("psig", "barg", "kpag")`, require explicit gauge-to-absolute offset conversion (`P_abs = P_gauge + P_atm`), returning `{"value_pa": float, "value_psia": float, "datum_note": str, "is_gauge_converted": True}`.
     - If `unit_str.lower() == "psi"`, raise `ValueError("Ambiguous pressure unit 'psi': specify 'psig' (gauge) or 'psia' (absolute) per Perry's Sec 6/8 cavitation safety guardrail.")`.
     - If `unit_str.lower() in ("psia", "pa", "kpa", "bar", "atm", "mmhg", "torr")`, convert directly to Pascals and `psia` with `"is_gauge_converted": False`.
  3. Implement `convert_field_unit(value: float, from_unit: str, to_unit: str, patm_psia: float = 14.6959) -> UnitConversionResult` returning exact input/output values, conversion factor, and LaTeX unit strings.
- **Success criteria**: `normalize_pressure_to_pa(0.0, "psig")` returns `101325.0` Pa (`14.6959 psia`), bare `"psi"` raises `ValueError`, and `convert_field_unit(100, "gpm", "m^3/s")` returns `0.00630902`.
- **Verify**: `PYTHONPATH=/Users/nad/ai4u/ai4UCheE/services/perry-engine /Users/nad/ai4u/ai4UCheE/services/perry-engine/.venv/bin/python -c "from core.unit_registry import normalize_pressure_to_pa, convert_field_unit; r = normalize_pressure_to_pa(0.0, 'psig'); assert abs(r['value_pa'] - 101325) < 15; print('UNIT_GUARD_OK')"` exits `0` and prints `UNIT_GUARD_OK`.

### Task 1.4 — Implement 3-Stage White-Box Equation Renderer (`handcalcs` AST-to-KaTeX)
- **Goal**: Build `services/perry-engine/core/handcalcs_katex.py` (`< 200` lines) that transforms Python mathematical AST expressions + variable dictionaries (with `pint` units) into a 3-Stage White-Box KaTeX object (`symbolic_latex`, `substituted_latex`, `result_latex`, `full_aligned_katex`, and `citation`).
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/core/handcalcs_katex.py` (`WhiteBoxStep`, `render_three_stage_equation()`, `ast_to_latex()`)
- **Steps**:
  1. Define Pydantic model `WhiteBoxStep`:
     - `lhs_symbol: str` (e.g., `"Re"`, `"\\Delta P"`, `"P_{vp}"`)
     - `symbolic_latex: str` (Stage 1: e.g., `Re = \frac{\rho \cdot v \cdot D}{\mu}`)
     - `substituted_latex: str` (Stage 2: e.g., `= \frac{998.2\;\text{kg/m}^3 \cdot 2.15\;\text{m/s} \cdot 0.1023\;\text{m}}{1.002 \times 10^{-3}\;\text{Pa}\cdot\text{s}}`)
     - `result_latex: str` (Stage 3: e.g., `= 2.191 \times 10^{5}\;\text{dimensionless}`)
     - `citation: str` (Mandatory `# [Perry's 9th Ed., Eq. X-Y, p. S-P]` string)
     - `full_aligned_katex: str` (Combined `\begin{aligned} ... \end{aligned}` block with `\quad \text{[Perry's 9th Ed., ...]}`).
  2. Implement an `ast.NodeVisitor` in `ast_to_latex(expr_str: str, env: dict[str, tuple[float, str, str]])` where each variable maps to `(numeric_value, unit_latex, symbol_latex)`:
     - Convert `ast.BinOp(Add/Sub/Mult/Div/Pow)` into `\frac{a}{b}`, `a \cdot b`, `a^{b}`.
     - Convert `ast.Call` for `ln`, `log10`, `exp`, `sqrt`, `sin`, `cos`, `sinh`, `cosh` into standard LaTeX operators (`\ln`, `\log_{10}`, `\exp`, `\sqrt{...}`, `\sinh`, `\cosh`).
     - Generate both the symbolic pass (using `symbol_latex`) and the numeric+unit substitution pass (formatting numbers to 4 significant figures or scientific notation `\times 10^{n}` with `\;\mathrm{unit}`).
  3. Enforce in `render_three_stage_equation()` that `citation` matches regex `^\[Perry's 9th Ed\., .*p\. \d+-\d+\]$`, raising `ValueError` if a calculation lacks a *Perry's 9th Ed.* section-page citation.
- **Success criteria**: `render_three_stage_equation` produces all 3 stages plus citation and rejects uncited equations.
- **Verify**: `PYTHONPATH=/Users/nad/ai4u/ai4UCheE/services/perry-engine /Users/nad/ai4u/ai4UCheE/services/perry-engine/.venv/bin/python -c "from core.handcalcs_katex import render_three_stage_equation; step = render_three_stage_equation('Re', '(rho * v * D) / mu', {'rho': (998.2, 'kg/m^3', r'\rho'), 'v': (2.0, 'm/s', 'v'), 'D': (0.1, 'm', 'D'), 'mu': (0.001, 'Pa\\cdot s', r'\mu')}, 199640.0, 'dimensionless', \"[Perry's 9th Ed., Eq. 6-38, p. 6-10]\"); assert r'\frac' in step.symbolic_latex and '998.2' in step.substituted_latex; print('HANDCALCS_OK')"` exits `0` and prints `HANDCALCS_OK`.

### Task 1.5 — Wire `services/perry-engine/main.py` & Phase 1 Pytest Suite
- **Goal**: Expose `GET /health`, `POST /api/v1/units/convert`, and `POST /api/v1/equations/render` on `127.0.0.1:8001` and verify with `pytest`.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/main.py` (`app`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/tests/test_phase1_core.py`
- **Steps**:
  1. Write `services/perry-engine/main.py` (`< 200` lines) creating `FastAPI(title="PerryEngine Sidecar", version="1.0.0")` with CORS enabled for `http://localhost:5173` and `http://localhost:3000`.
  2. Add `GET /health` returning `{"status": "ok", "pdf_exists": True, "pdf_pages": 2274, "engine": "perry-engine-v1"}`.
  3. Add `POST /api/v1/units/convert` and `POST /api/v1/equations/render` calling `unit_registry.py` and `handcalcs_katex.py`.
  4. Write `services/perry-engine/tests/test_phase1_core.py` testing:
     - `/health` endpoint returns `200` and `pdf_pages == 2274`.
     - `psig` to `psia` conversion and bare `"psi"` rejection (`400` or `ValueError`).
     - 3-stage `handcalcs` AST rendering with `\frac`, unit tags, and Perry's citation enforcement.
- **Success criteria**: All Phase 1 unit tests pass and all code files are `< 200` lines.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE/services/perry-engine && .venv/bin/pytest tests/test_phase1_core.py -v` exits `0` and prints `passed`.

## Todo

- [ ] Task 1.1: Initialize Root Node.js Workspace, TypeScript Config & SQLite/Drizzle Schema
- [ ] Task 1.2: Bootstrap Python `services/perry-engine` Virtual Environment & Dependencies
- [ ] Task 1.3: Implement `pint` Field-Unit Registry & Explicit `psig`/`psia` Guardrail
- [ ] Task 1.4: Implement 3-Stage White-Box Equation Renderer (`handcalcs` AST-to-KaTeX)
- [ ] Task 1.5: Wire `services/perry-engine/main.py` & Phase 1 Pytest Suite

## Success Criteria

- `initDb()` creates `screen_states`, `saved_calculations`, and `pdf_anchors` tables in SQLite (`SQLITE_OK`).
- Python `.venv` opens the 2,274-page *Perry's 9th Ed.* PDF (`PERRY_ENV_OK 2274`).
- `pytest tests/test_phase1_core.py -v` exits `0` with all unit conversion and 3-stage `handcalcs` tests passing.

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
