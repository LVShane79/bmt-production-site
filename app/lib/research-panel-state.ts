export type ResearchLoadState = "loading" | "ready" | "unavailable";
export function researchPanelView(state: ResearchLoadState, companyCount: number) { return { canWrite:state==="ready", showEmpty:state==="ready"&&companyCount===0, showLoading:state==="loading", showUnavailable:state==="unavailable" }; }
