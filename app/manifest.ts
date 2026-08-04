import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Black Mountain Technologies",
    short_name: "BMT",
    description:
      "Commercial AV engineering, documentation, network design, and practical consulting for integrators.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f2ec",
    theme_color: "#182022",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
