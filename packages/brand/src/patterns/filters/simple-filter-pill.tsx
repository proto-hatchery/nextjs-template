import { motion } from "motion/react";
import { X } from "lucide-react";

interface FilterPillProps {
  label: string;
  onRemove: () => void;
}

export function SimpleFilterPill({ label, onRemove }: FilterPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="h-9 px-4 flex items-center gap-3 rounded-full
                 bg-zinc-100 text-zinc-900
                 text-[13px] font-bold whitespace-nowrap transition-all"
    >
      {label}
      <button
        onClick={onRemove}
        className="w-5 h-5 flex items-center justify-center bg-zinc-200 text-zinc-500 hover:bg-black hover:text-white rounded-full transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
