"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Home } from "lucide-react";
import { MonitorSmartphone } from "lucide-react";
import { useMemo } from "react";

import { PageContentHeader } from "../../_components/page-content-header";
import { PageContentWrapper } from "../../_components/page-content-wrapper";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = useMemo(() => {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/home" className="inline-flex items-center gap-1.5">
              <Home className="size-4" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="inline-flex items-center gap-1.5">
              <MonitorSmartphone className="size-4" />
              Meu Site
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }, []);

  return (
    <PageContentHeader breadcrumbs={breadcrumbs}>
      <div className="h-full">
        <PageContentWrapper className="h-full !p-0">
          <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </PageContentWrapper>
      </div>
    </PageContentHeader>
  );
}
