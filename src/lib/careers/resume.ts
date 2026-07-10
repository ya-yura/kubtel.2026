import { randomUUID } from "node:crypto";
import path from "node:path";

export const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024;

const allowedResumeTypes = new Map([
  ["application/pdf", new Set([".pdf"])],
  ["application/msword", new Set([".doc"])],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", new Set([".docx"])],
  ["application/rtf", new Set([".rtf"])],
  ["text/rtf", new Set([".rtf"])],
  ["text/plain", new Set([".txt"])]
]);

export type CareerResumeAttachment = {
  originalName: string;
  safeName: string;
  mimeType: string;
  size: number;
  bytes: Uint8Array;
};

export class CareerResumeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CareerResumeError";
  }
}

export async function validateCareerResumeFile(
  value: FormDataEntryValue | null,
  applicationId: string
): Promise<CareerResumeAttachment | null> {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (value.size > MAX_RESUME_FILE_SIZE) {
    throw new CareerResumeError("Файл резюме должен быть не больше 5 МБ.");
  }

  const originalName = path.basename(value.name).normalize("NFC").slice(0, 180);
  const extension = path.extname(originalName).toLowerCase();
  const allowedExtensions = allowedResumeTypes.get(value.type.toLowerCase());

  if (!allowedExtensions || !allowedExtensions.has(extension)) {
    throw new CareerResumeError("Разрешены PDF, DOC, DOCX, RTF и TXT с корректным MIME-типом.");
  }

  const nonce = randomUUID().replace(/-/g, "").slice(0, 12);
  const safeName = `${applicationId}-${nonce}${extension}`;
  const bytes = new Uint8Array(await value.arrayBuffer());

  return {
    originalName,
    safeName,
    mimeType: value.type.toLowerCase(),
    size: value.size,
    bytes
  };
}
