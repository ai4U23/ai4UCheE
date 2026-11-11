---
title: "ak-plan --advice --ultra: PVU SharePoint edition plan (best-of-5 pick C)"
date: 2026-11-11
summary: "11-file handover plan for the PVU edition of the ChemEng workbench on PVU SharePoint; ultra verifier picked candidate C 88/100; receipt in plan.md ## Ultra"
---

# ak-plan --advice --ultra: PVU SharePoint edition plan (best-of-5 pick C)

## What happened
- Converted the locked 261111 brainstorm contract into an executable plan at plans/261111-1048-pvu-sharepoint-edition/ (plan.md + 10 phase files, handover contract, ~8d effort) in repo ai4UCheE.
- --ultra run: five independent planner candidates dispatched in one wave from one immutable evidence packet; a kongming verifier scored the five anonymized candidates on a 5-criterion rubric (1-20 each) plus 8 hard eligibility constraints.
- Winner: candidate C, 88/100 — margin LOW (1 point over runner-up E at 87), NOT unanimous (E won the executability criterion). Candidate A scored 85 but was ineligible: one-word Failure-Protocol typo ("met" vs "meet") in its phase-04 block. Receipt embedded in plan.md ## Ultra: `ultra: picked=C/5 margin=low unanimous=no rejected_all=no`.
- `ak plan validate` OK; plan registered active in the store. Whole-plan sweep green: 10/10 verbatim Failure Protocol blocks, all 12 required sections per phase file, all plan.md links resolve, no token-in-query violations, all phase files <= 142 lines.
- Owner pins resolved at plan time: NO daily spend cap on the copilot gateway alias (honest accepted-risk record; bounds = rate limit + JTI revocation), 30-day embed token TTL, ALL FOUR content-backlog items in-plan.

## Decision
- Winning design (C): caddy basic_auth with path exceptions (/app, /assets/*, /health stay ungated so the iframe never hits a blocked basic-auth prompt; Express Bearer gate is the real enforcement); Express verifier mirrors the publish-engine token wire format (canonical JSON + HMAC, aud artifact_viewer, purpose embed) with a cross-repo mint-to-curl round-trip proof; split rate limits 300/min general + 20/min copilot (classroom-NAT aware, env-tunable); corpus mounted to satisfy perry-engine main.py's hardcoded three-dirname PDF_PATH walk with zero code change; docker image-content law gate (find *.pdf -size +1M -> 0); day-one real-secret check prints length/boolean only, never the value.
- Materialization note: candidate texts were staged by the controller as faithful transcriptions of the five verbatim planner reports (candidate A de-indented from the persisted harness artifact); the winner was materialized byte-faithful — no blending.

## Next steps
- Handoff: /ak-cook plans/261111-1048-pvu-sharepoint-edition/plan.md --advice (supervision carries forward).
- Validation findings left UNFIXED per the no-auto-correct protocol: plan.md dependency map (line ~48) references a nonexistent "phase 3.5" (cosmetic; owner call whether to fix); phase-05 carries deliberate [VERIFY-AT-EXECUTION] host-path pins that its VPS discovery task resolves.
- External gates tracked in-plan: PVU-IT App Catalog activation chain (gates Lane B + content publishes); Microsoft SharePoint HTML-pages GA mid-Nov-Dec 2026 (gates the gadget).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
