// TEMPORARY PUBLIC DIAGNOSTIC — MUST be deleted entirely after token issue resolved
//
// Reports structural diagnostics about UPLOADTHING_TOKEN in the deployed
// environment WITHOUT exposing the secret value. Temporarily public, gated
// only by a hardcoded query-param so it's not trivially discoverable;
// returns 404 (looks absent) when the guard is missing.

import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GUARD = "impact17diag2026";

type TokenShape = { apiKey: unknown; appId: unknown; regions: unknown };

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("check") !== GUARD) {
    return new NextResponse("Not found", { status: 404 });
  }

  const raw = process.env.UPLOADTHING_TOKEN;
  const present = typeof raw === "string" && raw.length > 0;
  const value = present ? (raw as string) : "";

  let decodesToValidJson = false;
  let decodeErrorType: string | null = null;
  if (present) {
    try {
      const decoded = Buffer.from(value, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded) as TokenShape;
      decodesToValidJson =
        typeof parsed.apiKey === "string" &&
        typeof parsed.appId === "string" &&
        Array.isArray(parsed.regions);
      if (!decodesToValidJson) {
        decodeErrorType = "ShapeMismatch: missing string apiKey / string appId / array regions";
      }
    } catch (err) {
      const name = err instanceof Error ? err.name : "UnknownError";
      const msg = err instanceof Error ? err.message.slice(0, 60) : "";
      decodeErrorType = msg ? `${name}: ${msg}` : name;
    }
  }

  return NextResponse.json({
    present,
    length: value.length,
    startsWithEyJ: value.startsWith("eyJ"),
    hasSurroundingQuotes: /^["']/.test(value) || /["']$/.test(value),
    hasWhitespace: /[ \t\n\r]/.test(value),
    containsEqualsPrefix: value.includes("UPLOADTHING_TOKEN="),
    decodesToValidJson,
    decodeErrorType,
  });
}
