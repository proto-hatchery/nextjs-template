import { FileText } from "lucide-react";

export function DocumentsEmptyState() {
  return (
    <div className="mt-6 flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="rounded-full bg-neutral-100 p-3 dark:bg-neutral-800 mb-4">
        <FileText className="size-6 text-neutral-400" />
      </div>
      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
        Nenhum documento encontrado
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
        Comece criando um novo documento ou use um modelo existente.
      </p>
    </div>
  );
}
