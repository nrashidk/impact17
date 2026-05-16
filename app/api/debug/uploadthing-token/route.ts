// TEMPORARY PUBLIC DIAGNOSTIC — MUST be deleted entirely after token issue resolved
//
// Reports structural diagnostics about UPLOADTHING_TOKEN in the deployed
// environment WITHOUT exposing the secret value. Temporarily public, gated
// only by a hardcoded query-param so it's not trivially discoverable;
// returns 404 (looks absent) when the guard is missing.
//
// The `sdkParse*` fields replicate uploadthing@7.7.4's EXACT token schema
// (from node_modules/uploadthing/dist/shared-schemas-*.js):
//   const DecodeString = S.transform(S.Uint8ArrayFromSelf, S.String, …)
//   const ParsedToken = S.Struct({
//     apiKey: S.Redacted(S.String.pipe(S.startsWith("sk_"))),
//     appId: S.String,
//     regions: S.NonEmptyArray(S.String),
//     ingestHost: S.String.pipe(S.optionalWith({ default: () => "ingest.uploadthing.com" })),
//   });
//   const UploadThingToken =
//     S.Uint8ArrayFromBase64.pipe(S.compose(DecodeString), S.compose(S.parseJson(ParsedToken)));
// Only the failing path + issue tag is reported — never actual values.

import { NextResponse, type NextRequest } from "next/server";
import * as S from "effect/Schema";
import * as ParseResult from "effect/ParseResult";
import * as Either from "effect/Either";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GUARD = "impact17diag2026";

type TokenShape = { apiKey: unknown; appId: unknown; regions: unknown };

// Faithful reconstruction of uploadthing@7.7.4's internal token schema.
const DecodeString = S.transform(S.Uint8ArrayFromSelf, S.String, {
  decode: (data) => new TextDecoder().decode(data),
  encode: (data) => new TextEncoder().encode(data),
});
const ParsedToken = S.Struct({
  apiKey: S.Redacted(S.String.pipe(S.startsWith("sk_"))),
  appId: S.String,
  regions: S.NonEmptyArray(S.String),
  ingestHost: S.String.pipe(S.optionalWith({ default: () => "ingest.uploadthing.com" })),
});
const UploadThingToken = S.Uint8ArrayFromBase64.pipe(
  S.compose(DecodeString),
  S.compose(S.parseJson(ParsedToken)),
);

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

  // Run the EXACT uploadthing parser. Report only failing path + issue tag.
  let sdkParseSucceeds = false;
  let sdkParseError: string | null = null;
  if (present) {
    const result = S.decodeUnknownEither(UploadThingToken, { errors: "all" })(value);
    if (Either.isRight(result)) {
      sdkParseSucceeds = true;
    } else {
      try {
        const issues = ParseResult.ArrayFormatter.formatErrorSync(result.left);
        sdkParseError = issues
          .map((i) => {
            const path = i.path.length ? i.path.join(".") : "(root)";
            return `${path}: ${i._tag}`;
          })
          .join("; ");
      } catch {
        sdkParseError = "ParseError (unformattable)";
      }
      if (!sdkParseError) sdkParseError = "ParseError (no issues)";
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
    sdkParseSucceeds,
    sdkParseError,
  });
}
