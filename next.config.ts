import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/services",
        destination: "/#services",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/#approach",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/insights",
        permanent: true,
      },
      {
        source: "/blog/:path*",
        destination: "/insights",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.blackmountain.tech" }],
        destination: "https://blackmountain.tech/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
