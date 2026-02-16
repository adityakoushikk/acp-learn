#!/usr/bin/env bash
# Start the Flask backend (port 5000). Run this in a separate terminal before using the Next.js app.
cd "$(dirname "$0")"
export APP_BASE_DIR="$(pwd)"
source venv/bin/activate
echo "Starting Flask backend at http://127.0.0.1:5000"
python app.py
