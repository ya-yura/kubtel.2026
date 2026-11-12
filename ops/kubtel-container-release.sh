#!/usr/bin/env bash
set -Eeuo pipefail

COMPOSE_FILE="/opt/kubtel-site/compose.production.yml"
IMAGE_STATE="/opt/kubtel-site/current-image"
SERVICE_NAME="kubtel"
HEALTH_URL="http://127.0.0.1:4321/api/health.json"

usage() {
  echo "Usage: $0 --sha <commit-sha> --image <image> --archive <path>" >&2
  exit 2
}

SHA=""
IMAGE=""
ARCHIVE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --sha) SHA="${2:-}"; shift 2 ;;
    --image) IMAGE="${2:-}"; shift 2 ;;
    --archive) ARCHIVE="${2:-}"; shift 2 ;;
    *) usage ;;
  esac
done

[[ "$(id -u)" == "0" ]] || { echo "Run through sudo as root" >&2; exit 1; }
[[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "Invalid commit SHA" >&2; exit 1; }
[[ "$IMAGE" =~ ^[A-Za-z0-9._:/-]+$ ]] || { echo "Invalid image name" >&2; exit 1; }
[[ -f "$ARCHIVE" ]] || { echo "Image archive not found: $ARCHIVE" >&2; exit 1; }
[[ -f "$COMPOSE_FILE" ]] || { echo "Compose file not found: $COMPOSE_FILE" >&2; exit 1; }
[[ -f "/etc/kubtel-site.env" ]] || { echo "Production env not found" >&2; exit 1; }

install -d -o root -g root -m 0750 "$(dirname "$IMAGE_STATE")"
PREVIOUS_IMAGE=""
if [[ -s "$IMAGE_STATE" ]]; then
  PREVIOUS_IMAGE="$(<"$IMAGE_STATE")"
fi

docker load --input "$ARCHIVE"
docker image inspect "$IMAGE" >/dev/null

rollback() {
  if [[ -n "$PREVIOUS_IMAGE" ]]; then
    KUBTEL_IMAGE="$PREVIOUS_IMAGE" KUBTEL_ENV_FILE=/etc/kubtel-site.env docker compose --env-file /etc/kubtel-site.env \
      --file "$COMPOSE_FILE" up -d --no-build --pull never "$SERVICE_NAME" || true
    printf '%s\n' "$PREVIOUS_IMAGE" > "$IMAGE_STATE"
  fi
}
trap rollback ERR

KUBTEL_IMAGE="$IMAGE" KUBTEL_ENV_FILE=/etc/kubtel-site.env docker compose --env-file /etc/kubtel-site.env \
  --file "$COMPOSE_FILE" up -d --no-build --pull never "$SERVICE_NAME"

for attempt in {1..20}; do
  if curl --fail --silent --show-error --max-time 3 "$HEALTH_URL" >/dev/null; then
    trap - ERR
    printf '%s\n' "$IMAGE" > "$IMAGE_STATE"
    chmod 0640 "$IMAGE_STATE"
    rm -f -- "$ARCHIVE"
    echo "Deployed $SHA as $IMAGE"
    exit 0
  fi
  sleep 1
done

echo "Health check failed after deploying $SHA" >&2
exit 1
