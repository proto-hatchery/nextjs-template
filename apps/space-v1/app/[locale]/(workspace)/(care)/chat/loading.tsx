import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ChatLoading() {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      {/* Mensagem central */}
      <div className="flex flex-1 items-center justify-center px-6">
        <Skeleton className="h-9 w-[280px] md:h-10 md:w-[340px] rounded-lg" />
      </div>

      {/* Campo de input */}
      <div className="shrink-0 bg-background px-4 pb-10 pt-4 md:pb-12">
        <div className="mx-auto w-full md:max-w-[640px]">
          <div className="flex items-center gap-1.5 w-full bg-muted rounded-[32px] p-1.5 shadow-sm relative overflow-hidden h-[52px]">
            {/* Botão plus */}
            <Skeleton className="shrink-0 h-8 w-8 rounded-full" />

            {/* Input area */}
            <div className="flex-1 h-10 rounded-[28px] bg-transparent" />

            {/* Submit button */}
            <Skeleton className="shrink-0 h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
