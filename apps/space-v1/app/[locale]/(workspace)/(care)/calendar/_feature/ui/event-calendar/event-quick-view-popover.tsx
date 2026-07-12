"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MapPin, User, DollarSign, FileText, X, Trash2, Pencil } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import type { CalendarEvent, EventColor } from "./types";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { Button } from "@workspace/ui/components/button";
import { Popover, PopoverContent, PopoverAnchor } from "@workspace/ui/components/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet";
import { Badge } from "@workspace/ui/components/badge";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export type EventType = "session" | "supervision" | "meeting" | "block" | "other";

export type SeriesEditScope = "this" | "this_and_following" | "all";

export interface CalendarEventFull extends CalendarEvent {
  event_type?: EventType;
  series_id?: string | null;
  recurrence_rule?: string | null;
  status?: "scheduled" | "confirmed" | "cancelled" | "completed";
  duration_minutes?: number;
  editable?: boolean;
  deletable?: boolean;
  metadata?: {
    patient_id?: string;
    patient_name?: string;
    service_id?: string;
    price?: number;
    supervision_type?: "giving" | "receiving";
    supervisor_name?: string;
    supervisee_name?: string;
    google_meet_link?: string;
    [key: string]: unknown;
  };
}

export interface EventQuickViewPopoverProps {
  event: CalendarEventFull;
  triggerRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: CalendarEventFull) => void;
  onDelete: (event: CalendarEventFull) => void;
}

// ----------------------------------------------------------------------
// Utility Functions
// ----------------------------------------------------------------------

const formatDateTime = (start: Date, end: Date): string => {
  const dateStr = format(start, "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  const startTime = format(start, "HH:mm", { locale: ptBR });
  const endTime = format(end, "HH:mm", { locale: ptBR });
  return `${capitalizedDate} · ${startTime} – ${endTime}`;
};

const formatCurrency = (value: number): string => {
  // Convert from cents to reais
  const valueInReais = value / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInReais);
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

const getStatusBadgeVariant = (
  status?: string,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "confirmed":
      return "default";
    case "scheduled":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "completed":
      return "outline";
    default:
      return "secondary";
  }
};

const getStatusLabel = (status?: string): string => {
  switch (status) {
    case "confirmed":
      return "Confirmado";
    case "scheduled":
      return "Agendado";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Concluído";
    default:
      return "Agendado";
  }
};

// ----------------------------------------------------------------------
// Animation Variants
// ----------------------------------------------------------------------

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0, y: -5, transition: { duration: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
};

const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// ----------------------------------------------------------------------
// Quick View Content Component
// ----------------------------------------------------------------------

interface QuickViewContentProps {
  event: CalendarEventFull;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function QuickViewContent({ event, onClose, onEdit, onDelete }: QuickViewContentProps) {
  const eventType = event.event_type ?? "other";
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  return (
    <motion.div
      className="flex flex-col gap-3"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <motion.div className="flex items-start justify-between gap-2" variants={itemVariants}>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{event.title}</h3>
          {event.status && (
            <Badge variant={getStatusBadgeVariant(event.status)} className="mt-1.5">
              {getStatusLabel(event.status)}
            </Badge>
          )}
        </div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 -mr-2 -mt-1"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="space-y-2.5">
        {/* Date/Time */}
        <motion.div className="flex items-start gap-3 text-sm" variants={itemVariants}>
          <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-foreground">{formatDateTime(startDate, endDate)}</span>
        </motion.div>

        {/* Location */}
        {event.location && (
          <motion.div className="flex items-start gap-3 text-sm" variants={itemVariants}>
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-foreground">{event.location}</span>
          </motion.div>
        )}

        {/* Session-specific fields */}
        {eventType === "session" && (
          <>
            {event.metadata?.patient_name && (
              <motion.div className="flex items-start gap-3 text-sm" variants={itemVariants}>
                <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-foreground">{event.metadata.patient_name}</span>
              </motion.div>
            )}
            {event.metadata?.price !== undefined && (
              <motion.div className="flex items-start gap-3 text-sm" variants={itemVariants}>
                <DollarSign className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-foreground">{formatCurrency(event.metadata.price)}</span>
              </motion.div>
            )}
          </>
        )}

        {/* Supervision-specific fields */}
        {eventType === "supervision" && (
          <motion.div className="flex items-start gap-3 text-sm" variants={itemVariants}>
            <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-foreground">
              {event.metadata?.supervision_type === "receiving"
                ? `Supervisor: ${event.metadata?.supervisor_name ?? "Não informado"}`
                : `Supervisionando: ${event.metadata?.supervisee_name ?? "Não informado"}`}
            </span>
          </motion.div>
        )}

        {/* Other event - description */}
        {eventType === "other" && event.description && (
          <motion.div className="flex items-start gap-3 text-sm" variants={itemVariants}>
            <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{truncateText(event.description, 100)}</span>
          </motion.div>
        )}
      </div>

      {/* Footer Actions */}
      <motion.div
        className="flex items-center justify-between gap-2 pt-2 border-t"
        variants={itemVariants}
      >
        {event.deletable !== false && (
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Excluir
            </Button>
          </motion.div>
        )}
        {event.editable !== false && (
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className={event.deletable === false ? "ml-auto" : ""}
          >
            <Button variant="default" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Editar detalhes
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export function EventQuickViewPopover({
  event,
  triggerRef,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: EventQuickViewPopoverProps) {
  const isMobile = useIsMobile();
  const [virtualRect, setVirtualRect] = useState<DOMRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Update virtual rect when trigger ref changes or popover opens
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setVirtualRect(rect);
    }
  }, [open, triggerRef]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleEdit = useCallback(() => {
    onEdit(event);
    handleClose();
  }, [event, onEdit, handleClose]);

  const handleDelete = useCallback(() => {
    onDelete(event);
    // Don't close here - let the confirmation dialog handle it
  }, [event, onDelete]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
      // Keyboard shortcuts when popover is open
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        handleEdit();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose, handleEdit, handleDelete]);

  // Mobile: Use Sheet (bottom)
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl px-4 pb-6">
          <SheetHeader className="sr-only">
            <SheetTitle>{event.title}</SheetTitle>
          </SheetHeader>
          <div className="pt-2">
            <QuickViewContent
              event={event}
              onClose={handleClose}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Popover
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {/* Virtual anchor based on trigger position */}
      <PopoverAnchor
        {...(virtualRect
          ? {
              virtualRef: {
                current: {
                  getBoundingClientRect: () => virtualRect,
                },
              },
            }
          : {})}
      />
      <PopoverContent
        ref={popoverRef}
        side="right"
        align="start"
        sideOffset={8}
        className="w-80 p-4"
        onOpenAutoFocus={(e) => {
          // Prevent auto-focus to avoid scrolling issues
          e.preventDefault();
        }}
      >
        <QuickViewContent
          event={event}
          onClose={handleClose}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </PopoverContent>
    </Popover>
  );
}
