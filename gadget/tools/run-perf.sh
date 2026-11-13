#!/usr/bin/env bash
# Phase 4 perf gate runner (plan 261113-0638). Script-file form on purpose:
# pasting `exit $rc` into an interactive shell closes the shell.
# --retries=0 overrides the config's retries:1 (deployed-target setting) — a
# perf gate must not retry.
set -u
cd "$(dirname "$0")/../.."
python3 -m http.server 5199 -d gadget/dist & SRV=$!
sleep 1
E2E_BASE_URL=http://localhost:5199 npx playwright test tests/e2e/gadget-perf.spec.ts --retries=0 ; rc=$?
kill $SRV
exit $rc
