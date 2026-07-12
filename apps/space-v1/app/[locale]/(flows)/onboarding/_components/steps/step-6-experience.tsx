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

interface Step6ExperienceProps {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
}

export function Step6Experience({ items, onChange }: Step6ExperienceProps) {
  return (
    <div className="space-y-4">
      <TimelineForm type="professional" items={items} onChange={onChange} />
    </div>
  );
}
