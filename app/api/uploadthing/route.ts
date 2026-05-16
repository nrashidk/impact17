import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const runtime = "nodejs";

// Token is auto-read from UPLOADTHING_TOKEN; passed explicitly so a
// missing/empty value surfaces clearly rather than failing opaquely.
const token = process.env.UPLOADTHING_TOKEN;

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: token ? { token } : undefined,
});
