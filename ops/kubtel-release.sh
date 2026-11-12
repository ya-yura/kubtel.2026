#!/usr/bin/env bash
set -Eeuo pipefail

SITE_ROOT="/srv/kubtel-site"
SERVICE_NAME="kubtel-site"
HEALTH_URL="http://127.0.0.1:4321/api/health.json"
KEEP_RELEASES=3

usage() {
  echo "Usage: $0 --sha <commit-sha> --archive <path>" >&2
  exit 2
}

SHA=""
ARCHIVE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --sha) SHA="${2:-}"; shift 2 ;;
    --archive) ARCHIVE="${2:-}"; shift 2 ;;
    *) usage ;;
  esac
done

[[ "$(id -u)" == "0" ]] || { echo "Run through sudo as root" >&2; exit 1; }
[[ "$SHA" =~ ^[0-9a-f]{7,64}$ ]] || { echo "Invalid commit SHA" >&2; exit 1; }
[[ -f "$ARCHIVE" ]] || { echo "Release archive not found: $ARCHIVE" >&2; exit 1; }

RELEASE_DIR="$SITE_ROOT/releases/$SHA"
CURRENT_LINK="$SITE_ROOT/current"
PREVIOUS_TARGET=""
if [[ -L "$CURRENT_LINK" ]]; then
  PREVIOUS_TARGET="$(readlink -f "$CURRENT_LINK")"
fi

install -d -o kubtel -g kubtel -m 0750 "$SITE_ROOT/releases"
rm -rf -- "$RELEASE_DIR"
install -d -o kubtel -g kubtel -m 0750 "$RELEASE_DIR"
tar --extract --gzip --file "$ARCHIVE" --directory "$RELEASE_DIR"
chown -R kubtel:kubtel "$RELEASE_DIR"

if [[ ! -f "$RELEASE_DIR/server/entry.mjs" ]]; then
  echo "Release is missing server/entry.mjs" >&2
  rm -rf -- "$RELEASE_DIR"
  exit 1
fi

ln -s -- "$RELEASE_DIR" "$CURRENT_LINK.new"
mv -Tf -- "$CURRENT_LINK.new" "$CURRENT_LINK"

rollback() {
  if [[ -n "$PREVIOUS_TARGET" && -d "$PREVIOUS_TARGET" ]]; then
    ln -s -- "$PREVIOUS_TARGET" "$CURRENT_LINK.rollback"
    mv -Tf -- "$CURRENT_LINK.rollback" "$CURRENT_LINK"
    systemctl restart "$SERVICE_NAME" || true
  fi
}
trap rollback ERR

systemctl daemon-reload
systemctl restart "$SERVICE_NAME"
for attempt in {1..20}; do
  if curl --fail --silent --show-error --max-time 3 "$HEALTH_URL" >/dev/null; then
    trap - ERR
    rm -f -- "$ARCHIVE"
    echo "Deployed $SHA"
    exit 0
  fi
  sleep 1
done

echo "Health check failed after deploying $SHA" >&2
exit 1
