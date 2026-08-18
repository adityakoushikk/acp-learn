#!/usr/bin/env bash
# Start the Flask development backend. Production uses Gunicorn via systemd.
cd "$(dirname "$0")"
export APP_BASE_DIR="$(pwd)"
source venv/bin/activate
export BACKEND_PORT="${BACKEND_PORT:-5001}"
export FLASK_DEBUG="${FLASK_DEBUG:-1}"
echo "Starting Flask backend at http://127.0.0.1:${BACKEND_PORT}"
python app.py
