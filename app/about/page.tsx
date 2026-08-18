import { FlaskConical, Dna, BrainCircuit, TableProperties, Trophy } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-w-0 flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16 xl:px-14">
      <div className="w-full min-w-0 max-w-6xl">
      {/* Hero */}
      <div className="flex max-w-4xl flex-col gap-4">
        <div className="flex items-center gap-2.5 text-primary">
          <FlaskConical className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-widest sm:text-base">
            About the Project
          </span>
        </div>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          What is ACPLearn?
        </h1>
        <p className="text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          ACPLearn is a deep learning-based tool for the prediction of
          anti-cancer peptides (ACPs). It uses a trained neural network model
          to classify peptide sequences based on their likelihood of exhibiting
          anti-cancer activity, providing researchers with a fast and
          accessible screening method.
        </p>
        <p className="text-base text-muted-foreground sm:text-lg">
          Created by <span className="font-semibold text-foreground">Aditya Koushik</span>
        </p>
      </div>

      {/* Before & After comparison */}
      <section className="mt-12">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <img
            src="/images/breast-cancer-comparison.png"
            alt="Microscopy comparison: breast cancer cells before and after treatment with an anticancer peptide"
            className="w-full"
          />
          <div className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-2">
            <div className="bg-card px-5 py-4">
              <p className="text-base font-semibold text-foreground">Before</p>
              <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                Breast cancer cells (untreated)
              </p>
            </div>
            <div className="bg-card px-5 py-4">
              <p className="text-base font-semibold text-foreground">After</p>
              <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                Treated with an anticancer peptide predicted by <strong className="text-foreground">ACPLearn</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          How the Pipeline Works
        </h2>
        <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          When you submit peptide sequences in FASTA format, ACPLearn processes
          them through the following stages:
        </p>

        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          <PipelineCard
            icon={<Dna className="h-5 w-5" />}
            step="1"
            title="Feature Extraction"
          >
            <p className="text-base leading-relaxed text-muted-foreground">
              Peptide sequences are encoded into numerical feature vectors
              using three{" "}
              <a
                href="https://github.com/Superzchen/iFeature/tree/master"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-2"
              >
                iFeature
              </a>{" "}
              descriptors:
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-base leading-relaxed text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">CTDC</span>{" "}
                {"--"} tracks the composition of amino acids grouped by physicochemical
                properties (polarity, charge, hydrophobicity, secondary structure
                preference, etc.).
              </li>
              <li>
                <span className="font-semibold text-foreground">CTDD</span>{" "}
                {"--"} captures the same property groupings but measures their
                distribution across the sequence rather than overall composition.
              </li>
              <li>
                <span className="font-semibold text-foreground">CKSAAGP</span>{" "}
                {"--"} calculates the frequency of amino acid group pairs separated
                by any k residues, capturing local sequence patterns.
              </li>
            </ul>
          </PipelineCard>
          <PipelineCard
            icon={<TableProperties className="h-5 w-5" />}
            step="2"
            title="Preprocessing"
            description="The extracted features are merged into a single matrix and normalized using pre-fitted MinMax scaling parameters before entering the neural network."
          />
          <PipelineCard
            icon={<BrainCircuit className="h-5 w-5" />}
            step="3"
            title="Prediction"
            description="The scaled features are passed through a 4-layer dense neural network with ReLU hidden activations and a sigmoid output that produces a probability score (0-1) for anti-cancer activity."
          />
        </div>
      </section>

      {/* Technical details */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Technical Details
        </h2>
        <div className="mt-5 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-base">
            <tbody>
              <DetailRow label="Model Architecture" value="4-layer Dense Neural Network with ReLU hidden layers and a Sigmoid output (Keras / TensorFlow)" />
              <DetailRow label="Feature Toolkit" value="iFeature (CTDC, CKSAAGP, CTDD)" />
              <DetailRow label="Preprocessing" value="Pre-fitted MinMax scaling parameters" />
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

      {/* Recognition */}
      <section className="mt-16">
        <h2 className="flex items-center gap-2.5 text-2xl font-semibold text-foreground sm:text-3xl">
          <Trophy className="h-6 w-6 text-primary" />
          Recognition
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row">
            <img
              src="/images/regeneron-sts-banner.png"
              alt="Regeneron Science Talent Search banner"
              className="h-20 w-auto shrink-0 object-contain"
            />
            <div className="flex flex-col justify-center gap-1">
              <p className="text-base font-semibold text-foreground sm:text-lg">Regeneron Science Talent Search</p>
              <p className="text-base leading-relaxed text-muted-foreground">
                Top 300 Scholar
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row">
            <img
              src="/images/isef-banner.jpeg"
              alt="Regeneron ISEF banner"
              className="h-20 w-auto shrink-0 rounded-md object-cover"
            />
            <div className="flex flex-col justify-center gap-1">
              <p className="text-base font-semibold text-foreground sm:text-lg">International Science & Engineering Fair</p>
              <p className="text-base leading-relaxed text-muted-foreground">
                ISEF Finalist
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mt-16">
        <div className="rounded-xl border border-border bg-secondary/50 px-5 py-5 sm:px-6">
          <h3 className="text-lg font-semibold text-foreground">Disclaimer</h3>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            ACPLearn is intended for research purposes only. Predictions
            generated by this tool should be validated experimentally. The
            authors do not guarantee the accuracy of predictions and are not
            responsible for any downstream use of the results.
          </p>
        </div>
      </section>
      </div>
    </div>
  );
}

function PipelineCard({
  icon,
  step,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
          {icon}
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          Step {step}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : (
        children
      )}
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
    <tr className={`${last ? "" : "border-b border-border"} block sm:table-row`}>
      <td className="block px-5 pb-1 pt-4 font-medium text-foreground sm:table-cell sm:whitespace-nowrap sm:py-4">
        {label}
      </td>
      <td
        className={`block px-5 pb-4 pt-0 leading-relaxed text-muted-foreground sm:table-cell sm:py-4 ${mono ? "break-words font-mono text-sm" : ""}`}
      >
        {value}
      </td>
    </tr>
  );
}
