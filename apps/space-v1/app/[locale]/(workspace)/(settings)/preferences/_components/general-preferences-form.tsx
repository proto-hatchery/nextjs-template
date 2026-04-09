"use client"

import { useAction } from "next-safe-action/hooks"

import { useAppForm } from "@workspace/forms/hooks/use-app-form"
import { Button } from "@workspace/ui/components/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"

import { updateGeneralPreferencesAction } from "../_actions/update-general-preferences.action"
import { generalPrefsSchema, type GeneralPrefsSchema } from "../_lib/schemas"

type GeneralPreferencesFormProps = {
  initialValues: GeneralPrefsSchema
}

function GeneralPreferencesForm({ initialValues }: GeneralPreferencesFormProps) {
  const { executeAsync, isPending: isSubmitting, result } = useAction(updateGeneralPreferencesAction)

  const form = useAppForm({
    schema: generalPrefsSchema,
    defaultValues: initialValues,
  })

  const onSubmit = form.handleSubmit(async (value) => {
    const res = await executeAsync(value)
    if (!res || res.serverError || res.validationErrors) {
      return
    }
    form.reset(value)
  })

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["displayName", "Display name"],
              ["workspaceName", "Workspace name"],
              ["locale", "Locale"],
              ["timezone", "Timezone"],
            ] as const
          ).map(([fieldName, label]) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    {fieldName === "displayName"
                      ? "This name appears across the protected workspace."
                      : fieldName === "workspaceName"
                        ? "Use the workspace label clinicians and assistants recognize."
                        : fieldName === "locale"
                          ? "Keep locale explicit until this section gets deeper localization support."
                          : "Timezone stays local to settings and should not overlap with scheduling rules."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {result.serverError ? (
          <p className="text-destructive text-sm">{result.serverError}</p>
        ) : null}

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs/relaxed">
            Save identity and workspace basics here without crossing into calendar or public
            presence concerns.
          </p>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save general settings"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export { GeneralPreferencesForm }
