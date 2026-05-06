export type VerificationStatus = "confirmed" | "needs_verification" | "draft";

export type ProofPoint = {
  label: string;
  value: string;
  status: VerificationStatus;
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
