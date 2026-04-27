"use client"

import { useSearchParams } from "next/navigation"
import { useTransition } from "react"

import type { PatientDirectoryFilterState } from "@/app/[locale]/(workspace)/(care)/patients/_lib/patient-types"
import { usePathname, useRouter } from "@/i18n/navigation"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

type PatientsDirectoryFiltersProps = {
  filters: PatientDirectoryFilterState
}

export function PatientsDirectoryFilters({ filters }: PatientsDirectoryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function updateSearchParams(nextValues: Partial<PatientDirectoryFilterState>) {
    const params = new URLSearchParams(searchParams.toString())

    const mergedValues: PatientDirectoryFilterState = {
      ...filters,
      ...nextValues,
    }

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

    if (mergedValues.sort !== "name") {
      params.set("sort", mergedValues.sort)
    } else {
      params.delete("sort")
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname

    startTransition(() => {
      router.replace(nextUrl)
    })
  }

  return (
    <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
      <Input
        type="search"
        value={filters.query}
        onChange={(event) => updateSearchParams({ query: event.target.value })}
        placeholder="Search by patient, focus area, or tag"
        aria-label="Search patients"
        disabled={isPending}
      />

      <Select
        value={filters.status}
        onValueChange={(value) =>
          updateSearchParams({ status: value as PatientDirectoryFilterState["status"] })
        }
        disabled={isPending}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="Active care">Active care</SelectItem>
          <SelectItem value="Needs follow-up">Needs follow-up</SelectItem>
          <SelectItem value="Intake scheduled">Intake scheduled</SelectItem>
          <SelectItem value="Stepped down">Stepped down</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sort}
        onValueChange={(value) =>
          updateSearchParams({ sort: value as PatientDirectoryFilterState["sort"] })
        }
        disabled={isPending}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Sort by name</SelectItem>
          <SelectItem value="next-session">Sort by next session</SelectItem>
          <SelectItem value="recent-activity">Sort by recent activity</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
