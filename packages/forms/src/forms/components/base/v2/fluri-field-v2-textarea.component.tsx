"use client";

import { X } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";
import { resolveV2FieldError } from "@workspace/forms/v2/kernel";
import type { V2TextareaFieldBinding } from "@workspace/forms/v2/rhf";

export interface FluriFieldV2TextAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> {
  label: string;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  errorTextClassName?: string;
  showClearButton?: boolean;
  isInvalid?: boolean;
  fullWidth?: boolean;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
  onValueChange?: (value: string) => void;
  field?: V2TextareaFieldBinding;
}

const FluriFieldV2TextArea = ({
  label,
  helperText,
  errorMessage,
  className,
  containerClassName,
  labelClassName,
  helperTextClassName,
  errorTextClassName,
  showClearButton: showClearButtonProp = false,
  isInvalid = false,
  fullWidth = false,
  disabled = false,
  required = false,
  textareaRef: textareaRefProp,
  onValueChange,
  field,
  value: controlledValue,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  placeholder = " ",
  rows = 4,
  style,
  ...props
}: FluriFieldV2TextAreaProps) => {
  const showClearButton = showClearButtonProp;
  const id = useId();
  const textareaElementRef = useRef<HTMLTextAreaElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [manualHeight, setManualHeight] = useState<number | undefined>(undefined);

  const resolvedDisabled = field?.disabled ?? disabled;
  const resolvedErrorMessage = resolveV2FieldError(field?.errorMessage) ?? errorMessage;
  const resolvedName = field?.name ?? props.name;

  const isControlled = field !== undefined || controlledValue !== undefined;
  const currentValue = field ? field.value : isControlled ? controlledValue : internalValue;
  const hasValue = String(currentValue ?? "").length > 0;
  const shouldFloatLabel = isFocused || hasValue;
  const hasError = Boolean(resolvedErrorMessage) || isInvalid;
  const minHeight = Math.max(96, Number(rows) * 24);

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (resolvedDisabled || !textareaElementRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    const startY = event.clientY;
    const startHeight = textareaElementRef.current.offsetHeight;

    const onMove = (moveEvent: PointerEvent) => {
      const deltaY = moveEvent.clientY - startY;
      setManualHeight(Math.max(minHeight, startHeight + deltaY));
    };

    const onEnd = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
  };

  return (
    <Field
      data-invalid={hasError}
      data-disabled={resolvedDisabled}
      className={cn(fullWidth ? "w-full" : "max-w-xl", containerClassName)}
    >
      <div className="relative">
        <div
          className={cn(
            "relative rounded-2xl bg-muted/50 border border-transparent transition-all duration-200",
            "focus-within:ring-[3px] focus-within:ring-ring/50",
            hasError && "border-destructive",
            hasError && "focus-within:ring-destructive/40",
            resolvedDisabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <FieldLabel
            htmlFor={id}
            aria-required={required}
            className={cn(
              "absolute pointer-events-none text-base left-4 transition-all duration-200 ease-out origin-left",
              shouldFloatLabel
                ? "text-[11px] top-1.5 text-muted-foreground/80 font-semibold"
                : "top-5 -translate-y-1/2 text-muted-foreground",
              labelClassName,
            )}
          >
            {label}
          </FieldLabel>

          <textarea
            ref={(node) => {
              textareaElementRef.current = node;
              if (typeof textareaRefProp === "function") {
                textareaRefProp(node);
              } else if (textareaRefProp && "current" in textareaRefProp) {
                (textareaRefProp as React.MutableRefObject<HTMLTextAreaElement | null>).current =
                  node;
              }

              if (typeof field?.ref === "function") {
                field.ref(node);
              } else if (field?.ref && "current" in field.ref) {
                (field.ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
              }
            }}
            id={id}
            name={resolvedName}
            value={currentValue as string | number | readonly string[] | undefined}
            placeholder={placeholder}
            disabled={resolvedDisabled}
            rows={rows}
            onChange={(event) => {
              onChange?.(event);
              const nextValue = event.target.value;
              if (!isControlled) {
                setInternalValue(nextValue);
              }
              field?.onValueChange(nextValue);
              onValueChange?.(nextValue);
            }}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              field?.onBlur?.();
              onBlur?.(event);
            }}
            className={cn(
              "w-full resize-none overflow-y-auto rounded-2xl border-0 bg-transparent pl-4 pr-2 pt-7 pb-2 text-base shadow-none ring-0 outline-none",
              "placeholder:text-transparent focus:placeholder:text-muted-foreground/50",
              showClearButton && hasValue && "pr-10",
              className,
            )}
            style={{ ...style, height: manualHeight ?? style?.height, minHeight }}
            aria-invalid={hasError}
            aria-describedby={
              (helperText && !hasError) || hasError ? `${id}-description` : undefined
            }
            {...props}
          />

          <button
            type="button"
            onPointerDown={startResize}
            disabled={resolvedDisabled}
            className={cn(
              "absolute bottom-0.5 right-0.5 z-10 size-5 rounded-br-2xl rounded-tl-md",
              "flex items-end justify-end p-1 text-muted-foreground/70",
              "hover:text-foreground/80 transition-colors",
              "cursor-ns-resize",
              resolvedDisabled && "pointer-events-none opacity-40",
            )}
            aria-label="Redimensionar campo"
            tabIndex={-1}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1 9L9 1" stroke="currentColor" strokeWidth="1.25" />
              <path d="M4 9L9 4" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          </button>

          {showClearButton && hasValue && !resolvedDisabled && (
            <button
              type="button"
              onClick={() => {
                if (!isControlled) {
                  setInternalValue("");
                }
                const eventTarget = {
                  target: { value: "" },
                  currentTarget: { value: "" },
                };
                const event = eventTarget as React.ChangeEvent<HTMLTextAreaElement>;
                field?.onValueChange("");
                onValueChange?.("");
                onChange?.(event);
              }}
              className={cn(
                "absolute top-3 right-3 p-1 rounded-full",
                "text-muted-foreground/60 hover:text-foreground hover:bg-muted",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50",
              )}
              aria-label="Limpar campo"
              tabIndex={-1}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {(helperText || resolvedErrorMessage) && (
          <div className="mt-1.5 px-1">
            {hasError && resolvedErrorMessage ? (
              <FieldError id={`${id}-description`} className={cn("text-xs", errorTextClassName)}>
                {resolvedErrorMessage}
              </FieldError>
            ) : helperText ? (
              <FieldDescription
                id={`${id}-description`}
                className={cn("text-xs", helperTextClassName)}
              >
                {helperText}
              </FieldDescription>
            ) : null}
          </div>
        )}
      </div>
    </Field>
  );
};

export { FluriFieldV2TextArea };
export default FluriFieldV2TextArea;
