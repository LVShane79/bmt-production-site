"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { trackSiteEvent } from "../lib/analytics";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  eventProperties?: Record<string, string | number | boolean>;
};

export function TrackedLink({
  eventName,
  eventProperties,
  onClick,
  ...props
}: TrackedLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackSiteEvent(eventName, eventProperties);
    onClick?.(event);
  }

  return <a {...props} onClick={handleClick} />;
}
