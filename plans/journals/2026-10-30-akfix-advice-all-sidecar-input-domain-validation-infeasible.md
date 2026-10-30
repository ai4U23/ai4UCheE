---
title: "ak:fix --advice all: sidecar input-domain validation & infeasible-split guards (7dd76c3)"
date: 2026-10-30
summary: "Closed the open P2 from whole-site audit: added pydantic Field physical bounds on HydraulicsEvaluateRequest and DistillationEvaluateRequest mirroring zod schemas, added solver-level guards in hydraulics_pipe.py and distillation_mccabe.py (clean 400 Infeasible binary split message replacing math domain error), added test_edge_validation.py (43/43 pytest), deployed 7dd76c3 to chemie.ai4u.now and verified live 422/400/200 responses."
---

# ak:fix --advice all: sidecar input-domain validation & infeasible-split guards (7dd76c3)

Closed the open P2 from whole-site audit: added pydantic Field physical bounds on HydraulicsEvaluateRequest and DistillationEvaluateRequest mirroring zod schemas, added solver-level guards in hydraulics_pipe.py and distillation_mccabe.py (clean 400 Infeasible binary split message replacing math domain error), added test_edge_validation.py (43/43 pytest), deployed 7dd76c3 to chemie.ai4u.now and verified live 422/400/200 responses.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
