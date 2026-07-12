import { cn } from "@workspace/ui/lib/utils";

interface BallEffectProps {
  backgroundColor?: string;
  className?: string;
}

export function BallEffect({ backgroundColor = "#FFFFFF", className }: BallEffectProps) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-1/2 w-[220%] aspect-square -translate-x-1/2 translate-y-[92%] rounded-full",
        className,
      )}
      style={{
        background: backgroundColor,
        boxShadow: "0 -15px 40px -10px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.03)",
      }}
    />
  );
}
