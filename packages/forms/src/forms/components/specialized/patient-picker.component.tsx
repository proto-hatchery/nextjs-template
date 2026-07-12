"use client";

import {
  Check as CheckIcon,
  ChevronsUpDown as ChevronsUpDownIcon,
  Lock as LockIcon,
  User as UserIcon,
} from "lucide-react";
import { useId, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";

export interface PatientOption {
  id: string;
  name: string;
  avatarUrl?: string | null;
  subtitle?: string;
  status?: "active" | "inactive" | "archived";
}

export interface PatientPickerProps {
  ref?: React.Ref<HTMLButtonElement>;
  label?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  options?: PatientOption[];
  isLoading?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  placeholder?: string;
  className?: string;
  locked?: boolean;
  lockedTooltip?: string;
}

const PatientPicker = ({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  errorMessage,
  placeholder = "Selecione um paciente",
  className,
  locked = false,
  lockedTooltip = "Paciente pré-selecionado",
  ref,
}: PatientPickerProps) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedPatient = useMemo(() => options.find((p) => p.id === value), [options, value]);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter((p) => p.name.toLowerCase().includes(lowerSearch));
  }, [options, search]);

  return (
    <Field data-invalid={!!errorMessage} className={cn("space-y-1", className)}>
      {label && <FieldLabel>{label}</FieldLabel>}

      <Popover open={open && !locked} onOpenChange={(isOpen) => !locked && setOpen(isOpen)}>
        {locked ? (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    ref={ref}
                    variant="secondary"
                    role="combobox"
                    aria-controls={`${id}-listbox`}
                    aria-expanded={open}
                    className={cn(
                      "w-full h-auto p-0 border-0 bg-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 overflow-visible",
                      disabled && !locked && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={disabled && !locked}
                    onFocus={(e) => {
                      if (locked) {
                        e.currentTarget.blur();
                      }
                    }}
                    tabIndex={locked ? -1 : 0}
                  >
                    <div
                      className={cn(
                        "w-full flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 group",
                        "bg-background/50 backdrop-blur-xl shadow-sm hover:shadow-md hover:bg-background/80",
                        "border-border/40 hover:border-border/80",
                        open && "border-primary/20 bg-background shadow-lg",
                      )}
                    >
                      {/* Avatar Section */}
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm transition-transform duration-300">
                          <AvatarImage src={selectedPatient?.avatarUrl ?? undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                            {selectedPatient?.name?.slice(0, 2).toUpperCase() ?? (
                              <UserIcon className="h-5 w-5" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {selectedPatient?.status === "active" && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                        )}
                      </div>

                      {/* Text Info */}
                      <div className="flex flex-col items-start flex-1 text-left min-w-0">
                        <span
                          className={cn(
                            "text-base font-semibold tracking-tight transition-colors",
                            !selectedPatient && "text-muted-foreground font-normal",
                          )}
                        >
                          {selectedPatient?.name ?? placeholder}
                        </span>
                        {selectedPatient?.subtitle && (
                          <span className="text-xs text-muted-foreground/80 font-medium mt-0.5 truncate w-full">
                            {selectedPatient.subtitle}
                          </span>
                        )}
                      </div>

                      {/* Chevron or Lock Icon */}
                      <div className="shrink-0 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors">
                        <LockIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{lockedTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="secondary"
              role="combobox"
              aria-controls={`${id}-listbox`}
              aria-expanded={open}
              className={cn(
                "w-full h-auto p-0 border-0 bg-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 overflow-visible",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              disabled={disabled}
            >
              <div
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 group",
                  "bg-background/50 backdrop-blur-xl shadow-sm hover:shadow-md hover:bg-background/80",
                  "border-border/40 hover:border-border/80",
                  open && "border-primary/20 bg-background shadow-lg",
                )}
              >
                {/* Avatar Section */}
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm transition-transform duration-300">
                    <AvatarImage src={selectedPatient?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                      {selectedPatient?.name?.slice(0, 2).toUpperCase() ?? (
                        <UserIcon className="h-5 w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {selectedPatient?.status === "active" && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>

                {/* Text Info */}
                <div className="flex flex-col items-start flex-1 text-left min-w-0">
                  <span
                    className={cn(
                      "text-base font-semibold tracking-tight transition-colors",
                      !selectedPatient && "text-muted-foreground font-normal",
                    )}
                  >
                    {selectedPatient?.name ?? placeholder}
                  </span>
                  {selectedPatient?.subtitle && (
                    <span className="text-xs text-muted-foreground/80 font-medium mt-0.5 truncate w-full">
                      {selectedPatient.subtitle}
                    </span>
                  )}
                </div>

                {/* Chevron or Lock Icon */}
                <div className="shrink-0 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors">
                  <ChevronsUpDownIcon className="h-5 w-5" />
                </div>
              </div>
            </Button>
          </PopoverTrigger>
        )}

        <PopoverContent
          id={`${id}-listbox`}
          className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl overflow-hidden border-border/40 shadow-xl backdrop-blur-2xl bg-background/95"
          align="center"
          sideOffset={8}
        >
          <Command className="bg-transparent">
            <CommandInput
              placeholder="Buscar paciente..."
              value={search}
              onValueChange={setSearch}
              className="text-base"
            />
            <CommandList className="max-h-[300px] overflow-y-auto p-1">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                Nenhum paciente encontrado.
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    value={patient.name}
                    onSelect={() => {
                      onChange?.(patient.id);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-primary/5 aria-selected:text-primary cursor-pointer my-0.5"
                  >
                    <Avatar className="h-8 w-8 border border-border/40">
                      <AvatarImage src={patient.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                        {patient.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">{patient.name}</span>
                      {patient.subtitle && (
                        <span className="text-xs text-muted-foreground/70 truncate">
                          {patient.subtitle}
                        </span>
                      )}
                    </div>
                    {value === patient.id && (
                      <CheckIcon className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
};

export { PatientPicker };
