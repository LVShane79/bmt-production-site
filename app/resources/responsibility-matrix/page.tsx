import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../../components/SiteShell";
import ResourceHero from "../components/ResourceHero";
import ResponsibilityMatrix from "./ResponsibilityMatrix";

export const metadata: Metadata = { title: "AV Scope Responsibility Matrix", description: "Assign commercial AV scope responsibilities across the owner, integrator, IT, electrical, architect, and general contractor." };
export default function ResponsibilityMatrixPage() {
  return <main><SiteHeader /><ResourceHero number="04" kicker="Coordination tool" title="AV Scope" emphasis="Responsibility Matrix." description="Assign the party responsible for each system, infrastructure, programming, coordination, testing, and turnover requirement before gaps become change orders." /><ResponsibilityMatrix /><SiteFooter /></main>;
}
