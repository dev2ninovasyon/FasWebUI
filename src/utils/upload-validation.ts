export interface UploadValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const ZIP_MIME_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-zip",
  "application/octet-stream",
];
export const XML_MIME_TYPES = ["text/xml", "application/xml"];
export const ALLOWED_MIME_TYPES = [...ZIP_MIME_TYPES, ...XML_MIME_TYPES];

export const MAX_FILE_SIZE = 3_000_000_000; // 3GB
export const MAX_ZIP_FILE_SIZE = 3_000_000_000; // 3GB
export const MAX_SINGLE_FILE_SIZE = 500_000_000; // 500MB
export const MAX_FILES_PER_UPLOAD = 500;
export const MIN_FILES_PER_UPLOAD = 1;

export function validateFilesForUpload(
  files: File[],
  options?: {
    maxSize?: number;
    maxFiles?: number;
    allowedTypes?: string[];
    requireAtLeastOne?: boolean;
  }
): UploadValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE;
  const maxFiles = options?.maxFiles ?? MAX_FILES_PER_UPLOAD;
  const allowedTypes = options?.allowedTypes ?? ALLOWED_MIME_TYPES;
  const requireAtLeastOne = options?.requireAtLeastOne ?? true;

  if (!files || files.length === 0) {
    if (requireAtLeastOne) {
      errors.push("En az bir dosya seçmelisiniz.");
    }
    return { valid: errors.length === 0, errors, warnings };
  }

  if (files.length > maxFiles) {
    errors.push(`En fazla ${maxFiles} dosya yüklenebilir. Seçilen: ${files.length}`);
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > maxSize) {
    const mb = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
    errors.push(`Toplam dosya boyutu limiti aşıldı (${mb} GB). Maksimum: ${(maxSize / (1024 * 1024 * 1024)).toFixed(1)} GB`);
  }

  for (const file of files) {
    if (!file.name || file.size === 0) {
      warnings.push(`Geçersiz dosya atlandı: ${file.name || "isimsiz"}`);
      continue;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    const isValidExt = ext === "zip" || ext === "xml";
    const isValidMime = allowedTypes.some((t) => file.type.includes(t));

    if (!isValidExt && !isValidMime) {
      errors.push(`"${file.name}" desteklenmeyen dosya türü. Yalnızca ZIP ve XML dosyalarına izin verilir.`);
    }
  }

  const zipFiles = files.filter((f) => f.name.toLowerCase().endsWith(".zip"));
  for (const zip of zipFiles) {
    if (zip.size > MAX_ZIP_FILE_SIZE) {
      const gb = (zip.size / (1024 * 1024 * 1024)).toFixed(2);
      errors.push(`"${zip.name}" çok büyük (${gb} GB). ZIP dosyaları en fazla ${(MAX_ZIP_FILE_SIZE / (1024 * 1024 * 1024)).toFixed(1)} GB olabilir.`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export function getTotalFileSize(files: File[]): string {
  return formatFileSize(files.reduce((sum, f) => sum + f.size, 0));
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds} sn`;
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  return `${minutes} dk ${remainingSecs} sn`;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").trim();
}
