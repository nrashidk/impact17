import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const runtime = "nodejs";

// Token is auto-read from UPLOADTHING_TOKEN by the SDK; we pass it explicitly
// so a missing/empty value is obvious, and log presence (never the value).
const token = process.env.UPLOADTHING_TOKEN;
console.log(`[uploadthing] route init: UPLOADTHING_TOKEN ${token ? "present" : "MISSING"}`);

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: token ? { token } : undefined,
});
