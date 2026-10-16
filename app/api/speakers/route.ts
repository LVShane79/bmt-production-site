import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type ResponsePart = { type?: string; text?: string };
type ResponsesPayload = { output_text?: string; output?: { content?: ResponsePart[] }[] };

type Speaker = { brand: string; model: string; coverage: number; sensitivity: number; taps: number[]; impedance?: number; source?: string; sourceTitle?: string; note?: string };
type Amplifier = { brand:string; model:string; channels:number; power70v:number; minImpedance:number; lowZRatings:{ohms:number;watts:number}[]; source?:string; sourceTitle?:string; note?:string };

const systemPrompt = `You are an AV loudspeaker specification researcher. Extract one commercial ceiling loudspeaker model for a preliminary coverage and amplifier calculator. Prefer the current official manufacturer product page or manufacturer PDF. Never guess. Return ONLY a JSON object with these keys: brand (string), model (string), coverage (number, nominal conical coverage in degrees; for asymmetric coverage use the smaller angle), sensitivity (number, dB SPL 1W/1m or closest published equivalent), taps (ascending array of numeric 70.7 V transformer tap wattages), impedance (numeric nominal Low-Z/bypass impedance in ohms, or 8 if not offered), source (official URL), sourceTitle (short source label), note (short caveat). If required values are not published, return {"error":"specific explanation"}.`;
const amplifierPrompt = `You are a commercial AV power-amplifier specification researcher. Find the exact current amplifier model and prefer an official manufacturer product page or specification PDF. Never guess or combine variants. Return ONLY JSON with: brand (string), model (string), channels (number), power70v (numeric watts per channel in 70 V mode, 0 if unsupported), minImpedance (minimum supported Low-Z load in ohms), lowZRatings (array of objects {ohms,watts} for published per-channel continuous power at 2/4/8/16 ohms), source (official URL), sourceTitle (short label), note (qualifications such as channel count, bridge mode, or mutually exclusive operating modes). If neither 70 V nor Low-Z power is published, return {"error":"specific explanation"}.`;

function parseSpeaker(raw: string): Speaker {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("The AI response did not contain usable specification data.");
  const data = JSON.parse(match[0]);
  if (data.error) throw new Error(data.error);
  const speaker: Speaker = {
    brand: String(data.brand || "").trim(), model: String(data.model || "").trim(),
    coverage: Number(data.coverage), sensitivity: Number(data.sensitivity),
    taps: Array.isArray(data.taps) ? data.taps.map(Number).filter((n:number)=>Number.isFinite(n)&&n>0).sort((a:number,b:number)=>a-b) : [],
    impedance: Number(data.impedance || 8),
    source: data.source ? String(data.source) : undefined, sourceTitle: data.sourceTitle ? String(data.sourceTitle) : undefined,
    note: data.note ? String(data.note) : undefined,
  };
  if (!speaker.brand || !speaker.model || !speaker.coverage || !speaker.sensitivity || !speaker.taps.length) throw new Error("The source did not provide every value required by the calculator. Try a manufacturer specification sheet or manual entry.");
  return speaker;
}

function parseAmplifier(raw:string): Amplifier {
  const match = raw.match(/\{[\s\S]*\}/); if(!match) throw new Error("The AI response did not contain usable amplifier data.");
  const data = JSON.parse(match[0]); if(data.error) throw new Error(data.error);
  const lowZRatings = Array.isArray(data.lowZRatings) ? data.lowZRatings.map((rating: { ohms: unknown; watts: unknown })=>({ohms:Number(rating.ohms),watts:Number(rating.watts)})).filter((rating: { ohms: number; watts: number })=>rating.ohms>0&&rating.watts>0) : [];
  const amplifier:Amplifier = { brand:String(data.brand||"").trim(), model:String(data.model||"").trim(), channels:Number(data.channels||1), power70v:Number(data.power70v||0), minImpedance:Number(data.minImpedance||4), lowZRatings, source:data.source?String(data.source):undefined, sourceTitle:data.sourceTitle?String(data.sourceTitle):undefined, note:data.note?String(data.note):undefined };
  if(!amplifier.brand||!amplifier.model||(!amplifier.power70v&&!amplifier.lowZRatings.length)) throw new Error("The source did not provide usable amplifier output ratings.");
  return amplifier;
}

function outputText(response: ResponsesPayload) {
  if (typeof response.output_text === "string") return response.output_text;
  return (response.output || []).flatMap((item)=>item.content || []).filter((part)=>part.type==="output_text").map((part)=>part.text).join("\n");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI web lookup is not connected yet. PDF extraction and manual entry are available without an API key." }, { status: 503 });

  try {
    const body = await request.json();
    const kind = body.kind === "amplifier" ? "amplifier" : "speaker";
    const query = String(body.query || "").trim().slice(0, 180);
    if (!query) return NextResponse.json({ error: "Enter a manufacturer and model." }, { status: 400 });
    const tools = [{ type: "web_search", search_context_size: "medium" }];
    const input = `${kind === "amplifier" ? amplifierPrompt : systemPrompt}\nSearch for this exact ${kind}: ${query}. Use the official manufacturer source whenever possible.`;

    const apiResponse = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "authorization": `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model: "gpt-5.6-luna", reasoning: { effort: "low" }, tools, tool_choice: tools ? "required" : undefined, input, max_output_tokens: 900 }) });
    const data = await apiResponse.json();
    if (!apiResponse.ok) throw new Error(data?.error?.message || "OpenAI could not complete the lookup.");
    const raw = outputText(data);
    return kind === "amplifier" ? NextResponse.json({ amplifier:parseAmplifier(raw) }) : NextResponse.json({ speaker:parseSpeaker(raw) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The specification could not be processed." }, { status: 422 });
  }
}
