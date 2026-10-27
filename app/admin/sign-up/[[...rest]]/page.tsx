import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-dynamic";
export default function AdminSignUp() {
  return <main className="admin-shell"><p className="admin-kicker">Black Mountain Technologies · private workspace</p><h1>Create account</h1><p className="admin-intro">After verification, this workspace remains restricted to the configured BMT owner.</p><SignUp routing="path" path="/admin/sign-up" signInUrl="/admin/sign-in" forceRedirectUrl="/admin" /></main>;
}
