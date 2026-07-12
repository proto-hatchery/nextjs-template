"use client";

import { AtSign as AtSymbolIcon } from "lucide-react";

import TextField, { type TextFieldProps } from "@workspace/forms/components/base/text-field.component";

export interface InstagramUsernameFieldProps extends Omit<
  TextFieldProps,
  "startIcon" | "endIcon" | "type"
> {
  showInstagramLink?: boolean;
  linkClassName?: string;
  showAtSymbol?: boolean;
  validateUsername?: boolean;
  prefix?: string;
}

const sanitizeUsername = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/_{2,}/g, "_");
};

const isValidUsername = (username: string): boolean => {
  if (!username) return true;
  return (
    /^[a-z0-9._]{1,30}$/.test(username) &&
    !/^[._]/.test(username) &&
    !/[._]$/.test(username) &&
    !/[._]{2,}/.test(username)
  );
};

const InstagramUsernameField = ({
  showInstagramLink = true,
  placeholder = "Insira seu nome de usuario",
  maxLength = 30,
  helperText,
  linkClassName,
  showAtSymbol = true,
  validateUsername = false,
  prefix,
  onChange,
  value,
  ref,
  ...textFieldProps
}: InstagramUsernameFieldProps) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;

    // Remove prefix if present when getting the actual username
    if (prefix && rawValue.startsWith(prefix)) {
      rawValue = rawValue.substring(prefix.length);
    }

    // Remove @ if showAtSymbol is false and user types it
    if (!showAtSymbol && rawValue.startsWith("@")) {
      rawValue = rawValue.substring(1);
    }

    const sanitizedValue = sanitizeUsername(rawValue);

    // Re-add prefix if it exists
    const finalValue = prefix ? prefix + sanitizedValue : sanitizedValue;

    const sanitizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: finalValue,
      },
    };

    onChange?.(sanitizedEvent);
  };

  const currentValue = String(value || "");

  // Extract username from current value (remove prefix and @ if present)
  const getUsernameForValidation = (val: string): string => {
    let username = val;
    if (prefix && username.startsWith(prefix)) {
      username = username.substring(prefix.length);
    }
    if (username.startsWith("@")) {
      username = username.substring(1);
    }
    return username;
  };

  const usernameForValidation = getUsernameForValidation(currentValue);
  const hasValidUsername = validateUsername
    ? usernameForValidation && isValidUsername(usernameForValidation)
    : currentValue;
  const shouldShowLink = showInstagramLink && hasValidUsername;
  const instagramUrl = shouldShowLink
    ? `https://instagram.com/${usernameForValidation}`
    : undefined;

  const getHelperText = () => {
    if (shouldShowLink && instagramUrl) {
      const displayUrl = `instagram.com/${usernameForValidation}`;
      return (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            linkClassName ||
            "text-muted-foreground hover:text-foreground/70 underline underline-offset-2 transition-colors"
          }
        >
          {displayUrl}
        </a>
      );
    }
    return helperText;
  };

  // Determine the start icon
  const getStartIcon = () => {
    if (prefix) {
      return <span className="text-muted-foreground/80 text-sm">{prefix}</span>;
    }
    return showAtSymbol ? <AtSymbolIcon className="size-4" /> : null;
  };

  return (
    <TextField
      {...textFieldProps}
      {...(ref !== undefined ? { ref } : {})}
      value={currentValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      maxLength={maxLength}
      startIcon={getStartIcon()}
      autoComplete={textFieldProps.autoComplete ?? "off"}
      spellCheck={false}
      helperText={getHelperText()}
    />
  );
};

export { InstagramUsernameField };
export default InstagramUsernameField;
