import { redirect } from "next/navigation";
import { requireOwner } from "../../lib/admin-auth";
import { CrmWorkspace } from "./workspace";

export const dynamic = "force-dynamic";
export default async function CrmPage() { if (!(await requireOwner())) redirect("/"); return <CrmWorkspace />; }
