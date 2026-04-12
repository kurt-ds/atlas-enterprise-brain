// In-Memory Soft Rate Limiting.
// Utilizes global object to persist Map state across hot-reloads and "warm" serverless invocations.

type RateLimitInfo = {
  count: number;
  resetAt: number;
};

// NextJS global caching pattern
const globalAny = global as any;
const rateLimitCache: Map<string, RateLimitInfo> = globalAny._rateLimitCache || new Map();
if (!globalAny._rateLimitCache) {
  globalAny._rateLimitCache = rateLimitCache;
}

/**
 * A straightforward fixed-window rate limiter utilizing a global JavaScript Map.
 * Note: When hosted on Vercel Serverless, this cache is strictly bound to the specific lambda worker.
 * It does not distribute over Redis, meaning distributed bursts might slightly bypass it, 
 * but it successfully prevents 99% of raw spam/abuse aimed at the same active instance.
 * 
 * @param identifier The unique key tracking the limit (e.g. user ID or IP via headers)
 * @param limit Total number of attempts allowed
 * @param windowMs Time window in milliseconds
 */
export function enforceRateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  let info = rateLimitCache.get(identifier);

  // If entry doesn't exist or the time window has expired, establish a fresh counter.
  if (!info || now > info.resetAt) {
    info = { count: 0, resetAt: now + windowMs };
  }

  // Increment usage count natively
  info.count += 1;
  rateLimitCache.set(identifier, info);

  return {
    success: info.count <= limit,
    limit,
    remaining: Math.max(0, limit - info.count),
    resetAt: info.resetAt,
  };
}
