import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { UserX } from "lucide-react";

export type SessionStatus =
  | "scheduled"
  | "open"
  | "completed"
  | "cancelled"
  | "no_show"
  | "Upcoming"
  | "Awaiting notes"
  | "Completed";

interface SessionStatusBadgeProps {
  status: SessionStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  SessionStatus,
  {
    label: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  scheduled: {
    label: "Agendada",
    className: "bg-yellow-50 text-yellow-500 hover:bg-yellow-50",
    icon: <AlertCircle className="h-5 w-5" />,
  },
  open: {
    label: "Em aberto",
    className: "bg-blue-50 text-blue-500 hover:bg-blue-50",
    icon: <Clock className="h-5 w-5" />,
  },
  completed: {
    label: "Concluída",
    className: "bg-green-50 text-green-500 hover:bg-green-50",
    icon: <CheckCircle className="h-5 w-5" />,
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-red-50 text-red-500 hover:bg-red-50",
    icon: <XCircle className="h-5 w-5" />,
  },
  no_show: {
    label: "Não compareceu",
    className: "bg-orange-50 text-orange-500 hover:bg-orange-50",
    icon: <UserX className="h-5 w-5" />,
  },
  Upcoming: {
    label: "Próxima",
    className: "bg-yellow-50 text-yellow-500 hover:bg-yellow-50",
    icon: <AlertCircle className="h-5 w-5" />,
  },
  "Awaiting notes": {
    label: "Aguardando nota",
    className: "bg-blue-50 text-blue-500 hover:bg-blue-50",
    icon: <Clock className="h-5 w-5" />,
  },
  Completed: {
    label: "Concluída",
    className: "bg-green-50 text-green-500 hover:bg-green-50",
    icon: <CheckCircle className="h-5 w-5" />,
  },
};

export function SessionStatusBadge({ status, className }: SessionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold border-none inline-flex items-center gap-1.5 [&>svg]:!size-4",
        config.className,
        className,
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
