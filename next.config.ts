import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        // WARNING: this skips ESLint in `next build`
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
