# AGENTS.md — ai4UCheE repo invariants

Governance and architectural invariants for `ai4UCheE` (ChemEng's Intelligent Workbench / Chemical Engineering vertical).

## Invariants (non-negotiable)

1. **Ecosystem Governance.** Registered in `repos.yaml` under `verticals.ai4UCheE`. All repository changes follow control-plane governance rules.
2. **Modularization (<200 LOC).** If any code file exceeds 200 lines of code, modularize it into logical concern boundaries with kebab-case descriptive naming.
3. **Secrets Discipline.** Zero credentials, tokens, private keys, or API secrets committed to source control. Use environment variables and secret stores.
4. **Binary & PDF Discipline.** Large reference binaries, including *Perry's Chemical Engineers' Handbook, 9th Edition.pdf* (225 MB), must remain gitignored and never committed into the repository history.
5. **Engineering Rigor & Citations.** All chemical engineering calculations must enforce:
   - Explicit gauge vs. absolute pressure conversions (`psig` vs. `psia`).
   - Clear distinction between Fanning ($f_F$) and Darcy ($f_D = 4f_F$) friction factors.
   - Exact Perry's 9th Edition citations `[Perry's 9th Ed., Eq. X-Y, p. S-P]` and white-box equation derivations.
6. **Documentation Sync.** Maintain `./docs/` structure as features evolve:
   - `project-overview-pdr.md`
   - `code-standards.md`
   - `codebase-summary.md`
   - `design-guidelines.md`
   - `deployment-guide.md`
   - `system-architecture.md`
   - `project-roadmap.md`
7. **UX / AX & Discovery Surface Discipline.** Before making UI, route, or content changes, read `DESIGN.md` and `REVIEW.md`. Keep AX discovery surfaces (`public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`, `public/llms-full.txt`, `public/index.md`, `index.html` JSON-LD/OG metadata, and `<PageAxShareMenu />`) in sync with routes and content, and verify changes across Desktop (`1440×900`), Tablet (`768×1024`), and Mobile (`375×812` + `320×812` reflow).

## Structure
- `DESIGN.md` & `REVIEW.md` — Sovereign Design System tokens, motion rules, and UX/AX verification gates.
- `docs/` — Ecosystem documentation suite.
- `plans/` — Master implementation plans, phase blueprints, and validation reports.
- `services/perry-engine/` — Deterministic Python ChE & PDF sidecar (FastAPI + PyMuPDF + CoolProp/SciPy/Pint).
- `src/` — React 19 + motion/react agent-native frontend (repo root, Vite; plain CSS-variable dual-theme tokens — no Tailwind).
