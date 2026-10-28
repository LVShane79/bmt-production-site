export const researchSignalTypes=["hiring","expansion","project","other"] as const;
export const evidenceConfidence=["low","medium","high"] as const;
export type ResearchSignalType=typeof researchSignalTypes[number];
export type EvidenceConfidence=typeof evidenceConfidence[number];
export type GeographyStatus="unknown"|"nevada"|"non_nevada";
export type NtaReviewState="unresolved"|"hold"|"not_applicable"|"cleared";
export type AiAssistStatus={enabled:false;reason:"configuration_required";provider:"none"};
export const aiAssistStatus:AiAssistStatus={enabled:false,reason:"configuration_required",provider:"none"};
const clean=(v:unknown,max:number)=>typeof v==="string"&&v.trim().length>0&&v.length<=max?v.trim():null;
export const normalizeResearchCompany=(value:string)=>value.toLowerCase().trim().replace(/[^a-z0-9]+/g," ").trim();
export function freshnessFor(fetchedAt:string,now=new Date()):"fresh"|"aging"|"stale"{const age=now.getTime()-new Date(fetchedAt).getTime();return age>90*864e5?"stale":age>30*864e5?"aging":"fresh";}
export function ntaState(geography:GeographyStatus):NtaReviewState{return geography==="non_nevada"?"not_applicable":"unresolved";}
export function hiringSignalNotice(signal:ResearchSignalType){return signal==="hiring"?"Hiring is a capacity signal, not proof of outsourcing demand.":null;}
export function validateManualEvidence(value:unknown){if(!value||typeof value!=="object")return null;const v=value as Record<string,unknown>;const canonicalUrl=clean(v.canonicalUrl,2048),publisher=clean(v.publisher,240),excerpt=clean(v.excerpt,4000),capacityHypothesis=clean(v.capacityHypothesis,1200),companyName=clean(v.companyName,200);const signalType=v.signalType as ResearchSignalType;const confidence=v.confidence as EvidenceConfidence;const geography=v.geography as GeographyStatus;if(!companyName||!canonicalUrl||!/^https:\/\//.test(canonicalUrl)||!publisher||!excerpt||!capacityHypothesis||!researchSignalTypes.includes(signalType)||!evidenceConfidence.includes(confidence)||!["unknown","nevada","non_nevada"].includes(geography))return null;const publishedAt=typeof v.publishedAt==="string"&&v.publishedAt?new Date(v.publishedAt):null;if(publishedAt&&Number.isNaN(publishedAt.getTime()))return null;return {companyName,canonicalCompany:normalizeResearchCompany(companyName),canonicalUrl,publisher,excerpt,capacityHypothesis,signalType,confidence,geography,publishedAt:publishedAt?.toISOString()??null,fetchedAt:new Date().toISOString()};}
/** Deterministic test adapter only; it never performs a network or model call. */
export function syntheticEvidence(input:{companyName:string;canonicalUrl:string}){return {companyName:input.companyName,canonicalUrl:input.canonicalUrl,publisher:"Synthetic test adapter",excerpt:"Synthetic fixture: verify against a real source before review.",capacityHypothesis:"Synthetic fixture only; no demand claim.",signalType:"other" as const,confidence:"low" as const,geography:"unknown" as const,publishedAt:null,fetchedAt:"2026-01-01T00:00:00.000Z"};}
