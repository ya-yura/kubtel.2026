# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,id=kubtel-npm-build,target=/root/.npm \
    npm ci --no-audit --no-fund --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321 \
    LEAD_OUTBOX_DIR=/var/lib/kubtel-site/lead-outbox

WORKDIR /app

RUN groupadd --system kubtel \
    && useradd --system --gid kubtel --home-dir /app --no-create-home kubtel \
    && mkdir -p /var/lib/kubtel-site/lead-outbox \
    && chown -R kubtel:kubtel /app /var/lib/kubtel-site

COPY package.json package-lock.json ./
RUN --mount=type=cache,id=kubtel-npm-runtime,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund --legacy-peer-deps \
    && chown -R kubtel:kubtel /app

COPY --from=build --chown=kubtel:kubtel /app/dist ./dist

USER kubtel
EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4321/api/health.json').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1))"

CMD ["node", "./dist/server/entry.mjs"]
