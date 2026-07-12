import { Card, CardContent } from "@workspace/ui/components/card";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Inbox, Link2 } from "lucide-react";

interface TodoEmptyStateProps {
  onCreateTask: () => void;
}

export function TodoEmptyState({ onCreateTask }: TodoEmptyStateProps) {
  return (
    <Card className="h-full max-h-none rounded-xl border-none bg-muted/30 shadow-none">
      <CardContent className="h-full p-0">
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <div className="text-muted-foreground rounded-full border p-2">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium">Nenhuma tarefa ainda</p>
          <p className="text-muted-foreground mx-6 text-xs">
            Crie uma tarefa para começar a organizar seu dia
          </p>
          <div className="mt-1 flex items-center gap-2">
            <BrandButton size="sm" onClick={onCreateTask}>
              <Link2 className="mr-2 h-4 w-4" />
              Criar tarefa
            </BrandButton>
            <BrandButton size="sm" variant="neutral">
              Saiba mais
            </BrandButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
