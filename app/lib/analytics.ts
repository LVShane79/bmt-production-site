"use client";

import { track } from "@vercel/analytics";

type EventProperties = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackSiteEvent(name: string, properties: EventProperties = {}) {
  track(name, properties);
  window.gtag?.("event", name, properties);
}
