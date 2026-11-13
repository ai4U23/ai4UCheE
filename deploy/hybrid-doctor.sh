#!/usr/bin/env bash
# hybrid-doctor [261113-1735 phase-06] — read-only hybrid-lane health checks.
# LOCAL batteries law: probes only, never fixes. PARKED lines are honest
# states, not failures; exit 0 unless a probe itself cannot run.
#
#   bash deploy/hybrid-doctor.sh
#
# Probes:
#   1. last 06:20 cron line (dual-lane liveness: publish ok, mirror ok)
#   2. app-only SP write-lane (GA materialization state)
#   3. engine Graph lane (GB state)
#   4. workbench embed pass expiry (rotation ritual: re-mint BEFORE expiry)
set -uo pipefail

VPS="${VPS:-pvu}"
OK=0; PARKED=0; FAIL=0
note() { echo "$1"; case "$1" in *OK*) OK=$((OK+1));; *PARKED*) PARKED=$((PARKED+1));; *) FAIL=$((FAIL+1));; esac; }

echo "== 1. last 06:20 cron line =="
LINE=$(ssh "$VPS" 'sudo tail -40 /var/log/pvu-bod-republish.log | grep "=== republish" | tail -1' 2>/dev/null)
case "$LINE" in
  *"publish ok, mirror ok, liveness GREEN"*) note "OK  cron dual-lane GREEN: $LINE";;
  *"publish ok, liveness GREEN"*) note "OK  cron single-lane GREEN (legacy pre-mirror format): $LINE";;
  *"mirror FAILED"*) note "PARKED  cron primary ok, MIRROR failed: $LINE";;
  *"FAILED"*) note "PARKED  cron failed (canary signature): $LINE";;
  *) note "FAIL  cron probe unreadable: ${LINE:-none}";;
esac

echo "== 2. SP write lane (app-only) =="
R=$(ssh "$VPS" 'docker exec -i publish-mcp python3 -' <<'PYEOF' 2>/dev/null
import asyncio, sys
sys.path.insert(0, "/app")
from sharepoint.graph_client import get_client
async def main():
    c = await get_client()
    try:
        tok = await c._get_token(c._sp_resource)
        r = await c._http.post(
            "https://pvuedu.sharepoint.com/_api/web/GetFolderByServerRelativeUrl('/sites/PVIAICowork/SitePages')"
            "/Files/Add(url='_doctorprobe.html', overwrite=true)",
            headers={"Authorization": "Bearer " + tok, "Accept": "application/json;odata=verbose",
                     "Content-Type": "text/html"}, content=b"probe")
        if r.status_code == 200:
            await c._http.post(
                "https://pvuedu.sharepoint.com/_api/web/GetFileByServerRelativeUrl('/sites/PVIAICowork/SitePages/_doctorprobe.html')"
                "/DeleteObject()",
                headers={"Authorization": "Bearer " + tok, "Accept": "application/json;odata=verbose"})
            print("WRITELANE_OK")
        else:
            print("WRITELANE_PARKED_" + str(r.status_code))
    finally:
        await c.aclose()
asyncio.run(main())
PYEOF
)
case "$R" in
  WRITELANE_OK) note "OK  SP write lane green";;
  WRITELANE_PARKED_*) note "PARKED  SP write lane $R";;
  *) note "FAIL  SP write-lane probe error: ${R:-none}";;
esac

echo "== 3. engine Graph lane (GB) =="
G=$(ssh "$VPS" 'docker exec -i publish-mcp python3 -' <<'PYEOF' 2>/dev/null
import asyncio, os, sys
sys.path.insert(0, "/app")
from sharepoint.graph_client import get_client
async def main():
    c = await get_client()
    try:
        sid = await c.resolve_site(os.environ.get("SP_SITE_URL", "https://pvuedu.sharepoint.com/sites/PVIAICowork"))
        print("GRAPHLANE_OK")
    except Exception as e:
        print("GRAPHLANE_PARKED_" + str(getattr(e, "status", "")))
    finally:
        await c.aclose()
asyncio.run(main())
PYEOF
)
case "$G" in
  GRAPHLANE_OK) note "OK  Graph lane green";;
  GRAPHLANE_PARKED_*) note "PARKED  Graph lane $G (owner: activate App-Admin role → consent go)";;
  *) note "FAIL  Graph probe error: ${G:-none}";;
esac

echo "== 4. workbench embed pass expiry =="
EXP_EPOCH=1796978043  # jti d2996ea2 — 2026-12-11T08:34:03Z
NOW=$(date +%s)
DAYS=$(( (EXP_EPOCH - NOW) / 86400 ))
if [ "$DAYS" -le 0 ]; then
  note "FAIL  embed pass EXPIRED — re-mint + re-paste now (261111-1048 handover)"
elif [ "$DAYS" -le 7 ]; then
  note "PARKED  embed pass ${DAYS}d left — rotation ritual due"
else
  note "OK  embed pass ${DAYS}d left (expiry 2026-12-11)"
fi

echo "== summary: OK=$OK PARKED=$PARKED FAIL=$FAIL =="
exit 0
