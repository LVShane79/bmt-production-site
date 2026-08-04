import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const prompt = `You are a helpful commercial projection equipment researcher for preliminary AV design. Prefer official manufacturer product pages, lens calculators, manuals, and specification PDFs. Never guess, mix variants, or claim compatibility without an official source.

Interpret the request conversationally:
- If it names an exact projector and lens, return one verified combination.
- If it names a projector but no lens, return 2–4 verified compatible lens combinations spanning useful throw-ratio ranges. In each note, explain whether the lens is short, standard, middle, or long throw and what geometry would narrow the choice.
- If it names only a manufacturer or a broad need, return 3–5 current projector-series starting points organized by brightness, resolution, and installation scale. Pair each with a defensible compatible standard lens or its integrated lens so the option can be loaded into the calculator. In each note, briefly explain where that projector family fits and what would narrow the selection next.
- When a projector has an integrated lens, identify it as integrated rather than inventing a lens model.
- Treat supplied room constraints as engineering requirements. Prefer combinations whose throw range, resolution, mounting orientation, and connections fit; explicitly flag any conflict or item that still requires verification in the note.

Return ONLY JSON as {"options":[...]} with 1–5 option objects. Every option must contain: brand (string), model (projector model only), lumens (numeric ISO/center/ANSI lumens; use the manufacturer's main published value), resolution (string), throwMin (number), throwMax (number), lens (selected compatible lens model or "Integrated"), shiftVUp (maximum upward vertical lens shift as percent of image height), shiftVDown (maximum downward shift as percent of image height), shiftH (maximum left/right horizontal shift as percent of image width), source (official URL), note (a concise lineup or lens-positioning blurb plus caveats). If no defensible current combination can be sourced, return {"error":"specific explanation and the missing detail needed to continue"}.`;

function outputText(response: any) {
  if (typeof response.output_text === "string") return response.output_text;
  return (response.output || []).flatMap((item: any) => item.content || []).filter((part: any) => part.type === "output_text").map((part: any) => part.text).join("\n");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  try {
    const body = await request.json();
    const query = String(body.query || "").trim().slice(0, 220);
    const constraints = body.constraints && typeof body.constraints === "object"
      ? Object.entries(body.constraints).filter(([, value]) => String(value || "").trim()).map(([key, value]) => `${key}: ${String(value).slice(0, 80)}`).join("; ")
      : "";
    if (!query) return NextResponse.json({ error: "Enter a projector, lens, or design requirement." }, { status: 400 });
    if (!apiKey) {
      const response = await fetch("https://bmt-projection-lab.lvshane79.chatgpt.site/api/projectors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query, constraints: body.constraints }),
      });
      return new NextResponse(await response.text(), {
        status: response.status,
        headers: { "content-type": response.headers.get("content-type") || "application/json" },
      });
    }
    const tools = [{ type: "web_search", search_context_size: "medium" }];
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-5.6-luna", reasoning: { effort: "low" }, tools, tool_choice: "required", input: `${prompt}\nResearch request: ${query}\nRoom constraints: ${constraints || "none supplied"}`, max_output_tokens: 2400 }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || "The research request could not be completed.");
    const match = outputText(data).match(/\{[\s\S]*\}/);
    if (!match) throw new Error("The AI response did not contain usable specification data.");
    const result = JSON.parse(match[0]);
    if (result.error) throw new Error(result.error);
    const rawOptions = Array.isArray(result.options) ? result.options : [result];
    const projectors = rawOptions.slice(0, 5).map((item: any) => ({
      brand: String(item.brand || "").trim(), model: String(item.model || "").trim(),
      lumens: Number(item.lumens), resolution: String(item.resolution || "Not published"),
      throwMin: Number(item.throwMin), throwMax: Number(item.throwMax), lens: String(item.lens || ""),
      shiftVUp: Number(item.shiftVUp), shiftVDown: Number(item.shiftVDown), shiftH: Number(item.shiftH),
      source: String(item.source || ""), note: String(item.note || "Verify all values against the current manufacturer lens manual."),
    })).filter((item: any) => item.brand && item.model && item.lumens && item.throwMin && item.throwMax);
    if (!projectors.length) throw new Error("The official sources did not provide a complete projector and lens option.");
    return NextResponse.json({ projector: projectors[0], projectors });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The specification could not be processed." }, { status: 422 });
  }
}
