"use client";

import { deriveCountryFromNumber, formatPhoneDisplay } from "@workspace/forms/utils/phone";
import type { PatientWithDetails } from "@workspace/supabase-data/types/entities";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { maskPhone } from "@workspace/core/privacy/masking-utils";
import { Sensitive } from "@workspace/core/privacy/sensitive";
import { useSensitiveValue } from "@workspace/core/privacy/use-sensitive-value";
import { UserAvatar } from "@workspace/brand/patterns/user-avatar";
import { MessageCircle, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, type MouseEvent, useCallback } from "react";

interface PatientListItemProps {
  patient: PatientWithDetails;
}

export function PatientListItem({ patient }: PatientListItemProps) {
  const router = useRouter();
  const hasEmail = Boolean(patient.email);
  const hasPhone = Boolean(patient.phone);
  const country = patient.phone ? deriveCountryFromNumber(patient.phone) : undefined;
  const rawFormattedPhone = patient.phone
    ? formatPhoneDisplay(patient.phone, {
        ...(country !== undefined ? { country } : {}),
        format: country === "BR" ? "national" : "international",
      })
    : null;
  const formattedPhone = useSensitiveValue(rawFormattedPhone, maskPhone) as string | null;
  const phoneDigits = patient.phone ? patient.phone.replace(/\D+/g, "") : "";
  const whatsappHref = phoneDigits ? `https://wa.me/${phoneDigits}` : undefined;
  const phoneHref = phoneDigits ? `tel:${phoneDigits}` : undefined;

  const isMissingContact = !hasEmail && !hasPhone;
  const isProfileIncomplete = !patient.dateOfBirth || !hasEmail || !hasPhone;

  const statusLabel = (() => {
    if (isMissingContact) return "Sem contato";
    if (isProfileIncomplete) return "Perfil incompleto";
    if (patient.status === "active" || !patient.status) return "Ativo";
    return patient.status;
  })();

  const statusStyles = (() => {
    if (isMissingContact) return "bg-destructive/10 text-destructive";
    if (isProfileIncomplete) return "bg-amber-500/15 text-amber-700";
    if (patient.status === "active" || !patient.status) {
      return "bg-emerald-500/10 text-emerald-600";
    }
    return "bg-muted text-muted-foreground";
  })();

  const genderLabel = patient.gender
    ? ({
        male: "Masculino",
        female: "Feminino",
        other: "Outro",
        NAO_INFORMADO: null,
        not_informed: null,
      }[patient.gender] ?? patient.gender)
    : null;
  const infoBits = [patient.age ? `${patient.age} anos` : null, genderLabel].filter(Boolean);
  const infoLine = infoBits.length > 0 ? infoBits.join(" • ") : "Dados básicos não informados";

  const profileHref = `/patients/${patient.id}`;
  const handleOpenProfile = useCallback(() => {
    router.push(profileHref);
  }, [router, profileHref]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        router.push(profileHref);
      }
    },
    [router, profileHref],
  );

  const stopCardNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleOpenProfile}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer outline-none"
      aria-label={`Abrir perfil de ${patient.displayName}`}
    >
      <div className="w-full max-w-xl bg-muted/50 rounded-xl shadow-sm transition-all group-hover:shadow-md focus-within:ring-2 focus-within:ring-ring/50">
        <div className="flex gap-4 p-5">
          <Sensitive variant="blur" redactedLabel="Avatar oculto">
            <UserAvatar name={patient.displayName} className="h-12 w-12 rounded-xl shrink-0" />
          </Sensitive>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-medium text-foreground text-base leading-tight truncate group-hover:text-primary transition-colors">
                  <Sensitive variant="blur" redactedLabel="Nome oculto">
                    {patient.displayName}
                  </Sensitive>
                </h3>
              </div>
              <Badge
                variant="outline"
                className={cn("px-2 py-0.5 text-xs font-medium capitalize", statusStyles)}
              >
                {statusLabel}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {formattedPhone && whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={stopCardNavigation}
                  className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80"
                  aria-label={`Abrir WhatsApp de ${patient.displayName}`}
                >
                  <MessageCircle className="size-4" />
                  <span>{formattedPhone}</span>
                </a>
              ) : null}
              {!formattedPhone && <span>Nenhum contato informado</span>}
              {formattedPhone && phoneHref && (
                <a
                  href={phoneHref}
                  onClick={stopCardNavigation}
                  className="hidden md:inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  aria-label={`Ligar para ${patient.displayName}`}
                >
                  <Phone className="size-4" />
                  <span>Ligar</span>
                </a>
              )}
            </div>

            <div className="text-xs text-muted-foreground">{infoLine}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
