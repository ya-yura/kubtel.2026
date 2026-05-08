import type {
  CoverageArea,
  FaqItem,
  Promo,
  Service,
  Tariff,
  VerificationStatus
} from "@models/domain";

export type WorkflowStatus =
  | "draft"
  | "ready_for_review"
  | "commercial_approved"
  | "legal_approved"
  | "published"
  | "archived";

export type CmsProvider = "local" | "strapi";

export type CmsReadMode = "published" | "preview";

export type CmsResponsibleRole =
  | "commercial"
  | "operations"
  | "coverage"
  | "content"
  | "legal"
  | "design"
  | "developer";

export type CmsContentSource = {
  status: VerificationStatus;
  type: "kubtel_team" | "public_site" | "legacy_site" | "technical_audit" | "editorial_assumption";
  label: string;
  url: string | null;
  checkedAt: string | null;
  responsible: CmsResponsibleRole;
  note: string;
};

export type CmsProofPoint = {
  label: string;
  value: string;
  description: string | null;
  status: VerificationStatus;
  source: CmsContentSource;
};

export type CmsMoney = {
  amount: number | null;
  currency: "RUB";
  status: VerificationStatus;
};

export type BusinessServiceCategory =
  | "internet"
  | "telephony"
  | "cctv"
  | "wifi_auth"
  | "vps"
  | "vdi"
  | "colocation"
  | "datacenter_access"
  | "operators"
  | "government";

export type BusinessService = {
  title: string;
  slug: string;
  category: BusinessServiceCategory;
  summary: string;
  businessBenefit: string;
  proofPoints: CmsProofPoint[];
  ctaLabel: string;
  priority: "P0" | "P1" | "P2";
  relatedSegmentSlugs: string[];
  calculatorSlug: string | null;
  formVariantSlug: string | null;
  workflowStatus: WorkflowStatus;
  verificationStatus: VerificationStatus;
};

export type BusinessSegment = {
  title: string;
  slug: string;
  audience: string[];
  painPoints: string[];
  triggers: string[];
  primaryCta: string;
  relatedServiceSlugs: string[];
  formVariantSlug: string | null;
  workflowStatus: WorkflowStatus;
};

export type CalculatorOption = {
  title: string;
  slug: string;
  fieldKey: string;
  inputType: "select" | "number" | "checkbox" | "radio" | "slider";
  valueType: "string" | "number" | "boolean";
  unit: string | null;
  min: number | null;
  max: number | null;
  step: number | null;
  defaultValue: unknown;
  priceMonthly: CmsMoney;
  priceOneTime: CmsMoney;
  requiredConsultation: boolean;
  sortOrder: number;
  workflowStatus: WorkflowStatus;
};

export type BusinessCalculator = {
  title: string;
  slug: string;
  calculatorType: "internet" | "telephony" | "cctv" | "vps" | "vdi" | "colocation" | "wifi_auth";
  formulaVersion: string;
  disclaimer: string;
  requiredConsultation: boolean;
  pricingStatus: VerificationStatus;
  optionSlugs: string[];
  workflowStatus: WorkflowStatus;
};

export type LeadFormField = {
  key: string;
  label: string;
  type: "text" | "tel" | "email" | "select" | "textarea" | "number" | "checkbox" | "hidden";
  required: boolean;
  maxLength: number | null;
  options: string[];
};

export type LeadFormVariant = {
  title: string;
  slug: string;
  leadType: "b2c" | "b2b" | "datacenter_access" | "operator_partner";
  formKey: string;
  fields: LeadFormField[];
  requiredFields: string[];
  routingKey: string;
  crmPipeline: "b2c" | "b2b" | "operators" | "datacenter";
  consentDocumentSlug: string;
  workflowStatus: WorkflowStatus;
};

export type CmsContent = {
  tariffs: Tariff[];
  services: Service[];
  faqItems: FaqItem[];
  coverageAreas: CoverageArea[];
  promos: Promo[];
  businessServices: BusinessService[];
  businessSegments: BusinessSegment[];
  businessCalculators: BusinessCalculator[];
  calculatorOptions: CalculatorOption[];
  leadFormVariants: LeadFormVariant[];
};

export type CmsListOptions = {
  limit?: number;
};

export type CmsAdapter = {
  provider: CmsProvider;
  readMode: CmsReadMode;
  getTariffs(): Promise<Tariff[]>;
  getServices(): Promise<Service[]>;
  getFaqItems(options?: CmsListOptions): Promise<FaqItem[]>;
  getCoverageAreas(): Promise<CoverageArea[]>;
  getPromos(): Promise<Promo[]>;
  getBusinessServices(): Promise<BusinessService[]>;
  getBusinessSegments(): Promise<BusinessSegment[]>;
  getBusinessCalculators(): Promise<BusinessCalculator[]>;
  getCalculatorOptions(): Promise<CalculatorOption[]>;
  getLeadFormVariants(): Promise<LeadFormVariant[]>;
};

export type CmsAdapterConfig = {
  provider: CmsProvider;
  readMode: CmsReadMode;
  fallbackToLocal: boolean;
  cacheTtlSeconds: number;
  env: NodeJS.ProcessEnv;
  fetchImpl: typeof fetch;
};

export class CmsAdapterError extends Error {
  constructor(
    message: string,
    readonly provider: CmsProvider,
    readonly statusCode?: number
  ) {
    super(message);
    this.name = "CmsAdapterError";
  }
}
