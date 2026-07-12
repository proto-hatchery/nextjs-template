"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Check as CheckIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Info as InfoIcon,
  X as XIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  default as TextField,
  type TextFieldLinkInfo,
  type TextFieldProps,
  type TextFieldVariant,
} from "@workspace/forms/components/base/text-field.component";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import {
  calculateStrengthScore,
  checkPasswordStrength,
  getStrengthColor,
  getStrengthText,
} from "@workspace/forms/utils/validation";

export type PasswordFieldVariant = "login" | "create";

export interface PasswordFieldProps extends Omit<
  TextFieldProps,
  "type" | "endIcon" | "variant" | "linkInfo"
> {
  variant?: PasswordFieldVariant;

  showRequirements?: boolean;

  forgotPasswordLinkInfo?: TextFieldLinkInfo;

  inputVariant?: TextFieldVariant;
}

export const PasswordField = ({
  variant = "login",
  showRequirements,
  value,
  onChange,
  onFocus,
  onBlur,
  forgotPasswordLinkInfo,
  inputVariant,
  autoComplete,
  ref,
  ...props
}: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Internal state to handle both controlled and uncontrolled modes
  // and ensure strength meter works in all cases
  const [internalValue, setInternalValue] = useState<string>(
    typeof value === "string"
      ? value
      : typeof props.defaultValue === "string"
        ? props.defaultValue
        : "",
  );

  // Sync internal value with prop value if it changes (controlled mode)
  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value as string);
    }
  }, [value, internalValue]);

  const toggleVisibility = () => {
    if (props.disabled) return;
    setIsVisible((prevState) => !prevState);
  };

  const strength = useMemo(() => checkPasswordStrength(internalValue), [internalValue]);
  const strengthScore = useMemo(() => calculateStrengthScore(strength), [strength]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
  };

  const shouldShowStrengthValidation = variant === "create" || showRequirements;
  const shouldShowStrengthMeter = shouldShowStrengthValidation && internalValue.length > 0;

  const visibilityToggleButton = (
    <Button
      type="button"
      onClick={toggleVisibility}
      aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
      aria-pressed={isVisible}
      aria-controls="password"
      disabled={props.disabled}
      aria-disabled={props.disabled}
      className="text-muted-foreground/80 hover:text-foreground absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isVisible ? (
        <EyeOffIcon size={16} aria-hidden="true" />
      ) : (
        <EyeIcon size={16} aria-hidden="true" />
      )}
    </Button>
  );

  const passwordRequirementsTooltip = (
    <TooltipContent className="w-80 max-w-[calc(100vw-2rem)] p-4">
      <div className="space-y-3">
        <h4 className="text-xs font-medium tracking-wide text-gray-600 uppercase">
          Sua senha deve conter:
        </h4>
        <ul className="space-y-1.5" aria-label="Requisitos da senha">
          {strength.map((req) => (
            <li key={req.id} className="flex items-center gap-2">
              {req.met ? (
                <CheckIcon
                  size={14}
                  className="flex-shrink-0 text-emerald-500"
                  aria-hidden="true"
                />
              ) : (
                <XIcon size={14} className="flex-shrink-0 text-gray-400" aria-hidden="true" />
              )}
              <span
                className={`text-xs leading-relaxed ${req.met ? "font-medium text-emerald-600" : "text-gray-500"}`}
              >
                {req.text}
                <span className="sr-only">
                  {req.met ? " - Requisito atendido" : " - Requisito não atendido"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </TooltipContent>
  );

  const strengthMeter = shouldShowStrengthMeter && (
    <div className="mt-2 space-y-2">
      <div
        className="bg-border h-2 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-label="Força da senha"
      >
        <div
          className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-300 ease-out`}
          style={{ width: `${(strengthScore / 5) * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{getStrengthText(strengthScore)}</span>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                aria-label="Ver requisitos da senha"
                className="flex size-5 items-center justify-center rounded p-0 text-gray-400 transition-colors hover:bg-transparent hover:text-gray-600"
              >
                <InfoIcon size={14} />
              </Button>
            </TooltipTrigger>
            {passwordRequirementsTooltip}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  const inputElement = (
    <TextField
      {...props}
      {...(ref !== undefined ? { ref } : {})}
      type={isVisible ? "text" : "password"}
      autoComplete={autoComplete ?? "off"}
      value={internalValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="pr-10"
      {...(inputVariant !== undefined ? { variant: inputVariant } : {})}
      endIcon={visibilityToggleButton}
      {...(variant === "login" && forgotPasswordLinkInfo !== undefined
        ? { linkInfo: forgotPasswordLinkInfo }
        : {})}
    />
  );

  if (!shouldShowStrengthValidation) {
    return inputElement;
  }

  return (
    <div className="space-y-1">
      {inputElement}
      {strengthMeter}
    </div>
  );
};
