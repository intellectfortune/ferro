import type { NextConfig } from "next";

// 'unsafe-inline' on script-src is needed for the inline theme-init
// script in the root layout (runs before hydration to avoid a
// light/dark flash) — tightening that to a nonce is a follow-up, not
// done here. Everything else is a real allowlist: Google Maps needs
// its own script/style/image hosts, Supabase needs API + storage
// image access.
//
// Dev-only additions: Next's dev server needs 'unsafe-eval' (React's
// dev-mode debugging) and a ws: connection (HMR) — neither applies to
// the production bundle, so they're only added outside production.
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://maps.googleapis.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.supabase.co https://maps.googleapis.com https://maps.gstatic.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' https://*.supabase.co https://maps.googleapis.com${isDev ? " ws://localhost:* ws://100.105.166.83:*" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.105.166.83"],
  experimental: {
    serverActions: {
      // Covers the largest allowed upload (documents, 15MB) plus
      // multipart/form-data overhead.
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
