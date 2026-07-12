"use client";

import { Separator } from "@workspace/ui/components/separator";

import { LocationsSection } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/sections/service-section/LocationsSection";
import { ServicesSection } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/sections/service-section/ServicesSection";

export function OnboardingServiceSection() {
  return (
    <div className="space-y-8">
      <ServicesSection isOnboarding={true} />
      <Separator />
      <LocationsSection />
    </div>
  );
}
