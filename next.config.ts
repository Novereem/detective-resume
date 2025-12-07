import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
    eslint: {
        // WARNING: this skips ESLint in `next build`
        ignoreDuringBuilds: true,
    },
};

export default withNextIntl(nextConfig);