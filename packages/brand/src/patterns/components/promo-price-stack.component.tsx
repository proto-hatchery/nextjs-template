import React from "react";
import { cn } from "@workspace/ui/lib/utils";

interface PromoPriceStackProps extends React.HTMLAttributes<HTMLDivElement> {
  promoPriceCents: number;
  recurringPriceCents: number;
  billingPeriod?: "month" | "year";
  locale?: string;
  originalPriceCents?: number;
  badgeContent?: React.ReactNode;
}

export function PromoPriceStack({
  promoPriceCents,
  recurringPriceCents,
  billingPeriod = "month",
  locale = "pt-BR",
  originalPriceCents,
  badgeContent,
  className,
  ...props
}: PromoPriceStackProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formattedPromoPrice = formatCurrency(promoPriceCents);
  const formattedRecurringPrice = formatCurrency(recurringPriceCents);
  const periodLabel = billingPeriod === "month" ? "/mês" : "/ano";

  return (
    <div className={cn("flex flex-col tracking-tight", className)} {...props}>
      {badgeContent && (
        <div className="mb-2 w-fit rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-800">
          {badgeContent}
        </div>
      )}

      {originalPriceCents && (
        <span className="mb-0.5 text-sm font-medium text-slate-400 line-through">
          {formatCurrency(originalPriceCents)}
          {periodLabel}
        </span>
      )}

      <p className="text-[32px] leading-none font-semibold text-slate-900">
        {formattedPromoPrice}{" "}
        <span className="text-xl font-medium tracking-normal text-slate-700">no 1º mês</span>
      </p>

      <p className="mt-1.5 text-[13px] font-medium text-slate-500 max-w-[220px] leading-snug">
        Após o 1º mês: {formattedRecurringPrice}
        {periodLabel}. Cancele a qualquer momento.
      </p>
    </div>
  );
}
