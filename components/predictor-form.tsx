"use client";

import { useState, useTransition } from "react";
import { validateFasta } from "@/lib/fasta-validation";
import { FlaskConical, Upload, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResultsTable } from "@/components/results-table";

// The Flask backend URL -- adjust if running on a different host/port
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

interface Prediction {
  name: string;
  probability: number;
}

export function PredictorForm() {
  const [fastaInput, setFastaInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Prediction[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  function handleLoadSample() {
    startTransition(async () => {
      try {
        const res = await fetch(`${API_BASE}/get_sample_fasta`);
        if (!res.ok) throw new Error("Failed to load sample data");
        const data = await res.text();
        setFastaInput(data);
        setError(null);
        setResults(null);
      } catch {
        setError(
          "Could not load sample FASTA data. Make sure the backend is running."
        );
      }
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResults(null);

    const validation = validateFasta(fastaInput);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ peptides: fastaInput }),
      });

      if (!res.ok) throw new Error("Prediction failed");

      const data = await res.json();
      setResults(data.predictions);
    } catch {
      setError(
        "Prediction request failed. Make sure the Flask backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResults(null);
    setError(null);
  }

  if (results) {
    return <ResultsTable predictions={results} onBack={handleReset} />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <FlaskConical className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest">
            Peptide Predictor
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
          ACPLearn v1.0
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground text-pretty">
          Deep learning-based anti-cancer peptide predictor. Paste your peptide
          sequences in FASTA format below to get started.
        </p>
      </div>

      {/* Textarea */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="fasta-input"
          className="text-sm font-medium text-foreground"
        >
          Enter peptides in FASTA format
          <span className="ml-1 text-muted-foreground font-normal">
            (each record must start with &apos;{'>'}
            &apos;)
          </span>
        </label>
        <textarea
          id="fasta-input"
          value={fastaInput}
          onChange={(e) => {
            setFastaInput(e.target.value);
            if (error) setError(null);
          }}
          rows={12}
          placeholder={`>ACP_1|1\nAIGSILGALAKGLPTLISWIKNR\n>ACP_2|1\nAWKKWAKAWKWAKAKWWAKAA`}
          className={cn(
            "w-full rounded-lg border bg-card px-4 py-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
            "resize-y transition-shadow",
            error ? "border-destructive" : "border-input"
          )}
          required
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleLoadSample}
          disabled={isPending}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground",
            "transition-colors hover:bg-secondary",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Load Sample FASTA
        </button>
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground",
            "transition-colors hover:bg-primary/90",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FlaskConical className="h-4 w-4" />
          )}
          {loading ? "Predicting..." : "Run Prediction"}
        </button>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-border bg-secondary/50 px-4 py-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">How it works:</strong> ACPLearn
          extracts CTDC, CKSAAGP, and CTDD features from your peptide sequences
          using iFeature, then feeds them through a trained deep learning model
          to predict anti-cancer activity. Each sequence must be at least 7
          amino acids long and contain only valid amino acid characters
          (ACDEFGHIKLMNPQRSTVWY).
        </p>
      </div>
    </form>
  );
}
