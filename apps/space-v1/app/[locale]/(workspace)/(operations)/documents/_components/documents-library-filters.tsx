"use client"

import { useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { usePathname, useRouter } from "@/i18n/navigation"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import type { DocumentsFilterState } from "@/app/[locale]/(workspace)/(operations)/documents/_lib/document-types"

type DocumentsLibraryFiltersProps = {
  filters: DocumentsFilterState
}

export function DocumentsLibraryFilters({ filters }: DocumentsLibraryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function updateSearchParams(nextValues: Partial<DocumentsFilterState>) {
    const params = new URLSearchParams(searchParams.toString())
    const mergedValues = { ...filters, ...nextValues }

    if (mergedValues.query) {
      params.set("query", mergedValues.query)
    } else {
      params.delete("query")
    }

    if (mergedValues.status !== "all") {
      params.set("status", mergedValues.status)
    } else {
      params.delete("status")
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname

    startTransition(() => {
      router.replace(nextUrl)
    })
  }

  return (
    <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1.2fr_0.8fr]">
      <Input
        type="search"
        value={filters.query}
        onChange={(event) => updateSearchParams({ query: event.target.value })}
        placeholder="Search by title, patient, or document kind"
        aria-label="Search documents"
        disabled={isPending}
      />

      <Select
        value={filters.status}
        onValueChange={(value) =>
          updateSearchParams({ status: value as DocumentsFilterState["status"] })
        }
        disabled={isPending}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="Draft">Draft</SelectItem>
          <SelectItem value="Needs review">Needs review</SelectItem>
          <SelectItem value="Shared">Shared</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
