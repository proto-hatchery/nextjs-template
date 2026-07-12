"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface ComingSoonPlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function ComingSoonPlaceholder({
  title,
  description,
  icon: Icon,
  className,
}: ComingSoonPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-[500px] w-full flex-col items-center justify-center overflow-hidden p-6 text-center",
        className,
      )}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 -z-20 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center max-w-lg"
      >
        {/* Animated Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] -z-10" />

        {/* Icon Container */}
        <div className="relative mb-10">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex size-24 items-center justify-center rounded-[2rem] bg-background text-primary border border-primary/10 shadow-xl shadow-primary/5"
          >
            <Icon className="size-12" strokeWidth={1.25} />
          </motion.div>

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-3 -right-3 size-10 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm shadow-xs"
          >
            <Sparkles className="size-5 text-primary" fill="currentColor" />
          </motion.div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed font-medium/40">
            {description}
          </p>
        </div>

        {/* Decorative Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-[12px] font-semibold tracking-wide text-primary"
        >
          <div className="size-1.5 rounded-full bg-primary animate-pulse" />
          EM DESENVOLVIMENTO
        </motion.div>
      </motion.div>
    </div>
  );
}
