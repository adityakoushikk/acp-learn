import { PredictorForm } from "@/components/predictor-form";

export default function HomePage() {
  return (
    <div className="flex min-w-0 flex-1 items-start justify-center px-3 py-6 sm:px-6 sm:py-10 lg:px-10 lg:py-14 xl:px-14">
      <div className="w-full min-w-0 max-w-6xl rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10 xl:p-12">
        <PredictorForm />
      </div>
    </div>
  );
}
