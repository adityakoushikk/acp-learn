import os
import sys  # Import sys to use sys.executable
import subprocess
import pandas as pd
from flask import Flask, render_template, request

app = Flask(__name__, static_url_path='/static', static_folder='static')

from tensorflow import keras
import pickle

# Define base directory for the app
BASE_DIR = '/home/ubuntu/app'

# Load the deep learning model
dlmodel = keras.models.load_model(os.path.join(BASE_DIR, 'dlmodel2.h5'))

# Load the scaler
with open(os.path.join(BASE_DIR, 'dlscaler.pkl'), 'rb') as f:
    scaler = pickle.load(f)

# Ensure directories exist
def ensure_directories():
    os.makedirs(os.path.join(BASE_DIR, 'input'), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, 'output'), exist_ok=True)

# Function to process peptides
def process_peptides(peptides):
    ensure_directories()

    # Save peptides to input file
    input_file_path = os.path.join(BASE_DIR, 'input', 'input.txt')
    with open(input_file_path, 'w') as f:
        f.write(peptides)

    # Define output CSV files with absolute paths
    output_files = {
        'CTDC': os.path.join(BASE_DIR, 'output', 'CTDC.csv'),
        'CKSAAGP': os.path.join(BASE_DIR, 'output', 'CKSAAGP.csv'),
        'CTDD': os.path.join(BASE_DIR, 'output', 'CTDD.csv')
    }

    # Run iFeature to generate CSV files
    for feature, output_file in output_files.items():
        try:
            result = subprocess.run([
                sys.executable, os.path.join(BASE_DIR, "iFeature", "iFeature.py"),
                "--file", input_file_path,
                "--type", feature,
                "--out", output_file
            ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            print(f"{feature} CSV file created successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error running iFeature for {feature}: {e}")
            print(f"Stdout: {e.stdout}")
            print(f"Stderr: {e.stderr}")

    # Read and merge CSVs
    try:
        df_ctdd = pd.read_csv(output_files['CTDD'], sep='\t').drop(columns='#')
        df_cksaagp = pd.read_csv(output_files['CKSAAGP'], sep='\t').drop(columns='#')
        df_ctdc = pd.read_csv(output_files['CTDC'], sep='\t').drop(columns='#')

        combined_df = df_ctdc.join(df_cksaagp).join(df_ctdd)
        X = combined_df.values
        finaldf = scaler.transform(X)

        return finaldf
    except FileNotFoundError as e:
        print(f"CSV file not found: {e}")
        return None

# Extract peptide names
def extract_peptide_names(peptides):
    peptide_names = [line[1:] for line in peptides.splitlines() if line.startswith('>')]
    return peptide_names

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        peptides = request.form['peptides']
        if len(peptides) > 7:
            input_data = process_peptides(peptides)
            if input_data is not None:
                predictions = dlmodel.predict(input_data)
                peptide_names = extract_peptide_names(peptides)
                peptide_predictions = dict(zip(peptide_names, predictions))
                return render_template('results.html', predictions=peptide_predictions)
            else:
                return "Error generating features. Please try again.", 500
    return render_template('index.html')

# New route to serve sample FASTA data
@app.route('/get_sample_fasta', methods=['GET'])
def get_sample_fasta():
    sample_file_path = os.path.join(BASE_DIR, "sample_fasta.txt")
    try:
        with open(sample_file_path, "r") as f:
            sample_data = f.read()
        return sample_data, 200, {'Content-Type': 'text/plain'}
    except Exception as e:
        print(f"Error reading sample FASTA file: {e}")
        return "Error reading sample FASTA file.", 500

if __name__ == '__main__':
    app.run(debug=True)
