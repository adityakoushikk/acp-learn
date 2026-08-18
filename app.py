import logging
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from threading import Lock

import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

from backend.fasta import FastaValidationError, normalize_fasta

# Keep TensorFlow's startup logs quiet unless explicitly overridden.
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
from tensorflow import keras  # noqa: E402


logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)


def env_int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, default))
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer") from exc


app.config["MAX_CONTENT_LENGTH"] = env_int("MAX_CONTENT_LENGTH", 1_048_576)
app.json.sort_keys = False

# The browser normally calls the API through the same-origin Nginx/Next proxy.
# Only enable cross-origin access when explicit origins are configured.
cors_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
if cors_origins:
    CORS(app, resources={r"/*": {"origins": cors_origins}})

BASE_DIR = Path(
    os.environ.get("APP_BASE_DIR", Path(__file__).resolve().parent)
).expanduser().resolve()
FEATURE_TIMEOUT_SECONDS = env_int("FEATURE_TIMEOUT_SECONDS", 90)
MAX_PEPTIDES = env_int("MAX_PEPTIDES", 500)
MAX_SEQUENCE_LENGTH = env_int("MAX_SEQUENCE_LENGTH", 10_000)

MODEL_PATH = BASE_DIR / "dlmodel2.h5"
SCALER_PATH = BASE_DIR / "dlscaler.npz"
IFEATURE_PATH = BASE_DIR / "iFeature" / "iFeature.py"

for required_path in (MODEL_PATH, SCALER_PATH, IFEATURE_PATH):
    if not required_path.is_file():
        raise RuntimeError(f"Required application file is missing: {required_path}")

logger.info("Loading prediction model from %s", MODEL_PATH)
dlmodel = keras.models.load_model(MODEL_PATH, compile=False)
with np.load(SCALER_PATH, allow_pickle=False) as scaler_data:
    scaler_scale = scaler_data["scale"].copy()
    scaler_min = scaler_data["min"].copy()

if scaler_scale.ndim != 1 or scaler_min.shape != scaler_scale.shape:
    raise RuntimeError("Scaler parameters have invalid dimensions")
expected_feature_count = scaler_scale.size
if dlmodel.input_shape[-1] != expected_feature_count:
    raise RuntimeError(
        f"Model expects {dlmodel.input_shape[-1]} features; "
        f"scaler contains {expected_feature_count}"
    )
# Initialize TensorFlow during process startup instead of delaying the first
# real user's request.
dlmodel(np.zeros((1, expected_feature_count), dtype=np.float32), training=False)
logger.info("Prediction model and scaler loaded")

# TensorFlow inference is serialized inside each worker. Feature extraction can
# still run concurrently because every request now has its own temporary files.
prediction_lock = Lock()


class FeatureExtractionError(RuntimeError):
    pass


def process_peptides(peptides: str, expected_rows: int):
    """Extract and scale model features in an isolated request workspace."""
    with tempfile.TemporaryDirectory(prefix="acplearn-") as workspace:
        workspace_path = Path(workspace)
        input_path = workspace_path / "input.fasta"
        input_path.write_text(peptides, encoding="utf-8")

        output_files = {
            feature: workspace_path / f"{feature}.tsv"
            for feature in ("CTDC", "CKSAAGP", "CTDD")
        }

        for feature, output_path in output_files.items():
            try:
                subprocess.run(
                    [
                        sys.executable,
                        str(IFEATURE_PATH),
                        "--file",
                        str(input_path),
                        "--type",
                        feature,
                        "--out",
                        str(output_path),
                    ],
                    check=True,
                    capture_output=True,
                    text=True,
                    timeout=FEATURE_TIMEOUT_SECONDS,
                )
            except subprocess.TimeoutExpired as exc:
                raise FeatureExtractionError(
                    f"{feature} extraction exceeded {FEATURE_TIMEOUT_SECONDS} seconds"
                ) from exc
            except subprocess.CalledProcessError as exc:
                logger.error(
                    "%s extraction failed (exit %s): %s",
                    feature,
                    exc.returncode,
                    exc.stderr.strip(),
                )
                raise FeatureExtractionError(f"{feature} extraction failed") from exc

        frames = []
        for feature in ("CTDC", "CKSAAGP", "CTDD"):
            output_path = output_files[feature]
            if not output_path.is_file():
                raise FeatureExtractionError(f"{feature} did not produce an output file")

            frame = pd.read_csv(output_path, sep="\t")
            if "#" not in frame.columns:
                raise FeatureExtractionError(f"{feature} output is missing record names")
            if len(frame.index) != expected_rows:
                raise FeatureExtractionError(
                    f"{feature} produced {len(frame.index)} rows; expected {expected_rows}"
                )
            frames.append(frame.drop(columns="#").reset_index(drop=True))

        combined = pd.concat(frames, axis=1)
        if combined.shape[1] != expected_feature_count:
            raise FeatureExtractionError(
                f"Feature pipeline produced {combined.shape[1]} columns; "
                f"model scaler expects {expected_feature_count}"
            )

        return combined.values * scaler_scale + scaler_min


def request_peptides() -> str:
    if request.is_json:
        payload = request.get_json(silent=True) or {}
        return payload.get("peptides", "")
    return request.form.get("peptides", "")


@app.get("/healthz")
def health():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    try:
        peptides, peptide_names = normalize_fasta(
            request_peptides(),
            max_records=MAX_PEPTIDES,
            max_sequence_length=MAX_SEQUENCE_LENGTH,
        )
    except FastaValidationError as exc:
        return jsonify({"error": str(exc)}), 400

    try:
        input_data = process_peptides(peptides, expected_rows=len(peptide_names))
        with prediction_lock:
            probabilities = dlmodel.predict(input_data, verbose=0).reshape(-1)

        if len(probabilities) != len(peptide_names):
            raise RuntimeError(
                f"Model produced {len(probabilities)} predictions for "
                f"{len(peptide_names)} peptides"
            )
        if not np.isfinite(probabilities).all():
            raise RuntimeError("Model produced a non-finite probability")

        results = [
            {"name": name, "probability": float(probability)}
            for name, probability in zip(peptide_names, probabilities)
        ]
        return jsonify({"predictions": results})
    except Exception:  # Keep unexpected processing failures out of API responses.
        logger.exception("Prediction request failed")
        return jsonify({"error": "Prediction processing failed. Please try again."}), 500


@app.get("/get_sample_fasta")
def get_sample_fasta():
    sample_path = BASE_DIR / "sample_fasta.txt"
    try:
        return sample_path.read_text(encoding="utf-8"), 200, {"Content-Type": "text/plain"}
    except OSError:
        logger.exception("Could not read sample FASTA file")
        return jsonify({"error": "Sample FASTA is unavailable."}), 500


@app.errorhandler(413)
def request_too_large(_error):
    max_bytes = app.config["MAX_CONTENT_LENGTH"]
    return jsonify({"error": f"Request exceeds the {max_bytes}-byte limit."}), 413


if __name__ == "__main__":
    app.run(
        host=os.environ.get("FLASK_HOST", "127.0.0.1"),
        port=env_int("BACKEND_PORT", 5001),
        debug=os.environ.get("FLASK_DEBUG", "0") == "1",
    )
