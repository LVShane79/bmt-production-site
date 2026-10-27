import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "../lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!(await requireOwner())) redirect("/admin/sign-in");
  return <main className="admin-shell"><p className="admin-kicker">Black Mountain Technologies · private workspace</p><h1>Admin hub</h1><p className="admin-intro">A single private home for the systems that support BMT.</p><section className="admin-cards"><Link className="admin-card" href="/admin/crm"><span>01</span><h2>Business development CRM</h2><p>Research, outreach protection, and follow-up records. No campaigns send from this workspace.</p><b>Open CRM →</b></Link><article className="admin-card admin-card-reserved"><span>02</span><h2>Network Manager</h2><p>Reserved for the next private BMT application.</p><b>Coming next</b></article></section></main>;
}
