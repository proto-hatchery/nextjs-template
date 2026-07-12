import { cn } from "@workspace/ui/lib/utils";
import {
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

interface OnboardingStepFormProps<TFieldValues extends FieldValues> {
  methods: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: React.ReactNode;
  className?: string;
}

export function OnboardingStepForm<TFieldValues extends FieldValues>({
  methods,
  onSubmit,
  children,
  className,
}: OnboardingStepFormProps<TFieldValues>) {
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(event) => {
          void methods.handleSubmit(onSubmit)(event);
        }}
        className={cn("space-y-6", className)}
      >
        {children}
      </form>
    </FormProvider>
  );
}
