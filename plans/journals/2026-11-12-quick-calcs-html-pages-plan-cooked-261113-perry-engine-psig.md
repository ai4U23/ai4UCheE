---
title: Quick-Calcs HTML-pages plan cooked (261113) + perry-engine psig oracle defect found
date: 2026-11-12
summary: ak-plan --advice delivered 261113-0638-quick-calcs-html-pages (6 phases); plan-review kongming NO-GO overturned by verified 827x psig oracle defect — Phase 0 added; live workbench NPSHa affected until engine rebuild
---

# Quick-Calcs HTML-pages plan cooked (261113) + perry-engine psig oracle defect found

ak-brainstorm --advice on n8d.at SharePoint HTML-pages built-in-libraries post -> Phase 8 un-gated (kongming GO + 3 amendments: two-library placement probe, KaTeX woff2 base64 inlining, owner gate BUILD->SHIP). ak-plan --advice drafted plans/261113-0638-quick-calcs-html-pages/ (6 phase files, advice-handover contract, Failure Protocol each).

Plan-review kongming checkpoint returned NO-GO with a verified blocking find: normalize_pressure_to_pa (services/perry-engine/core/unit_registry.py:66) mislabels a psi->Pa magnitude as psia — 2.0 psig -> 13804.21 psia (truth 16.6959, ~827x); barg/kpag gauge contribution erased; the engine test is blind (asserts only npsha_m > 10); the LIVE workbench hydraulics NPSHa psig path is affected on both deployments until the next engine rebuild. Re-verified empirically with the engine venv (same numbers).

Amendments applied: new Phase 0 (fingerprint -> red exact-value test pin -> one-line ureg-idiom fix -> suite green -> own commit; law-6 exception recorded in plan.md); Task 2.2 smoke -> nonzero 10-psig == 24.6959-psia equivalence; battery grid adds equivalence pairs + barg/kpag + vacuum/0-psig with extended mechanical Verify; oracle primary = services/perry-engine/.venv/bin/python (VPS container fallback demoted — same-tree truth beats live-server truth); probe upload-failure taxonomy (UPLOAD-FAILED = probe data, not protocol failure); SP_SITE_URL pre-flight printenv; perf gate --retries=0 + warm-up iteration + script-file form; pilot verify = Graph content download by driveItem id + sharing-mode record line.

Supersession markers written into 261111-1048 plan.md (row 8 + gate map) and old phase-08 header. Validation sweep green (links OK, Failure Protocol x6, mechanical Verify fields). Execution gated on owner G1 (green-light); live-engine rebuild decision belongs to the owner and is out of plan scope.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
