"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

interface UsePersistentTabOptions {
  paramName?: string;
  defaultTab?: string;
}

export function usePersistentTab({
  paramName = "tab",
  defaultTab = "overview",
}: UsePersistentTabOptions = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = useMemo(() => {
    return searchParams.get(paramName) ?? defaultTab;
  }, [searchParams, paramName, defaultTab]);

  const setActiveTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === defaultTab) {
        params.delete(paramName);
      } else {
        params.set(paramName, tab);
      }
      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname, paramName, defaultTab],
  );

  return { activeTab, setActiveTab };
}
