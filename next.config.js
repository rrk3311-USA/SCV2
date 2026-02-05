/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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
