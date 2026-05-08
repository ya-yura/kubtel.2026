import { describe, expect, it } from "vitest";
import { runLaunchReadinessAudit, type LaunchReadinessInput } from "@lib/launch/readiness";

const readyInput: LaunchReadinessInput = {
  prelaunch: {
    summary: {
      defects: 0,
      externalBlockers: 0,
      watches: 0,
      technicalReady: true,
      launchReady: true
    }
  },
  production: {
    origin: "https://kubtel.ru",
    expectedOrigin: "https://kubtel.ru",
    keyRoutesRespond: true,
    healthEndpointResponds: true,
    dnsVerified: true,
    sslVerified: true,
    redirectsVerified: true,
    productionFormsVerified: true
  },
  postrelease: {
    errorMonitoringConfigured: true,
    speedMonitoringConfigured: true,
    analyticsReceivesConversions: true,
    conversionBaselineDocumented: true,
    salesFeedbackLoopDocumented: true
  },
  dependencies: {
    productionAuditClean: true
  }
};

describe("runLaunchReadinessAudit", () => {
  it("passes when production, monitoring, dependencies and prelaunch are confirmed", () => {
    const report = runLaunchReadinessAudit(readyInput);

    expect(report.issues).toHaveLength(0);
    expect(report.summary).toEqual({
      blockers: 0,
      watches: 0,
      technicalReleaseReady: true,
      productionLaunchReady: true,
      postreleaseControlReady: true
    });
  });

  it("blocks a local launch candidate with unresolved external and production checks", () => {
    const report = runLaunchReadinessAudit({
      ...readyInput,
      prelaunch: {
        summary: {
          defects: 0,
          externalBlockers: 7,
          watches: 0,
          technicalReady: true,
          launchReady: false
        }
      },
      production: {
        origin: "http://127.0.0.1:4321",
        expectedOrigin: "http://127.0.0.1:4321",
        keyRoutesRespond: true,
        healthEndpointResponds: true,
        dnsVerified: false,
        sslVerified: false,
        redirectsVerified: false,
        productionFormsVerified: false
      },
      postrelease: {
        errorMonitoringConfigured: false,
        speedMonitoringConfigured: false,
        analyticsReceivesConversions: false,
        conversionBaselineDocumented: false,
        salesFeedbackLoopDocumented: false
      }
    });

    expect(report.summary.productionLaunchReady).toBe(false);
    expect(report.issues.map((issue) => issue.id)).toEqual(
      expect.arrayContaining([
        "prelaunch-external-blockers-open",
        "production-origin-not-https",
        "production-network-not-verified",
        "production-forms-not-verified",
        "postrelease-monitoring-missing",
        "postrelease-analytics-missing"
      ])
    );
  });
});
