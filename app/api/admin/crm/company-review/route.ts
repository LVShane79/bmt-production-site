import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { ownerOrUnauthorized } from "../../../../lib/admin-auth";
import { validateCompanyReview } from "../../../../lib/company-review";

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
  const rows=await sql.query("WITH updated AS (UPDATE crm_research_companies SET geography=$3,geography_status=$4,nta_review_state=$5,review_state=$6,review_rationale=$7,reviewed_by=$8,reviewed_at=clock_timestamp(),updated_at=GREATEST(clock_timestamp(),updated_at + interval '1 microsecond') WHERE id=$1 AND floor(extract(epoch FROM updated_at)*1000000)::bigint::text=$2 RETURNING id,company_name,geography,geography_status,nta_review_state,review_state,review_rationale,reviewed_by,reviewed_at,updated_at), audit AS (INSERT INTO crm_research_company_reviews (id,company_id,expected_version,geography,geography_status,nta_review_state,review_state,rationale,reviewed_by,reviewed_at) SELECT $9,id,$2,geography,geography_status,nta_review_state,review_state,review_rationale,reviewed_by,reviewed_at FROM updated RETURNING company_id) SELECT updated.*,floor(extract(epoch FROM updated.updated_at)*1000000)::bigint::text AS updated_version FROM updated JOIN audit ON audit.company_id=updated.id",[review.id,review.expectedVersion,review.geography,review.geographyStatus,review.ntaReviewState,review.reviewState,review.rationale,gate.userId,crypto.randomUUID()]);
  if(!rows[0])return NextResponse.json({error:"Company changed or is unavailable. Reload before recording a new owner decision."},{status:409,headers});
  return NextResponse.json({company:rows[0],message:"Company review recorded. Evidence acceptance, draft attachment, approval, and sending remain separate controls."},{headers});
 }catch{return NextResponse.json({error:"Could not record company review; verify migration 0005."},{status:503,headers});}
}
