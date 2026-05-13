import { describe, expect, it } from "vitest";
import { getLegacyBusinessRedirect } from "@lib/redirects/business-legacy";

describe("getLegacyBusinessRedirect", () => {
  it("maps legacy B2B public URLs to the new business section", () => {
    expect(getLegacyBusinessRedirect("/legal/smallbusiness/inet/")).toBe("/business/internet/");
    expect(getLegacyBusinessRedirect("/legal/smallbusiness/datac/colocation")).toBe(
      "/business/colocation/"
    );
    expect(getLegacyBusinessRedirect("/legal/operators/")).toBe("/business/operators/");
  });

  it("does not redirect unrelated routes", () => {
    expect(getLegacyBusinessRedirect("/tariffs/")).toBeNull();
    expect(getLegacyBusinessRedirect("/business/internet/")).toBeNull();
  });
});
