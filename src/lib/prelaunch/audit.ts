import type {
  CoverageArea,
  FaqItem,
  Promo,
  Service,
  Tariff,
  VerificationStatus
} from "@models/domain";
import type { RouteMetadata } from "@config/routes";

export type PrelaunchIssueSeverity = "defect" | "external_blocker" | "watch";

export type PrelaunchIssueArea =
  | "forms"
  | "integrations"
  | "analytics"
  | "content"
  | "coverage"
  | "legal"
  | "seo";

export type PrelaunchIssue = {
  id: string;
  severity: PrelaunchIssueSeverity;
  area: PrelaunchIssueArea;
  title: string;
  detail: string;
  refs?: string[];
};

export type LeadFormPageContract = {
  path: string;
  isOnDemand: boolean;
  hasActionResult: boolean;
};

export type LegalReadiness = {
  consentTextConfirmed: boolean;
  privacyPolicyPath: string | null;
  operatorDetailsConfirmed: boolean;
};

export type PrelaunchEnvironment = Partial<
  Record<
    "CRM_WEBHOOK_URL" | "TELEGRAM_BOT_TOKEN" | "TELEGRAM_SALES_CHAT_ID" | "ANALYTICS_WEBHOOK_URL",
    string | undefined
  >
>;

export type PrelaunchAuditInput = {
  tariffs: Tariff[];
  services: Service[];
  faqItems: FaqItem[];
  coverageAreas: CoverageArea[];
  promos: Promo[];
  routes: RouteMetadata[];
  formPages: LeadFormPageContract[];
  env?: PrelaunchEnvironment;
  legal: LegalReadiness;
};

export type PrelaunchAuditReport = {
  issues: PrelaunchIssue[];
  summary: {
    defects: number;
    externalBlockers: number;
    watches: number;
    technicalReady: boolean;
    launchReady: boolean;
  };
};

export function runPrelaunchAudit(input: PrelaunchAuditInput): PrelaunchAuditReport {
  const issues: PrelaunchIssue[] = [];

  auditLeadForms(input.formPages, issues);
  auditRoutes(input.routes, issues);
  auditContentIntegrity(input, issues);
  auditContentTruth(input, issues);
  auditIntegrations(input.env ?? {}, issues);
  auditLegalReadiness(input.legal, issues);

  const defects = countBySeverity(issues, "defect");
  const externalBlockers = countBySeverity(issues, "external_blocker");
  const watches = countBySeverity(issues, "watch");

  return {
    issues,
    summary: {
      defects,
      externalBlockers,
      watches,
      technicalReady: defects === 0,
      launchReady: defects === 0 && externalBlockers === 0
    }
  };
}

function auditLeadForms(formPages: LeadFormPageContract[], issues: PrelaunchIssue[]): void {
  if (formPages.length === 0) {
    issues.push({
      id: "forms-missing",
      severity: "defect",
      area: "forms",
      title: "Нет страниц с формой заявки",
      detail: "Предрелизный сценарий подключения не может быть проверен без страницы с формой."
    });

    return;
  }

  const staticFormPages = formPages.filter((page) => !page.isOnDemand);

  if (staticFormPages.length > 0) {
    issues.push({
      id: "forms-static-pages",
      severity: "defect",
      area: "forms",
      title: "Форма заявки размещена на статической странице",
      detail:
        "Страница с Astro Action должна рендериться на сервере, чтобы вернуть success/error state после отправки.",
      refs: staticFormPages.map((page) => page.path)
    });
  }

  const pagesWithoutResult = formPages.filter((page) => !page.hasActionResult);

  if (pagesWithoutResult.length > 0) {
    issues.push({
      id: "forms-action-result-missing",
      severity: "defect",
      area: "forms",
      title: "Страница с формой не читает результат action",
      detail:
        "После отправки заявки пользователь должен увидеть состояние успеха или ошибки на той же странице.",
      refs: pagesWithoutResult.map((page) => page.path)
    });
  }
}

function auditRoutes(routes: RouteMetadata[], issues: PrelaunchIssue[]): void {
  const duplicatePaths = findDuplicates(routes.map((route) => route.path));
  const incompleteRoutes = routes.filter(
    (route) => route.title.trim().length === 0 || route.description.trim().length === 0
  );

  if (duplicatePaths.length > 0) {
    issues.push({
      id: "routes-duplicate-paths",
      severity: "defect",
      area: "seo",
      title: "Повторяются пути в карте маршрутов",
      detail: "Sitemap и навигационный SEO-контракт должны использовать уникальные пути.",
      refs: duplicatePaths
    });
  }

  if (incompleteRoutes.length > 0) {
    issues.push({
      id: "routes-metadata-incomplete",
      severity: "defect",
      area: "seo",
      title: "У страницы не заполнены title или description",
      detail: "Ключевые страницы должны иметь уникальные метаданные перед предрелизной проверкой.",
      refs: incompleteRoutes.map((route) => route.path)
    });
  }
}

function auditContentIntegrity(input: PrelaunchAuditInput, issues: PrelaunchIssue[]): void {
  const tariffSlugs = new Set(input.tariffs.map((tariff) => tariff.slug));
  const serviceSlugs = new Set(input.services.map((service) => service.slug));

  if (input.tariffs.length === 0) {
    issues.push({
      id: "tariffs-empty",
      severity: "defect",
      area: "content",
      title: "Нет тарифов",
      detail: "Тарифная витрина и форма выбора тарифа не могут работать без тарифов."
    });
  }

  const duplicateTariffs = findDuplicates(input.tariffs.map((tariff) => tariff.slug));

  if (duplicateTariffs.length > 0) {
    issues.push({
      id: "tariffs-duplicate-slugs",
      severity: "defect",
      area: "content",
      title: "Повторяются slug тарифов",
      detail: "Slug тарифа используется в форме, ссылках и заявке, поэтому должен быть уникальным.",
      refs: duplicateTariffs
    });
  }

  const invalidTariffs = input.tariffs.filter(
    (tariff) => tariff.priceMonth <= 0 || tariff.speedDownload <= 0
  );

  if (invalidTariffs.length > 0) {
    issues.push({
      id: "tariffs-invalid-values",
      severity: "defect",
      area: "content",
      title: "У тарифа некорректная цена или скорость",
      detail: "Предрелизная витрина не должна показывать нулевую цену или скорость.",
      refs: invalidTariffs.map((tariff) => tariff.slug)
    });
  }

  if (input.tariffs.length > 0 && !input.tariffs.some((tariff) => tariff.isFeatured)) {
    issues.push({
      id: "tariffs-featured-missing",
      severity: "defect",
      area: "content",
      title: "Нет рекомендуемого тарифа",
      detail: "Форма использует рекомендуемый тариф как безопасный выбор по умолчанию."
    });
  }

  const brokenReferences = [
    ...input.services.flatMap((service) =>
      service.relatedTariffs
        .filter((slug) => !tariffSlugs.has(slug))
        .map((slug) => `services/${service.slug} -> tariffs/${slug}`)
    ),
    ...input.promos.flatMap((promo) =>
      promo.relatedTariffs
        .filter((slug) => !tariffSlugs.has(slug))
        .map((slug) => `promos/${promo.slug} -> tariffs/${slug}`)
    ),
    ...input.coverageAreas.flatMap((area) =>
      area.availableTariffs
        .filter((slug) => !tariffSlugs.has(slug))
        .map((slug) => `coverage/${area.slug} -> tariffs/${slug}`)
    ),
    ...input.faqItems.flatMap((faq) =>
      faq.relatedServices
        .filter((slug) => !serviceSlugs.has(slug))
        .map((slug) => `faq/${faq.question} -> services/${slug}`)
    )
  ];

  if (brokenReferences.length > 0) {
    issues.push({
      id: "content-broken-references",
      severity: "defect",
      area: "content",
      title: "Есть битые связи в локальном контенте",
      detail:
        "Перед запуском карточки, FAQ, акции и покрытие должны ссылаться только на существующие сущности.",
      refs: brokenReferences
    });
  }
}

function auditContentTruth(input: PrelaunchAuditInput, issues: PrelaunchIssue[]): void {
  const unconfirmedTariffs = input.tariffs.filter((tariff) =>
    hasAnyUnconfirmedStatus([
      tariff.proof.status,
      tariff.contentSource.status,
      tariff.commercialReview.status,
      tariff.commercialReview.priceStatus,
      tariff.commercialReview.speedStatus,
      tariff.commercialReview.optionsStatus,
      tariff.commercialReview.connectionStatus
    ])
  );

  if (unconfirmedTariffs.length > 0) {
    issues.push({
      id: "tariffs-unconfirmed",
      severity: "external_blocker",
      area: "content",
      title: "Тарифы, цены или условия не подтверждены",
      detail:
        "Коммерческая матрица Kubtel должна подтвердить цены, скорости, опции и условия подключения.",
      refs: unconfirmedTariffs.map((tariff) => tariff.slug)
    });
  }

  const unconfirmedServices = input.services.filter((service) =>
    hasAnyUnconfirmedStatus([
      service.contentSource.status,
      ...service.facts.map((fact) => fact.status)
    ])
  );

  if (unconfirmedServices.length > 0) {
    issues.push({
      id: "services-unconfirmed",
      severity: "external_blocker",
      area: "content",
      title: "Услуги содержат неподтвержденные факты",
      detail:
        "Описания услуг, зоны работы, SLA и состав ТВ-пакетов требуют подтверждения командой Kubtel.",
      refs: unconfirmedServices.map((service) => service.slug)
    });
  }

  const unconfirmedFaq = input.faqItems.filter((faq) =>
    hasAnyUnconfirmedStatus([faq.proof.status, faq.contentSource.status])
  );

  if (unconfirmedFaq.length > 0) {
    issues.push({
      id: "faq-unconfirmed",
      severity: "external_blocker",
      area: "content",
      title: "FAQ содержит ответы без подтвержденного основания",
      detail:
        "Ответы про цены, SLA, частный сектор и поддержку нужно сверить с операционной и коммерческой командами.",
      refs: unconfirmedFaq.map((faq) => faq.question)
    });
  }

  const unconfirmedPromos = input.promos.filter((promo) =>
    hasAnyUnconfirmedStatus([promo.proof.status, promo.contentSource.status])
  );

  if (unconfirmedPromos.length > 0) {
    issues.push({
      id: "promos-unconfirmed",
      severity: "external_blocker",
      area: "content",
      title: "Промо-механики не подтверждены",
      detail:
        "Акции нельзя публиковать без финальных условий, ограничений, сроков и юридической формулировки.",
      refs: unconfirmedPromos.map((promo) => promo.slug)
    });
  }

  const unconfirmedCoverage = input.coverageAreas.filter(
    (area) =>
      area.connectionStatus === "draft" ||
      area.streets.length === 0 ||
      hasAnyUnconfirmedStatus([area.contentSource.status])
  );

  if (unconfirmedCoverage.length > 0) {
    issues.push({
      id: "coverage-unconfirmed",
      severity: "external_blocker",
      area: "coverage",
      title: "Адресная база покрытия не подтверждена",
      detail:
        "Для запуска нужна фактическая зона подключения: районы, улицы, дома, ЖК и частный сектор.",
      refs: unconfirmedCoverage.map((area) => area.slug)
    });
  }
}

function auditIntegrations(env: PrelaunchEnvironment, issues: PrelaunchIssue[]): void {
  const missingLeadDelivery = ["CRM_WEBHOOK_URL", "TELEGRAM_BOT_TOKEN", "TELEGRAM_SALES_CHAT_ID"]
    .filter((key) => !env[key as keyof PrelaunchEnvironment])
    .map((key) => key);

  if (missingLeadDelivery.length > 0) {
    issues.push({
      id: "lead-integrations-env-missing",
      severity: "external_blocker",
      area: "integrations",
      title: "Боевые CRM/Telegram переменные не настроены",
      detail:
        "Технический outbox подстраховывает заявку, но чек 'все заявки доходят' требует production webhook и Telegram-чат.",
      refs: missingLeadDelivery
    });
  }

  if (!env.ANALYTICS_WEBHOOK_URL) {
    issues.push({
      id: "analytics-env-missing",
      severity: "external_blocker",
      area: "analytics",
      title: "Боевой analytics webhook не настроен",
      detail:
        "События заявки реализованы на сервере, но production-аналитика требует внешний endpoint."
    });
  }
}

function auditLegalReadiness(legal: LegalReadiness, issues: PrelaunchIssue[]): void {
  const refs: string[] = [];

  if (!legal.consentTextConfirmed) {
    refs.push("consent");
  }

  if (!legal.privacyPolicyPath) {
    refs.push("privacy-policy");
  }

  if (!legal.operatorDetailsConfirmed) {
    refs.push("operator-details");
  }

  if (refs.length > 0) {
    issues.push({
      id: "legal-readiness-missing",
      severity: "external_blocker",
      area: "legal",
      title: "Юридические тексты не готовы к публикации",
      detail:
        "Финальное согласие на обработку персональных данных, политика и реквизиты оператора должны быть согласованы до запуска.",
      refs
    });
  }
}

function hasAnyUnconfirmedStatus(statuses: VerificationStatus[]): boolean {
  return statuses.some((status) => status !== "confirmed");
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  });

  return [...duplicates];
}

function countBySeverity(issues: PrelaunchIssue[], severity: PrelaunchIssueSeverity): number {
  return issues.filter((issue) => issue.severity === severity).length;
}
