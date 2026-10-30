import { randomUUID } from "node:crypto";

export type SendSql = { query(query:string,params?:unknown[]):Promise<Record<string,unknown>[]> };
export type SendEnv = Record<string,string|undefined>;
export type Receipt = {messageId:string;threadId?:string|null};
export type SendMessage = {attemptId:string;to:string;subject:string;body:string};
export type SendTransport = {send(message:SendMessage):Promise<Receipt>;reconcile(message:SendMessage):Promise<Receipt|null>};
export type ReviewRecipient={leadId:string;email:string;contextKind:"requested"|"invited";contextEvidence:string;contextSource:string;contextDate:string;purpose:string};
type Review={id:string;draft_id:string;draft_version:string;sender_alias:string;subject:string;body:string;recipients:ReviewRecipient[]};
export const SEND_FROM="info@blackmountain.tech";
export function sendEnabled(env:SendEnv){return env.CRM_GMAIL_CONNECTION_ENABLED==="true"&&env.CRM_GMAIL_SEND_ENABLED==="true";}
export function validSendOrigin(request:Request,env:SendEnv){return env.CRM_APP_ORIGIN==="https://blackmountain.tech"&&request.headers.get("origin")===env.CRM_APP_ORIGIN&&new URL(request.url).origin===env.CRM_APP_ORIGIN&&request.headers.get("sec-fetch-site")!=="cross-site"&&request.headers.get("content-type")?.split(";")[0].trim()==="application/json";}
const text=(v:unknown,min:number,max:number)=>typeof v==="string"&&v.trim().length>=min&&v.length<=max?v.trim():null;
export function validateSendReview(value:unknown){
 if(!value||typeof value!=="object")return null;const v=value as Record<string,unknown>;
 const draftId=text(v.draftId,1,200),messageVersion=text(v.messageVersion,1,100),backupRunId=text(v.backupRunId,1,200);
 if(!draftId||!messageVersion||!backupRunId||v.confirmation!==true||!Array.isArray(v.contexts)||v.contexts.length<1||v.contexts.length>10)return null;
 const contexts=[];for(const raw of v.contexts){if(!raw||typeof raw!=="object")return null;const c=raw as Record<string,unknown>;const leadId=text(c.leadId,1,200),evidence=text(c.evidence,10,2000),source=text(c.source,3,2000),purpose=text(c.purpose,5,1000),observedAt=text(c.observedAt,10,10);if(!leadId||!evidence||!source||!purpose||!observedAt||!/^\d{4}-\d{2}-\d{2}$/.test(observedAt)||(!Number.isFinite(Date.parse(observedAt))||new Date(observedAt).toISOString().slice(0,10)!==observedAt)||observedAt>new Date().toISOString().slice(0,10)||(c.kind!=="requested"&&c.kind!=="invited"))return null;contexts.push({leadId,contextKind:c.kind as "requested"|"invited",contextEvidence:evidence,contextSource:source,purpose,contextDate:observedAt});}
 if(new Set(contexts.map(c=>c.leadId)).size!==contexts.length)return null;
 return{draftId,messageVersion,backupRunId,contexts};
}
export function validateSendAction(value:unknown,key:"reviewId"|"attemptId"){if(!value||typeof value!=="object")return null;const v=value as Record<string,unknown>;if(v.confirmation!==true)return null;return text(v[key],1,200);}
export const draftSendSql=`SELECT d.id,d.name,d.subject,d.body,d.state,floor(extract(epoch FROM d.updated_at)*1000000)::bigint::text AS version,COALESCE((SELECT jsonb_agg(jsonb_build_object('leadId',l.id,'email',coalesce(lower(btrim(l.email)),''),'company',l.company,'eligible',(l.history_state='clear' AND l.status NOT IN ('Bounced','Opted out') AND coalesce(l.next_step,'')<>'Monitor for reply; no further automated outreach' AND l.email IS NOT NULL AND btrim(l.email)<>'' AND NOT EXISTS(SELECT 1 FROM crm_research_companies c WHERE c.proposed_lead_id=l.id AND (c.review_state<>'owner_review' OR NOT ((c.geography_status='non_nevada' AND c.nta_review_state='not_applicable' AND btrim(coalesce(c.geography,''))<>'') OR (c.geography_status='nevada' AND c.nta_review_state='cleared'))))),'holdReasons',CASE WHEN l.history_state<>'clear' THEN jsonb_build_array('History review required') WHEN l.status IN ('Bounced','Opted out') THEN jsonb_build_array('Recipient suppressed') WHEN coalesce(l.next_step,'')='Monitor for reply; no further automated outreach' THEN jsonb_build_array('No further contact hold') WHEN l.email IS NULL OR btrim(l.email)='' THEN jsonb_build_array('Missing recipient email') WHEN EXISTS(SELECT 1 FROM crm_research_companies c WHERE c.proposed_lead_id=l.id AND (c.review_state<>'owner_review' OR NOT ((c.geography_status='non_nevada' AND c.nta_review_state='not_applicable' AND btrim(coalesce(c.geography,''))<>'') OR (c.geography_status='nevada' AND c.nta_review_state='cleared')))) THEN jsonb_build_array('Company geography, NTA or owner review hold') ELSE '[]'::jsonb END) ORDER BY cr.position) FROM crm_campaign_recipients cr JOIN crm_leads l ON l.id=cr.lead_id WHERE cr.draft_id=d.id),'[]'::jsonb) AS recipients FROM crm_campaign_drafts d WHERE d.id=$1`;
export async function getSendStatus(sql:SendSql,owner:string,draftId:string){
 const draft=(await sql.query(draftSendSql,[draftId]))[0]??null;
 const attempts=await sql.query(`SELECT a.id,a.draft_id AS "draftId",a.lead_id AS "leadId",a.draft_version AS "draftVersion",a.recipient_email AS "recipientEmail",coalesce(o.state,'unknown') AS state,o.provider_message_id AS "providerMessageId" FROM crm_send_attempts a JOIN crm_send_reviews r ON r.id=a.review_id LEFT JOIN LATERAL (SELECT state,provider_message_id FROM crm_send_outcomes WHERE attempt_id=a.id ORDER BY recorded_at DESC,id DESC LIMIT 1) o ON true WHERE r.owner_id=$1 AND (a.draft_id=$2 OR (coalesce(o.state,'unknown')='unknown' AND EXISTS(SELECT 1 FROM crm_campaign_recipients cr JOIN crm_leads l ON l.id=cr.lead_id WHERE cr.draft_id=$2 AND (l.id=a.lead_id OR lower(btrim(l.email))=a.recipient_email)))) ORDER BY a.claimed_at`,[owner,draftId]);
 const successfulBackup=(await sql.query("SELECT id,completed_at AS \"completedAt\" FROM crm_backup_runs WHERE trigger='pre_campaign' AND state='succeeded' AND btrim(coalesce(manifest_sha256,''))<>'' AND btrim(coalesce(destination,''))<>'' AND requested_at>=(SELECT updated_at FROM crm_campaign_drafts WHERE id=$1) AND completed_at>=(SELECT updated_at FROM crm_campaign_drafts WHERE id=$1) ORDER BY completed_at DESC LIMIT 1",[draftId]))[0]??null;
 return{draft,attempts,successfulBackup};
}
export async function createSendReview(sql:SendSql,owner:string,input:NonNullable<ReturnType<typeof validateSendReview>>){
 const draft=(await sql.query(draftSendSql,[input.draftId]))[0];if(!draft||draft.version!==input.messageVersion||draft.state!=="review_ready")throw new Error("review_conflict");
 const recipients=draft.recipients as Array<{leadId:string;email:string;eligible:boolean}>;
 if(!Array.isArray(recipients)||recipients.length!==input.contexts.length||recipients.some((r,i)=>!r.eligible||r.leadId!==input.contexts[i].leadId))throw new Error("review_conflict");
 const reviewed=recipients.map((r,i)=>({...input.contexts[i],email:r.email}));const id=randomUUID();
 await sql.query("SELECT crm_create_send_review($1,$2,$3,$4,$5::jsonb,$6) AS id",[id,owner,input.draftId,input.messageVersion,JSON.stringify(reviewed),input.backupRunId]);
 return{reviewId:id,snapshot:{draftId:input.draftId,messageVersion:input.messageVersion,from:SEND_FROM,recipients:recipients.map(r=>({leadId:r.leadId,to:r.email,subject:draft.subject,body:draft.body}))}};
}
async function reviewFor(sql:SendSql,owner:string,id:string){const row=(await sql.query("SELECT id,draft_id,draft_version,sender_alias,subject,body,recipients FROM crm_send_reviews WHERE id=$1 AND owner_id=$2",[id,owner]))[0];if(!row)throw new Error("review_missing");return row as unknown as Review;}
export async function runReviewedSend(sql:SendSql,owner:string,id:string,transport:SendTransport,enabled:()=>boolean,messageId:(attemptId:string)=>string){
 const review=await reviewFor(sql,owner,id);const attempts:Array<{id:string;draftId:string;leadId:string;draftVersion:string;recipientEmail:string;state:string;providerMessageId?:string}>=[];let stopped=false;
 for(const recipient of review.recipients){
  if(!enabled()){stopped=true;break;}
  const candidate=randomUUID();let claimed:Record<string,unknown>|undefined;
  try{claimed=(await sql.query("SELECT * FROM crm_claim_send_attempt($1,$2,$3,$4,$5)",[candidate,owner,id,recipient.leadId,messageId(candidate)]))[0];}catch{stopped=true;break;}
  if(!claimed||typeof claimed.attempt_id!=="string"){stopped=true;break;}
  const attemptId=claimed.attempt_id;
  if(claimed.result!=="created"){
   const existing=(await sql.query("SELECT state,provider_message_id FROM crm_send_outcomes WHERE attempt_id=$1 ORDER BY recorded_at DESC,id DESC LIMIT 1",[attemptId]))[0];const state=String(existing?.state??"unknown");attempts.push({id:attemptId,draftId:review.draft_id,leadId:recipient.leadId,draftVersion:review.draft_version,recipientEmail:recipient.email,state,providerMessageId:existing?.provider_message_id as string|undefined});
   if(state!=="sent"){stopped=true;break;}continue;
  }
  // Claim is durable before any provider action. There is no automatic retry or lease reclamation.
  let receipt:Receipt|undefined;let state="unknown";
  if(!enabled()){state="failed";try{await sql.query("SELECT crm_finish_send_attempt($1,$2,$3,$4,$5,$6,$7)",[randomUUID(),owner,attemptId,state,null,null,"disabled_before_send"]);}catch{state="unknown";}attempts.push({id:attemptId,draftId:review.draft_id,leadId:recipient.leadId,draftVersion:review.draft_version,recipientEmail:recipient.email,state});stopped=true;break;}
  try{receipt=await transport.send({attemptId,to:recipient.email,subject:review.subject,body:review.body});if(!receipt?.messageId)throw new Error("unconfirmed_provider_receipt");const settled=(await sql.query("SELECT crm_finish_send_attempt($1,$2,$3,$4,$5,$6,$7) AS state",[randomUUID(),owner,attemptId,"sent",receipt.messageId,receipt.threadId??null,"gmail_accepted"]))[0];state=["sent","failed","unknown"].includes(String(settled?.state))?String(settled!.state):"unknown";}
  catch{try{await sql.query("SELECT crm_finish_send_attempt($1,$2,$3,$4,$5,$6,$7)",[randomUUID(),owner,attemptId,"unknown",null,null,"provider_or_commit_unconfirmed"]);}catch{/* No outcome is also UNKNOWN, not retryable. */}}
  attempts.push({id:attemptId,draftId:review.draft_id,leadId:recipient.leadId,draftVersion:review.draft_version,recipientEmail:recipient.email,state,...(state==="sent"?{providerMessageId:receipt!.messageId}:{})});if(state!=="sent"){stopped=true;break;}
 }
 return{attempts,stopped,blocked:stopped&&attempts.length===0};
}
export async function reconcileReviewedSend(sql:SendSql,owner:string,id:string,transport:SendTransport){
 const a=(await sql.query("SELECT a.id,a.draft_id,a.lead_id,a.draft_version,a.recipient_email,r.subject,r.body,coalesce(o.state,'unknown') AS state,o.provider_message_id FROM crm_send_attempts a JOIN crm_send_reviews r ON r.id=a.review_id LEFT JOIN LATERAL (SELECT state,provider_message_id FROM crm_send_outcomes WHERE attempt_id=a.id ORDER BY recorded_at DESC,id DESC LIMIT 1) o ON true WHERE a.id=$1 AND r.owner_id=$2",[id,owner]))[0];if(!a)throw new Error("attempt_missing");if(a.state!=="unknown")return{attempt:{id,draftId:a.draft_id,leadId:a.lead_id,draftVersion:a.draft_version,recipientEmail:a.recipient_email,state:a.state,providerMessageId:a.provider_message_id}};
 const receipt=await transport.reconcile({attemptId:id,to:String(a.recipient_email),subject:String(a.subject),body:String(a.body)});if(!receipt)return{attempt:{id,draftId:a.draft_id,leadId:a.lead_id,draftVersion:a.draft_version,recipientEmail:a.recipient_email,state:"unknown"}};
 const settled=(await sql.query("SELECT crm_reconcile_send_attempt($1,$2,$3,$4,$5) AS state",[randomUUID(),owner,id,receipt.messageId,receipt.threadId??null]))[0];const state=["sent","failed","unknown"].includes(String(settled?.state))?String(settled!.state):"unknown";return{attempt:{id,draftId:a.draft_id,leadId:a.lead_id,draftVersion:a.draft_version,recipientEmail:a.recipient_email,state,...(state==="sent"?{providerMessageId:receipt.messageId}:{})}};
}
