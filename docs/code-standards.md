# Code Standards — ai4UCheE

## Engineering Principles
- **200 LOC Modularity**: Every source code file (`.ts`, `.tsx`, `.py`) must remain strictly under 200 lines of code. Modularize across concerns using descriptive kebab-case filenames.
- **Strict Typing**: TypeScript `strict: true` and Python type annotations enforced across all surfaces.
- **Deterministic Solvers**: All physical and thermodynamic calculations reside in Python services (`services/perry-engine/`) utilizing verified scientific libraries (`scipy`, `pint`, `chemicals`, `fluids`, `ht`, `thermo`, `CoolProp`). LLMs are strictly forbidden from performing free-form numerical computations.
- **Conventional Commits**: Commit messages follow the conventional commit specification (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`).
- **No Secrets**: Zero credentials, tokens, or private environment variables committed.
- **Binary & PDF Hygiene**: Large reference binaries (e.g. Perry's Handbook PDF) remain untracked in `.gitignore`.
