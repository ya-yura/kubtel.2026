import type { VerificationStatus } from "@models/domain";

const verificationLabels: Record<VerificationStatus, string> = {
  confirmed: "Подтверждено",
  needs_verification: "Нужна сверка",
  draft: "Черновик"
};

export function getVerificationLabel(status: VerificationStatus) {
  return verificationLabels[status];
}
