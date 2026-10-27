import { SignIn } from "@clerk/nextjs";
import { adminAuthAppearance } from "../../auth-appearance";

export const dynamic = "force-dynamic";
export default function AdminSignIn() {
  return <main className="admin-shell admin-auth-shell"><p className="admin-kicker">Black Mountain Technologies · private workspace</p><h1>Sign in</h1><p className="admin-intro">Use the authorized BMT owner account to continue to Admin.</p><SignIn appearance={adminAuthAppearance} routing="path" path="/admin/sign-in" signUpUrl="/admin/sign-up" forceRedirectUrl="/admin" /></main>;
}
