"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { Wand2 } from "lucide-react";

interface DocumentsHeaderActionProps {
  onCreate: () => void;
}

export function DocumentsHeaderAction({ onCreate }: DocumentsHeaderActionProps) {
  return (
    <BrandButton variant="default" size="sm" onClick={onCreate}>
      <Wand2 className="size-4 mr-2" />
      Gerar documento
    </BrandButton>
  );
}
