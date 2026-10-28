# Deployment Guide — ai4UCheE

## Local Development Stack

### Prerequisites
- Node.js 20+ and pnpm / npm
- Python 3.11+ with `uv` or virtualenv
- Local Perry's 9th Edition PDF located at `ai4UCheE/Perry's Chemical Engineers' Handbook, 9th Edition.pdf` (or configured via `PERRY_PDF_PATH`)

### Services
1. **Python Sidecar (`services/perry-engine`)**:
   ```bash
   cd services/perry-engine
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --host 127.0.0.1 --port 8001 --reload
   ```

2. **Frontend App (`apps/web`)**:
   ```bash
   cd apps/web
   pnpm install
   pnpm dev
   ```

## Production Deployment
- **Container Strategy**: Multi-stage Docker container packaging both the static Vite/React build (served via Caddy/Nginx) and the Python FastAPI sidecar running Uvicorn.
- **Port Mapping**:
  - `5173 / 80`: Web frontend and reverse-proxy
  - `8001`: Internal sidecar API bridge
- **Governance**: Managed under control-plane (`ai4u`) ecosystem deployment standards.
