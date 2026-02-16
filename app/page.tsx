import { PredictorForm } from "@/components/predictor-form";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <PredictorForm />
      </div>
    </div>
  );
}
