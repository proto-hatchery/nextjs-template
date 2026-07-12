"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Globe, Home } from "lucide-react";

import { ComingSoonPlaceholder } from "../../_components/coming-soon-placeholder";
import { PageContentHeader } from "../../_components/page-content-header";

export default function CommunityPage() {
  return (
    <PageContentHeader
      breadcrumbs={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" className="inline-flex items-center gap-1.5">
                <Home size={16} />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="inline-flex items-center gap-1.5">
                <Globe className="size-4" />
                Comunidade
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    >
      <ComingSoonPlaceholder
        title="Estamos preparando algo especial..."
        description="A comunidade Fluri será um espaço único para troca de experiências, networking e crescimento profissional."
        icon={Globe}
      />
    </PageContentHeader>
  );
}
