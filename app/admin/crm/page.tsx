import { redirect } from "next/navigation";
import { getAdminAccess } from "../../lib/admin-auth";
import { CrmWorkspace } from "./workspace";

export const dynamic = "force-dynamic";
export default async function CrmPage() { const access=await getAdminAccess(); if(access.kind==="unauthenticated") redirect("/admin/sign-in"); if(access.kind==="forbidden") return <main className="admin-shell"><h1>Access denied</h1></main>; return <CrmWorkspace />; }
