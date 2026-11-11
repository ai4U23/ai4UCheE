# ChemEng Intelligent Workbench — PVU edition container (plan 261111 phase 05).
# Single-stage: full npm ci (tsx is a devDependency needed at runtime; better-sqlite3 needs
# glibc — node:22-slim is Debian). The copyrighted corpus NEVER enters the image (the
# .dockerignore lists the PDFs/epub FIRST — the licensing law). VITE_* vars are public by
# design: branding only, never secrets. Runtime secrets (token, gateway) come from
# /etc/ai4upvu/chemeng.env via compose env_file — server-side only.
FROM node:22-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_BRAND=pvu
ARG VITE_CANONICAL_URL=https://chemeng-pvu.ai4u.now
RUN VITE_BRAND=$VITE_BRAND VITE_CANONICAL_URL=$VITE_CANONICAL_URL npm run build

ENV PORT=3000 HOST=0.0.0.0
EXPOSE 3000
CMD ["npx", "tsx", "src/server/api-server.ts"]
