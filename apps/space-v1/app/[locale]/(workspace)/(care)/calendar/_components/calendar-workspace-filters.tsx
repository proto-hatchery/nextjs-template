"use client"

import { useSearchParams } from "next/navigation"
import { useTransition } from "react"

import type { CalendarFilterState } from "@/app/[locale]/(workspace)/(care)/calendar/_lib/calendar-types"
import { usePathname, useRouter } from "@/i18n/navigation"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

export function CalendarWorkspaceFilters({ filters }: { filters: CalendarFilterState }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function updateSearchParams(nextValues: Partial<CalendarFilterState>) {
    const params = new URLSearchParams(searchParams.toString())
    const mergedValues = { ...filters, ...nextValues }

    params.set("date", mergedValues.date)

    if (mergedValues.view !== "month") {
      params.set("view", mergedValues.view)
    } else {
      params.delete("view")
    }

    if (mergedValues.kind !== "all") {
      params.set("kind", mergedValues.kind)
    } else {
      params.delete("kind")
    }

    const nextUrl = `${pathname}?${params.toString()}`

    startTransition(() => {
      router.replace(nextUrl)
    })
  }

  return (
    <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-[0.9fr_0.8fr_0.8fr]">
      <Input
        type="date"
        value={filters.date}
        onChange={(event) => updateSearchParams({ date: event.target.value })}
        aria-label="Select calendar date"
        disabled={isPending}
      />

      <Select
        value={filters.view}
        onValueChange={(value) =>
          updateSearchParams({ view: value as CalendarFilterState["view"] })
        }
        disabled={isPending}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="View" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Month view</SelectItem>
          <SelectItem value="day">Day agenda</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.kind}
        onValueChange={(value) =>
          updateSearchParams({ kind: value as CalendarFilterState["kind"] })
        }
        disabled={isPending}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          <SelectItem value="clinical-session">Sessions</SelectItem>
          <SelectItem value="meeting">Meetings</SelectItem>
          <SelectItem value="supervision">Supervisions</SelectItem>
          <SelectItem value="block">Blocks</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
