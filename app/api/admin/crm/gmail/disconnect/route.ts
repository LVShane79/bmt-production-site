import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { ownerOrUnauthorized } from "../../../../../lib/admin-auth";
import { disconnectGmail, gmailSameOrigin } from "../../../../../lib/crm-gmail-oauth";
export const runtime="nodejs";export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
export async function POST(request:Request){const owner=await ownerOrUnauthorized();if(owner instanceof NextResponse)return owner;if(!gmailSameOrigin(request,process.env))return NextResponse.json({error:"Same-origin owner action required."},{status:403,headers});if(!process.env.DATABASE_URL)return NextResponse.json({error:"Connection storage unavailable."},{status:503,headers});try{await disconnectGmail(owner.userId,neon(process.env.DATABASE_URL));return NextResponse.json({connected:false,message:"CRM connection removed. Revoke the app in Google Account permissions to revoke the Google grant too. In-flight sends may already have been accepted; reconcile their outcomes."},{headers});}catch{return NextResponse.json({error:"Disconnect was not confirmed. Disable sending and retry connection status."},{status:503,headers});}}
