export type ConfiguratorServiceId = "internet" | "tv" | "cctv";

export type ConfiguratorFieldType = "select" | "radio" | "checkbox" | "counter";

export type ConfiguratorChoice = {
  id: string;
  label: string;
  description?: string;
  monthlyPrice: number;
  oneTimePrice: number;
  default?: boolean;
};

export type ConfiguratorField = {
  id: string;
  label: string;
  type: ConfiguratorFieldType;
  required?: boolean;
  multiple?: boolean;
  help?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number | boolean | string[];
  monthlyPrice?: number;
  oneTimePrice?: number;
  choices?: ConfiguratorChoice[];
};

export type ConfiguratorService = {
  id: ConfiguratorServiceId;
  tabLabel: string;
  title: string;
  description: string;
  eyebrow: string;
  fields: ConfiguratorField[];
  notes: string[];
};

export type ChannelGroup = {
  id: string;
  title: string;
  channels: string[];
};

export type AppLink = {
  label: string;
  platform: string;
  href: string;
  external?: boolean;
};

export type OfferLink = {
  label: string;
  href: string;
};

export type ConfiguratorCatalog = {
  title: string;
  slug: string;
  updatedAt: string;
  sourceNote: string;
  services: ConfiguratorService[];
  tv: {
    channelCount: number;
    channelGroups: ChannelGroup[];
    appLinks: AppLink[];
    offers: OfferLink[];
    setupSteps: string[];
    supportedDevices: string[];
  };
  cctv: {
    appLinks: AppLink[];
    offers: OfferLink[];
    benefits: string[];
    setupSteps: string[];
    cameraModels: Array<{
      id: string;
      title: string;
      price: number;
      specs: string[];
    }>;
  };
  internet: {
    offers: OfferLink[];
    benefits: string[];
    connectionSteps: string[];
  };
};

export type ConfiguratorFieldValue = string | number | boolean | string[];

export type ConfiguratorPriceLine = {
  fieldId: string;
  label: string;
  value: ConfiguratorFieldValue;
  valueLabel: string;
  monthlyPrice: number;
  oneTimePrice: number;
};

export type ConfiguratorPrice = {
  service: ConfiguratorService;
  lines: ConfiguratorPriceLine[];
  monthlyTotal: number;
  oneTimeTotal: number;
};
