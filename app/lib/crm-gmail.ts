import { createHash } from "node:crypto";
export const CRM_GMAIL_FROM = "info@blackmountain.tech";
export const CRM_GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.readonly"] as const;
export type GmailMessage = {attemptId:string;to:string;subject:string;body:string};
export type GmailReceipt = {messageId:string;threadId:string|null};
export type GmailFetch = typeof fetch;
const noControl = (s:string) => !/[\u0000-\u001f\u007f]/.test(s);
export function validGmailAddress(value:unknown):value is string {return typeof value==="string"&&value.length<=254&&noControl(value)&&/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(value);}
export function gmailMessageId(attemptId:string){if(!/^[A-Za-z0-9_-]{1,160}$/.test(attemptId))throw Error("Invalid attempt identity");return `<crm-${createHash("sha256").update(attemptId).digest("hex")}@blackmountain.tech>`;}
export function normalizeGmailBody(body:string){return body.replace(/\r\n?/g,"\n");}
export function validateGmailMessage(m:GmailMessage){if(!validGmailAddress(m.to)||typeof m.subject!=="string"||!m.subject.trim()||m.subject.length>240||!noControl(m.subject)||typeof m.body!=="string"||!m.body.trim()||m.body.length>8000||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(m.body))throw Error("Invalid reviewed message");gmailMessageId(m.attemptId);}
export function renderGmailMessage(m:GmailMessage){validateGmailMessage(m);const chars=Array.from(m.subject);const words:string[]=[];for(let i=0;i<chars.length;i+=10)words.push(`=?UTF-8?B?${Buffer.from(chars.slice(i,i+10).join("")).toString("base64")}?=`);const subject=words.join("\r\n ");const body=Buffer.from(normalizeGmailBody(m.body),"utf8").toString("base64").match(/.{1,76}/g)?.join("\r\n")??"";return Buffer.from([`From: ${CRM_GMAIL_FROM}`,`To: ${m.to}`,`Subject: ${subject}`,`Message-ID: ${gmailMessageId(m.attemptId)}`,"MIME-Version: 1.0","Content-Type: text/plain; charset=UTF-8","Content-Transfer-Encoding: base64","",body].join("\r\n"),"utf8").toString("base64url");}
export function gmailContentHash(m:GmailMessage){validateGmailMessage(m);return createHash("sha256").update(JSON.stringify([CRM_GMAIL_FROM,m.to,m.subject,normalizeGmailBody(m.body)])).digest("hex");}
/** No retry: once POST begins every non-receipt is an unknown outcome. */
export function createGmailTransport(accessToken:string,fetcher:GmailFetch=fetch){
 const headers={Authorization:`Bearer ${accessToken}`};
 async function json(url:string,init:RequestInit={}){const r=await fetcher(url,{...init,headers:{...headers,...init.headers},redirect:"error",signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error("Gmail request was not confirmed");return await r.json();}
 return {
  async send(message:GmailMessage):Promise<GmailReceipt>{const raw=renderGmailMessage(message);const r=await json("https://gmail.googleapis.com/gmail/v1/users/me/messages/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({raw})});if(typeof r.id!=="string"||!r.id||r.id.length>256)throw Error("Gmail receipt was not confirmed");return {messageId:r.id,threadId:typeof r.threadId==="string"?r.threadId:null};},
  async reconcile(message:GmailMessage):Promise<GmailReceipt|null>{validateGmailMessage(message);const q=`in:sent rfc822msgid:${gmailMessageId(message.attemptId)}`;const list=await json(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=SENT&q=${encodeURIComponent(q)}`);if(list.nextPageToken||!Array.isArray(list.messages)||list.messages.length!==1)return null;const id=list.messages[0]?.id;if(typeof id!=="string"||!id)return null;const r=await json(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}?format=full`);if(!Array.isArray(r.labelIds)||!r.labelIds.includes("SENT")||r.id!==id)return null;const p=r.payload;if(!p||p.mimeType!=="text/plain"||p.parts?.length||!Array.isArray(p.headers)||typeof p.body?.data!=="string")return null;
   const header=(name:string)=>{const a=p.headers.filter((h:{name?:string})=>h.name?.toLowerCase()===name.toLowerCase());return a.length===1&&typeof a[0].value==="string"?a[0].value:null;};
   const decodeSubject=(s:string|null)=>{if(s===null)return null;return s.replace(/(\?=)\s+(?==\?UTF-8\?B\?)/gi,"$1").replace(/=\?UTF-8\?B\?([A-Za-z0-9+/=]+)\?=/gi,(_all,b)=>Buffer.from(b,"base64").toString("utf8"));};
   if(header("Message-ID")!==gmailMessageId(message.attemptId)||header("From")!==CRM_GMAIL_FROM||header("To")!==message.to||decodeSubject(header("Subject"))!==message.subject||header("Bcc")!==null||header("Cc")!==null)return null;
   if(normalizeGmailBody(Buffer.from(p.body.data,"base64url").toString("utf8"))!==normalizeGmailBody(message.body))return null;return {messageId:id,threadId:typeof r.threadId==="string"?r.threadId:null};
  }
 };
}
