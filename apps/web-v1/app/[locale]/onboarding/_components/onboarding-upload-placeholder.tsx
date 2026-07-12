import { Upload } from "lucide-react";

interface OnboardingUploadPlaceholderProps {
  label: string;
  caption?: string;
}

export function OnboardingUploadPlaceholder({
  label,
  caption = "(Simulado para este onboarding)",
}: OnboardingUploadPlaceholderProps) {
  return (
    <div className="space-y-2">
      <div className="flex min-h-24 w-full cursor-not-allowed flex-col gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-left transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
        <span className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
          {label}
        </span>

        <div className="flex items-center gap-4">
          <div className="shrink-0 rounded-full bg-indigo-50 p-2.5 text-indigo-500 ring-2 ring-indigo-50/70">
            <Upload className="size-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-slate-900">Upload de documento</p>
            <p className="text-xs text-slate-500">{caption}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
