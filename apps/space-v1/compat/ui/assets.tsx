"use client";

import type { SVGProps } from "react";

type FluriIconProps = SVGProps<SVGSVGElement> & {
  alt?: string;
  color?: "black" | "white";
  priority?: boolean;
};

type FluriLogoProps = FluriIconProps;

function FluriIcon({ alt = "Fluri icon", color = "black", className, ...props }: FluriIconProps) {
  const fill = color === "white" ? "#ffffff" : "#111111";

  return (
    <svg
      aria-label={alt}
      className={className}
      fill="none"
      role="img"
      viewBox="0 0 32 32"
      {...props}
    >
      <rect width="32" height="32" rx="10" fill={fill} opacity="0.08" />
      <path
        d="M9 24V8h12.5v4H13.8v2.6h6.8v3.8h-6.8V24H9Z"
        fill={fill}
      />
      <circle cx="23" cy="22" r="2" fill={fill} />
    </svg>
  );
}

function FluriLogo({ alt = "Fluri", color = "black", className, ...props }: FluriLogoProps) {
  const fill = color === "white" ? "#ffffff" : "#111111";

  return (
    <svg
      aria-label={alt}
      className={className}
      fill="none"
      role="img"
      viewBox="0 0 96 32"
      {...props}
    >
      <path
        d="M8 25V7h14v4.2h-9.2V15h8v4.1h-8V25H8Zm20 0V7h4.8v18H28Zm12.8.3c-3.6 0-5.9-2.2-5.9-6.1V12h4.6v6.6c0 1.8.8 2.8 2.3 2.8s2.5-1 2.5-2.9V12h4.6v13h-4.4v-1.6c-.9 1.2-2.1 1.9-3.7 1.9ZM52.8 25V12h4.5v2.6c.7-1.8 2-2.9 4.2-2.8v4.8h-.4c-2.5 0-3.8 1.4-3.8 4.4v4h-4.5Zm11.6 0V12H69v13h-4.6Zm-.2-14.5V6.8h5v3.7h-5Z"
        fill={fill}
      />
    </svg>
  );
}

export { FluriIcon, FluriLogo };
