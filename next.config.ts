import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // The admin seed route reads /content/*.md at request time. Tell Next's
  // file-tracer to bundle the markdown catalogue with that route so it's
  // available in the serverless function.
  outputFileTracingIncludes: {
    "/api/admin/seed": ["./content/**/*.md"],
  },
};

export default withNextIntl(nextConfig);
