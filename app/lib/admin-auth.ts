import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isConfiguredOwner } from "./owner-policy";

/** Fail closed: there is no development bypass and no header-based identity. */
export async function requireOwner() {
  try {
    const { userId } = await auth(); // Clerk verifies the session token server-side.
    if (!userId) return null;

    // A stable user ID is the authorization key. Email is re-checked only to bind
    // the bootstrap account to the requested owner and avoid authorizing signups.
    const user = await (await clerkClient()).users.getUser(userId);
    const primary = user.primaryEmailAddress;
    const email = primary?.emailAddress?.toLowerCase();
    const verified = primary?.verification?.status === "verified";
    return isConfiguredOwner(userId, email ?? null, verified, process.env.BMT_OWNER_CLERK_USER_IDS) ? { userId, email } : null;
  } catch {
    // Missing Clerk configuration, invalid tokens, and provider errors deny access.
    return null;
  }
}

export async function ownerOrUnauthorized() {
  const owner = await requireOwner();
  return owner ?? NextResponse.json({ error: "Not authorized" }, { status: 403, headers: { "Cache-Control": "private, no-store" } });
}
