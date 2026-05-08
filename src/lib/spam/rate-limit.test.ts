import { describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimitForTests } from "@lib/spam/rate-limit";

describe("checkRateLimit", () => {
  it("blocks repeated submissions inside the window", () => {
    resetRateLimitForTests();

    expect(checkRateLimit("client", { limit: 2, windowMs: 1000 }, 1000).allowed).toBe(true);
    expect(checkRateLimit("client", { limit: 2, windowMs: 1000 }, 1100).allowed).toBe(true);

    const blocked = checkRateLimit("client", { limit: 2, windowMs: 1000 }, 1200);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
  });
});
