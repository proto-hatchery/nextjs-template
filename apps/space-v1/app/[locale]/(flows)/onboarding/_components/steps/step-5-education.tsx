"use client";

import { TimelineForm } from "./timeline-form";

interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  type: "academic" | "professional";
}

interface Step5EducationProps {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
}

export function Step5Education({ items, onChange }: Step5EducationProps) {
  return (
    <div className="space-y-4">
      <TimelineForm type="academic" items={items} onChange={onChange} />
    </div>
  );
}
