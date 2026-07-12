import { cn } from "@workspace/ui/lib/utils";

type FluriLogoProps = {
  app?: "space" | "desk" | "admin" | "clinic" | "connect" | "web";
  color?: "black" | "white" | "primary";
  className?: string;
  priority?: boolean;
};

const APP_LABELS: Record<NonNullable<FluriLogoProps["app"]>, string> = {
  admin: "fluri",
  clinic: "fluriclinic",
  connect: "fluriconnect",
  desk: "fluridesk",
  space: "flurispace",
  web: "fluri",
};

export function FluriLogo({ app = "web", color = "black", className }: FluriLogoProps) {
  return (
    <span
      aria-label={APP_LABELS[app]}
      className={cn(
        "inline-flex items-center font-semibold leading-none tracking-normal",
        color === "white" ? "text-white" : color === "primary" ? "text-primary" : "text-foreground",
        className,
      )}
    >
      {APP_LABELS[app]}
    </span>
  );
}
