"use client"

import {
  useHookFormAction,
  type InferUseHookFormActionHookReturn,
} from "@next-safe-action/adapter-react-hook-form/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import type { DefaultValues, FieldValues, Resolver } from "react-hook-form"
import type { HookSafeActionFn } from "next-safe-action/hooks"
import type { z, ZodTypeAny } from "zod"

type FormValues<TSchema extends ZodTypeAny> = z.input<TSchema> & FieldValues

type UseActionFormOptions<
  TSchema extends ZodTypeAny,
  TAction extends HookSafeActionFn<unknown, TSchema, unknown, unknown>,
> = {
  action: TAction
  schema: TSchema
  defaultValues: DefaultValues<FormValues<TSchema>>
  values?: FormValues<TSchema>
  onSuccess?: (
    data: NonNullable<
      InferUseHookFormActionHookReturn<TAction>["action"]["result"]["data"]
    >
  ) => void
  onError?: (error: InferUseHookFormActionHookReturn<TAction>["action"]["result"]["serverError"]) => void
}

function createResolver<TSchema extends ZodTypeAny>(
  schema: TSchema
): Resolver<FormValues<TSchema>, unknown, z.output<TSchema>> {
  return (zodResolver as (...args: unknown[]) => unknown)(schema) as Resolver<
    FormValues<TSchema>,
    unknown,
    z.output<TSchema>
  >
}

function useActionForm<
  TSchema extends ZodTypeAny,
  TAction extends HookSafeActionFn<unknown, TSchema, unknown, unknown>,
>({
  action,
  schema,
  defaultValues,
  values,
  onSuccess,
  onError,
}: UseActionFormOptions<TSchema, TAction>): InferUseHookFormActionHookReturn<TAction> {
  return useHookFormAction(action as never, createResolver(schema) as never, {
    actionProps: {
      onSuccess: ({ data }: { data: InferUseHookFormActionHookReturn<TAction>["action"]["result"]["data"] }) => {
        if (data !== undefined) {
          onSuccess?.(data as NonNullable<typeof data>)
        }
      },
      onError: ({ error }: { error?: { serverError?: unknown } }) => onError?.(error?.serverError),
    },
    formProps: {
      defaultValues: defaultValues as never,
      ...(values !== undefined && { values: values as never }),
    },
  }) as InferUseHookFormActionHookReturn<TAction>
}

export { useActionForm }
export type { UseActionFormOptions }
