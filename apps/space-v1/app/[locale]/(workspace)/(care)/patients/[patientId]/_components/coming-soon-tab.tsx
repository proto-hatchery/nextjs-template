"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import { Construction } from "lucide-react";

interface ComingSoonTabProps {
  title?: string;
  description?: string;
}

export function ComingSoonTab({
  title = "Conteúdo em desenvolvimento",
  description = "Estamos preparando esta aba para integrar dados clínicos e históricos.",
}: ComingSoonTabProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Construction className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      </CardContent>
    </Card>
  );
}
