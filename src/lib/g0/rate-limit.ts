/**
 * Rate limiting for the G0 endpoint.
 *
 * THE TRAP: an in-memory limiter is close to useless on serverless. Vercel (and
 * anything else that scales by invocation) may run each request in a fresh
 * instance, and concurrent instances each keep their own counter - so a `Map`
 * limiter that looks perfect locally can let an attacker through a hundred
 * times over in production. That is worse than having none, because it reads
 * like protection.
 *
 * So the store is pluggable. In-memory is the default and is genuinely correct
 * on a single long-lived Node process. For a serverless deploy, set
 * `G0_REDIS_REST_URL` and `G0_REDIS_REST_TOKEN` (Upstash-compatible REST) and
 * the durable store takes over. `describeLimiter()` reports which one is live
 * so the route can refuse to pretend.
 */

export type RateLimitVerdict = {
  ok: boolean;
  /** Requests left in the current window. */
  remaining: number;
  /** Unix ms when the window resets. */
  resetAt: number;
};

export type RateLimitRule = {
  /** Requests allowed per window. */
  limit: number;
  /** Window length in ms. */
  windowMs: number;
};

/** Ten questions an hour: pointless to abuse, invisible to a real visitor. */
export const G0_RULE: RateLimitRule = { limit: 10, windowMs: 60 * 60 * 1000 };

interface RateLimitStore {
  readonly durable: boolean;
  readonly name: string;
  hit(key: string, rule: RateLimitRule): Promise<RateLimitVerdict>;
}

// --- in-memory -------------------------------------------------------------

type Window = { count: number; resetAt: number };

function createMemoryStore(): RateLimitStore {
  const windows = new Map<string, Window>();

  return {
    durable: false,
    name: "in-memory",
    async hit(key, rule) {
      const now = Date.now();

      // Opportunistic sweep; this map only ever holds live windows.
      if (windows.size > 5000) {
        for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
      }

      const existing = windows.get(key);
      const window =
        existing && existing.resetAt > now
          ? existing
          : { count: 0, resetAt: now + rule.windowMs };

      window.count += 1;
      windows.set(key, window);

      return {
        ok: window.count <= rule.limit,
        remaining: Math.max(0, rule.limit - window.count),
        resetAt: window.resetAt,
      };
    },
  };
}

// --- durable (Upstash-compatible REST) -------------------------------------

function createRedisStore(url: string, token: string): RateLimitStore {
  const call = async (command: unknown[]): Promise<unknown> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`rate-limit store ${response.status}`);
    const body = (await response.json()) as { result?: unknown };
    return body.result;
  };

  return {
    durable: true,
    name: "redis",
    async hit(key, rule) {
      const seconds = Math.ceil(rule.windowMs / 1000);
      // INCR then set the TTL only on first write, so the window is fixed to
      // the first request rather than sliding forward with every hit.
      const count = Number(await call(["INCR", key]));
      if (count === 1) await call(["EXPIRE", key, seconds]);

      const ttl = Number(await call(["TTL", key]));
      return {
        ok: count <= rule.limit,
        remaining: Math.max(0, rule.limit - count),
        resetAt: Date.now() + (ttl > 0 ? ttl * 1000 : rule.windowMs),
      };
    },
  };
}

// --- selection -------------------------------------------------------------

let store: RateLimitStore | null = null;

function getStore(): RateLimitStore {
  if (store) return store;

  const url = process.env.G0_REDIS_REST_URL;
  const token = process.env.G0_REDIS_REST_TOKEN;
  store = url && token ? createRedisStore(url, token) : createMemoryStore();
  return store;
}

/** True when the platform runs each request in its own short-lived instance. */
export function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export function describeLimiter() {
  const active = getStore();
  return {
    name: active.name,
    durable: active.durable,
    /** In-memory counting on serverless is not real protection. */
    trustworthy: active.durable || !isServerless(),
  };
}

/** Derives the caller's key. Falls back to a shared bucket, never to "no limit". */
export function callerKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown";
  return `g0:${ip}`;
}

export function rateLimit(key: string, rule: RateLimitRule = G0_RULE) {
  return getStore().hit(key, rule);
}
