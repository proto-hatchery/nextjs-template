"use client";

import { Button } from "@workspace/ui/components/button";
import { FileText, Upload, X, AlertCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@workspace/ui/lib/utils";

interface FileUploadFieldHookFormProps {
  name: string;
  label: string;
  accept?: string;
  maxSize?: number;
  helpText?: string;
  required?: boolean;
  onFileSelect?: (file: File | null) => void;
  disabled?: boolean;
}

// Limites de tamanho por tipo MIME

// Limites por tipo de arquivo
const SIZE_LIMITS: Record<string, number> = {
  "application/pdf": 10 * 1024 * 1024, // 10MB
  "image/jpeg": 5 * 1024 * 1024, // 5MB
  "image/png": 5 * 1024 * 1024, // 5MB
  "application/msword": 10 * 1024 * 1024, // 10MB
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 10 * 1024 * 1024, // 10MB
  "text/plain": 1 * 1024 * 1024, // 1MB
  "application/vnd.oasis.opendocument.text": 10 * 1024 * 1024, // 10MB
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
};

export function FileUploadFieldHookForm({
  name,
  label,
  accept = "application/pdf",
  maxSize = 5 * 1024 * 1024,
  helpText,
  required = false,
  onFileSelect,
  disabled = false,
}: FileUploadFieldHookFormProps) {
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
    return accept.split(",").map((t) => t.trim().toLowerCase());
  }, [accept]);

  const isFileTypeAllowed = useCallback(
    (file: File): boolean => {
      const acceptedTypes = getAcceptedMimeTypes();
      if (acceptedTypes.length === 0) return true;

      // Verifica MIME type
      if (acceptedTypes.includes(file.type.toLowerCase())) return true;

      // Verifica extensão do arquivo
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
      // Retorna o limite específico para o tipo ou o limite padrão
      return SIZE_LIMITS[file.type] || maxSize;
    },
    [maxSize],
  );

  const handleFileChange = useCallback(
    (file: File | null) => {
      setCompressionInfo(null);

      if (!file) {
        setSelectedFile(null);
        setValue(name, null);
        onFileSelect?.(null);
        return;
      }

      // Valida tipo de arquivo
      if (!isFileTypeAllowed(file)) {
        setValue(name, null);
        setError(name, {
          type: "manual",
          message: `Tipo de arquivo não permitido. Aceitos: ${accept}`,
        });
        return;
      }

      // Valida tamanho específico por tipo
      const sizeLimit = getFileSizeLimit(file);
      if (file.size > sizeLimit) {
        // Se for imagem, informa que será comprimida
        if (file.type.startsWith("image/") && file.size > 5 * 1024 * 1024) {
          setCompressionInfo(
            `Imagem grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Será comprimida automaticamente.`,
          );
          // Não bloqueia, deixa passar para compressão posterior
        } else {
          setValue(name, null);
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
      name,
      accept,
      isFileTypeAllowed,
      getFileSizeLimit,
      setValue,
      setError,
      clearErrors,
      onFileSelect,
    ],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileChange(file);
      }
    },
    [disabled, handleFileChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleFileChange(file);
    },
    [handleFileChange],
  );

  const handleRemove = useCallback(() => {
    handleFileChange(null);
  }, [handleFileChange]);

  const getAcceptedTypesLabel = () => {
    const types = accept.split(",").map((t) => t.trim().toUpperCase().replace(".", ""));
    return types.join(", ");
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* biome-ignore lint/a11y/noStaticElementInteractions: Drag-and-drop zone has accessible label inside */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          isDragOver && !disabled && "border-brand-primary bg-brand-primary/5",
          !isDragOver && !error && "border-gray-300",
          error && "border-red-500",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {!selectedFile ? (
          <label
            htmlFor={name}
            className={cn(
              "flex flex-col items-center justify-center px-6 py-10 cursor-pointer",
              disabled && "cursor-not-allowed",
            )}
          >
            <Upload className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium text-brand-primary">Clique para fazer upload</span> ou
              arraste o arquivo aqui
            </p>
            <p className="text-xs text-gray-500 text-center">
              Formatos aceitos: {getAcceptedTypesLabel()}
            </p>
            <p className="text-xs text-gray-400 mt-1">Máximo: PDF 10MB • Imagens 5MB • Word 10MB</p>
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
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-brand-primary" />
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  {selectedFile.type.startsWith("image/") &&
                    selectedFile.size > 5 * 1024 * 1024 && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="size-3" />
                        Será comprimido
                      </span>
                    )}
                </div>
              </div>
            </div>
            {!disabled && (
              <Button
                type="button"
                onClick={handleRemove}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                aria-label="Remover arquivo"
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Info sobre compressão */}
      {compressionInfo && !error && (
        <div className="flex items-start gap-2 text-xs text-amber-600">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{compressionInfo}</span>
        </div>
      )}

      {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="size-3" /> {error}
        </p>
      )}
    </div>
  );
}
