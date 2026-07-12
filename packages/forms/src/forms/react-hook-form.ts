/**
 * React Hook Form re-exports (client-only).
 * Import from "@workspace/forms/react-hook-form" in Client Components only.
 * Do not import this module from Server Components.
 */

export {
  useForm,
  useFormContext,
  useWatch,
  useFieldArray,
  useController,
  Controller,
  FormProvider,
} from "react-hook-form";
export type {
  FieldValues,
  FieldErrors,
  UseFormReturn,
  UseFormProps,
  Control,
  ControllerProps,
  ControllerRenderProps,
  ControllerFieldState,
  UseControllerProps,
  UseControllerReturn,
  SubmitHandler,
  SubmitErrorHandler,
  FieldPath,
  FieldPathValue,
  DeepPartial,
  DefaultValues,
  Resolver,
  FormState,
  UseFormSetValue,
  UseFormTrigger,
  UseFormGetValues,
  UseFormWatch,
  UseFormReset,
  UseFormClearErrors,
  UseFormSetError,
  UseFormRegisterReturn,
  RegisterOptions,
  Path,
  PathValue,
} from "react-hook-form";
export type { FieldError as RHFFieldError } from "react-hook-form";
export { zodResolver } from "@hookform/resolvers/zod";
export { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
