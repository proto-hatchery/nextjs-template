"use client";

import { ArrowDownCircle, ArrowUpCircle, PieChart, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export function FinancesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-background rounded-xl border border-border/50 px-8 py-12 text-center">
      <div className="relative flex shrink-0 items-center justify-center w-48 h-48 mb-6">
        {/* Concentric circles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute inset-0 border border-dashed border-muted-foreground/20 rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute inset-6 border border-dashed border-muted-foreground/20 rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="absolute inset-12 border border-dashed border-muted-foreground/20 rounded-full"
        />

        {/* Floating icons */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-6 left-6 p-2 bg-background rounded-lg shadow-sm border border-border"
        >
          <ArrowUpCircle className="size-4 text-muted-foreground" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-8 right-6 p-2 bg-background rounded-lg shadow-sm border border-border"
        >
          <ArrowDownCircle className="size-4 text-muted-foreground" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-1/2 -left-3 p-2 bg-background rounded-lg shadow-sm border border-border"
        >
          <PieChart className="size-4 text-muted-foreground" />
        </motion.div>

        {/* Central Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative z-10 flex items-center justify-center size-16 bg-muted/10 rounded-2xl border border-border shadow-sm"
        >
          <TrendingUp className="size-8 text-muted-foreground" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-xs space-y-2"
      >
        <h3 className="text-lg font-semibold text-foreground">Nenhuma movimentação</h3>
        <p className="text-sm text-muted-foreground">
          Comece registrando suas receitas e despesas para visualizar o histórico financeiro.
        </p>
      </motion.div>
    </div>
  );
}
