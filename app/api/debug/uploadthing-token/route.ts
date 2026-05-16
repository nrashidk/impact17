// TEMPORARY DIAGNOSTIC — delete after token issue resolved
//
// Reports structural diagnostics about UPLOADTHING_TOKEN in the deployed
// environment WITHOUT exposing the secret value. Protected by the same
// Bearer secret as /api/admin/seed.

import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type TokenShape = { apiKey: unknown; appId: unknown; regions: unknown };

export async function GET(request: NextRequest) {
  const expected = process.env.ADMIN_SEED_SECRET;
  if (!expected || expected.length === 0) {
    return NextResponse.json(
      { error: "ADMIN_SEED_SECRET is not configured on the server" },
      { status: 500 },
    );
  }

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized();
  }
  const bearer = header.slice("Bearer ".length).trim();
  if (bearer !== expected) {
    return unauthorized();
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
