# Watchdog Automation Backup (deleted 2026-11-03, Phase 5 Task 5.2)

- **Automation id**: `automation-f7a1acdc-717f-42c8-9a9d-9cad0231284d`
- **Schedule**: every 15 minutes
- **Behavior**: check `https://chemeng.ai4u.now/health`; on failure run `instabox resume chemie`; then re-verify `/health` + `/api/copilot/status`
- **Why deleted**: pre-cutover (Phase 5) — a watchdog-triggered `instabox resume chemie` during/after the tunnel handoff could resurrect the old connector into a dual-connector split-brain (plan.md D4). Lightsail is always-on; the watchdog's resume function is obsolete post-cutover.
- **Recreate if**: rollback to InstaBox becomes permanent (>24 h standby per Phase 5 Task 5.5). Recreate with the same schedule/behavior via CronCreate against the values above.
