import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { useAppForm } from "@workspace/forms/hooks/use-app-form"

describe("useAppForm", () => {
  it("uses the zod resolver and returns parsed submit values", async () => {
    const onSubmit = vi.fn()
    const schema = z.object({
      email: z
        .string()
        .trim()
        .email()
        .transform((value) => value.toLowerCase()),
    })

    const { result } = renderHook(() =>
      useAppForm({
        defaultValues: {
          email: "USER@example.test",
        },
        schema,
      })
    )

    await act(async () => {
      await result.current.handleSubmit(onSubmit)()
    })

    expect(onSubmit).toHaveBeenCalledWith(
      { email: "user@example.test" },
      undefined
    )
  })
})
