"use client";

import { motion } from "motion/react";

import type { OnboardingSuccessStatus } from "../_types";
import { StatusDescription, StatusTitle } from "./status-content";
import { LoadingIcon, SuccessIcon } from "./status-icons";

// ============================================================================
// Props
// ============================================================================

interface SuccessStateProps {
  status: OnboardingSuccessStatus;
}

// ============================================================================
// Component
// ============================================================================

export function SuccessState({ status }: SuccessStateProps) {
  const isReady = status === "ready";

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {isReady ? (
          <SuccessIcon className="mx-auto mb-6" />
        ) : (
          <LoadingIcon className="mx-auto mb-6" />
        )}
        <StatusTitle status={status} />
        <StatusDescription status={status} />
      </motion.div>
    </div>
  );
}
