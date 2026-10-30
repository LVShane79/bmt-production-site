import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { ownerOrUnauthorized } from "../../../../../lib/admin-auth";
import { getGmailConnectionStatus } from "../../../../../lib/crm-gmail-oauth";
export const runtime="nodejs";export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
export async function GET(){const owner=await ownerOrUnauthorized();if(owner instanceof NextResponse)return owner;if(!process.env.DATABASE_URL)return NextResponse.json({configured:false,connected:false,sendEnabled:false},{headers});try{return NextResponse.json(await getGmailConnectionStatus(owner.userId,neon(process.env.DATABASE_URL),process.env),{headers});}catch{return NextResponse.json({error:"Gmail connection status unavailable.",connected:false,sendEnabled:false},{status:503,headers});}}
