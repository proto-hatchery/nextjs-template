"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  OnboardingStepActions,
  OnboardingStepContainer,
  OnboardingStepForm,
  OnboardingStepHeader,
} from "@workspace/brand/onboarding";
import {
  type ProfessionalStepData,
  professionalStepSchema,
} from "@workspace/brand/onboarding/lib/schemas";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2Crp } from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { CRP_FORMAT_HELPER_TEXT, CRP_MASK_PLACEHOLDER } from "@workspace/forms/utils/crp";
import { getV2InputProps, getV2SelectProps, useV2ControllerField } from "@workspace/forms/v2/rhf";
import { updateOnboardingStepAction } from "@workspace/supabase-data/actions/onboarding/flow-controller";
import { saveProfessionalStepAction } from "@workspace/supabase-data/actions/onboarding/steps/professional-step-action";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { BRAZILIAN_STATES } from "../_lib/types";

interface ProfessionalPageClientProps {
  initialData: Partial<ProfessionalStepData>;
}

function CrpField() {
  const { control } = useFormContext<ProfessionalStepData>();
  const { contract } = useV2ControllerField<ProfessionalStepData, "crpNumber">({
    control,
    name: "crpNumber",
    mode: "string",
  });

  return (
    <FluriFieldV2Crp
      field={getV2InputProps(contract)}
      label="Número do CRP"
      placeholder={CRP_MASK_PLACEHOLDER}
      helperText={CRP_FORMAT_HELPER_TEXT}
      required
      fullWidth
    />
  );
}

// Opções de UF memoizadas fora do componente para evitar recriação
const CRP_STATE_OPTIONS = BRAZILIAN_STATES.map((state) => ({
  value: state.value,
  label: state.value,
}));

// Componente wrapper para UF (Select v2)
function CrpStateField() {
  const { control } = useFormContext<ProfessionalStepData>();
  const { contract } = useV2ControllerField<ProfessionalStepData, "crpState">({
    control,
    name: "crpState",
    mode: "string",
  });

  return (
    <FluriFieldV2Select
      field={getV2SelectProps(contract)}
      label="UF"
      placeholder="UF"
      options={CRP_STATE_OPTIONS}
      helperText="Selecione a UF do seu conselho regional."
      required
      fullWidth
    />
  );
}

export default function ProfessionalPageClient({ initialData }: ProfessionalPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const methods = useForm<ProfessionalStepData>({
    resolver: standardSchemaResolver(professionalStepSchema),
    defaultValues: {
      crpNumber: initialData.crpNumber ?? "",
      crpState: initialData.crpState ?? "",
    },
    mode: "onChange",
  });

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = useCallback(
    (values: Partial<ProfessionalStepData>) => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

      autoSaveTimerRef.current = setTimeout(() => {
        startTransition(() => {
          void updateOnboardingStepAction({
            stepId: "professional",
            isComplete: false,
            draftData: values as Record<string, unknown>,
          });
        });
      }, 1500);
    },
    [startTransition],
  );

  useEffect(() => {
    const subscription = methods.watch((values) => {
      scheduleSave(values as Partial<ProfessionalStepData>);
    });
    return () => {
      subscription.unsubscribe();
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [methods, scheduleSave]);

  const {
    formState: { isValid },
  } = methods;

  const onSubmit = (data: ProfessionalStepData) => {
    startTransition(async () => {
      const result = await saveProfessionalStepAction(data);

      if (result.success) {
        router.push("/onboarding/subscription");
        return;
      }

      toast.error(result.error?.message || "Erro ao salvar dados. Tente novamente.");
    });
  };

  const handleBack = () => {
    router.push("/onboarding/identity");
  };

  return (
    <OnboardingStepContainer>
      <OnboardingStepHeader
        title="Credenciais"
        description="Precisamos validar seu registro profissional para ativar seu perfil na plataforma."
      />

      <OnboardingStepForm methods={methods} onSubmit={onSubmit}>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <CrpField />
          </div>
          <CrpStateField />
        </div>

        <OnboardingStepActions
          onBack={handleBack}
          continueType="submit"
          continueLabel="Continuar"
          continuePendingLabel="Salvando..."
          isPending={isPending}
          continueDisabled={!isValid}
          size="default"
        />
      </OnboardingStepForm>
    </OnboardingStepContainer>
  );
}
