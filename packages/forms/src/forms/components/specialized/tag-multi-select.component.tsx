"use client";

import type { ReactNode } from "react";
import { useId, useMemo } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";
import MultipleSelector, { type Option } from "./tag-multi-select-internal.component";

export type TagOption = { value: string; label: string; description?: string };
export type TagMultiSelectSize = "sm" | "md" | "lg";

export interface TagMultiSelectProps {
  label?: string;
  helperText?: ReactNode;
  errorMessage?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  options: TagOption[];
  value?: string[];
  onChange?: (next: string[]) => void;
  maxSelected?: number;
  disabled?: boolean;
  required?: boolean;
  containerClassName?: string;
  size?: TagMultiSelectSize;
  startIcon?: ReactNode;
  renderTag?: (tag: TagOption, onRemove: () => void) => ReactNode;
}

const TagMultiSelect = ({
  label,
  helperText,
  errorMessage,
  placeholder = "Selecione…",
  searchPlaceholder = "Pesquisar…",
  emptyMessage = "Nenhum resultado",
  options,
  value = [],
  onChange,
  maxSelected,
  disabled,
  required,
  containerClassName,
  size = "md",
  startIcon,
  renderTag,
}: TagMultiSelectProps) => {
  const id = useId();
  const helperId = `${id}-help`;
  const errorId = `${id}-error`;

  const normalizedOptions = useMemo<Option[]>(
    () =>
      options.map((option) => ({
        value: option.value,
        label: option.label,
        description: option.description,
      })),
    [options],
  );

  const byValue = useMemo(
    () => new Map(normalizedOptions.map((opt) => [opt.value, opt])),
    [normalizedOptions],
  );

  const selectedOptions = useMemo(
    () => value.map((selectedValue) => byValue.get(selectedValue)).filter(Boolean) as Option[],
    [value, byValue],
  );

  const handleChange = (next: Option[]) => {
    if (disabled) return;
    onChange?.(next.map((opt) => opt.value));
  };

  const describedBy = errorMessage ? errorId : helperText ? helperId : undefined;

  return (
    <Field
      data-invalid={!!errorMessage}
      data-disabled={disabled}
      className={cn(containerClassName)}
    >
      {label ? (
        <FieldLabel htmlFor={id} className="flex items-center gap-2">
          {startIcon}
          {label}
          {required ? (
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          ) : null}
        </FieldLabel>
      ) : null}

      <MultipleSelector
        value={selectedOptions}
        onChange={handleChange}
        defaultOptions={normalizedOptions}
        options={normalizedOptions}
        placeholder={placeholder}
        {...(disabled !== undefined ? { disabled } : {})}
        {...(maxSelected !== undefined ? { maxSelected } : {})}
        hidePlaceholderWhenSelected
        emptyIndicator={<p className="text-center text-sm py-3">{emptyMessage}</p>}
        className={cn(
          "bg-input border border-input transition-[color,box-shadow]",
          errorMessage && "border-destructive",
          {
            "h-9 text-sm": size === "sm",
            "h-10 text-sm": size === "md",
            "h-11 text-base": size === "lg",
          },
        )}
        badgeClassName={cn({
          "text-xs px-1.5 py-0.5": size === "sm",
          "text-xs px-2 py-1": size === "md",
          "text-sm px-2 py-1": size === "lg",
        })}
        commandProps={{
          label: label ?? placeholder,
        }}
        inputProps={{
          id,
          "aria-describedby": describedBy,
          "aria-invalid": errorMessage ? true : undefined,
          "aria-required": required ? true : undefined,
          "aria-label": searchPlaceholder,
          className: cn({
            "text-sm": size === "sm" || size === "md",
            "text-base": size === "lg",
          }),
        }}
        {...(renderTag !== undefined
          ? {
              renderTag: (option: Option, onRemove: () => void) =>
                renderTag(
                  {
                    value: option.value,
                    label: option.label,
                    ...(typeof option.description === "string"
                      ? { description: option.description }
                      : {}),
                  },
                  onRemove,
                ),
            }
          : {})}
      />

      {helperText && !errorMessage ? <FieldDescription>{helperText}</FieldDescription> : null}
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </Field>
  );
};

export { TagMultiSelect };
export default TagMultiSelect;
