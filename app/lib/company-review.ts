export type CompanyGeographyStatus="unknown"|"nevada"|"non_nevada";
export type CompanyNtaDecision="unresolved"|"hold"|"not_applicable"|"cleared";
export type CompanyReviewState="research"|"owner_review"|"rejected";

const text=(value:unknown,max:number)=>typeof value==="string"&&value.trim().length>0&&value.trim().length<=max?value.trim():null;
const oneOf=<T extends readonly string[]>(value:unknown,values:T):value is T[number]=>typeof value==="string"&&values.includes(value);

export type CompanyReview={id:string;expectedVersion:string;geography:string;geographyStatus:CompanyGeographyStatus;ntaReviewState:CompanyNtaDecision;reviewState:CompanyReviewState;rationale:string};

/** Owner decisions are deliberately explicit.  Neither a source acceptance nor a
 * geography guess can turn a company into an attachable campaign recipient. */
export function validateCompanyReview(value:unknown):CompanyReview|null{
 if(!value||typeof value!=="object")return null;
 const input=value as Record<string,unknown>;
 const id=text(input.id,120),expectedVersion=text(input.expectedVersion,80),geography=text(input.geography,240),rationale=text(input.rationale,2000);
 const geographyStatus=input.geographyStatus,ntaReviewState=input.ntaReviewState,reviewState=input.reviewState;
 if(!id||!expectedVersion||!geography||!rationale||!oneOf(geographyStatus,["unknown","nevada","non_nevada"] as const)||!oneOf(ntaReviewState,["unresolved","hold","not_applicable","cleared"] as const)||!oneOf(reviewState,["research","owner_review","rejected"] as const))return null;
 // Unknown geography is not a clearance. Nevada requires a deliberate clearance;
 // a held or rejected company is kept visibly non-attachable.
 if((geographyStatus==="unknown"||geographyStatus==="nevada")&&ntaReviewState==="not_applicable")return null;
 if(ntaReviewState==="cleared"&&geographyStatus!=="nevada")return null;
 if(ntaReviewState==="not_applicable"&&geographyStatus!=="non_nevada")return null;
 if(reviewState==="owner_review"&&!((geographyStatus==="nevada"&&ntaReviewState==="cleared")||(geographyStatus==="non_nevada"&&ntaReviewState==="not_applicable")))return null;
 return {id,expectedVersion,geography,geographyStatus,ntaReviewState,reviewState,rationale};
}

export function companyHoldReasons(company:{geography_status:string;nta_review_state:string;review_state:string;review_rationale?:string|null}){
 const reasons:string[]=[];
 if(company.review_state!=="owner_review")reasons.push(company.review_state==="rejected"?"Company research was rejected by the owner.":"Company needs an owner company review.");
 if(company.geography_status==="unknown")reasons.push("Geography is unknown; NTA clearance cannot be inferred.");
 if(company.nta_review_state==="unresolved")reasons.push("NTA decision is unresolved.");
 if(company.nta_review_state==="hold")reasons.push("NTA review is explicitly on hold.");
 return reasons;
}
