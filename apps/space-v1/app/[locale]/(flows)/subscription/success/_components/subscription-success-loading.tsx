export function SubscriptionSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6">
          <div className="h-full w-full animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ativando sua assinatura...
        </h1>
      </div>
    </div>
  );
}
