#!/usr/bin/env bash
# publish-mcp shared-container recreate — THE LAW, executable (incident-3 261111).
#
# 261111: the chemeng phase-05 deploy recreated publish-mcp with the env intact but WITHOUT
# the three bind mounts → every SharePoint artifact page 404'd (the BOD usage dashboard went
# down in front of the owner) and the startup reconcile tripped the quarantine completion
# trap. An env-only diff cannot catch it: the bind list is a separate axis that must be
# captured, re-asserted, and diffed like the env.
#
# Axes this script preserves (captured BEFORE any mutation, re-asserted after):
#   env (51 keys) · 3 binds · 3 networks · 127.0.0.1:3020 port · restart policy
#
# Laws encoded:
#   1. capture first — one docker inspect JSON is the source of truth for the diff.
#   2. REFUSE if the live container already lacks a bind — never bless a broken state.
#   3. docker run takes one network → primary at run, the rest via `docker network connect`.
#   4. post-gates: env diff clean, bind diff clean, /health ok, BOD feed 200 with EXACTLY
#      ONE Access-Control-Allow-Origin (duplicate ACAO = every browser fails while curl stays
#      green — the incident-3 layer-1 lesson), revoked-jtis feed intact.
#   5. If the artifact row is quarantined in the metadata DB, un-quarantine it BEFORE running
#      this script — booting a MOUNTED container completes a quarantine (incident-1 law).
#
# Usage (root on the PVU VPS): ./publish-mcp-recreate.sh ai4upvu-<sha>
set -euo pipefail

NEW_IMAGE="${1:?usage: $0 <new-image-tag>  (e.g. ai4upvu-<sha>)}"
ENV_FILE="${ENV_FILE:-/etc/ai4upvu/publish-mcp.env}"
BOD_SLUG="${BOD_SLUG:-pvu-bod-usage-dashboard-vn}"
PORT="${PORT:-127.0.0.1:3020:3020}"
NETWORKS=(ai4uedu_default ai4upvu_default litellm-network)
BINDS=(
  "/data/artifacts:/data/artifacts"
  "/data/state:/data/state"
  "/opt/litellm-gateway/repo/contract/catalog/data-products.json:/app/catalog/data-products.json"
)

command -v docker >/dev/null || { echo "docker missing" >&2; exit 2; }
command -v python3 >/dev/null || { echo "python3 missing" >&2; exit 2; }
[ -f "$ENV_FILE" ] || { echo "env file missing: $ENV_FILE" >&2; exit 2; }
docker inspect publish-mcp >/dev/null 2>&1 || { echo "publish-mcp not running — capture impossible" >&2; exit 2; }

CAPTURE="$(mktemp)"; NEWCAP="$(mktemp)"; H1="$(mktemp)"; H2="$(mktemp)"; BODY="$(mktemp)"
trap 'rm -f "$CAPTURE" "$NEWCAP" "$H1" "$H2" "$BODY"' EXIT
docker inspect publish-mcp > "$CAPTURE"

# Law 2 — the live container must itself carry every bind before we bless its capture.
REQUIRED_BINDS="$(printf '%s\n' "${BINDS[@]}")" python3 - "$CAPTURE" <<'PY'
import json, os, sys
mounts = {f"{m['Source']}:{m['Destination']}" for m in json.load(open(sys.argv[1]))[0]['Mounts']}
missing = set(os.environ['REQUIRED_BINDS'].splitlines()) - mounts
if missing:
    print(f"REFUSING: live publish-mcp lacks binds {sorted(missing)} — fix the live state first", file=sys.stderr)
    sys.exit(3)
PY
echo "[capture] env+binds+networks+port captured; live binds verified"

docker stop publish-mcp >/dev/null
docker rm publish-mcp >/dev/null

echo "[recreate] $NEW_IMAGE — network ${NETWORKS[0]}, ${#BINDS[@]} binds, env-file, port $PORT"
run_flags=(--env-file "$ENV_FILE" -p "$PORT")
for b in "${BINDS[@]}"; do run_flags+=(-v "$b"); done
docker run -d --name publish-mcp --restart unless-stopped \
  --network "${NETWORKS[0]}" "${run_flags[@]}" "$NEW_IMAGE" >/dev/null
for n in "${NETWORKS[@]:1}"; do docker network connect "$n" publish-mcp; done

sleep 4
docker inspect publish-mcp > "$NEWCAP"

env_of() { python3 -c "import json,sys; print('\n'.join(sorted(json.load(open(sys.argv[1]))[0]['Config']['Env'])))" "$1"; }
echo "[diff] env (261109 env-drop class)"
diff <(env_of "$CAPTURE") <(env_of "$NEWCAP") || { echo "ENV DIFF — resolve before proceeding" >&2; exit 4; }
echo "[diff] env clean"

echo "[diff] binds (261111 bind-drop class — the incident-3 axis)"
REQUIRED_BINDS="$(printf '%s\n' "${BINDS[@]}")" python3 - "$NEWCAP" <<'PY'
import json, os, sys
mounts = {f"{m['Source']}:{m['Destination']}" for m in json.load(open(sys.argv[1]))[0]['Mounts']}
missing = set(os.environ['REQUIRED_BINDS'].splitlines()) - mounts
if missing:
    print(f"BIND DIFF — new container lacks {sorted(missing)}", file=sys.stderr)
    sys.exit(4)
print("[diff] binds clean")
PY

echo "[gate] /health (in-container)"
docker exec publish-mcp python - <<'PY'
import json, urllib.request
json.load(urllib.request.urlopen("http://127.0.0.1:3020/health", timeout=10))
print("[gate] /health ok")
PY

echo "[gate] BOD feed browser-lane: 200 + EXACTLY ONE ACAO + fresh ict_date"
TOKEN="$(docker exec publish-mcp python -c "
import sys; sys.path.insert(0, '/app')
from token_manager import create_signed_token
print(create_signed_token('$BOD_SLUG', 'recreate-smoke', ttl_days=1, purpose='share')[0])
")"
code="$(curl -sD "$H1" -o "$BODY" -w '%{http_code}' "https://pvu.ai4u.now/api/artifacts/$BOD_SLUG" -H "Authorization: Bearer $TOKEN")"
[ "$code" = "200" ] || { echo "BOD feed HTTP $code (expect 200)" >&2; exit 5; }
acao="$(grep -ic 'access-control-allow-origin' "$H1" || true)"
[ "$acao" = "1" ] || { echo "ACAO count $acao (expect exactly 1 — duplicate = browsers fail, curl green)" >&2; exit 5; }
grep -q "$(date +%F)" "$BODY" || { echo "artifact lacks today's ict_date bake" >&2; exit 5; }
echo "[gate] BOD feed 200 / ACAO x1 / ict_date $(date +%F)"

echo "[gate] revoked-jtis feed (che-workbench) — the chemeng revocation tier"
SVC_TOKEN="$(grep -E '^STUDIO_MCP_BEARER_TOKEN=' "$ENV_FILE" | cut -d= -f2-)"
docker exec -e T="$SVC_TOKEN" publish-mcp python - <<'PY'
import json, os, urllib.request
req = urllib.request.Request(
    "http://127.0.0.1:3020/internal/revoked-jtis/che-workbench",
    headers={"Authorization": f"Bearer {os.environ['T']}"})
feed = json.load(urllib.request.urlopen(req, timeout=10))
assert feed.get("slug") == "che-workbench" and "epoch" in feed, feed
print("[gate] revoked-jtis feed ok:", json.dumps(feed))
PY

echo "ALL GREEN — publish-mcp recreated on $NEW_IMAGE with every axis preserved."
