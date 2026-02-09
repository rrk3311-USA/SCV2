/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Silence "inferred workspace root" warning when multiple lockfiles exist (e.g. monorepo parent)
  turbopack: { root: __dirname },
  images: {
    // Unoptimized disables Image Optimizer, mitigating GHSA-9g9p-9gw9-jx7f (DoS via remotePatterns).
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  async redirects() {
    return [
      {
        source: "/feeds/google-shopping",
        destination: "/api/feeds/google-shopping",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
