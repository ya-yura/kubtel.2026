import { describe, expect, it } from "vitest";
import {
  CareerResumeError,
  MAX_RESUME_FILE_SIZE,
  validateCareerResumeFile
} from "@lib/careers/resume";

describe("career resume upload", () => {
  it("accepts an allowlisted file and creates a server-safe name", async () => {
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "../Резюме.pdf", {
      type: "application/pdf"
    });

    const attachment = await validateCareerResumeFile(file, "KBT-HR-TEST");

    expect(attachment?.originalName).toBe("Резюме.pdf");
    expect(attachment?.safeName).toMatch(/^KBT-HR-TEST-[a-f0-9]{12}\.pdf$/);
    expect(attachment?.mimeType).toBe("application/pdf");
  });

  it("rejects executable formats even when the filename is disguised", async () => {
    const file = new File(["payload"], "resume.pdf.exe", {
      type: "application/octet-stream"
    });

    await expect(validateCareerResumeFile(file, "KBT-HR-TEST")).rejects.toBeInstanceOf(
      CareerResumeError
    );
  });

  it("rejects files above the size limit", async () => {
    const file = new File([new Uint8Array(MAX_RESUME_FILE_SIZE + 1)], "resume.pdf", {
      type: "application/pdf"
    });

    await expect(validateCareerResumeFile(file, "KBT-HR-TEST")).rejects.toThrow("5 МБ");
  });
});
