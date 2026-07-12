import { Spinner } from "@workspace/ui/components/spinner";

export default function LoadingSelectPlanPage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center gap-4">
      <Spinner className="size-8 text-primary" />
      <p className="text-sm text-slate-500 font-light">Carregando planos...</p>
    </div>
  );
}
