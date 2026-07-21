import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
