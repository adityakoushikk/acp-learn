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

function escapeCsvField(value: string): string {
  // Quoting prevents commas/newlines from breaking the CSV. Prefixing formula
  // characters prevents spreadsheet applications from executing a FASTA name.
  const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
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
          `${escapeCsvField(p.name)},${p.probability.toFixed(4)},${getConfidenceLabel(p.probability).label}`
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
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Prediction Results
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            {predictions.length} peptide{predictions.length !== 1 ? "s" : ""}{" "}
            analyzed
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:flex md:w-auto">
          <button
            onClick={onBack}
            className={cn(
              "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-base font-medium text-foreground sm:text-lg",
              "transition-colors hover:bg-secondary"
            )}
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Input
          </button>
          <button
            onClick={handleExportCSV}
            className={cn(
              "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-base font-medium text-primary-foreground sm:text-lg",
              "transition-colors hover:bg-primary/90"
            )}
          >
            <Download className="h-5 w-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-base">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-5 py-4 text-left font-medium text-muted-foreground">
                  #
                </th>
                <th className="px-5 py-4 text-left font-medium text-muted-foreground">
                  Peptide Name
                </th>
                <th className="px-5 py-4 text-left font-medium text-muted-foreground">
                  ACP Probability
                </th>
                <th className="px-5 py-4 text-left font-medium text-muted-foreground">
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
                    <td className="px-5 py-4 text-muted-foreground tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-foreground sm:text-base">
                      {p.name}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm tabular-nums text-foreground sm:text-base">
                      {p.probability.toFixed(4)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-sm font-medium",
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
      <div className="grid gap-4 md:grid-cols-3">
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
    <div className="rounded-xl border border-border bg-card px-5 py-5 sm:px-6">
      <p className="text-base font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
