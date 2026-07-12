import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import type { ActivityReference } from "@workspace/supabase-data/types/entities";
import { useActivities } from "@workspace/supabase-data/hooks/catalogs";
import {
  downloadAndOpenSignedStorageObject,
  getPublicStorageUrl,
} from "@/compat/supabase/utils/storage";
import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@workspace/ui/components/sheet";
import { VisuallyHidden } from "@workspace/ui/components/visually-hidden";
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { FluriDialogV2OverlayCloseButton } from "@workspace/brand/overlays/fluri-dialog-v2-overlay-close-button";
import { ChevronLeft, Download, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ActivityAssignForm } from "./activity-assign-form";

interface ActivityDetailsDialogProps {
  activity: ActivityReference | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPatientId?: string;
  onSuccess?: () => void;
}

const IMAGE_BUCKET = "activity-images";
const PDF_BUCKET = "activity-pdfs";

// Same fallback image used in DocumentCard and ActivityCard
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1698044048234-2e7f6c4e6aca?q=80&w=1000&auto=format";

export function ActivityDetailsDialog({
  activity: initialActivity,
  open,
  onOpenChange,
  defaultPatientId,
  onSuccess,
}: ActivityDetailsDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [step, setStep] = useState<"activity-selection" | "details" | "assign">("details");
  const [internalSelectedActivity, setInternalSelectedActivity] =
    useState<ActivityReference | null>(null);

  const { data: activities = [], isPending: isPendingActivities } = useActivities();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const activity = initialActivity ?? internalSelectedActivity;

  useEffect(() => {
    if (open) {
      if (initialActivity) {
        setInternalSelectedActivity(initialActivity);
        setStep("details");
      } else {
        setInternalSelectedActivity(null);
        setStep("activity-selection");
      }
      // Reset image error state when dialog opens
      setImageError(false);
    }
  }, [open, initialActivity]);

  const storageImageUrl = activity?.image_path
    ? getPublicStorageUrl(IMAGE_BUCKET, activity.image_path)
    : null;

  // Use storage image if available and no error, otherwise use fallback
  const displayImageUrl = storageImageUrl && !imageError ? storageImageUrl : FALLBACK_IMAGE;

  const handleDownload = async () => {
    if (!activity?.pdf_path) return;
    setIsDownloading(true);
    try {
      const fileName = activity.pdf_path.split("/").pop();
      const { error } = await downloadAndOpenSignedStorageObject(PDF_BUCKET, activity.pdf_path, {
        expiresInSeconds: 60 * 5,
        ...(fileName ? { fileName } : {}),
        openInNewTab: true,
      });
      if (error) {
        throw new Error(error ?? "Não foi possível gerar o link do PDF.");
      }
    } catch (error) {
      console.error("[ActivityDetailsDialog] PDF download error:", error);
      toast.error("Não foi possível baixar o PDF da atividade.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset logic handled in useEffect on open
    }
    onOpenChange(isOpen);
  };

  const content = (
    <div className="relative flex min-h-[520px] flex-col bg-background overflow-hidden h-full">
      <div className="absolute right-4 top-4 z-20">
        <FluriDialogV2OverlayCloseButton onClick={() => handleClose(false)} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === "activity-selection" ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full bg-background p-6 pt-12"
          >
            <h2 className="text-xl font-semibold mb-2">Escolha uma atividade</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Selecione qual atividade deseja visualizar ou atribuir.
            </p>

            <div className="space-y-4">
              <FluriFieldV2Select
                label="Atividade"
                placeholder={isPendingActivities ? "Carregando..." : "Selecione a atividade"}
                options={activities.map((a) => ({ value: a.id, label: a.name ?? "Sem nome" }))}
                value={activity?.id ?? ""}
                onValueChange={(val) => {
                  const selected = activities.find((a) => a.id === val);
                  if (selected) {
                    setInternalSelectedActivity(selected);
                    setStep("details");
                  }
                }}
                disabled={isPendingActivities || activities.length === 0}
                fullWidth
              />
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              layout
              className="relative overflow-hidden shrink-0 bg-muted"
              animate={{
                height: step === "details" ? 200 : 0,
                opacity: step === "details" ? 1 : 0,
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Image
                src={displayImageUrl}
                alt={activity?.name ?? "Activity"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={() => setImageError(true)}
              />
              {/* Back button to activity selection if we started there */}
              {!initialActivity && step === "details" && (
                <BrandButton
                  onClick={() => {
                    setStep("activity-selection");
                    setInternalSelectedActivity(null);
                  }}
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-4 left-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </BrandButton>
              )}
            </motion.div>

            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
              {activity && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold">{activity.name}</h2>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mt-2">{activity.description}</p>
                    )}
                  </div>

                  {}
                  {Array.isArray(activity.tags) && activity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {}
                      {activity.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* 
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {activity.duration_min && (
                      <span>Duração estimada: {activity.duration_min} min</span>
                    )}
                    {activity.activity_kind && <span>Tipo: {activity.activity_kind}</span>}
                    {Array.isArray(activity.delivery_modes) &&
                    activity.delivery_modes.length > 0 ? (
                      <span>Formato: {activity.delivery_modes.join(", ")}</span>
                    ) : null}
                  </div>
                  */}
                </>
              )}

              <AnimatePresence mode="wait">
                {step === "details" && activity ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex flex-row items-center justify-end gap-3 mt-auto"
                  >
                    <BrandButton
                      variant="secondary"
                      disabled={!activity.pdf_path || isDownloading}
                      onClick={() => {
                        void handleDownload();
                      }}
                      className="rounded-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isDownloading ? "Baixando..." : "Baixar PDF"}
                    </BrandButton>
                    <BrandButton
                      variant="primary"
                      onClick={() => setStep("assign")}
                      className="rounded-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Atribuir atividade
                    </BrandButton>
                    {!activity.pdf_path && (
                      <span className="text-xs text-muted-foreground">
                        PDF ainda não disponível
                      </span>
                    )}
                  </motion.div>
                ) : step === "assign" && activity ? (
                  <motion.div
                    key="assign"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex flex-col gap-5"
                  >
                    <ActivityAssignForm
                      defaultActivityId={activity.id}
                      defaultPatientId={defaultPatientId ?? undefined}
                      onCancel={() => setStep("details")}
                      onSuccess={() => {
                        setStep("details");
                        onOpenChange(false);
                        onSuccess?.();
                      }}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  const dialogTitle =
    step === "activity-selection" ? "Selecionar Atividade" : (activity?.name ?? "Atividade");
  const dialogDescription =
    step === "activity-selection"
      ? "Escolha uma atividade da lista para visualizar detalhes ou atribuir a um paciente."
      : (activity?.description ??
        "Visualize detalhes da atividade, faça download do PDF ou atribua a um paciente.");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="sm:max-w-xl p-0 gap-0 overflow-hidden rounded-3xl border-0"
          showCloseButton={false}
        >
          <VisuallyHidden>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </VisuallyHidden>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="p-0 pb-safe rounded-t-3xl h-[85vh] overflow-hidden"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <SheetTitle>{dialogTitle}</SheetTitle>
          <SheetDescription>{dialogDescription}</SheetDescription>
        </VisuallyHidden>
        {content}
      </SheetContent>
    </Sheet>
  );
}
