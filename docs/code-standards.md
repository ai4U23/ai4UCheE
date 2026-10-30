# Code Standards — ai4UCheE

## Engineering Principles
- **200 LOC Modularity**: Every source code file (`.ts`, `.tsx`, `.py`) must remain strictly under 200 lines of code. Modularize across concerns using descriptive kebab-case filenames.
- **Strict Typing**: TypeScript `strict: true` and Python type annotations enforced across all surfaces.
- **Deterministic Solvers**: All physical, thermodynamic, hydraulic, separation, and reaction engineering calculations reside in deterministic Python/TypeScript solver modules (`services/perry-engine/` and `src/lib/` + `src/components/workbenches/*-solver-math.ts`) utilizing verified scientific correlations (`scipy`, `pint`, `chemicals`, `fluids`, `ht`, `thermo`, `CoolProp`). LLMs are strictly forbidden from performing free-form numerical computations.
- **Engineering Rigor & Citations**: Enforce explicit `psig` ↔ `psia` (`+14.6959 psia = 101,325 Pa`) datum conversions, clear Fanning ($f_F$) vs. Darcy ($f_D = 4 f_F$) vs. Ergun packed-bed friction distinction, and verbatim 3-stage white-box KaTeX citations across all 6 reference textbooks (*Perry's 9th Ed.*, *Fogler 7th Ed.*, *BSL Transport 2nd Ed.*, *Smith-Van Ness-Abbott 9th Ed.*, *Seader 4th Ed.*, *Crowl & Louvar 4th Ed.*).
- **Conventional Commits**: Commit messages follow the conventional commit specification (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`).
- **No Secrets**: Zero credentials, tokens, or private environment variables committed.
- **Binary & Ebook Hygiene**: Large reference binaries (`*.pdf`, `*.epub`, `*.mobi`, `*.djvu`) remain untracked in `.gitignore`.
