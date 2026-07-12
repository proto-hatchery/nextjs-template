"use client";

import { SubscriptionSuccessLoading } from "./_components/subscription-success-loading";
import { SubscriptionSuccessView } from "./_components/subscription-success-view";
import { useSubscriptionSuccess } from "./_hooks/use-subscription-success";

export default function SubscriptionSuccessPage() {
  const { error, isRefreshing } = useSubscriptionSuccess();

  if (isRefreshing) {
    return <SubscriptionSuccessLoading />;
  }

  return <SubscriptionSuccessView error={error} />;
}
