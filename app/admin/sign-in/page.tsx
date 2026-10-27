import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

/** Explicit private entrypoint; Clerk returns successful sign-in to /admin. */
export default function AdminSignIn() {
  return <main className="admin-shell"><p className="admin-kicker">Black Mountain Technologies · private workspace</p><h1>Sign in</h1><p className="admin-intro">Use the authorized BMT owner account to continue to Admin.</p><SignIn routing="path" path="/admin/sign-in" fallbackRedirectUrl="/admin" /></main>;
}
