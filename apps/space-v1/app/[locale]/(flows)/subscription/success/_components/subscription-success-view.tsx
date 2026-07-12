import { motion } from "motion/react";
import Link from "next/link";

interface SubscriptionSuccessViewProps {
  error: string | null;
}

function StatusIcon({ error }: SubscriptionSuccessViewProps) {
  if (error) {
    return (
      <svg
        className="w-10 h-10 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    );
  }

  return (
    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function SubscriptionSuccessView({ error }: SubscriptionSuccessViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              error ? "bg-yellow-100" : "bg-green-100"
            }`}
          >
            <StatusIcon error={error} />
          </div>

          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Assinatura Ativada!
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Seu pagamento foi processado com sucesso.
          </p>

          {error ? (
            <p className="text-yellow-600 dark:text-yellow-400 mb-8 text-sm">{error}</p>
          ) : (
            <p className="text-gray-500 dark:text-gray-500 mb-8 text-sm">
              Redirecionando em instantes...
            </p>
          )}

          <Link
            href="/home"
            className="inline-block px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/30"
          >
            Ir para o Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
