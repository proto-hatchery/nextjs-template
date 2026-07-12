"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "motion/react";

interface FloatingPointAmountInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "onChange" | "size" | "value"
> {
  className?: string;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  currency?: string;
  size?: "sm" | "md" | "xl";
}

// Moved outside to avoid re-creation on every render
const Caret = ({ isFocused }: { isFocused: boolean }) => {
  return (
    <motion.span
      layoutId="caret"
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "bg-foreground mx-[1px] inline-block h-[0.9em] w-[2px] translate-y-[0.1em] align-baseline rounded-full",
        isFocused ? "animate-caret-blink" : "opacity-0",
      )}
    />
  );
};

// Size configuration
const SIZE_CONFIGS = {
  sm: {
    base: "text-4xl",
    medium: "text-3xl",
    small: "text-2xl",
    padding: "p-4",
  },
  md: {
    base: "text-6xl",
    medium: "text-5xl",
    small: "text-4xl",
    padding: "p-8",
  },
  xl: {
    base: "text-8xl",
    medium: "text-7xl",
    small: "text-6xl",
    padding: "p-10",
  },
};

const getAmountParts = (amount: number, forceDecimals: boolean) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      decimal: "",
      integer: "",
      isDecimalMode: false,
    };
  }

  const [int, dec = "00"] = amount.toFixed(2).split(".");

  return {
    decimal: forceDecimals ? dec : dec === "00" ? "" : dec,
    integer: String(Number(int)),
    isDecimalMode: forceDecimals || dec !== "00",
  };
};

const parseProgrammaticAmount = (rawValue: string): { amount: number; forceDecimals: boolean } => {
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return { amount: 0, forceDecimals: false };
  }

  const digitsOnly = trimmedValue.replace(/\D/g, "");
  const hasExplicitDecimals = /[.,]/.test(trimmedValue);

  if (!hasExplicitDecimals && digitsOnly) {
    return {
      amount: Number(digitsOnly) / 100,
      forceDecimals: true,
    };
  }

  const normalized = trimmedValue
    .replace(/[^\d,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const amount = Number(normalized);

  return {
    amount: Number.isFinite(amount) ? amount : 0,
    forceDecimals: hasExplicitDecimals,
  };
};

export function FloatingPointAmountInput({
  className,
  value: controlledValue,
  defaultValue = 0,
  onChange,
  currency: _currency = "BRL",
  size = "md",
  autoFocus = true,
  id,
  name,
  onBlur,
  onFocus,
  ...inputProps
}: FloatingPointAmountInputProps) {
  // Internal state
  // We use "" as the internal representation for "empty/placeholder 0"
  // and "0" for "active/user-typed 0"
  const [internalValue, setInternalValue] = React.useState(
    defaultValue === 0 ? "" : defaultValue.toString(),
  );
  const [internalDecimal, setInternalDecimal] = React.useState("");
  const [isDecimalMode, setIsDecimalMode] = React.useState(false);

  const config = SIZE_CONFIGS[size];

  const setStateFromAmount = React.useCallback((amount: number, forceDecimals = false) => {
    const next = getAmountParts(amount, forceDecimals);
    setInternalValue(next.integer);
    setInternalDecimal(next.decimal);
    setIsDecimalMode(next.isDecimalMode);
  }, []);

  // Sync with controlled value
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      const currentInternalAsNumber = parseFloat(
        `${internalValue || "0"}.${(internalDecimal || "0").padEnd(2, "0")}`,
      );
      if (Math.abs(controlledValue - currentInternalAsNumber) < 0.00001) return;
      setStateFromAmount(controlledValue);
    }
  }, [controlledValue, internalDecimal, internalValue, setStateFromAmount]);

  const integerPart = internalValue;
  const decimalPart = internalDecimal;

  const isPlaceholder = integerPart === "" && !isDecimalMode && decimalPart === "";

  const totalDisplayLength =
    (integerPart || "0").length + (isDecimalMode || decimalPart.length > 0 ? 3 : 0);

  const fontSizeClass =
    totalDisplayLength > 12 ? config.small : totalDisplayLength > 9 ? config.medium : config.base;

  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const activeColor = "text-foreground";
  const inactiveColor = "text-muted-foreground/30";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      handleBackspace();
      return;
    }
    if (e.key === "." || e.key === ",") {
      e.preventDefault();
      if (!isDecimalMode) setIsDecimalMode(true);
      return;
    }
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      handleNumberInput(e.key);
      return;
    }
  };

  const handleBackspace = () => {
    if (isDecimalMode) {
      if (decimalPart.length > 0) {
        const newDecimal = decimalPart.slice(0, -1);
        setInternalDecimal(newDecimal);
        emitChange(integerPart || "0", newDecimal);
      } else {
        setIsDecimalMode(false);
      }
    } else {
      if (internalValue.length <= 1) {
        setInternalValue("");
        emitChange("0", decimalPart);
      } else {
        const newInteger = internalValue.slice(0, -1);
        setInternalValue(newInteger);
        emitChange(newInteger, decimalPart);
      }
    }
  };

  const handleNumberInput = (num: string) => {
    if (isDecimalMode) {
      if (decimalPart.length < 2) {
        const newDecimal = decimalPart + num;
        setInternalDecimal(newDecimal);
        emitChange(integerPart || "0", newDecimal);
      }
    } else {
      if (internalValue === "" || internalValue === "0") {
        setInternalValue(num);
        emitChange(num, decimalPart);
      } else {
        const newInteger = internalValue + num;
        setInternalValue(newInteger);
        emitChange(newInteger, decimalPart);
      }
    }
  };

  const emitChange = (int: string, dec: string) => {
    const raw = `${int}.${dec.padEnd(2, "0")}`;
    onChange?.(parseFloat(raw));
  };

  const showDecimals = isDecimalMode || isPlaceholder;

  const inputValue = React.useMemo(() => {
    if (isPlaceholder) return "";

    if (showDecimals) {
      return `${integerPart || "0"}.${decimalPart.padEnd(2, "0")}`;
    }

    return integerPart || "0";
  }, [decimalPart, integerPart, isPlaceholder, showDecimals]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { amount, forceDecimals } = parseProgrammaticAmount(event.currentTarget.value);
    setStateFromAmount(amount, forceDecimals);
    onChange?.(amount);
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center cursor-text select-none",
        config.padding,
        className,
      )}
      onClick={handleContainerClick}
    >
      <style>{`
        @keyframes caret-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-caret-blink {
          animation: caret-blink 1s step-end infinite;
        }
      `}</style>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
        value={inputValue}
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        autoFocus={autoFocus}
        {...inputProps}
      />

      {/* Visual Display */}
      <div
        className={cn(
          "flex items-baseline font-bold tracking-tight transition-all duration-300",
          fontSizeClass,
        )}
      >
        <span className="mr-2 text-muted-foreground">R$</span>

        <motion.span
          layout
          className={cn(
            "transition-colors duration-200",
            isPlaceholder ? inactiveColor : activeColor,
          )}
        >
          {integerPart || "0"}
        </motion.span>

        {/* Caret for Integer Mode */}
        {!isDecimalMode && !isPlaceholder && <Caret isFocused={isFocused} />}

        <AnimatePresence mode="popLayout">
          {showDecimals && (
            <motion.span
              layout
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.2 }}
              className="flex items-baseline"
            >
              <span
                className={cn(
                  "transition-colors duration-200",
                  isPlaceholder
                    ? inactiveColor
                    : isDecimalMode || decimalPart.length > 0
                      ? activeColor
                      : inactiveColor,
                )}
              >
                .
              </span>

              {isDecimalMode && decimalPart.length === 0 && <Caret isFocused={isFocused} />}

              <span className="flex items-baseline">
                <span
                  className={cn(
                    "transition-colors duration-200",
                    isPlaceholder
                      ? inactiveColor
                      : decimalPart.length >= 1
                        ? activeColor
                        : inactiveColor,
                  )}
                >
                  {decimalPart[0] || "0"}
                </span>

                {isDecimalMode && decimalPart.length === 1 && <Caret isFocused={isFocused} />}

                <span
                  className={cn(
                    "transition-colors duration-200",
                    isPlaceholder
                      ? inactiveColor
                      : decimalPart.length >= 2
                        ? activeColor
                        : inactiveColor,
                  )}
                >
                  {decimalPart[1] || "0"}
                </span>

                {isDecimalMode && decimalPart.length === 2 && <Caret isFocused={isFocused} />}

                {isPlaceholder && <Caret isFocused={isFocused} />}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
