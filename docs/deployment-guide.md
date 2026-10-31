# Deployment Guide — ai4UCheE (ChemEng's Intelligent Workbench)

## 1. Live Production Deployment (`chemeng.ai4u.now` & `chemeng` on Tailscale)

ChemEng's Intelligent Workbench (`ai4UCheE`) is deployed on the **`chemeng`** VPS (`InstaBox.sh`, Debian 13 amd64, 4 vCPU / 8 GiB RAM / 20 GiB `/data` persistent disk) on the `duc.a.nguyen@` tailnet and publicly routed at **`https://chemeng.ai4u.now`** via Cloudflare Tunnel (`chemie-workbench`). *Renamed from `chemie` on 2026-10-31: Tailscale host, tunnel systemd unit, and public domain are now `chemeng`; the InstaBox machine name remains `chemie` (used by `instabox resume chemie`), and the legacy DNS alias `chemie.ai4u.now` still resolves to the same tunnel.*

### Live Endpoints
- **Public HTTPS Endpoint (Cloudflare Tunnel)**: [https://chemeng.ai4u.now](https://chemeng.ai4u.now) / [https://chemeng.ai4u.now/health](https://chemeng.ai4u.now/health) (legacy alias `https://chemie.ai4u.now` still resolves)
- **Workbench Web UI & Unified API (Tailnet Port 80)**: [http://chemeng](http://chemeng) / [http://100.64.56.26](http://100.64.56.26)
- **Workbench Web UI & Unified API (Tailnet Port 3000)**: [http://chemeng:3000](http://chemeng:3000) / [http://100.64.56.26:3000](http://100.64.56.26:3000)
- **Python FastAPI PerryEngine Sidecar (Tailnet Port 8001)**: [http://chemeng:8001/health](http://chemeng:8001/health) / [http://100.64.56.26:8001/docs](http://100.64.56.26:8001/docs)
- **Public GitHub Repository**: [https://github.com/ai4U23/ai4UCheE](https://github.com/ai4U23/ai4UCheE)

### Remote Directory & Systemd Units on `chemeng`
- **Checkout Path**: `/data/home/ai4UCheE`
- **Reference Textbooks Path (gitignored, all 6 on `/data/home/ai4UCheE/`)**:
  - `Perry's Chemical Engineers' Handbook, 9th Edition.pdf` (215.2 MB, 2,274 pages)
  - `Elements of Chemical Reaction Engineering, 7th Edition -- H_ Scott Fogler & Bryan R_ Goldsmith & Eranda Nikolla & -- 2025 -- Pearson.epub` (43.8 MB)
  - `Transport Phenomena, Revised 2nd Edition -- Robert Byron Bird; Warren E Stewart; Edwin N Lightfoot -- 2nd, 2006.pdf` (7.9 MB)
  - `Introduction to Chemical Engineering Thermodynamics 9th -- Hendrick Van Ness, Michael  Abbott, Joseph Mauk Smith, Mark -- 9th Edition, PT, 2021.pdf` (76.2 MB)
  - `Separation Process Principles with Applications Using -- J_ D_ Seader, Ernest J_ Henley, D_ Keith Roper -- 4, 2015-12-23.pdf` (7.2 MB)
  - `Chemical Process Safety- Fundamentals with Applications, 4th -- Daniel A_ Crowl & Joseph F_ Louvar -- 2019.pdf` (23.4 MB)
- **Cloudflare Tunnel (`chemie-workbench`)**:
  - Tunnel ID: `6aeedb2a-9324-4c9a-b75e-650ca6731f7d`
  - DNS CNAME: `chemeng.ai4u.now` -> `6aeedb2a-9324-4c9a-b75e-650ca6731f7d.cfargotunnel.com` (primary; legacy alias `chemie.ai4u.now` -> same target, kept until retired)
  - Remote Config & Credentials: `/etc/cloudflared/config.yml` (`0644`) & `/etc/cloudflared/6aeedb2a-9324-4c9a-b75e-650ca6731f7d.json` (`0600`, root-owned, never in git)
- **Systemd Services**:
  - `perry-engine.service` — Python 3.12 Uvicorn FastAPI sidecar on `0.0.0.0:8001`
  - `perry-workbench.service` — Express + Vite production bundle server on `0.0.0.0:3000` (proxies `/health`, `/api/v1/*`, `/api/perry/*` to `127.0.0.1:8001`)
  - `perry-workbench-http.service` — Express + Vite production bundle server on `0.0.0.0:80` (`CAP_NET_BIND_SERVICE`)
  - `cloudflared-chemeng.service` — Cloudflare Tunnel connector (`--protocol http2`, `Restart=always`, `RestartSec=5s`) routing `chemeng.ai4u.now` (and legacy `chemie.ai4u.now`) -> `http://127.0.0.1:3000`

### Redeploy / Resume / Rollback Commands
```bash
# If the sandbox (InstaBox machine name `chemie`) is auto-paused after idle timeout (https://chemeng.ai4u.now shows Error 1033):
instabox resume chemie

# Deploy latest main branch to chemeng:
ssh chemeng "cd /data/home/ai4UCheE && git pull origin main && npm install --no-audit --no-fund && npm run build && sudo systemctl restart perry-engine perry-workbench perry-workbench-http cloudflared-chemeng"

# Verify health over public HTTPS & tailnet:
curl -sS https://chemeng.ai4u.now/health
curl -sS http://100.64.56.26/health

# Rollback / stop public tunnel on chemeng:
ssh chemeng "sudo systemctl stop cloudflared-chemeng.service"
```

### Keep-Alive (Free-Plan Constraints & 15-Min Watchdog)

The InstaBox sandbox (machine name `chemie`; Tailscale host `chemeng`) runs on the **InstaBox Free plan**, which enforces two immutable limits:

- **Idle auto-suspend: 30 minutes** (locked; `instabox auto-suspend chemie 0` returns `permission_denied` on Free).
- **Max runtime: 480 minutes** (8 h) — the sandbox stops even under active traffic.

Consequence: the sandbox periodically goes down (Cloudflare **Error 530/1033**) and must be resumed with `instabox resume chemie` (fallback `instabox start chemie` after a hard stop). A keep-alive watchdog automation (ZCode cron `automation-f7a1acdc-717f-42c8-9a9d-9cad0231284d`, every 15 min) checks `https://chemeng.ai4u.now/health`, auto-resumes the sandbox on failure, and re-verifies `/health` + `/api/copilot/status`. Worst-case downtime after a pause is therefore ~15–20 min. systemd units (`perry-engine`, `perry-workbench`, `perry-workbench-http`, `cloudflared-chemeng`) start automatically at sandbox boot, so a resume needs no manual deploy.

**True always-on requires Pro**: `instabox workspace subscribe <workspace> --plan pro`, then `instabox auto-suspend chemie 0` (unlocks idle-pause off and unlimited max runtime). The watchdog remains useful as a safety net either way.

---

## 2. Local Development Stack

### Prerequisites
- Node.js 20+ and npm
- Python 3.12 with `uv`
- Local *Perry's Chemical Engineers' Handbook, 9th Edition.pdf* at repo root (or `PERRY_PDF_PATH` env var)

### Running Locally
1. **Python Sidecar (`services/perry-engine`)**:
   ```bash
   cd services/perry-engine
   uv venv .venv --python 3.12
   uv pip install --python .venv/bin/python -e .
   PYTHONPATH=. .venv/bin/uvicorn main:app --host 127.0.0.1 --port 8001 --reload
   ```

2. **Frontend Workbench (`src/`)**:
   ```bash
   npm install
   npm run dev
   ```

### Server-Only Environment Variables (Two-Tier AI Co-Pilot Gateway)

`.env.example` documents the server-only contract — copy it to `.env` for local runs. Zero secrets are ever committed (repo invariant #3): `GATEWAY_API_KEY` is documented **empty** by default, which forces the deterministic Tier-1 ChE Tutor fallback (same behavior as zero-key / Vitest runs).

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `GATEWAY_URL` | `https://gateway.ai4u.now` | Base URL of the Tier-2 OpenAI-compatible LLM gateway (`POST /v1/chat/completions`) |
| `GATEWAY_API_KEY` | *(empty — server-only secret, never committed)* | Bearer key for the Tier-2 gateway; when unset the Express route serves the Tier-1 deterministic Perry tutor |
| `GATEWAY_MODEL` | `gemini-4-argon-low` | Tier-2 chat-completion model ID (hard `4500 ms` `AbortSignal.timeout`) |

- **Vite dev `/api` proxy**: `vite.config.ts` forwards `/api/*` to `http://127.0.0.1:3000`, so `npm run dev` reaches the Express host's `POST /api/copilot` and `GET /api/copilot/status`. In production Express serves `dist/` directly, so browser-relative `/api` calls hit the same host with no proxy.
- `PERRY_SIDECAR_URL` (default `http://127.0.0.1:8001`) still routes `/api/v1/*` and `/api/perry/*` to the deterministic FastAPI sidecar.
