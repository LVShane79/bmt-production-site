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
        source: "/post/how-to-read-av-drawings-a-beginner-s-guide",
        destination: "/insights/how-to-read-av-drawings",
        permanent: true,
      },
      {
        source: "/post/8-ohm-vs-70v-speakers-which-one-is-right-for-your-av-project",
        destination: "/insights/8-ohm-vs-70v-speakers",
        permanent: true,
      },
      {
        source: "/post/planning-av-installation",
        destination: "/insights/hidden-cost-of-skipping-engineering",
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
