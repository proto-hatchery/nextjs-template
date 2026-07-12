import { cn } from "@workspace/ui/lib/utils";

interface OnboardingStepContainerProps {
  children: React.ReactNode;
  maxWidthClassName?: string;
  centered?: boolean;
  className?: string;
}

export function OnboardingStepContainer({
  children,
  maxWidthClassName = "max-w-xl",
  centered = false,
  className,
}: OnboardingStepContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex h-full w-full flex-col px-8 py-12 min-h-0",
        maxWidthClassName,
        centered && "text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
