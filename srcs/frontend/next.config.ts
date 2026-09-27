import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const allowedOrigin = process.env.NEXT_PUBLIC_IP_ADDRESS || "localhost";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    allowedOrigin,
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "300mb",
      allowedOrigins: [
        "localhost:9000",
        `${allowedOrigin}:9000`,
      ],
    },
  },
};

export default withNextIntl(nextConfig);