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

export type ResponsibleRole = "commercial" | "operations" | "coverage" | "content";

export type ContentSource = {
  status: VerificationStatus;
  type: ContentSourceType;
  label: string;
  checkedAt: string | null;
  responsible: ResponsibleRole;
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

export const tariffOptions = ["routerRent", "staticIp", "tvPack"] as const;

export type TariffOption = (typeof tariffOptions)[number];

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

export type Service = {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  facts: ProofPoint[];
  benefits: string[];
  relatedTariffs: string[];
  contentSource: ContentSource;
};

export type FaqItem = {
  question: string;
  answer: string;
  category: string;
  priority: number;
  relatedServices: string[];
  proof: ProofPoint;
  contentSource: ContentSource;
};

export type CoverageArea = {
  title: string;
  slug: string;
  type: "city" | "district" | "street" | "housing_complex" | "private_sector";
  city: string;
  district: string | null;
  streets: string[];
  houses: string[];
  connectionStatus: "available" | "manual_check" | "unavailable" | "draft";
  availableTariffs: string[];
  contactHint: string;
  contentSource: ContentSource;
};

export type Promo = {
  title: string;
  slug: string;
  startDate: string;
  endDate: string | null;
  description: string;
  conditions: string[];
  relatedTariffs: string[];
  targetArea: string | null;
  ctaLabel: string;
  proof: ProofPoint;
  contentSource: ContentSource;
};
