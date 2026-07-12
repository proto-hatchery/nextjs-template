"use client";

import { AlertCircle, FileText, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";
import { useFormContext } from "react-hook-form";

export interface FluriFieldV2FileUploadProps {
  name: string;
  label: string;
  accept?: string;
  maxSize?: number;
  helperText?: string;
  required?: boolean;
  onFileSelect?: (file: File | null) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  containerClassName?: string;
}

const SIZE_LIMITS: Record<string, number> = {
  "application/pdf": 10 * 1024 * 1024,
  "image/jpeg": 5 * 1024 * 1024,
  "image/png": 5 * 1024 * 1024,
  "application/msword": 10 * 1024 * 1024,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 10 * 1024 * 1024,
  "text/plain": 1 * 1024 * 1024,
  "application/vnd.oasis.opendocument.text": 10 * 1024 * 1024,
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const kiloBytes = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const index = Math.floor(Math.log(bytes) / Math.log(kiloBytes));
  return `${Math.round((bytes / kiloBytes ** index) * 100) / 100} ${sizes[index]}`;
};

export function FluriFieldV2FileUpload({
  name,
  label,
  accept = "application/pdf",
  maxSize = 5 * 1024 * 1024,
  helperText,
  required = false,
  onFileSelect,
  disabled = false,
  fullWidth = true,
  containerClassName,
}: FluriFieldV2FileUploadProps) {
  const {
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const error = errors[name]?.message as string | undefined;

  const getAcceptedMimeTypes = useCallback(() => {
    if (!accept) return [];
    return accept.split(",").map((type) => type.trim().toLowerCase());
  }, [accept]);

  const isFileTypeAllowed = useCallback(
    (file: File): boolean => {
      const acceptedTypes = getAcceptedMimeTypes();
      if (acceptedTypes.length === 0) return true;

      if (acceptedTypes.includes(file.type.toLowerCase())) return true;

      const fileName = file.name.toLowerCase();
      return acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return fileName.endsWith(type);
        }

        if (type.endsWith("/*")) {
          const baseType = type.slice(0, -2);
          return file.type.startsWith(baseType);
        }

        return false;
      });
    },
    [getAcceptedMimeTypes],
  );

  const getFileSizeLimit = useCallback(
    (file: File): number => {
      return SIZE_LIMITS[file.type] || maxSize;
    },
    [maxSize],
  );

  const handleFileChange = useCallback(
    (file: File | null) => {
      setCompressionInfo(null);

      if (!file) {
        setSelectedFile(null);
        setValue(name, null, { shouldValidate: true });
        onFileSelect?.(null);
        return;
      }

      if (!isFileTypeAllowed(file)) {
        setValue(name, null, { shouldValidate: true });
        setError(name, {
          type: "manual",
          message: `Tipo de arquivo não permitido. Aceitos: ${accept}`,
        });
        return;
      }

      const sizeLimit = getFileSizeLimit(file);
      if (file.size > sizeLimit) {
        if (file.type.startsWith("image/") && file.size > 5 * 1024 * 1024) {
          setCompressionInfo(
            `Imagem grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Será comprimida automaticamente.`,
          );
        } else {
          setValue(name, null, { shouldValidate: true });
          setError(name, {
            type: "manual",
            message: `Arquivo muito grande. Máximo permitido: ${formatFileSize(sizeLimit)} para este tipo de arquivo.`,
          });
          return;
        }
      }

      clearErrors(name);
      setSelectedFile(file);
      setValue(name, file, { shouldValidate: true });
      onFileSelect?.(file);
    },
    [
      accept,
      clearErrors,
      getFileSizeLimit,
      isFileTypeAllowed,
      name,
      onFileSelect,
      setError,
      setValue,
    ],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFileChange(file);
      }
    },
    [disabled, handleFileChange],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      handleFileChange(file);
    },
    [handleFileChange],
  );

  const handleRemove = useCallback(() => {
    handleFileChange(null);
  }, [handleFileChange]);

  const acceptedTypesLabel = accept
    .split(",")
    .map((type) => type.trim().toUpperCase().replace(".", ""))
    .join(", ");

  return (
    <Field
      className={cn(fullWidth ? "w-full" : "max-w-xl", containerClassName)}
      data-invalid={Boolean(error)}
    >
      <FieldLabel htmlFor={name} aria-required={required}>
        {label}
      </FieldLabel>

      <div
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => {
          setIsDragOver(false);
        }}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-colors",
          isDragOver && !disabled && "border-primary bg-primary/5",
          !isDragOver && !error && "border-border bg-muted/20",
          error && "border-destructive/70 bg-destructive/5",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {!selectedFile ? (
          <label
            htmlFor={name}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center px-6 py-10 text-center",
              disabled && "cursor-not-allowed",
            )}
          >
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 text-sm text-muted-foreground">
              <span className="font-medium text-primary">Clique para fazer upload</span> ou arraste
              o arquivo aqui
            </p>
            <p className="text-xs text-muted-foreground/80">
              Formatos aceitos: {acceptedTypesLabel}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Máximo: PDF 10MB • Imagens 5MB • Word 10MB
            </p>
            <input
              id={name}
              name={name}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              disabled={disabled}
              className="sr-only"
            />
          </label>
        ) : (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  {selectedFile.type.startsWith("image/") && selectedFile.size > 5 * 1024 * 1024 ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle className="size-3" />
                      Será comprimido
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {!disabled ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleRemove}
                aria-label="Remover arquivo"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {compressionInfo && !error ? (
        <FieldDescription className="flex items-start gap-2 text-xs text-amber-600">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{compressionInfo}</span>
        </FieldDescription>
      ) : null}

      {error ? (
        <FieldError className="flex items-center gap-1 text-xs">
          <AlertCircle className="size-3" /> {error}
        </FieldError>
      ) : helperText ? (
        <FieldDescription className="text-xs">{helperText}</FieldDescription>
      ) : null}
    </Field>
  );
}

export default FluriFieldV2FileUpload;
