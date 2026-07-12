"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatientGuardiansDataAction } from "@workspace/supabase-data/actions/patients/get-patient-guardians-data";
import { isActionError } from "@workspace/supabase-data/lib/boundary/action-error";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action";
import { queryKeys } from "@/compat/supabase/utils/query-keys";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Mail, Phone, User, Users } from "lucide-react";
import { z } from "zod";

import {
  PatientDetailCardEmptyState,
  PatientDetailCardErrorState,
  PatientDetailCardLoadingState,
} from "../../shared/patient-detail-card-states";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";

export interface PatientGuardiansInfoSectionProps {
  patientId: string;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  father: "Pai",
  mother: "Mãe",
  legal_guardian: "Responsável Legal",
  tutor: "Tutor",
  other: "Outro",
};

// Schema for guardian data
const GuardianSchema = z.object({
  name: z.string(),
  relationship: z.string().nullable().optional(),
  cpf: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
});

const GuardiansResponseSchema = z.object({
  primary: GuardianSchema.nullable().optional(),
  secondary: GuardianSchema.nullable().optional(),
});

export function PatientGuardiansInfoSection({ patientId }: PatientGuardiansInfoSectionProps) {
  const {
    data: guardians,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.patients.guardians(patientId),
    queryFn: async () => {
      try {
        const result = await getPatientGuardiansDataAction({ patientId });
        return unwrapActionResult(result, GuardiansResponseSchema);
      } catch (err) {
        if (isActionError(err)) {
          throw new Error(err.message);
        }
        throw err;
      }
    },
  });

  if (isPending) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Responsáveis Legais" />
        <PatientDetailCardLoadingState message="Carregando responsáveis..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Responsáveis Legais" />
        <PatientDetailCardErrorState
          message="Erro ao carregar responsáveis."
          onRetry={() => void refetch()}
        />
      </section>
    );
  }

  const { primary, secondary } = guardians ?? { primary: null, secondary: null };

  const hasNoGuardians = !primary && !secondary;

  if (hasNoGuardians) {
    return (
      <section className="space-y-6">
        <PatientDetailSubheader title="Responsáveis Legais">
          <BrandButton variant="ghost" size="sm" family="rounded">
            Adicionar responsável
          </BrandButton>
        </PatientDetailSubheader>
        <PatientDetailCardEmptyState
          icon={Users}
          title="Nenhum responsável cadastrado"
          subtitle="Adicione os dados dos responsáveis legais do paciente"
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PatientDetailSubheader title="Responsáveis Legais">
        <BrandButton variant="ghost" size="sm" family="rounded">
          {primary && secondary ? "Editar" : "Adicionar responsável"}
        </BrandButton>
      </PatientDetailSubheader>

      {/* Guardians grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Parent 1 (Primary Guardian) */}
        {primary && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Responsável Principal</h3>
            </div>

            <div className="space-y-3">
              {/* Name */}
              <div>
                <p className="text-xs text-muted-foreground">Nome Completo</p>
                <p className="text-sm font-medium text-foreground">{primary.name}</p>
              </div>

              {/* Relationship */}
              {primary.relationship && (
                <div>
                  <p className="text-xs text-muted-foreground">Relacionamento</p>
                  <p className="text-sm text-foreground">
                    {RELATIONSHIP_LABELS[primary.relationship] ?? primary.relationship}
                  </p>
                </div>
              )}

              {/* Documents */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {primary.cpf && <span>CPF: {primary.cpf}</span>}
              </div>

              {/* Contact */}
              <div className="space-y-2">
                {primary.phone && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>{primary.phone}</span>
                  </div>
                )}
                {primary.email && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Mail className="size-3 text-muted-foreground" />
                    <span>{primary.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Parent 2 (Secondary Guardian) */}
        {secondary && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Responsável Secundário</h3>
            </div>

            <div className="space-y-3">
              {/* Nome */}
              <div>
                <p className="text-xs text-muted-foreground">Nome Completo</p>
                <p className="text-sm font-medium text-foreground">{secondary.name}</p>
              </div>

              {/* Relacionamento */}
              {secondary.relationship && (
                <div>
                  <p className="text-xs text-muted-foreground">Relacionamento</p>
                  <p className="text-sm text-foreground">
                    {RELATIONSHIP_LABELS[secondary.relationship] ?? secondary.relationship}
                  </p>
                </div>
              )}

              {/* Documentos */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {secondary.cpf && <span>CPF: {secondary.cpf}</span>}
              </div>

              {/* Contato */}
              <div className="space-y-2">
                {secondary.phone && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>{secondary.phone}</span>
                  </div>
                )}
                {secondary.email && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Mail className="size-3 text-muted-foreground" />
                    <span>{secondary.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for second guardian if not exists */}
        {primary && !secondary && (
          <PatientDetailCardEmptyState
            icon={Users}
            title="Responsável secundário não cadastrado"
            subtitle="Adicione um segundo responsável legal para este paciente"
          />
        )}
      </div>
    </section>
  );
}
