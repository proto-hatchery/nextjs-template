"use client";

import { Controller, useForm, zodResolver } from "@workspace/forms/react-hook-form";
import { getV2InputProps } from "@workspace/forms/v2/rhf";
import { dateOrUndefinedSchema } from "@workspace/forms/v2/schema";
import { Calendar } from "@workspace/ui/components/calendar";
import { Field, FieldError } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Flag, Flag as FlagFilled, Plus } from "lucide-react";
import { z } from "zod";

const todoSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  priority: z.enum(["none", "low", "medium", "high"]),
  dueDate: dateOrUndefinedSchema,
});

type TodoFormValues = z.infer<typeof todoSchema>;

interface TodoFormProps {
  onAdd: (title: string, priority: "none" | "low" | "medium" | "high", dueDate?: Date) => void;
  autoFocus?: boolean;
}

const priorityMeta = {
  none: { label: "Nenhuma", color: "text-muted-foreground" },
  low: { label: "Baixa", color: "text-blue-600" },
  medium: { label: "Média", color: "text-amber-600" },
  high: { label: "Alta", color: "text-rose-600" },
};

export function TodoForm({ onAdd, autoFocus }: TodoFormProps) {
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      priority: "none",
    },
  });

  function onSubmit(values: TodoFormValues) {
    onAdd(values.title, values.priority, values.dueDate);
    form.reset();
  }

  const dateValue = form.watch("dueDate");

  return (
    <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-4 px-2 pb-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <div className="flex-1">
                <Field data-invalid={fieldState.invalid} className="w-full">
                  <div className="relative">
                    <Plus className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    {(() => {
                      const inputProps = getV2InputProps({
                        value: field.value,
                        onValueChange: field.onChange,
                        onBlur: field.onBlur,
                        name: field.name,
                        ref: field.ref,
                        error: fieldState.error,
                      });

                      return (
                        <Input
                          ref={inputProps.ref}
                          id="todo-title"
                          name={inputProps.name}
                          value={inputProps.value}
                          onBlur={inputProps.onBlur}
                          placeholder="Adicionar tarefa..."
                          autoFocus={autoFocus}
                          className="h-9 border-none bg-transparent pl-9 shadow-none focus-visible:ring-0 w-full"
                          onChange={(event) => inputProps.onValueChange(event.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              void form.handleSubmit(onSubmit)();
                            }
                          }}
                        />
                      );
                    })()}
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} className="mt-1 ml-9" />
                  )}
                </Field>
              </div>
            )}
          />
        </div>

        {form.watch("title") && (
          <div className="flex items-center gap-2 pl-9">
            <Controller
              control={form.control}
              name="dueDate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <BrandButton
                        variant="neutral"
                        size="xs"
                        className={cn(!field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {dateValue ? format(dateValue, "dd MMM", { locale: ptBR }) : "Data"}
                      </BrandButton>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        aria-label="Data de vencimento"
                        selected={dateValue}
                        onSelect={(d: Date | undefined) => field.onChange(d)}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Popover>
              <PopoverTrigger asChild>
                <BrandButton variant="neutral" size="xs">
                  {form.watch("priority") === "none" ? (
                    <Flag className="mr-1 h-3 w-3" />
                  ) : (
                    <FlagFilled
                      className={cn(
                        "mr-1 h-3 w-3",
                        form.watch("priority") === "low"
                          ? "text-blue-600"
                          : form.watch("priority") === "medium"
                            ? "text-amber-600"
                            : "text-rose-600",
                      )}
                    />
                  )}
                  {priorityMeta[form.watch("priority")].label}
                </BrandButton>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="start">
                <ul className="space-y-1">
                  {(["none", "low", "medium", "high"] as const).map((p) => (
                    <li key={p}>
                      <BrandButton
                        variant="ghost"
                        size="xs"
                        className={cn(
                          "w-full justify-start",
                          form.watch("priority") === p && "bg-muted font-medium",
                        )}
                        onClick={() => form.setValue("priority", p)}
                      >
                        {p === "none" ? (
                          <Flag className="text-muted-foreground h-3.5 w-3.5" />
                        ) : (
                          <FlagFilled
                            className={cn(
                              "h-3.5 w-3.5",
                              p === "low"
                                ? "text-blue-600"
                                : p === "medium"
                                  ? "text-amber-600"
                                  : "text-rose-600",
                            )}
                          />
                        )}
                        {priorityMeta[p].label}
                      </BrandButton>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </form>
  );
}
