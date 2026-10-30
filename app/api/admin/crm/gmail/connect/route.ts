import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { ownerOrUnauthorized } from "../../../../../lib/admin-auth";
import { CRM_GMAIL_COOKIE, gmailConnectionConfigured, gmailSameOrigin, startGmailConnection } from "../../../../../lib/crm-gmail-oauth";
export const runtime="nodejs";export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
export async function POST(request:Request){const owner=await ownerOrUnauthorized();if(owner instanceof NextResponse)return owner;if(!gmailSameOrigin(request,process.env))return NextResponse.json({error:"Same-origin owner action required."},{status:403,headers});if(!gmailConnectionConfigured(process.env)||!process.env.DATABASE_URL)return NextResponse.json({error:"Gmail connection requires separately approved application configuration and owner authorization."},{status:503,headers});try{const result=await startGmailConnection(owner.userId,neon(process.env.DATABASE_URL),process.env);return NextResponse.json({authorizationUrl:result.url},{headers:{...headers,"Set-Cookie":`${CRM_GMAIL_COOKIE}=${result.browser}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=600`}});}catch{return NextResponse.json({error:"Gmail connection could not be started."},{status:503,headers});}}
