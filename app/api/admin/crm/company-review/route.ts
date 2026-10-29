import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { ownerOrUnauthorized } from "../../../../lib/admin-auth";
import { companyReviewWrite, validateCompanyReview } from "../../../../lib/company-review";

export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};

/** Records an owner-only company/NTA decision. It never changes evidence, leads,
 * recipients, suppressions, or draft approval/send state. */
export async function PATCH(request:Request){
 const gate=await ownerOrUnauthorized();if(gate instanceof NextResponse)return gate;
 const review=validateCompanyReview(await request.json().catch(()=>null));
 if(!review)return NextResponse.json({error:"Invalid company review. Unknown or Nevada geography cannot be marked not applicable; an attachable review requires explicit Nevada clearance or verified non-Nevada not-applicable status."},{status:400,headers});
 if(!process.env.DATABASE_URL)return NextResponse.json({error:"Research storage is not configured."},{status:503,headers});
 try{
  const sql=neon(process.env.DATABASE_URL);
  const write=companyReviewWrite(review,gate.userId,crypto.randomUUID());
  const rows=await sql.query(write.sql,write.params);
  if(!rows[0])return NextResponse.json({error:"Company changed or is unavailable. Reload before recording a new owner decision."},{status:409,headers});
  return NextResponse.json({company:rows[0],message:"Company review recorded. Evidence acceptance, draft attachment, approval, and sending remain separate controls."},{headers});
 }catch{return NextResponse.json({error:"Could not record company review; verify migration 0005."},{status:503,headers});}
}
