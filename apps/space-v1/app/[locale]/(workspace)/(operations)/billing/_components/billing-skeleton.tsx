"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

/**
 * Skeleton da tabela de cobranças
 * Estrutura idêntica à billing-table.tsx
 */

export function BillingTableSkeleton() {
  return (
    <div className="w-full">
      {/* Header */}
      <Table className="w-full table-fixed">
        <TableHeader className="bg-background border-none">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead scope="col" className="border-none py-2.5">
              <Skeleton className="h-4 w-28" />
            </TableHead>
            <TableHead scope="col" className="border-none py-2.5 w-[35%]">
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead scope="col" className="border-none py-2.5 w-[20%]">
              <Skeleton className="h-4 w-28" />
            </TableHead>
            <TableHead scope="col" className="border-none py-2.5 w-[15%]">
              <Skeleton className="h-4 w-32" />
            </TableHead>
            <TableHead scope="col" className="border-none py-2.5 text-right">
              <Skeleton className="h-4 w-12 ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      {/* Body */}
      <Table className="w-full table-fixed">
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="border-none hover:bg-transparent">
              {/* Data */}
              <TableCell className="py-2.5 border-none">
                <Skeleton className="h-4 w-32" />
              </TableCell>

              {/* Paciente */}
              <TableCell className="py-2.5 border-none w-[35%]">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-14 mt-0.5" />
                  </div>
                </div>
              </TableCell>

              {/* Meio */}
              <TableCell className="py-2.5 border-none w-[20%]">
                <Skeleton className="h-4 w-20" />
              </TableCell>

              {/* Status */}
              <TableCell className="py-2.5 border-none w-[15%]">
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>

              {/* Valor */}
              <TableCell className="py-2.5 border-none text-right">
                <Skeleton className="h-4 w-20 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function BillingMobileSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}
