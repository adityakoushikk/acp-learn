import { PredictorForm } from "@/components/predictor-form";

export default function HomePage() {
  return (
    <div className="flex flex-1 items-start justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-3xl rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <PredictorForm />
      </div>
    </div>
  );
}
