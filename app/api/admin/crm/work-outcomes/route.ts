import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { ownerOrUnauthorized } from "../../../../lib/admin-auth";

export const dynamic="force-dynamic";
const noStore={"Cache-Control":"private, no-store"};
const channels=["email","call","manual"] as const;

function valid(value:unknown) {
  if (!value || typeof value!=="object") return null;
  const record=value as Record<string,unknown>;
  if (typeof record.leadId!=="string" || !record.leadId || !channels.includes(record.channel as typeof channels[number]) || typeof record.outcome!=="string" || !record.outcome.trim() || record.outcome.length>240 || (record.note!==undefined && record.note!==null && (typeof record.note!=="string" || record.note.length>8000))) return null;
  return {leadId:record.leadId,channel:record.channel as typeof channels[number],outcome:record.outcome.trim(),note:typeof record.note==="string"?record.note.trim()||null:null};
}

/** User-reported internal work log; it never attests provider delivery, replies, or calls. */
export async function GET(request:Request) {
  const gate=await ownerOrUnauthorized(); if (gate instanceof NextResponse) return gate;
  const leadId=new URL(request.url).searchParams.get("leadId");
  if (!leadId || !process.env.DATABASE_URL) return NextResponse.json({error:"Work outcomes are unavailable until the additive workflow migration is applied."},{status:503,headers:noStore});
  try { const rows=await neon(process.env.DATABASE_URL).query("SELECT id,lead_id,channel,outcome,note,reported_by,reported_at FROM crm_work_outcomes WHERE lead_id=$1 ORDER BY reported_at DESC,id DESC",[leadId]); return NextResponse.json(rows,{headers:noStore}); } catch { return NextResponse.json({error:"Work outcomes are unavailable until the additive workflow migration is applied."},{status:503,headers:noStore}); }
}

export async function POST(request:Request) {
  const gate=await ownerOrUnauthorized(); if (gate instanceof NextResponse) return gate;
  const input=valid(await request.json().catch(()=>null));
  if (!input) return NextResponse.json({error:"Invalid internal work outcome."},{status:400,headers:noStore});
  if (!process.env.DATABASE_URL) return NextResponse.json({error:"Work outcomes are unavailable until the additive workflow migration is applied."},{status:503,headers:noStore});
  try { const id=crypto.randomUUID(); const rows=await neon(process.env.DATABASE_URL).query("INSERT INTO crm_work_outcomes (id,lead_id,channel,outcome,note,reported_by) SELECT $1,$2,$3,$4,$5,$6 WHERE EXISTS (SELECT 1 FROM crm_leads WHERE id=$2) RETURNING id,lead_id,channel,outcome,note,reported_by,reported_at",[id,input.leadId,input.channel,input.outcome,input.note,gate.email]); const row=rows[0]; return row?NextResponse.json(row,{status:201,headers:noStore}):NextResponse.json({error:"Lead not found; no outcome was recorded."},{status:404,headers:noStore}); } catch { return NextResponse.json({error:"Work outcomes are unavailable until the additive workflow migration is applied."},{status:503,headers:noStore}); }
}
