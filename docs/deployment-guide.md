# Deployment Guide — ai4UCheE (Perry's Intelligent Workbench)

## 1. Live Production Deployment (`chemie.ai4u.now` & `chemie` on Tailscale)

Perry's Intelligent Workbench (`ai4UCheE`) is deployed on the **`chemie`** VPS (`InstaBox.sh`, Debian 13 amd64, 4 vCPU / 8 GiB RAM / 20 GiB `/data` persistent disk) on the `duc.a.nguyen@` tailnet and publicly routed at **`https://chemie.ai4u.now`** via Cloudflare Tunnel (`chemie-workbench`).

### Live Endpoints
- **Public HTTPS Endpoint (Cloudflare Tunnel)**: [https://chemie.ai4u.now](https://chemie.ai4u.now) / [https://chemie.ai4u.now/health](https://chemie.ai4u.now/health)
- **Workbench Web UI & Unified API (Tailnet Port 80)**: [http://chemie](http://chemie) / [http://100.64.56.26](http://100.64.56.26)
- **Workbench Web UI & Unified API (Tailnet Port 3000)**: [http://chemie:3000](http://chemie:3000) / [http://100.64.56.26:3000](http://100.64.56.26:3000)
- **Python FastAPI PerryEngine Sidecar (Tailnet Port 8001)**: [http://chemie:8001/health](http://chemie:8001/health) / [http://100.64.56.26:8001/docs](http://100.64.56.26:8001/docs)
- **Public GitHub Repository**: [https://github.com/ai4U23/ai4UCheE](https://github.com/ai4U23/ai4UCheE)

### Remote Directory & Systemd Units on `chemie`
- **Checkout Path**: `/data/home/ai4UCheE`
- **Reference PDF Path (gitignored)**: `/data/home/ai4UCheE/Perry's Chemical Engineers' Handbook, 9th Edition.pdf` (225.6 MB, 2,274 pages)
- **Cloudflare Tunnel (`chemie-workbench`)**:
  - Tunnel ID: `6aeedb2a-9324-4c9a-b75e-650ca6731f7d`
  - DNS CNAME: `chemie.ai4u.now` -> `6aeedb2a-9324-4c9a-b75e-650ca6731f7d.cfargotunnel.com`
  - Remote Config & Credentials: `/etc/cloudflared/config.yml` (`0644`) & `/etc/cloudflared/6aeedb2a-9324-4c9a-b75e-650ca6731f7d.json` (`0600`, root-owned, never in git)
- **Systemd Services**:
  - `perry-engine.service` — Python 3.12 Uvicorn FastAPI sidecar on `0.0.0.0:8001`
  - `perry-workbench.service` — Express + Vite production bundle server on `0.0.0.0:3000` (proxies `/health`, `/api/v1/*`, `/api/perry/*` to `127.0.0.1:8001`)
  - `perry-workbench-http.service` — Express + Vite production bundle server on `0.0.0.0:80` (`CAP_NET_BIND_SERVICE`)
  - `cloudflared-chemie.service` — Cloudflare Tunnel connector (`--protocol http2`, `Restart=always`, `RestartSec=5s`) routing `chemie.ai4u.now` -> `http://127.0.0.1:3000`

### Redeploy / Resume / Rollback Commands
```bash
# If chemie is auto-paused after idle timeout (https://chemie.ai4u.now shows Error 1033):
instabox resume chemie

# Deploy latest main branch to chemie:
ssh chemie "cd /data/home/ai4UCheE && git pull origin main && npm install --no-audit --no-fund && npm run build && sudo systemctl restart perry-engine perry-workbench perry-workbench-http cloudflared-chemie"

# Verify health over public HTTPS & tailnet:
curl -sS https://chemie.ai4u.now/health
curl -sS http://100.64.56.26/health

# Rollback / stop public tunnel on chemie:
ssh chemie "sudo systemctl stop cloudflared-chemie.service"
```

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
