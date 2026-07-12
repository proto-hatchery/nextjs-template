/**
 * File upload validation for patient documents
 * LGPD/Healthcare context: Extra strict for PHI protection
 */

type AllowedFileType = {
  mimeType: string;
  extensions: readonly string[];
  maxSize: number;
};

// Allowed file types for patient documents
const PATIENT_DOCUMENT_TYPES: readonly AllowedFileType[] = [
  // PDF documents
  {
    mimeType: "application/pdf",
    extensions: [".pdf"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  // Images (for medical images, scans)
  {
    mimeType: "image/jpeg",
    extensions: [".jpg", ".jpeg"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  {
    mimeType: "image/png",
    extensions: [".png"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  // Text documents
  {
    mimeType: "text/plain",
    extensions: [".txt"],
    maxSize: 1 * 1024 * 1024, // 1MB
  },
  // OpenDocument formats
  {
    mimeType: "application/vnd.oasis.opendocument.text",
    extensions: [".odt"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  // Microsoft Word documents
  {
    mimeType: "application/msword",
    extensions: [".doc"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extensions: [".docx"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
] as const;

const TEST_RESULT_TYPES: readonly AllowedFileType[] = [
  {
    mimeType: "application/pdf",
    extensions: [".pdf"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    mimeType: "image/jpeg",
    extensions: [".jpg", ".jpeg"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  {
    mimeType: "image/png",
    extensions: [".png"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  {
    mimeType: "application/msword",
    extensions: [".doc"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extensions: [".docx"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    mimeType: "text/plain",
    extensions: [".txt"],
    maxSize: 1 * 1024 * 1024, // 1MB
  },
  {
    mimeType: "text/csv",
    extensions: [".csv"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    mimeType: "application/csv",
    extensions: [".csv"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
] as const;

export const ALLOWED_DOCUMENT_TYPES = PATIENT_DOCUMENT_TYPES;

export type FileValidationPolicy = "patient_document" | "test_result";

const FILE_VALIDATION_POLICIES: Record<FileValidationPolicy, readonly AllowedFileType[]> = {
  patient_document: PATIENT_DOCUMENT_TYPES,
  test_result: TEST_RESULT_TYPES,
};

// Dangerous file types to explicitly block
export const BLOCKED_EXTENSIONS = [
  ".exe",
  ".dll",
  ".bat",
  ".cmd",
  ".sh",
  ".php",
  ".jsp",
  ".asp",
  ".aspx",
  ".html",
  ".htm",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".xml",
  ".zip",
  ".tar",
  ".gz",
  ".rar",
  ".7z", // Archives (could contain malware)
  ".docm",
  ".xlsm",
  ".pptm", // Office macros
  ".scr",
  ".msi",
  ".com",
  ".vbs",
  ".ps1", // Windows executables
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName: string;
  mimeType: string;
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  policy: FileValidationPolicy = "patient_document",
): FileValidationResult {
  const allowedTypes = FILE_VALIDATION_POLICIES[policy];

  // Check file size first (fastest check)
  const typeConfig = allowedTypes.find((t) => t.mimeType === file.type);

  const maxSize = typeConfig?.maxSize || 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`,
      sanitizedName: sanitizeFilename(file.name),
      mimeType: file.type,
    };
  }

  // Sanitize filename
  const sanitizedName = sanitizeFilename(file.name);
  const extension = getFileExtension(sanitizedName).toLowerCase();

  // Check for blocked extensions
  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type not allowed: ${extension}`,
      sanitizedName,
      mimeType: file.type,
    };
  }

  // Validate MIME type
  if (!typeConfig) {
    return {
      valid: false,
      error: `File type not allowed: ${file.type || "unknown"}`,
      sanitizedName,
      mimeType: file.type,
    };
  }

  // Verify extension matches MIME type
  if (!(typeConfig.extensions as readonly string[]).includes(extension as string)) {
    return {
      valid: false,
      error: `File extension ${extension} does not match type ${file.type}`,
      sanitizedName,
      mimeType: file.type,
    };
  }

  return {
    valid: true,
    sanitizedName,
    mimeType: file.type,
  };
}

/**
 * Sanitize filename to prevent path traversal and injection
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const basename = filename.replace(/^.*[\\/]/, "");

  // Remove null bytes
  // eslint-disable-next-line no-control-regex
  const noNulls = basename.replace(/\x00/g, "");

  // Remove control characters
  // eslint-disable-next-line no-control-regex
  const noControl = noNulls.replace(/[\x00-\x1f\x7f]/g, "");

  // Limit length
  const maxLength = 255;
  const truncated = noControl.slice(0, maxLength);

  // Ensure it doesn't start with dot (hidden files)
  const noHidden = truncated.replace(/^\.+/, "");

  // If empty after sanitization, generate name
  if (!noHidden) {
    return `document-${Date.now()}`;
  }

  return noHidden;
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? "" : filename.slice(lastDot);
}

/**
 * Validate file content (magic numbers) - additional security layer
 */
export async function validateFileContent(
  file: File,
  expectedType: string,
): Promise<{ valid: boolean; error?: string }> {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Magic numbers for common formats
  const signatures: Record<string, number[]> = {
    "application/pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
    "image/jpeg": [0xff, 0xd8, 0xff],
    "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  };

  const signature = (signatures as Record<string, number[]>)[expectedType];
  if (!signature) {
    return { valid: true }; // Unknown type, skip content validation
  }

  const matches = signature.every((byte, i) => bytes[i] === byte);

  if (!matches) {
    return {
      valid: false,
      error: "File content does not match expected type",
    };
  }

  return { valid: true };
}
