#!/usr/bin/env bash
# Idempotent environment bootstrap for the Orion Streamlit app.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
sudo apt-get install -y -qq postgresql postgresql-contrib python3-venv proxychains4 socat

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
./.venv/bin/pip install --upgrade pip
# v1 (Streamlit) deps and v2 (FastAPI) backend deps share the same venv.
./.venv/bin/pip install -r requirements.txt
./.venv/bin/pip install -r backend/requirements.txt

# v2 (React) frontend deps. Node is provided by the base image.
if [ -f frontend/package-lock.json ] && command -v npm >/dev/null 2>&1; then
  (cd frontend && npm ci)
fi

# Local dev .env (gitignored). DB credentials match .cursor/db/init_db.sh
# defaults so both v1 and v2 connect to the local PostgreSQL out of the box.
if [ ! -f .env ]; then
  cat >.env <<'EOF'
ORION_DB_HOST=localhost
ORION_DB_PORT=5432
ORION_DB_NAME=orion
ORION_DB_USER=orion_user
ORION_DB_PASSWORD=orion_dev_password
ORION_SESSION_SECRET=orion-dev-session-secret-local-only
ORION_ADMIN_USERNAME=admin
ORION_ADMIN_PASSWORD=orion_dev_password
ORION_SESSION_TTL_DAYS=7
ORION_PORT=8501
ORION_BIND=0.0.0.0
ORION_API_PORT=8000
EOF
fi

if ! command -v tailscale >/dev/null 2>&1; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi

PROXYCHAINS=/etc/proxychains4.conf
sudo sed -i 's/^strict_chain/#strict_chain/' "$PROXYCHAINS"
sudo sed -i 's/^#dynamic_chain/dynamic_chain/' "$PROXYCHAINS"
sudo sed -i 's/^#proxy_dns/proxy_dns/' "$PROXYCHAINS"
sudo sed -i 's/^# localnet 127\.0\.0\.0\/255\.0\.0\.0/localnet 127.0.0.0\/255.0.0.0/' "$PROXYCHAINS"
grep -q '127.0.0.1 1055' "$PROXYCHAINS" || echo 'socks5 127.0.0.1 1055' | sudo tee -a "$PROXYCHAINS" >/dev/null

sudo pg_ctlcluster 16 main start 2>/dev/null || true
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then break; fi
  sleep 1
done

bash "$REPO_ROOT/.cursor/db/init_db.sh"

echo "Install complete."
