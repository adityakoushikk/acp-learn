"use client";

import { useState, useTransition } from "react";
import { validateFasta } from "@/lib/fasta-validation";
import { FlaskConical, Upload, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResultsTable } from "@/components/results-table";

// Same-origin by default: Next proxies locally and Nginx routes /api in production.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

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
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        const data = await res.text();
        setFastaInput(data);
        setError(null);
        setResults(null);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Request failed";
        setError(
          `Could not load sample FASTA. Make sure the Flask backend is running on port 5001. (${msg})`
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

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? `Backend returned ${res.status}`);
      }
      if (!Array.isArray(data?.predictions)) {
        throw new Error("Backend returned an invalid response");
      }
      setResults(data.predictions);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Request failed";
      setError(
        `Prediction failed. Make sure the Flask backend is running on port 5001. (${msg})`
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex max-w-4xl flex-col gap-3">
        <div className="flex items-center gap-2.5 text-primary">
          <FlaskConical className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-widest sm:text-base">
            Peptide Predictor
          </span>
        </div>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          ACPLearn v1.0
        </h1>
        <p className="text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Deep learning-based anti-cancer peptide predictor. Paste your peptide
          sequences in FASTA format below to get started.
        </p>
      </div>

      {/* Textarea */}
      <div className="flex flex-col gap-3">
        <label
          htmlFor="fasta-input"
          className="text-base font-medium text-foreground sm:text-lg"
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
          rows={16}
          placeholder={`>ACP_1|1\nAIGSILGALAKGLPTLISWIKNR\n>ACP_2|1\nAWKKWAKAWKWAKAKWWAKAA`}
          className={cn(
            "min-h-80 w-full resize-y rounded-xl border bg-card px-4 py-4 font-mono text-base leading-7 text-foreground placeholder:text-muted-foreground/50 sm:min-h-96 sm:px-5 sm:py-5 sm:text-lg lg:min-h-[28rem]",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
            "transition-shadow",
            error ? "border-destructive" : "border-input"
          )}
          required
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4 text-base text-destructive sm:px-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={handleLoadSample}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-6 py-3 text-base font-medium text-foreground sm:w-auto sm:text-lg",
            "transition-colors hover:bg-secondary",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
          Load Sample FASTA
        </button>
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground sm:w-auto sm:text-lg",
            "transition-colors hover:bg-primary/90",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FlaskConical className="h-5 w-5" />
          )}
          {loading ? "Predicting..." : "Run Prediction"}
        </button>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-border bg-secondary/50 px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
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
