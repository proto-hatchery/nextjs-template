import { BrandButton, type BrandButtonSize } from "@workspace/brand/components/brand-button";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";

interface OnboardingStepActionsProps {
  onBack?: () => void;
  onContinue?: () => void;
  continueType?: "button" | "submit";
  continueLabel: string;
  continuePendingLabel?: string;
  isPending?: boolean;
  /** Disables the continue button without showing a loading spinner */
  continueDisabled?: boolean;
  className?: string;
  backLabel?: string;
  size?: BrandButtonSize;
}

export function OnboardingStepActions({
  onBack,
  onContinue,
  continueType = "button",
  continueLabel,
  continuePendingLabel,
  isPending = false,
  continueDisabled = false,
  className,
  backLabel = "Voltar",
  size = "default",
}: OnboardingStepActionsProps) {
  const currentContinueLabel =
    isPending && continuePendingLabel ? continuePendingLabel : continueLabel;

  return (
    <div
      className={cn(
        "flex flex-col-reverse items-center gap-4 pt-4 sm:flex-row",
        onBack ? "sm:justify-between" : "sm:justify-end",
        className,
      )}
    >
      {onBack && (
        <BrandButton
          type="button"
          family="rounded"
          variant="ghost"
          size={size}
          onClick={onBack}
          className="w-full sm:w-auto"
        >
          {backLabel}
        </BrandButton>
      )}

      <BrandButton
        type={continueType}
        family="rounded"
        onClick={
          continueType === "button" && onContinue
            ? () => {
                onContinue();
              }
            : undefined
        }
        size={size}
        className="w-full sm:w-auto"
        disabled={isPending || continueDisabled}
        rightIcon={isPending ? <Spinner className="text-current" /> : undefined}
      >
        {currentContinueLabel}
      </BrandButton>
    </div>
  );
}
