import { describe, expect, it } from "vitest";
import { getLegacyBusinessRedirect } from "@lib/redirects/business-legacy";

describe("getLegacyBusinessRedirect", () => {
  it("maps legacy B2B public URLs to short request and calculator paths", () => {
    expect(getLegacyBusinessRedirect("/legal/smallbusiness/inet/")).toBe(
      "/business/request/?service=internet"
    );
    expect(getLegacyBusinessRedirect("/legal/smallbusiness/datac/colocation")).toBe(
      "/business/?calculator=colocation#business-calculators"
    );
    expect(getLegacyBusinessRedirect("/legal/smallbusiness/datac/admission")).toBe(
      "/business/datacenter-access/"
    );
    expect(getLegacyBusinessRedirect("/legal/operators/")).toBe("/business/operators/");
    expect(getLegacyBusinessRedirect("/legal/govsector/")).toBe("/business/b2g/");
  });

  it("redirects redundant service detail pages to the business workspace", () => {
    expect(getLegacyBusinessRedirect("/business/internet/")).toBe(
      "/business/request/?service=internet"
    );
    expect(getLegacyBusinessRedirect("/business/telephony/")).toBe(
      "/business/?calculator=telephony#business-calculators"
    );
    expect(getLegacyBusinessRedirect("/business/government/")).toBe("/business/b2g/");
  });

  it("does not redirect unrelated routes", () => {
    expect(getLegacyBusinessRedirect("/tariffs/")).toBeNull();
    expect(getLegacyBusinessRedirect("/business/operators/")).toBeNull();
    expect(getLegacyBusinessRedirect("/business/datacenter-access/")).toBeNull();
  });
});
