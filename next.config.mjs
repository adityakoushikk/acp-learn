/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // App URL: http://localhost:3000 (use that in the browser).
    // Proxy /api/* to Flask (127.0.0.1:5000) so the frontend can call the backend.
    return [
      { source: "/api/:path*", destination: "http://127.0.0.1:5000/:path*" },
    ];
  },
};

export default nextConfig;
