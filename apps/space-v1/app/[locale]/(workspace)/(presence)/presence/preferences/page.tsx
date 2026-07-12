"use client";

import {
  usePsychologistPublicProfile,
  usePublicProfileActions,
} from "@workspace/supabase-data/hooks/public-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { useRouter } from "next/navigation";

export default function ProfilePreferencesPage() {
  const router = useRouter();
  const { data: profile, isPending } = usePsychologistPublicProfile();
  const { updatePublicationPreferences } = usePublicProfileActions();

  if (isPending) {
    return (
      <div className="flex h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-700" />
      </div>
    );
  }

  if (!profile?.slug || !profile?.is_public) {
    return (
      <div className="flex h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] items-center justify-center px-6">
        <Card className="max-w-xl border-0 shadow-none bg-transparent">
          <CardContent className="space-y-4 rounded-2xl bg-white p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Conclua o onboarding para liberar preferências
            </h2>
            <p className="text-sm text-muted-foreground">
              Finalize a ativação e publicação do site pessoal para configurar as preferências.
            </p>
            <BrandButton onClick={() => router.push("/onboarding")}>Ir para onboarding</BrandButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Preferências do Site Pessoal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PreferenceToggle
            title="Site pessoal público"
            description="Controla se seu link pessoal fica acessível publicamente."
            checked={Boolean(profile.is_public)}
            onCheckedChange={(checked) =>
              void updatePublicationPreferences({
                isPublic: checked,
              })
            }
          />

          <PreferenceToggle
            title="Mostrar no marketplace"
            description="Permite que seu perfil apareça na busca global do Fluri."
            checked={Boolean(profile.show_in_marketplace)}
            onCheckedChange={(checked) =>
              void updatePublicationPreferences({
                showInMarketplace: checked,
              })
            }
          />

          <PreferenceToggle
            title="Aceitando novos pacientes"
            description="Sinaliza disponibilidade de agenda para novos contatos."
            checked={Boolean(
              (profile as { accepting_new_patients?: boolean | null }).accepting_new_patients,
            )}
            onCheckedChange={(checked) =>
              void updatePublicationPreferences({
                acceptingNewPatients: checked,
              })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

function PreferenceToggle({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
