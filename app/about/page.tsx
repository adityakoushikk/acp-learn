import { FlaskConical, Dna, BrainCircuit, TableProperties, Award, Trophy } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      {/* Hero */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-primary">
          <FlaskConical className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest">
            About the Project
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
          What is ACPLearn?
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground text-pretty">
          ACPLearn is a deep learning-based tool for the prediction of
          anti-cancer peptides (ACPs). It uses a trained neural network model
          to classify peptide sequences based on their likelihood of exhibiting
          anti-cancer activity, providing researchers with a fast and
          accessible screening method.
        </p>
        <p className="text-sm text-muted-foreground">
          Created by <span className="font-semibold text-foreground">Aditya Koushik</span>
        </p>
      </div>

      {/* Awards */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Recognition
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex gap-4 rounded-lg border border-border bg-card p-5">
            <img
              src="/images/regeneron-sts-banner.png"
              alt="Regeneron Science Talent Search banner"
              className="h-20 w-auto shrink-0 object-contain"
            />
            <div className="flex flex-col justify-center gap-1">
              <p className="text-sm font-semibold text-foreground">Regeneron Science Talent Search</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Top 300 Scholar
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-lg border border-border bg-card p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-accent">
              <Award className="h-7 w-7 text-primary" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <p className="text-sm font-semibold text-foreground">International Science & Engineering Fair</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                ISEF Finalist
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After comparison */}
      <section className="mt-10">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <img
            src="/images/breast-cancer-comparison.png"
            alt="Microscopy comparison: breast cancer cells before and after treatment with an anticancer peptide"
            className="w-full"
          />
          <div className="grid grid-cols-2 gap-px border-t border-border bg-border">
            <div className="bg-card px-4 py-3">
              <p className="text-xs font-semibold text-foreground">Before</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Breast cancer cells (untreated)
              </p>
            </div>
            <div className="bg-card px-4 py-3">
              <p className="text-xs font-semibold text-foreground">After</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Treated with an anticancer peptide predicted by deep learning model
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">
          How the Pipeline Works
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          When you submit peptide sequences in FASTA format, ACPLearn processes
          them through the following stages:
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <PipelineCard
            icon={<Dna className="h-5 w-5" />}
            step="1"
            title="Feature Extraction"
            description="Peptide sequences are encoded into numerical feature vectors using three iFeature descriptors: CTDC, CKSAAGP, and CTDD. These capture compositional and distributional properties of amino acid groups."
          />
          <PipelineCard
            icon={<TableProperties className="h-5 w-5" />}
            step="2"
            title="Preprocessing"
            description="The extracted features are merged into a single matrix and standardized using a pre-fitted scaler to normalize the input for the neural network."
          />
          <PipelineCard
            icon={<BrainCircuit className="h-5 w-5" />}
            step="3"
            title="Prediction"
            description="The scaled features are passed through a dense neural network with three hidden layers (126, 63, and 42 units) using ReLU activations and dropout regularization, ending in a sigmoid output that produces a probability score (0-1) for anti-cancer activity."
          />
        </div>
      </section>

      {/* Technical details */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">
          Technical Details
        </h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <tbody>
              <DetailRow label="Model Architecture" value="4-layer Dense Neural Network (126 -> 63 -> 42 -> 1) with ReLU, Dropout, and Sigmoid output (Keras / TensorFlow)" />
              <DetailRow label="Feature Toolkit" value="iFeature (CTDC, CKSAAGP, CTDD)" />
              <DetailRow label="Preprocessing" value="StandardScaler (scikit-learn)" />
              <DetailRow label="Input Format" value="FASTA (minimum 7 amino acids per sequence)" />
              <DetailRow
                label="Valid Amino Acids"
                value="A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y"
                mono
              />
              <DetailRow label="Output" value="Per-peptide probability score (0 = non-ACP, 1 = ACP)" last />
            </tbody>
          </table>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mt-12">
        <div className="rounded-lg border border-border bg-secondary/50 px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Disclaimer</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            ACPLearn is intended for research purposes only. Predictions
            generated by this tool should be validated experimentally. The
            authors do not guarantee the accuracy of predictions and are not
            responsible for any downstream use of the results.
          </p>
        </div>
      </section>
    </div>
  );
}

function PipelineCard({
  icon,
  step,
  title,
  description,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-primary">
          {icon}
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          Step {step}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <tr className={last ? "" : "border-b border-border"}>
      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
        {label}
      </td>
      <td
        className={`px-4 py-3 text-muted-foreground ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </td>
    </tr>
  );
}
