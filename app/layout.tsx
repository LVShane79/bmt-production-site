import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://blackmountain.tech"),
  title: {
    default: "Black Mountain Technologies",
    template: "%s | Black Mountain Technologies",
  },
  description: "Commercial AV engineering, documentation, network design, and consulting for integrators.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
