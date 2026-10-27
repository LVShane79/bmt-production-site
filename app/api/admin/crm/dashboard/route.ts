import { NextResponse } from "next/server";
import { ownerOrUnauthorized } from "../../../../lib/admin-auth";
import { CrmUnavailableError, getCrmRepository } from "../../../../lib/crm";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "private, no-store" };

export async function GET() {
  const gate = await ownerOrUnauthorized();
  if (gate instanceof NextResponse) return gate;
  try { return NextResponse.json(await getCrmRepository().dashboard(), { headers: noStore }); }
  catch (error) {
    if (error instanceof CrmUnavailableError) return NextResponse.json({ error: "CRM is unavailable until private storage is configured." }, { status: 503, headers: noStore });
    return NextResponse.json({ error: "CRM dashboard unavailable" }, { status: 500, headers: noStore });
  }
}
