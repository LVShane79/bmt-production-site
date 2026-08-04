import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://blackmountain.tech"),
  title: {
    default: "Black Mountain Technologies | Commercial AV Engineering",
    template: "%s | Black Mountain Technologies",
  },
  description:
    "Commercial AV engineering, documentation, network design, and practical consulting for integrators that need more capacity and fewer surprises.",
  applicationName: "Black Mountain Technologies",
  authors: [{ name: "Black Mountain Technologies", url: "https://blackmountain.tech" }],
  creator: "Black Mountain Technologies",
  publisher: "Black Mountain Technologies",
  category: "Commercial AV engineering",
  verification: {
    google: "hdYrpgyK0yTRcBCKHY2CbVBmTlw8byb_RqNtL6SwIeA",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Black Mountain Technologies",
    title: "Black Mountain Technologies | Commercial AV Engineering",
    description:
      "Engineered documentation, AV network design, and practical consulting for commercial AV integrators.",
    url: "https://blackmountain.tech",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Black Mountain Technologies — engineering better AV projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Black Mountain Technologies | Commercial AV Engineering",
    description:
      "Engineered documentation, AV network design, and practical consulting for commercial AV integrators.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        {googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
