import {
  SkeletonCalendar,
  SkeletonMobileHeader,
} from "@workspace/brand/patterns/components/skeleton-compositions";

export default function CalendarLoading() {
  return (
    <>
      <SkeletonMobileHeader />
      <div className="h-[calc(100vh-3.5rem)] md:h-full">
        <SkeletonCalendar />
      </div>
    </>
  );
}
