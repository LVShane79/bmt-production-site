const host = "blackmountain.tech";
const key = "e9dbd83bc183db2e1562a07103759770";
const keyLocation = `https://${host}/${key}.txt`;
const sitemapUrl = `https://${host}/sitemap.xml`;

const sitemapResponse = await fetch(sitemapUrl);
if (!sitemapResponse.ok) {
  throw new Error(`Could not read ${sitemapUrl}: ${sitemapResponse.status}`);
}

const sitemap = await sitemapResponse.text();
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (!urlList.length) {
  throw new Error("No URLs were found in the production sitemap.");
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

if (!response.ok && response.status !== 202) {
  throw new Error(`IndexNow submission failed: ${response.status} ${await response.text()}`);
}

console.log(`Submitted ${urlList.length} production URLs to IndexNow (${response.status}).`);
