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
  // /[locale]/points was consolidated into /[locale]/profile. Redirect any
  // remaining bookmarks/links permanently.
  async redirects() {
    return [
      {
        source: "/:locale/points",
        destination: "/:locale/profile",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
