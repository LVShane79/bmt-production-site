export const siteUrl = "https://blackmountain.tech";
export const organizationId = `${siteUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export const organizationReference = {
  "@type": "Organization",
  "@id": organizationId,
  name: "Black Mountain Technologies",
  url: siteUrl,
  email: "info@blackmountain.tech",
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/bmt-logo-graphite.png"),
  },
};
