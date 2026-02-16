"use client";

import { ArrowLeft, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Prediction {
  name: string;
  probability: number;
}

interface ResultsTableProps {
  predictions: Prediction[];
  onBack: () => void;
}

function getConfidenceLabel(prob: number): {
  label: string;
  className: string;
} {
  if (prob >= 0.7) {
    return { label: "High", className: "bg-primary/10 text-primary" };
  }
  if (prob >= 0.4) {
    return {
      label: "Moderate",
      className: "bg-amber-100 text-amber-700",
    };
  }
  return { label: "Low", className: "bg-secondary text-muted-foreground" };
}

export function ResultsTable({ predictions, onBack }: ResultsTableProps) {
  function handleExportCSV() {
    const header = "Peptide Name,ACP Probability,Confidence\n";
    const rows = predictions
      .map(
        (p) =>
          `${p.name},${p.probability.toFixed(4)},${getConfidenceLabel(p.probability).label}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "acplearn_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Prediction Results
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {predictions.length} peptide{predictions.length !== 1 ? "s" : ""}{" "}
            analyzed
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground",
              "transition-colors hover:bg-secondary"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Input
          </button>
          <button
            onClick={handleExportCSV}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
              "transition-colors hover:bg-primary/90"
            )}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Peptide Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  ACP Probability
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, i) => {
                const { label, className } = getConfidenceLabel(p.probability);
                return (
                  <tr
                    key={p.name}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-secondary/30",
                      i === predictions.length - 1 && "border-b-0"
                    )}
                  >
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-foreground">
                      {p.probability.toFixed(4)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          className
                        )}
                      >
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Peptides"
          value={predictions.length.toString()}
        />
        <SummaryCard
          label="High Confidence ACPs"
          value={predictions
            .filter((p) => p.probability >= 0.7)
            .length.toString()}
        />
        <SummaryCard
          label="Avg. Probability"
          value={(
            predictions.reduce((sum, p) => sum + p.probability, 0) /
            predictions.length
          ).toFixed(4)}
        />
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
