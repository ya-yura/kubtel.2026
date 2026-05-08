import { describe, expect, it } from "vitest";
import { sitemapRoutes } from "@config/routes";
import { runPrelaunchAudit } from "@lib/prelaunch/audit";
import familyTv from "@content/tariffs/family-tv.json";
import home100 from "@content/tariffs/home-100.json";
import home300 from "@content/tariffs/home-300.json";
import internetService from "@content/services/internet.json";
import staticIpService from "@content/services/static-ip.json";
import tvService from "@content/services/tv.json";
import nightSupportFaq from "@content/faq/night-support.json";
import priceStabilityFaq from "@content/faq/price-stability.json";
import privateSectorFaq from "@content/faq/private-sector.json";
import krasnodarCoverage from "@content/coverage/krasnodar-draft.json";
import switchLocalPromo from "@content/promos/switch-local.json";
import type { CoverageArea, FaqItem, Promo, Service, Tariff } from "@models/domain";

const tariffs = [home100, home300, familyTv] as Tariff[];
const services = [internetService, staticIpService, tvService] as Service[];
const faqItems = [nightSupportFaq, priceStabilityFaq, privateSectorFaq] as FaqItem[];
const coverageAreas = [krasnodarCoverage] as CoverageArea[];
const promos = [switchLocalPromo] as Promo[];

describe("runPrelaunchAudit", () => {
  it("passes the technical prerelease contract and exposes external launch blockers", () => {
    const report = runPrelaunchAudit({
      tariffs,
      services,
      faqItems,
      coverageAreas,
      promos,
      routes: sitemapRoutes,
      formPages: [
        { path: "/", isOnDemand: true, hasActionResult: true },
        { path: "/connect/", isOnDemand: true, hasActionResult: true },
        { path: "/tariffs/", isOnDemand: true, hasActionResult: true }
      ],
      env: {},
      legal: {
        consentTextConfirmed: false,
        privacyPolicyPath: null,
        operatorDetailsConfirmed: false
      }
    });

    expect(report.summary.defects).toBe(0);
    expect(report.summary.technicalReady).toBe(true);
    expect(report.summary.launchReady).toBe(false);
    expect(report.issues.map((issue) => issue.id)).toEqual(
      expect.arrayContaining([
        "tariffs-unconfirmed",
        "coverage-unconfirmed",
        "lead-integrations-env-missing",
        "analytics-env-missing",
        "legal-readiness-missing"
      ])
    );
  });

  it("fails the form contract when a page cannot render action results", () => {
    const report = runPrelaunchAudit({
      tariffs,
      services,
      faqItems,
      coverageAreas,
      promos,
      routes: sitemapRoutes,
      formPages: [{ path: "/tariffs/", isOnDemand: false, hasActionResult: false }],
      env: {},
      legal: {
        consentTextConfirmed: false,
        privacyPolicyPath: null,
        operatorDetailsConfirmed: false
      }
    });

    expect(report.issues.map((issue) => issue.id)).toEqual(
      expect.arrayContaining(["forms-static-pages", "forms-action-result-missing"])
    );
    expect(report.summary.technicalReady).toBe(false);
  });
});
