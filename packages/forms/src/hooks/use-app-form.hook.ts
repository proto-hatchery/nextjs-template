"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
} from "react-hook-form"
import type { z, ZodTypeAny } from "zod"

type FormValues<TSchema extends ZodTypeAny> = z.input<TSchema> & FieldValues

type UseAppFormOptions<TSchema extends ZodTypeAny> = {
  schema: TSchema
  defaultValues: DefaultValues<FormValues<TSchema>>
  values?: FormValues<TSchema>
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

function useAppForm<TSchema extends ZodTypeAny>({
  schema,
  defaultValues,
  values,
}: UseAppFormOptions<TSchema>) {
  return useForm<FormValues<TSchema>, unknown, z.output<TSchema>>({
    resolver: createResolver(schema),
    defaultValues,
    ...(values !== undefined && { values }),
  })
}

export { useAppForm }
export type { UseAppFormOptions }
