/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  output: "standalone",
  poweredByHeader: false,
  async rewrites() {
    const backendUrl = (
      process.env.BACKEND_URL ?? "http://127.0.0.1:5001"
    ).replace(/\/$/, "");

    // Local development proxy. In production Nginx sends /api/* directly to
    // Gunicorn, but keeping this rewrite makes `pnpm dev` work identically.
    return [
      { source: "/api/:path*", destination: `${backendUrl}/:path*` },
    ];
  },
};

export default nextConfig;
