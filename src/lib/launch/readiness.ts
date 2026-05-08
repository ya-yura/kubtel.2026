import type { PrelaunchAuditReport } from "@lib/prelaunch/audit";

export type LaunchIssueSeverity = "blocker" | "watch";

export type LaunchIssueArea =
  | "prelaunch"
  | "production"
  | "forms"
  | "monitoring"
  | "analytics"
  | "sales"
  | "dependencies";

export type LaunchIssue = {
  id: string;
  severity: LaunchIssueSeverity;
  area: LaunchIssueArea;
  title: string;
  detail: string;
  refs?: string[];
};

export type ProductionVerification = {
  origin: string;
  expectedOrigin: string;
  keyRoutesRespond: boolean;
  healthEndpointResponds: boolean;
  dnsVerified: boolean;
  sslVerified: boolean;
  redirectsVerified: boolean;
  productionFormsVerified: boolean;
};

export type PostreleaseControl = {
  errorMonitoringConfigured: boolean;
  speedMonitoringConfigured: boolean;
  analyticsReceivesConversions: boolean;
  conversionBaselineDocumented: boolean;
  salesFeedbackLoopDocumented: boolean;
};

export type DependencyVerification = {
  productionAuditClean: boolean;
};

export type LaunchReadinessInput = {
  prelaunch: Pick<PrelaunchAuditReport, "summary">;
  production: ProductionVerification;
  postrelease: PostreleaseControl;
  dependencies: DependencyVerification;
};

export type LaunchReadinessReport = {
  issues: LaunchIssue[];
  summary: {
    blockers: number;
    watches: number;
    technicalReleaseReady: boolean;
    productionLaunchReady: boolean;
    postreleaseControlReady: boolean;
  };
};

export function runLaunchReadinessAudit(input: LaunchReadinessInput): LaunchReadinessReport {
  const issues: LaunchIssue[] = [];

  auditPrelaunch(input.prelaunch.summary, issues);
  auditProduction(input.production, issues);
  auditDependencies(input.dependencies, issues);
  auditPostreleaseControl(input.postrelease, issues);

  const blockers = countBySeverity(issues, "blocker");
  const watches = countBySeverity(issues, "watch");
  const productionBlockers = issues.filter(
    (issue) =>
      issue.severity === "blocker" &&
      ["prelaunch", "production", "forms", "dependencies"].includes(issue.area)
  );
  const postreleaseBlockers = issues.filter(
    (issue) =>
      issue.severity === "blocker" && ["monitoring", "analytics", "sales"].includes(issue.area)
  );

  return {
    issues,
    summary: {
      blockers,
      watches,
      technicalReleaseReady: productionBlockers.length === 0,
      productionLaunchReady: blockers === 0,
      postreleaseControlReady: postreleaseBlockers.length === 0
    }
  };
}

function auditPrelaunch(summary: PrelaunchAuditReport["summary"], issues: LaunchIssue[]): void {
  if (summary.defects > 0 || !summary.technicalReady) {
    issues.push({
      id: "prelaunch-defects-open",
      severity: "blocker",
      area: "prelaunch",
      title: "Предрелизные технические дефекты не закрыты",
      detail: "Этап запуска нельзя начинать, пока prelaunch-аудит показывает технические дефекты."
    });
  }

  if (summary.externalBlockers > 0 || !summary.launchReady) {
    issues.push({
      id: "prelaunch-external-blockers-open",
      severity: "blocker",
      area: "prelaunch",
      title: "Внешние launch-блокеры не закрыты",
      detail: "Нужны подтвержденные тарифы, покрытие, юридические тексты и production-интеграции."
    });
  }
}

function auditProduction(production: ProductionVerification, issues: LaunchIssue[]): void {
  const isExpectedHttpsProduction =
    production.expectedOrigin.startsWith("https://") &&
    !production.expectedOrigin.includes("localhost") &&
    !production.expectedOrigin.includes("127.0.0.1");

  if (production.origin !== production.expectedOrigin) {
    issues.push({
      id: "production-origin-mismatch",
      severity: "blocker",
      area: "production",
      title: "Production origin не совпадает с ожидаемым",
      detail: "Canonical, sitemap, robots и analytics должны использовать один production origin.",
      refs: [production.origin, production.expectedOrigin]
    });
  }

  if (!isExpectedHttpsProduction) {
    issues.push({
      id: "production-origin-not-https",
      severity: "blocker",
      area: "production",
      title: "Production origin не похож на боевой HTTPS-домен",
      detail:
        "Для релиза нужен внешний HTTPS-домен, а не локальный origin разработки или preview-адрес."
    });
  }

  if (!production.keyRoutesRespond) {
    issues.push({
      id: "production-key-routes-fail",
      severity: "blocker",
      area: "production",
      title: "Ключевые страницы production не подтверждены",
      detail:
        "Перед запуском главная, тарифы, подключение, поддержка и контакты должны отвечать без 404."
    });
  }

  if (!production.healthEndpointResponds) {
    issues.push({
      id: "production-health-fail",
      severity: "blocker",
      area: "monitoring",
      title: "Health endpoint недоступен",
      detail: "Мониторинг должен проверять `/api/health.json` и получать успешный ответ."
    });
  }

  if (!production.dnsVerified || !production.sslVerified || !production.redirectsVerified) {
    const refs = [
      production.dnsVerified ? null : "dns",
      production.sslVerified ? null : "ssl",
      production.redirectsVerified ? null : "redirects"
    ].filter((value): value is string => value !== null);

    issues.push({
      id: "production-network-not-verified",
      severity: "blocker",
      area: "production",
      title: "DNS, SSL или redirects не подтверждены",
      detail:
        "Production-домен должен корректно резолвиться, отдавать валидный SSL и вести на единый canonical.",
      refs
    });
  }

  if (!production.productionFormsVerified) {
    issues.push({
      id: "production-forms-not-verified",
      severity: "blocker",
      area: "forms",
      title: "Формы не проверены на production",
      detail:
        "После деплоя нужно отправить тестовую заявку и подтвердить доставку в CRM, Telegram или outbox."
    });
  }
}

function auditDependencies(dependencies: DependencyVerification, issues: LaunchIssue[]): void {
  if (!dependencies.productionAuditClean) {
    issues.push({
      id: "dependencies-audit-open",
      severity: "blocker",
      area: "dependencies",
      title: "Production npm audit не чистый",
      detail: "`npm audit --omit=dev` должен проходить без известных production advisory."
    });
  }
}

function auditPostreleaseControl(postrelease: PostreleaseControl, issues: LaunchIssue[]): void {
  if (!postrelease.errorMonitoringConfigured || !postrelease.speedMonitoringConfigured) {
    const refs = [
      postrelease.errorMonitoringConfigured ? null : "error-monitoring",
      postrelease.speedMonitoringConfigured ? null : "speed-monitoring"
    ].filter((value): value is string => value !== null);

    issues.push({
      id: "postrelease-monitoring-missing",
      severity: "blocker",
      area: "monitoring",
      title: "Пострелизный мониторинг не настроен",
      detail: "После запуска команда должна видеть ошибки runtime и деградацию скорости.",
      refs
    });
  }

  if (!postrelease.analyticsReceivesConversions || !postrelease.conversionBaselineDocumented) {
    const refs = [
      postrelease.analyticsReceivesConversions ? null : "conversion-events",
      postrelease.conversionBaselineDocumented ? null : "conversion-baseline"
    ].filter((value): value is string => value !== null);

    issues.push({
      id: "postrelease-analytics-missing",
      severity: "blocker",
      area: "analytics",
      title: "Конверсионная аналитика не готова",
      detail:
        "Нужно подтвердить получение событий заявки и зафиксировать базовый уровень конверсии.",
      refs
    });
  }

  if (!postrelease.salesFeedbackLoopDocumented) {
    issues.push({
      id: "postrelease-sales-feedback-watch",
      severity: "watch",
      area: "sales",
      title: "Не описан цикл обратной связи отдела продаж",
      detail:
        "Это не ломает сайт технически, но без регулярной обратной связи нельзя сравнить качество заявок после запуска."
    });
  }
}

function countBySeverity(issues: LaunchIssue[], severity: LaunchIssueSeverity): number {
  return issues.filter((issue) => issue.severity === severity).length;
}
