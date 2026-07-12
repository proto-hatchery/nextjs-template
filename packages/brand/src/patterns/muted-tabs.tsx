"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";

interface MutedTabsProps {
  ref?: React.Ref<HTMLDivElement>;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface MutedTabsListProps {
  ref?: React.Ref<HTMLDivElement>;
  className?: string;
  children: React.ReactNode;
}

interface MutedTabsTriggerProps {
  ref?: React.Ref<HTMLButtonElement>;
  value: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

interface MutedTabsContentProps {
  ref?: React.Ref<HTMLDivElement>;
  value: string;
  className?: string;
  children: React.ReactNode;
}

const MutedTabs = ({ className, children, ref, ...props }: MutedTabsProps) => {
  return (
    <Tabs ref={ref} className={className} {...props}>
      {children}
    </Tabs>
  );
};
MutedTabs.displayName = "MutedTabs";

const MutedTabsList = ({ className, children, ref, ...props }: MutedTabsListProps) => {
  return (
    <TabsList ref={ref} className={cn("bg-transparent", className)} {...props}>
      {children}
    </TabsList>
  );
};
MutedTabsList.displayName = "MutedTabsList";

const MutedTabsTrigger = ({ className, children, ref, ...props }: MutedTabsTriggerProps) => {
  return (
    <TabsTrigger
      ref={ref}
      className={cn("data-[state=active]:bg-muted data-[state=active]:shadow-none", className)}
      {...props}
    >
      {children}
    </TabsTrigger>
  );
};
MutedTabsTrigger.displayName = "MutedTabsTrigger";

const MutedTabsContent = ({ className, children, ref, ...props }: MutedTabsContentProps) => {
  return (
    <TabsContent ref={ref} className={className} {...props}>
      {children}
    </TabsContent>
  );
};
MutedTabsContent.displayName = "MutedTabsContent";

export { MutedTabs, MutedTabsList, MutedTabsTrigger, MutedTabsContent };
