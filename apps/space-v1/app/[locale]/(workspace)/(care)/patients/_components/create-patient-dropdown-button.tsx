"use client";

import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Description,
  FluriDialogV2Title,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { FileText, Mail, X, Zap } from "lucide-react";
import { UserPlus } from "lucide-react";
import { useState } from "react";

import { FullCreatePatientWizardModal } from "./full-create-patient-wizard-modal";
import { InvitePatientModal } from "./invite-patient-modal";
import { QuickCreatePatientModal } from "./quick-create-patient-modal";

const headerButtonClasses =
  "cursor-pointer rounded-full bg-accent p-2.5 transition-colors hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-ring";

export function CreatePatientDropdownButton() {
  const [flowSelectorOpen, setFlowSelectorOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const options = [
    {
      id: "quick",
      title: "Criação Rápida",
      description: "Adicionar nome e telefone",
      icon: Zap,
      iconClassName: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
      onSelect: () => setQuickOpen(true),
    },
    {
      id: "full",
      title: "Formulário Completo",
      description: "Preencher todos os dados",
      icon: FileText,
      iconClassName: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
      onSelect: () => setFullOpen(true),
    },
    {
      id: "invite",
      title: "Enviar Convite",
      description: "Paciente preenche os dados",
      icon: Mail,
      iconClassName: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
      onSelect: () => setInviteOpen(true),
    },
  ] as const;

  const handleSelectFlow = (onSelect: () => void) => {
    setFlowSelectorOpen(false);
    window.setTimeout(() => onSelect(), 80);
  };

  return (
    <>
      <BrandButton
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setFlowSelectorOpen(true)}
      >
        <UserPlus className="h-4 w-4" />
        Novo Paciente
      </BrandButton>

      <FluriDialogV2 open={flowSelectorOpen} onOpenChange={setFlowSelectorOpen}>
        <FluriDialogV2Content
          className="sm:max-w-[440px] p-0 gap-0 overflow-hidden rounded-3xl"
          showCloseButton={false}
          title="Cadastro de paciente"
          hideTitle
        >
          <div className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-2">
            <div className="min-w-[44px]" />
            <div className="flex items-center justify-center px-2">
              <div className="truncate text-center text-base font-semibold text-foreground">
                Cadastro de paciente
              </div>
            </div>
            <div className="flex min-w-[44px] items-center justify-end">
              <BrandButton
                variant="ghost"
                size="icon"
                onClick={() => setFlowSelectorOpen(false)}
                className={cn(headerButtonClasses, "mr-1 mt-2")}
                aria-label="Fechar"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </BrandButton>
            </div>
          </div>

          <div className="px-6 pb-3 pt-2">
            <FluriDialogV2Title className="text-xl">
              Como deseja criar o paciente?
            </FluriDialogV2Title>
            <FluriDialogV2Description className="mt-1">
              Escolha o fluxo ideal para este cadastro.
            </FluriDialogV2Description>
          </div>

          <div className="flex flex-col gap-3 p-6">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <BrandButton
                  key={option.id}
                  variant="ghost"
                  onClick={() => handleSelectFlow(option.onSelect)}
                  className="group rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 p-5 text-left transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.98] h-auto justify-start"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
                        option.iconClassName,
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-foreground">{option.title}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                </BrandButton>
              );
            })}
          </div>
        </FluriDialogV2Content>
      </FluriDialogV2>

      <QuickCreatePatientModal open={quickOpen} onOpenChange={setQuickOpen} />
      <FullCreatePatientWizardModal open={fullOpen} onOpenChange={setFullOpen} />
      <InvitePatientModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
}
