import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isConfiguredOwner } from "./owner-policy";

/** Fail closed: there is no development bypass and no header-based identity. */
export async function requireOwner() {
  const access = await getAdminAccess();
  return access.kind === "owner" ? access : null;
}

export async function getAdminAccess(): Promise<{kind:"owner";userId:string;email:string}|{kind:"unauthenticated"}|{kind:"forbidden"}> {
  try {
    const { userId } = await auth(); // Clerk verifies the session token server-side.
    if (!userId) return { kind: "unauthenticated" };

    // A stable user ID is the authorization key. Email is re-checked only to bind
    // the bootstrap account to the requested owner and avoid authorizing signups.
    const user = await (await clerkClient()).users.getUser(userId);
    const primary = user.primaryEmailAddress;
    const email = primary?.emailAddress?.toLowerCase();
    const verified = primary?.verification?.status === "verified";
    return isConfiguredOwner(userId, email ?? null, verified, process.env.BMT_OWNER_CLERK_USER_IDS) ? { kind:"owner", userId, email:email! } : { kind:"forbidden" };
  } catch {
    // Missing Clerk configuration, invalid tokens, and provider errors deny access.
    return { kind: "unauthenticated" };
  }
}

export async function ownerOrUnauthorized() {
  const access = await getAdminAccess();
  if(access.kind === "owner") return access;
  return NextResponse.json({ error: access.kind === "unauthenticated" ? "Authentication required" : "Not authorized" }, { status: access.kind === "unauthenticated" ? 401 : 403, headers: { "Cache-Control": "private, no-store" } });
}
