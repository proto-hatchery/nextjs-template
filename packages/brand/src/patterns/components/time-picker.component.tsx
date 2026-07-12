"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";

export interface TimePickerProps {
  /**
   * Valor atual selecionado no formato "HH:mm"
   */
  value?: string;
  /**
   * Callback quando o valor muda
   */
  onValueChange?: (value: string) => void;
  /**
   * Placeholder quando nenhum valor está selecionado
   */
  placeholder?: string;
  /**
   * Largura do botão trigger
   */
  triggerWidth?: string;
  /**
   * Classe CSS adicional para o trigger
   */
  triggerClassName?: string;
  /**
   * Classe CSS adicional para o popover content
   */
  contentClassName?: string;
  /**
   * Se o componente está desabilitado
   */
  disabled?: boolean;
  /**
   * Intervalo de minutos disponível
   */
  intervalMinutes?: number;
  /**
   * Altura máxima do scroll area
   */
  maxHeight?: string;
  /**
   * Se deve mostrar o ícone de relógio
   */
  showIcon?: boolean;
}

export function TimePicker({
  value = "00:00",
  onValueChange,
  placeholder = "00:00",
  triggerWidth = "auto",
  triggerClassName,
  contentClassName,
  disabled = false,
  intervalMinutes = 5,
  maxHeight = "200px",
  showIcon = true,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse hours and minutes from value
  const [h, m] = (value || "00:00").split(":");
  const hour = h || "00";
  const minute = m || "00";

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  const handleHourSelect = (newHour: string) => {
    onValueChange?.(`${newHour}:${minute}`);
  };

  const handleMinuteSelect = (newMinute: string) => {
    onValueChange?.(`${hour}:${newMinute}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled}
          className={cn(
            "h-8 justify-center text-left font-normal px-2 hover:bg-accent/50 flex-shrink-0 transition-colors",
            !value && "text-muted-foreground",
            triggerClassName,
          )}
          style={{ width: triggerWidth }}
        >
          {showIcon && <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground/50" />}
          <span className="tabular-nums">{value || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[160px] p-0 shadow-xl border-border/40", contentClassName)}
        align="start"
      >
        <div className="flex divide-x divide-border/40" style={{ height: maxHeight }}>
          <ScrollArea className="flex-1">
            <div className="flex flex-col p-1">
              <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                Hora
              </div>
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourSelect(h)}
                  className={cn(
                    "flex items-center justify-center rounded-md py-1.5 text-sm transition-all tabular-nums",
                    hour === h
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          </ScrollArea>
          <ScrollArea className="flex-1">
            <div className="flex flex-col p-1">
              <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                Min
              </div>
              {minutes
                .filter((min) => parseInt(min) % intervalMinutes === 0)
                .map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinuteSelect(m)}
                    className={cn(
                      "flex items-center justify-center rounded-md py-1.5 text-sm transition-all tabular-nums",
                      minute === m
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {m}
                  </button>
                ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default TimePicker;
