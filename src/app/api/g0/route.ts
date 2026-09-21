import OpenAI from "openai";
import { KNOWLEDGE, SYSTEM_PROMPT } from "@/lib/g0/knowledge";
import {
  G0_RULE,
  callerKey,
  describeLimiter,
  isServerless,
  rateLimit,
} from "@/lib/g0/rate-limit";

/** Streaming needs a live request; nothing here can be prerendered. */
export const dynamic = "force-dynamic";

/**
 * Cheap and fast, with a 1M context and cached input at $0.02/M - which makes
 * the knowledge base almost free to resend and keeps an abusive loop survivable.
 * Move to `gpt-5.6-sol` if the answers are not sharp enough; it is roughly 16x
 * the cost per turn.
 */
const MODEL = "gpt-5.6-luna";

/** Hard ceilings. These exist to bound the bill, not to shape the UX. */
const MAX_TURNS = 8;
const MAX_QUESTION_CHARS = 500;
const MAX_OUTPUT_TOKENS = 400;

type Turn = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return problem(503, "G0 is offline: no API key configured.");
  }

  // Refuse to pretend. An in-memory counter on serverless is not a rate limit,
  // and shipping one would be a false assurance over a spendable key.
  const limiter = describeLimiter();
  if (!limiter.trustworthy) {
    console.error(
      "[g0] refusing to serve: in-memory rate limiting on a serverless platform " +
        "is per-instance and offers no real protection. Set G0_REDIS_REST_URL " +
        "and G0_REDIS_REST_TOKEN.",
    );
    return problem(503, "G0 is offline: rate limiting is not configured.");
  }

  const key = callerKey(request.headers);
  const verdict = await rateLimit(key);
  if (!verdict.ok) {
    const seconds = Math.max(1, Math.ceil((verdict.resetAt - Date.now()) / 1000));
    return problem(
      429,
      `Rate limit reached - ${G0_RULE.limit} questions an hour. Try again in ${formatWait(seconds)}.`,
      { "retry-after": String(seconds) },
    );
  }

  let turns: Turn[];
  try {
    turns = parseTurns(await request.json());
  } catch (error) {
    return problem(400, error instanceof Error ? error.message : "Bad request.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const stream = await client.responses.create({
      model: MODEL,
      // Instructions first and byte-stable, so the cached prefix actually hits.
      instructions: `${SYSTEM_PROMPT}\n\n# PORTFOLIO KNOWLEDGE\n\n${KNOWLEDGE}`,
      input: turns.map((turn) => ({ role: turn.role, content: turn.content })),
      max_output_tokens: MAX_OUTPUT_TOKENS,
      stream: true,
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
              controller.enqueue(encoder.encode(event.delta));
            }
          }
        } catch (error) {
          console.error("[g0] stream failed", error);
          controller.enqueue(encoder.encode("\n[G0 lost its connection.]"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-ratelimit-remaining": String(verdict.remaining),
      },
    });
  } catch (error) {
    console.error("[g0] request failed", error);
    return problem(502, "G0 could not reach its model.");
  }
}

function parseTurns(payload: unknown): Turn[] {
  if (!payload || typeof payload !== "object" || !("messages" in payload)) {
    throw new Error("Expected { messages: [...] }.");
  }

  const raw = (payload as { messages: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) throw new Error("No messages.");

  // Only the tail matters, and a long history is someone else's bill.
  const turns = raw.slice(-MAX_TURNS).map((entry): Turn => {
    const role = (entry as Turn)?.role;
    const content = (entry as Turn)?.content;
    if (role !== "user" && role !== "assistant") throw new Error("Bad role.");
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Empty message.");
    }
    return { role, content: content.slice(0, MAX_QUESTION_CHARS) };
  });

  if (turns.at(-1)?.role !== "user") throw new Error("Last message must be a question.");
  return turns;
}

function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return minutes < 60 ? `${minutes} min` : `${Math.ceil(minutes / 60)}h`;
}

function problem(status: number, message: string, headers: HeadersInit = {}) {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", ...headers },
  });
}

/** Handy for checking which limiter a deploy actually ended up with. */
export async function GET() {
  return Response.json({
    model: MODEL,
    configured: Boolean(process.env.OPENAI_API_KEY),
    limit: `${G0_RULE.limit} / ${G0_RULE.windowMs / 60000} min`,
    limiter: describeLimiter(),
    serverless: isServerless(),
  });
}
