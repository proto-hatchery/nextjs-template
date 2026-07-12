"use client";

import * as React from "react";
import {
  Calendar,
  CalendarDays,
  CheckSquare,
  FilePlus,
  Files,
  FileText,
  ListTodo,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
} from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@workspace/ui/components/command";
import { Kbd } from "./kbd.component";

export function CommandPalette({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(true);

  // In a real implementation, this would likely be controlled by a Dialog or Popover
  // and have keyboard event listeners for Cmd+K to toggle visibility.
  // For this component deliverable, we focus on the UI structure.

  return (
    <div className={cn("relative max-w-xl w-full mx-auto dark", className)}>
      <Command className="rounded-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-lg backdrop-saturate-150 bg-black/55 overflow-hidden text-white [&_[data-slot=command-input-wrapper]]:border-b-white/10 [&_[data-slot=command-input-wrapper]]:h-auto">
        <div className="relative">
          <CommandInput
            placeholder="Digite um comando ou pesquise..."
            className="h-11 text-base font-medium placeholder:text-white/50 text-white"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Kbd className="bg-white/10 text-white/70 border-none shadow-none">F</Kbd>
          </div>
        </div>

        <CommandList className="max-h-[500px] py-2 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          <CommandGroup
            heading="Pesquisas recentes"
            className="text-white/60 font-medium px-2 py-1.5 [&_[cmdk-group-heading]]:text-white/60"
          >
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <Users className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Pacientes ativos</span>
              <CommandShortcut className="text-white/40">Ir para...</CommandShortcut>
            </CommandItem>
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <FileText className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Modelo de avaliação inicial</span>
              <CommandShortcut className="text-white/40">Ir para...</CommandShortcut>
            </CommandItem>
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Agenda da semana</span>
              <CommandShortcut className="text-white/40">Ir para...</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="my-1 bg-white/10" />

          <CommandGroup
            heading="Gestão de Pacientes"
            className="text-white/60 font-medium px-2 py-1.5 [&_[cmdk-group-heading]]:text-white/60"
          >
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <UserPlus className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Criar novo paciente</span>
              <CommandShortcut className="text-white/40">Alt P</CommandShortcut>
            </CommandItem>
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <Search className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Pesquisar paciente</span>
              <CommandShortcut className="text-white/40">Alt K</CommandShortcut>
            </CommandItem>
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <Users className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Ver todos os pacientes</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="my-1 bg-white/10" />

          <CommandGroup
            heading="Agendamento"
            className="text-white/60 font-medium px-2 py-1.5 [&_[cmdk-group-heading]]:text-white/60"
          >
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Agendar nova sessão</span>
              <CommandShortcut className="text-white/40">Alt S</CommandShortcut>
            </CommandItem>
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Ver agenda</span>
              <CommandShortcut className="text-white/40">Alt A</CommandShortcut>
            </CommandItem>
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <RefreshCw className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Reagendar sessão</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="my-1 bg-white/10" />

          <CommandGroup
            heading="Atividades"
            className="text-white/60 font-medium px-2 py-1.5 [&_[cmdk-group-heading]]:text-white/60"
          >
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <CheckSquare className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Atribuir atividade</span>
            </CommandItem>
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <ListTodo className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Ver atividades pendentes</span>
            </CommandItem>
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <FilePlus className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Criar modelo de atividade</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="my-1 bg-white/10" />

          <CommandGroup
            heading="Documentos"
            className="text-white/60 font-medium px-2 py-1.5 [&_[cmdk-group-heading]]:text-white/60"
          >
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <Search className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Pesquisar modelo de documento</span>
            </CommandItem>
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <FilePlus className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Criar novo documento</span>
              <CommandShortcut className="text-white/40">Alt D</CommandShortcut>
            </CommandItem>
            <CommandItem className="rounded-lg aria-selected:bg-white/10 aria-selected:text-white my-0.5 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
              <Files className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-medium">Ver documentos recentes</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>

        <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Kbd className="h-5 px-1.5 bg-white/10 border-none shadow-none text-white/70">
                <ArrowUp className="h-3 w-3" />
              </Kbd>
              <Kbd className="h-5 px-1.5 bg-white/10 border-none shadow-none text-white/70">
                <ArrowDown className="h-3 w-3" />
              </Kbd>
              <span>navegar</span>
            </div>
            <div className="flex items-center gap-1">
              <Kbd className="h-5 px-1.5 bg-white/10 border-none shadow-none text-white/70">
                <CornerDownLeft className="h-3 w-3" />
              </Kbd>
              <span>selecionar</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Kbd className="h-5 px-1.5 bg-white/10 border-none shadow-none text-white/70">esc</Kbd>
            <span>fechar</span>
          </div>
        </div>
      </Command>
    </div>
  );
}
