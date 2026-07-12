import * as React from "react";

export interface VisibleMonth {
  month: number; // 0-11
  year: number;
  monthName: string;
  percentage: number;
}

export function useMonthDetection<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  itemSelector: string = "[data-month]",
  _threshold: number = 0.5,
): VisibleMonth | null {
  const [visibleMonth, setVisibleMonth] = React.useState<VisibleMonth | null>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        // Re-check current inside RAF
        if (!containerRef.current) return;

        const containerElement = containerRef.current;
        const containerRect = containerElement.getBoundingClientRect();
        const items = containerElement.querySelectorAll(itemSelector);

        let maxVisibility = 0;
        let dominantMonth: VisibleMonth | null = null;

        items.forEach((item) => {
          const rect = item.getBoundingClientRect();

          // Calculate intersection height
          const visibleTop = Math.max(containerRect.top, rect.top);
          const visibleBottom = Math.min(containerRect.bottom, rect.bottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);

          if (visibleHeight <= 0) return;

          const percentage = (visibleHeight / rect.height) * 100;

          // We prioritize the month that takes up the most "view share" or is simply most visible
          if (percentage > maxVisibility) {
            maxVisibility = percentage;
            const monthStr = item.getAttribute("data-month"); // "0-2024" (Jan 2024)
            const nameStr = item.getAttribute("data-month-name");

            if (monthStr && nameStr) {
              const parts = monthStr.split("-");
              const monthPart = parts[0];
              const yearPart = parts[1];

              if (monthPart && yearPart) {
                const month = parseInt(monthPart, 10);
                const year = parseInt(yearPart, 10);

                if (!isNaN(month) && !isNaN(year)) {
                  dominantMonth = {
                    month,
                    year,
                    monthName: nameStr,
                    percentage,
                  };
                }
              }
            }
          }
        });

        if (dominantMonth) {
          setVisibleMonth((prev) => {
            if (prev?.month === dominantMonth?.month && prev?.year === dominantMonth?.year)
              return prev;
            return dominantMonth;
          });
        }
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger once on mount
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, itemSelector]);

  return visibleMonth;
}
