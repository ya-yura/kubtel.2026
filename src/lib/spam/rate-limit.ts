import { createHash } from "node:crypto";

type Bucket = {
  timestamps: number[];
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const defaultOptions: RateLimitOptions = {
  limit: 3,
  windowMs: 10 * 60 * 1000
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = defaultOptions,
  now = Date.now()
): RateLimitResult {
  const bucket = buckets.get(key) ?? { timestamps: [] };
  const freshTimestamps = bucket.timestamps.filter(
    (timestamp) => now - timestamp < options.windowMs
  );

  if (freshTimestamps.length >= options.limit) {
    const oldest = freshTimestamps[0] ?? now;

    buckets.set(key, { timestamps: freshTimestamps });

    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((options.windowMs - (now - oldest)) / 1000)
    };
  }

  freshTimestamps.push(now);
  buckets.set(key, { timestamps: freshTimestamps });

  return {
    allowed: true,
    retryAfterSeconds: 0
  };
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return headers.get("x-real-ip") ?? "unknown";
}

export function hashRateLimitKey(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function resetRateLimitForTests(): void {
  buckets.clear();
}
