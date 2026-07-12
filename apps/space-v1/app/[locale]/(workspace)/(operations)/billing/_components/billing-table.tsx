"use client";

import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/brand/patterns/components/empty";
import { UserAvatar } from "@workspace/brand/patterns/user-avatar";
import { Receipt } from "lucide-react";

import { formatPaymentMethod, formatPaymentStatus } from "@/lib/utils/enum-formatters";

import type { BillingRow } from "../types/billing-row";

interface BillingTableProps {
  rows: BillingRow[];
  hasError?: boolean;
  errorMessage?: string;
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  onRowClick?: ((row: BillingRow) => void) | undefined;
  onRefresh?: () => void;
}

export function BillingTable({
  rows,
  hasError,
  errorMessage,
  sentinelRef,
  isFetchingNextPage = false,
  onRowClick,
}: BillingTableProps) {
  const isEmpty = !rows || rows.length === 0;

  // Empty or error states - no scroll, static table
  if (hasError || isEmpty) {
    return (
      <div className="w-full max-w-full mt-4 h-full flex flex-col">
        <Table className="w-full table-fixed max-w-full">
          <TableHeader className="bg-background border-none">
            <TableRow className="hover:bg-transparent border-none border-b-0">
              <TableHead scope="col" className="border-none">
                Data da Sessão
              </TableHead>
              <TableHead scope="col" className="border-none">
                Paciente
              </TableHead>
              <TableHead scope="col" className="border-none">
                Valor
              </TableHead>
              <TableHead scope="col" className="border-none">
                Meio de Pagamento
              </TableHead>
              <TableHead scope="col" className="border-none">
                Status de Pagamento
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex-1 min-h-0">
          <Table className="w-full table-fixed max-w-full h-full">
            <TableBody className="h-full">
              {hasError ? (
                <TableRow className="h-full">
                  <TableCell colSpan={5} className="align-middle h-full">
                    <div className="flex items-center justify-center px-4 py-32 h-full">
                      <div className="text-center max-w-xl mx-auto">
                        <h3 className="text-lg font-semibold text-destructive">
                          Erro ao carregar cobranças
                        </h3>
                        <p className="text-muted-foreground mt-2 text-sm">
                          {errorMessage ?? "Dados não disponíveis"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow className="h-full">
                  <TableCell colSpan={5} className="align-middle h-full p-0">
                    <Empty className="h-full border-0 rounded-none">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Receipt className="size-6" />
                        </EmptyMedia>
                        <EmptyTitle>Nenhuma cobrança registrada</EmptyTitle>
                        <EmptyDescription>
                          Comece a registrar suas cobranças para manter o controle financeiro do seu
                          consultório.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Has data - table with scrollable body
  return (
    <div className="w-full max-w-full flex flex-col min-h-0 h-full">
      <div className="rounded-lg overflow-hidden flex flex-col h-full min-h-0 w-full">
        <div className="shrink-0 w-full">
          <Table className="w-full table-fixed max-w-full">
            <TableHeader className="bg-background border-none">
              <TableRow className="hover:bg-transparent border-none border-b-0">
                <TableHead scope="col" className="border-none">
                  Data da Sessão
                </TableHead>
                <TableHead scope="col" className="border-none w-[35%]">
                  Paciente
                </TableHead>
                <TableHead scope="col" className="border-none w-[20%]">
                  Meio de Pagamento
                </TableHead>
                <TableHead scope="col" className="border-none w-[15%]">
                  Status de Pagamento
                </TableHead>
                <TableHead scope="col" className="border-none text-right">
                  Valor
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        <div className="flex-1 min-h-0 relative w-full">
          <ScrollArea className="h-full w-full *:data-[slot=scroll-area-scrollbar]:hidden">
            <Table className="w-full table-fixed max-w-full">
              <TableBody>
                {rows.map((row) => {
                  const statusInfo = formatPaymentStatus(row.status);
                  return (
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/50 transition-colors border-none cursor-pointer"
                      onClick={() => onRowClick?.(row)}
                    >
                      <TableCell className="py-2.5 whitespace-nowrap border-none">
                        {row.createdAt}
                      </TableCell>
                      <TableCell className="py-2.5 border-none w-[35%]">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={row.patient}
                            avatarUrl={row.avatarUrl ?? null}
                            className="h-8 w-8"
                            fallbackClassName="text-xs"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{row.patient}</span>
                            <span className="text-xs text-muted-foreground">Paciente</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 border-none w-[20%]">
                        {formatPaymentMethod(row.method)}
                      </TableCell>
                      <TableCell className="py-2.5 border-none w-[15%]">
                        <Badge variant={statusInfo.variant ?? "default"}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="py-2.5 border-none text-right font-semibold">
                        {row.amount}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Sentinel for infinite scroll */}
            {sentinelRef && (
              <div ref={sentinelRef} className="h-4 flex items-center justify-center py-4">
                {isFetchingNextPage && (
                  <p className="text-sm text-muted-foreground">Carregando mais...</p>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Gradient fade at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
