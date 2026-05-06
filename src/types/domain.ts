export type VerificationStatus = "confirmed" | "needs_verification" | "draft";

export type ProofPoint = {
  label: string;
  value: string;
  status: VerificationStatus;
};

export type ContentSourceType =
  | "kubtel_team"
  | "public_site"
  | "legacy_site"
  | "technical_audit"
  | "editorial_assumption";

export type ContentSource = {
  status: VerificationStatus;
  type: ContentSourceType;
  label: string;
  checkedAt: string | null;
  responsible: string;
  note: string;
};

export type CommercialReview = {
  status: VerificationStatus;
  priceStatus: VerificationStatus;
  speedStatus: VerificationStatus;
  optionsStatus: VerificationStatus;
  connectionStatus: VerificationStatus;
  requiredEvidence: string[];
  note: string;
};

export type TariffOption = "routerRent" | "staticIp" | "tvPack";

export type Tariff = {
  title: string;
  slug: string;
  audience: string[];
  speedDownload: number;
  speedUpload: number | null;
  priceMonth: number;
  promoPrice: number | null;
  promoPeriod: string | null;
  benefitDescription: string;
  bestFor: string[];
  includedServices: string[];
  availableOptions: TariffOption[];
  connectionPrice: number | null;
  routerRentPrice: number | null;
  staticIpPrice: number | null;
  isFeatured: boolean;
  sortOrder: number;
  proof: ProofPoint;
  contentSource: ContentSource;
  commercialReview: CommercialReview;
};

export type PriceBreakdown = {
  base: number;
  options: Array<{
    id: TariffOption;
    label: string;
    amount: number;
  }>;
  total: number;
};
