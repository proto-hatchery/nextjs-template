"use client";

import {
  FormProvider,
  useForm,
  type UseFormReturn,
  zodResolver,
} from "@workspace/forms/react-hook-form";
import { createFinancialEntryAction } from "@workspace/supabase-data/actions/financial/create-financial-entry";
import { deleteFinancialEntryAction } from "@workspace/supabase-data/actions/financial/delete-financial-entry";
import { updateFinancialEntryAction } from "@workspace/supabase-data/actions/financial/update-financial-entry";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import type { FinancialEntryWithDetails, PaymentMethod } from "@workspace/supabase-data/types/entities";
import { useTransactionCategories } from "@workspace/supabase-data/hooks/finances";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import {
  FluriFormDialogFooter,
  FluriFormDialogShell,
} from "@workspace/brand/overlays/fluri-form-dialog-shell";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CONSOLIDATED_ENTRY_MESSAGE, isConsolidatedEntry } from "../_utils/consolidation";
import { TransactionForm } from "./transaction-form";
import {
  amountCodec,
  convertDateToISO,
  dateCodec,
  optionalNotesCodec,
  optionalSelectWithNoneCodec,
  type TransactionFormValues,
  transactionSchema,
} from "./transaction-schema";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  defaultType: "income" | "expense";
  entry?: FinancialEntryWithDetails | null;
}

interface TransactionCategory {
  id: string;
  name: string;
  type: string;
  is_selectable: boolean;
}

const CANONICAL_CATEGORIES_BY_TYPE = {
  INCOME: [
    "Consulta Presencial",
    "Consulta Online",
    "Supervisão",
    "Plantão Psicológico",
    "Avaliação Psicológica",
    "Bateria de Testes",
    "Orientação de Pais",
    "Outros Serviços",
  ],
  EXPENSE: [
    "Aluguel do Consultório",
    "Software/Plataforma",
    "Material de Escritório",
    "Marketing/Divulgação",
    "Capacitação/Cursos",
    "Supervisão Recebida",
    "Transporte",
    "Impostos",
    "Outras Despesas",
  ],
} as const;

const normalizeCategoryName = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
};

const CANONICAL_NAME_BY_NORMALIZED = new Map<string, string>(
  [...CANONICAL_CATEGORIES_BY_TYPE.INCOME, ...CANONICAL_CATEGORIES_BY_TYPE.EXPENSE].map((name) => {
    return [normalizeCategoryName(name), name];
  }),
);

export function TransactionModal({
  open,
  onOpenChange,
  mode,
  defaultType,
  entry,
}: TransactionModalProps) {
  const _isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { data: categoriesData } = useTransactionCategories();
  const [step, setStep] = useState<"selection" | "form">(mode === "edit" ? "form" : "selection");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = mode === "edit" && entry != null && !isConsolidatedEntry(entry);

  // Inclui categoria da entrada ao editar (ex: Consolidação Diária) mesmo se não for selecionável
  const categories = useMemo<TransactionCategory[]>(() => {
    // Pegamos apenas o que vem do banco (já filtrado por is_selectable na query)
    const base = (categoriesData ?? []) as TransactionCategory[];

    if (mode !== "edit" || !entry?.transaction_category_id || !entry?.categoryName) {
      return base;
    }
    const hasEntryCategory = base.some((c) => c.id === entry.transaction_category_id);
    if (hasEntryCategory) return base;

    // Só adicionamos a categoria da transação atual se ela não estiver na lista base
    const entryType = entry.type === "expense" ? "EXPENSE" : "INCOME";
    return [
      ...base,
      {
        id: entry.transaction_category_id,
        name: entry.categoryName,
        type: entryType,
        is_selectable: true,
      },
    ];
  }, [categoriesData, entry?.categoryName, entry?.transaction_category_id, entry?.type, mode]);

  const getCreateDefaults = (type: "income" | "expense"): TransactionFormValues => {
    const nowIso = new Date().toISOString();
    return {
      type,
      amount: "",
      dateTime: dateCodec.encode(nowIso) || "",
      categoryId: undefined,
      status: "confirmed",
      paymentMethod: "none",
      notes: "",
    };
  };

  const getEditDefaults = (entryValue: FinancialEntryWithDetails): TransactionFormValues => {
    const rawAmount = entryValue.amount ?? 0;
    const amountInCurrency = rawAmount / 100;
    const notesInput = typeof entryValue.notes === "string" ? entryValue.notes : undefined;
    return {
      type: entryValue.type === "expense" ? "expense" : "income",
      amount: amountCodec.encode(amountInCurrency) ?? "",
      dateTime: dateCodec.encode(entryValue.date_time ?? new Date().toISOString()) || "",
      categoryId: entryValue.transaction_category_id ?? undefined,
      status: entryValue.status ?? "confirmed",
      paymentMethod: optionalSelectWithNoneCodec.encode(entryValue.payment_method ?? undefined),
      notes: optionalNotesCodec.encode(notesInput) ?? "",
    };
  };

  const form = useForm<TransactionFormValues>({
    // @ts-expect-error - zod codec output has amount: number; form input has amount: string
    resolver: zodResolver(transactionSchema),
    defaultValues: getCreateDefaults(defaultType),
  });

  const currentFormType = form.watch("type");

  const filteredCategories = useMemo<TransactionCategory[]>(() => {
    return categories.filter((c) => {
      const categoryType = String(c.type ?? "").toUpperCase();
      const selectedType = String(currentFormType ?? "").toUpperCase();
      if (categoryType !== selectedType) return false;

      const isSavedCategoryInEdit =
        mode === "edit" &&
        entry?.transaction_category_id != null &&
        c.id === entry.transaction_category_id;
      if (isSavedCategoryInEdit) return true;

      const normalizedName = normalizeCategoryName(c.name);
      return CANONICAL_NAME_BY_NORMALIZED.has(normalizedName);
    });
  }, [categories, currentFormType, mode, entry?.transaction_category_id]);

  const canonicalOrderedCategories = useMemo<TransactionCategory[]>(() => {
    const selectedType = String(currentFormType ?? "").toUpperCase();
    const canonicalOrder =
      CANONICAL_CATEGORIES_BY_TYPE[selectedType as keyof typeof CANONICAL_CATEGORIES_BY_TYPE] ?? [];

    const deduped = new Map<string, TransactionCategory>();
    for (const category of filteredCategories) {
      const isSavedCategoryInEdit =
        mode === "edit" &&
        entry?.transaction_category_id != null &&
        category.id === entry.transaction_category_id;

      if (isSavedCategoryInEdit) {
        deduped.set(`id:${category.id}`, category);
        continue;
      }

      const canonicalName = CANONICAL_NAME_BY_NORMALIZED.get(normalizeCategoryName(category.name));
      if (!canonicalName) continue;
      if (!deduped.has(`name:${canonicalName}`)) {
        deduped.set(`name:${canonicalName}`, { ...category, name: canonicalName });
      }
    }

    const orderedCanonical = canonicalOrder
      .map((name) => deduped.get(`name:${name}`))
      .filter((category): category is TransactionCategory => category != null);

    const savedCategory =
      mode === "edit" && entry?.transaction_category_id
        ? deduped.get(`id:${entry.transaction_category_id}`)
        : undefined;

    if (savedCategory && !orderedCanonical.some((category) => category.id === savedCategory.id)) {
      return [...orderedCanonical, savedCategory];
    }

    return orderedCanonical;
  }, [currentFormType, entry?.transaction_category_id, filteredCategories, mode]);

  useEffect(() => {
    const selectedCategoryId = form.getValues("categoryId");
    if (!selectedCategoryId) return;
    const isCategoryAllowedForType = canonicalOrderedCategories.some((category) => {
      return category.id === selectedCategoryId;
    });
    if (!isCategoryAllowedForType) {
      form.setValue("categoryId", undefined);
    }
  }, [canonicalOrderedCategories, form]);

  useEffect(() => {
    if (!open) return;
    setShowDeleteConfirm(false);
    if (mode === "edit" && entry) {
      setStep("form");
      form.reset(getEditDefaults(entry));
    } else {
      setStep("selection");
      form.reset(getCreateDefaults(defaultType));
    }
  }, [defaultType, entry, form, mode, open]);

  const onSubmit = async (formValues: TransactionFormValues) => {
    try {
      setIsSaving(true);
      const values = transactionSchema.parse(formValues);
      const selectedCategory = canonicalOrderedCategories.find((category) => {
        return category.id === values.categoryId;
      });
      const categoryId = selectedCategory?.id;
      const categoryName = selectedCategory?.name;
      const description = categoryName ?? (values.type === "income" ? "Receita" : "Despesa");

      if (mode === "create") {
        unwrapActionResult(await createFinancialEntryAction({
          type: values.type,
          amount: Math.round(values.amount * 100),
          description,
          dateTime: convertDateToISO(values.dateTime) || new Date().toISOString(),
          categoryId,
          paymentMethod: (values.paymentMethod as PaymentMethod) ?? undefined,
          notes: values.notes ?? undefined,
        }));
        toast.success("Transação criada com sucesso");
      } else if (entry) {
        unwrapActionResult(await updateFinancialEntryAction({
          entryId: entry.id,
          data: {
            amount: Math.round(values.amount * 100),
            description,
            dateTime: convertDateToISO(values.dateTime),
            categoryId,
            paymentMethod: (values.paymentMethod as PaymentMethod) ?? undefined,
            status: values.status,
            notes: values.notes ?? undefined,
          },
        }));
        toast.success("Transação atualizada");
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.financial.all });
      onOpenChange(false);
    } catch (ignoreErr) {
      const message = ignoreErr instanceof Error ? ignoreErr.message : "Erro ao salvar transação";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void (form as unknown as UseFormReturn<TransactionFormValues>).handleSubmit(onSubmit)(e);
  };

  const handleDelete = async () => {
    if (!entry) return;
    if (isConsolidatedEntry(entry)) {
      toast.info("Entrada sincronizada", {
        description: CONSOLIDATED_ENTRY_MESSAGE,
      });
      return;
    }
    try {
      setIsDeleting(true);
      unwrapActionResult(await deleteFinancialEntryAction({ entryId: entry.id }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.financial.all });
      toast.success("Transação removida");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao excluir transação");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isSaving && !isDeleting) {
      onOpenChange(false);
    }
  };

  const title = mode === "edit" ? "Editar Transação" : "Nova Transação";
  const description =
    mode === "edit"
      ? "Edite os detalhes da transação financeira, como valor, data, categoria e método de pagamento."
      : "Crie uma nova transação financeira informando o valor, data, categoria e método de pagamento.";

  return (
    <FluriFormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      showBackButton={
        step === "form" && (mode === "create" ? !showDeleteConfirm : showDeleteConfirm)
      }
      onBack={() => {
        if (showDeleteConfirm) setShowDeleteConfirm(false);
        else setStep("selection");
      }}
      onClose={handleClose}
    >
      <FormProvider {...form}>
        <TransactionForm
          step={step}
          setStep={setStep}
          categories={canonicalOrderedCategories}
          mode={mode}
          onSubmit={handleFormSubmit}
          onCancel={handleClose}
          showDeleteConfirm={showDeleteConfirm}
          onDeleteRequest={() => setShowDeleteConfirm(true)}
          onCancelDelete={() => setShowDeleteConfirm(false)}
          onConfirmDelete={() => void handleDelete()}
          isSubmitting={isSaving}
          isDeleting={isDeleting}
          canDelete={canDelete}
        />
        {step === "form" && showDeleteConfirm && (
          <FluriFormDialogFooter
            onCancel={() => setShowDeleteConfirm(false)}
            onSubmit={() => void handleDelete()}
            cancelLabel="Voltar"
            submitLabel="Excluir"
            submitVariant="destructive"
            isSubmitting={isDeleting}
            className="border-t"
          />
        )}
      </FormProvider>
    </FluriFormDialogShell>
  );
}
