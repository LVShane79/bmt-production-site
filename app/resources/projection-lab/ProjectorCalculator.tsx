"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Projector = {
  brand: string; model: string; lumens: number; resolution: string;
  throwMin: number; throwMax: number; lens?: string;
  shiftVUp: number; shiftVDown: number; shiftH: number;
  source?: string; note?: string;
};
type CalculationMode = "screen" | "distance" | "fit";
type BrightnessMode = "rated" | "calibrated" | "measured";

const starterProjectors: Projector[] = [
  { brand: "Epson", model: "EB-PU1008B + ELPLM08", lumens: 8500, resolution: "WUXGA", throwMin: 1.44, throwMax: 2.32, lens: "ELPLM08", shiftVUp: 67, shiftVDown: 67, shiftH: 30, note: "Reference values — verify against current manufacturer documentation." },
  { brand: "Panasonic", model: "PT-REQ12 + ET-C1W300", lumens: 12000, resolution: "4K", throwMin: 1.36, throwMax: 2.10, lens: "ET-C1W300", shiftVUp: 50, shiftVDown: 50, shiftH: 24, note: "Reference values — verify against current manufacturer documentation." },
  { brand: "Christie", model: "4K13-HS + 1.2–1.5 lens", lumens: 13500, resolution: "4K UHD", throwMin: 1.20, throwMax: 1.50, lens: "1.2–1.5:1", shiftVUp: 55, shiftVDown: 55, shiftH: 20, note: "Reference values — verify against current manufacturer documentation." },
];

const ratios: Record<string, number> = { "16:9": 16 / 9, "16:10": 16 / 10, "4:3": 4 / 3, "21:9": 21 / 9, "2.39:1": 2.39 };
const screenPresets: Record<string, number[]> = {
  "16:9": [92, 100, 106, 110, 120, 123, 133, 135, 150, 159, 165, 180, 200],
  "16:10": [67, 76, 85, 94, 109, 113, 123, 137, 165, 189],
  "4:3": [72, 84, 100, 120, 150, 180, 200],
  "21:9": [120, 138, 150, 165, 180, 200, 220, 240],
  "2.39:1": [120, 138, 150, 165, 180, 200, 220, 240],
};
const presets: Record<string, { fc: number; label: string }> = {
  dark: { fc: 16, label: "Controlled light" },
  dim: { fc: 30, label: "Dim presentation" },
  normal: { fc: 50, label: "Typical conference" },
  bright: { fc: 80, label: "High ambient light" },
};
const brightnessZones = [
  { label: "Dark room", range: "14–22 fL" },
  { label: "Controlled", range: "22–40 fL" },
  { label: "Classroom", range: "40–70 fL" },
  { label: "Bright ambient", range: "70–100+ fL" },
];

function Field({ label, value, onChange, unit, step = 1, min = 0 }: { label: string; value: number; onChange: (value: number) => void; unit?: string; step?: number; min?: number }) {
  return <label className="field"><span>{label}</span><span className="input-wrap"><input type="number" value={value} step={step} min={min} onChange={(event) => onChange(Number(event.target.value))} />{unit && <b>{unit}</b>}</span></label>;
}

function filenameIdentity(filename: string) {
  const clean = filename.replace(/\.[^.]+$/, "").replace(/\b(spec(?:ification)?[\s_-]*sheet|datasheet|manual|brochure)\b/gi, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const parts = clean.split(" ");
  return { brand: parts.shift() || "Custom", model: parts.join(" ") || clean || "Imported projector" };
}

async function readSpecificationText(file: File) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return file.text();
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const content = await (await pdf.getPage(pageNumber)).getTextContent();
    pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
  }
  return pages.join("\n");
}

function extractProjectorFromText(text: string, filename: string): Projector | null {
  const flat = text.replace(/\u00a0/g, " ").replace(/\s+/g, " ");
  const identity = filenameIdentity(filename);
  const throwMatch = flat.match(/(?:throw\s+ratio|throw\s+distance\s+ratio)[^\d]{0,60}(\d(?:\.\d+)?)\s*(?:[-–—~to]+\s*)(\d(?:\.\d+)?)/i)
    || flat.match(/(\d(?:\.\d+)?)\s*(?:[-–—~to]+\s*)(\d(?:\.\d+)?)\s*:\s*1/i);
  const lumens = Number(flat.match(/(\d{1,3}(?:,\d{3})+|\d{4,6})\s*(?:ANSI|ISO|center)?\s*lumens?/i)?.[1]?.replaceAll(",", "") || 0);
  const resolution = flat.match(/\b(4K UHD|4K|WUXGA|WXGA|Full HD|1080p|XGA)\b/i)?.[1] || "Not published";
  const shiftV = Number(flat.match(/(?:vertical\s+lens\s+shift|lens\s+shift\s+vertical)[^\d]{0,45}(?:±|\+\/-)?\s*(\d{1,3}(?:\.\d+)?)\s*%/i)?.[1] || 0);
  const shiftH = Number(flat.match(/(?:horizontal\s+lens\s+shift|lens\s+shift\s+horizontal)[^\d]{0,45}(?:±|\+\/-)?\s*(\d{1,3}(?:\.\d+)?)\s*%/i)?.[1] || 0);
  if (!throwMatch || !lumens) return null;
  return {
    ...identity, lumens, resolution,
    throwMin: Number(throwMatch[1]), throwMax: Number(throwMatch[2]),
    lens: flat.match(/\b(?:lens\s+model|projection\s+lens)[^\w]{0,12}([A-Z]{2,6}[-\s]?[A-Z0-9]{3,12})\b/i)?.[1] || "From uploaded specification",
    shiftVUp: shiftV, shiftVDown: shiftV, shiftH,
    note: `Extracted locally from ${filename}. ${shiftV || shiftH ? "Review the parsed values" : "Lens-shift values were not found and are set to zero"} before final design.`,
  };
}

export default function ProjectorCalculator() {
  const [projector, setProjector] = useState(starterProjectors[0]);
  const [library, setLibrary] = useState(starterProjectors);
  const [aspect, setAspect] = useState("16:9");
  const [screenInput, setScreenInput] = useState(180);
  const [customSize, setCustomSize] = useState(false);
  const [projectionAlignment, setProjectionAlignment] = useState<"bottom" | "center" | "top" | "manual">("center");
  const [gain, setGain] = useState(1);
  const [ambient, setAmbient] = useState("normal");
  const [lightLoss, setLightLoss] = useState(25);
  const [screenBottom, setScreenBottom] = useState(3);
  const [manualLensHeight, setManualLensHeight] = useState(8);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [calculationMode, setCalculationMode] = useState<CalculationMode>("screen");
  const [mountDistance, setMountDistance] = useState(24);
  const [knownDistance, setKnownDistance] = useState(24);
  const [selectedThrow, setSelectedThrow] = useState(1.88);
  const [chassisDepth, setChassisDepth] = useState(2.3);
  const [lensInset, setLensInset] = useState(.15);
  const [serviceClearance, setServiceClearance] = useState(1);
  const [brightnessMode, setBrightnessMode] = useState<BrightnessMode>("calibrated");
  const [measuredLumens, setMeasuredLumens] = useState(6500);
  const [brightnessUnit, setBrightnessUnit] = useState<"fL" | "nits">("fL");
  const [shortlist, setShortlist] = useState<Projector[]>([]);
  const [constraints, setConstraints] = useState({ minDistance: "", maxDistance: "", screen: "180", resolution: "WUXGA or better", mounting: "Ceiling", connections: "" });
  const [dialog, setDialog] = useState(false);
  const [dialogTab, setDialogTab] = useState<"ai" | "upload" | "manual">("ai");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<Projector[]>([]);
  const [manual, setManual] = useState<Projector>({ brand: "Custom", model: "Projector + lens", lumens: 8000, resolution: "WUXGA", throwMin: 1.2, throwMax: 2.0, lens: "Manual entry", shiftVUp: 50, shiftVDown: 50, shiftH: 20, note: "Manually entered values — verify against current manufacturer documentation." });
  const [shareLabel, setShareLabel] = useState("Share design");

  useEffect(() => {
    const encoded = new URL(location.href).searchParams.get("design");
    if (!encoded) return;
    try {
      const saved = JSON.parse(atob(encoded));
      // Shared designs are intentionally restored after mount because the URL is browser-only state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved.aspect in ratios) setAspect(saved.aspect);
      [["screenInput", setScreenInput], ["gain", setGain], ["lightLoss", setLightLoss], ["screenBottom", setScreenBottom], ["horizontalOffset", setHorizontalOffset]].forEach(([key, setter]) => {
        const value = saved[key as string];
        if (typeof value === "number" && Number.isFinite(value)) (setter as (number: number) => void)(value);
      });
      if (typeof saved.screenInput === "number" && !screenPresets[saved.aspect || "16:9"]?.includes(saved.screenInput)) setCustomSize(true);
      if (["bottom", "center", "top"].includes(saved.projectionAlignment)) setProjectionAlignment(saved.projectionAlignment);
      if (saved.ambient in presets) setAmbient(saved.ambient);
      if (saved.projector?.brand && saved.projector?.model) activateProjector(saved.projector, false);
    } catch {
      // Ignore malformed shared-state URLs and keep the calculator defaults.
    }
  }, []);

  const calc = useMemo(() => {
    const ratio = ratios[aspect];
    const widthToDiagonal = Math.sqrt(ratio * ratio + 1) / ratio;
    const safeThrow = Math.min(projector.throwMax, Math.max(projector.throwMin, selectedThrow));
    const diagonalFt = calculationMode === "distance" ? (knownDistance / safeThrow) * widthToDiagonal : screenInput / 12;
    const width = diagonalFt * ratio / Math.sqrt(ratio * ratio + 1);
    const height = width / ratio;
    const minDistance = projector.throwMin * width;
    const maxDistance = projector.throwMax * width;
    const selectedDistance = calculationMode === "screen" ? Math.min(maxDistance, Math.max(minDistance, mountDistance)) : knownDistance;
    const requiredThrow = selectedDistance / width;
    const throwPosition = projector.throwMax === projector.throwMin ? 0 : (requiredThrow - projector.throwMin) / (projector.throwMax - projector.throwMin);
    const possibleDiagonalMin = knownDistance / projector.throwMax * widthToDiagonal;
    const possibleDiagonalMax = knownDistance / projector.throwMin * widthToDiagonal;
    const area = width * height;
    const deliveredLumens = brightnessMode === "rated" ? projector.lumens : brightnessMode === "measured" ? measuredLumens : projector.lumens * (1 - lightLoss / 100);
    const footLamberts = deliveredLumens * gain / area;
    const nits = footLamberts * 3.426;
    const targetFc = presets[ambient].fc;
    const requiredLumens = targetFc * area / Math.max(gain, .1);
    const lensHeight = projectionAlignment === "bottom" ? screenBottom : projectionAlignment === "top" ? screenBottom + height : projectionAlignment === "manual" ? manualLensHeight : screenBottom + height / 2;
    const imageCenter = screenBottom + height / 2;
    const verticalShift = ((lensHeight - imageCenter) / height) * 100;
    const horizontalShift = (horizontalOffset / width) * 100;
    const shiftFit = verticalShift <= projector.shiftVUp && verticalShift >= -projector.shiftVDown && Math.abs(horizontalShift) <= projector.shiftH;
    const lensHeightMin = imageCenter - height * projector.shiftVDown / 100;
    const lensHeightMax = imageCenter + height * projector.shiftVUp / 100;
    const horizontalLimit = width * projector.shiftH / 100;
    const rearFaceDistance = selectedDistance + Math.max(0, chassisDepth - lensInset);
    const clearanceDistance = rearFaceDistance + serviceClearance;
    const distanceFit = requiredThrow >= projector.throwMin && requiredThrow <= projector.throwMax;
    return { width, height, diagonalFt, minDistance, maxDistance, selectedDistance, requiredThrow, throwPosition, possibleDiagonalMin, possibleDiagonalMax, lensHeight, lensHeightMin, lensHeightMax, horizontalLimit, area, deliveredLumens, footLamberts, nits, requiredLumens, verticalShift, horizontalShift, shiftFit, distanceFit, rearFaceDistance, clearanceDistance };
  }, [aspect, screenInput, projector, lightLoss, gain, ambient, screenBottom, projectionAlignment, manualLensHeight, horizontalOffset, calculationMode, mountDistance, knownDistance, selectedThrow, chassisDepth, lensInset, serviceClearance, brightnessMode, measuredLumens]);

  async function search() {
    if (!query.trim()) return;
    setSearching(true); setMessage(""); setResults([]);
    try {
      const response = await fetch("/api/projectors", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query, constraints }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResults(data.projectors || (data.projector ? [data.projector] : []));
    } catch (error) { setMessage(error instanceof Error ? error.message : "The lookup failed."); }
    finally { setSearching(false); }
  }

  async function importSpecification(file?: File) {
    if (!file) return;
    setSearching(true); setMessage(""); setResults([]);
    try {
      const extracted = extractProjectorFromText(await readSpecificationText(file), file.name);
      if (!extracted) throw new Error("I could not confidently find both rated lumens and a throw-ratio range. Try the projector/lens specification sheet, or use manual entry.");
      setResults([extracted]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "The specification sheet could not be read."); }
    finally { setSearching(false); }
  }

  function activateProjector(next: Projector, closeDialog = true) {
    setProjector(next);
    setSelectedThrow((value) => Math.min(next.throwMax, Math.max(next.throwMin, value)));
    setLibrary((current) => current.some((item) => item.brand === next.brand && item.model === next.model) ? current : [...current, next]);
    if (closeDialog) setDialog(false);
  }

  async function share() {
    const url = new URL(location.href);
    url.searchParams.set("design", btoa(JSON.stringify({ aspect, screenInput, projectionAlignment, gain, ambient, lightLoss, screenBottom, horizontalOffset, projector })));
    await navigator.clipboard.writeText(url.toString());
    setShareLabel("Link copied");
    setTimeout(() => setShareLabel("Share design"), 1800);
  }

  function toggleShortlist(next: Projector) {
    setShortlist((current) => current.some((item) => item.brand === next.brand && item.model === next.model && item.lens === next.lens)
      ? current.filter((item) => !(item.brand === next.brand && item.model === next.model && item.lens === next.lens))
      : [...current.slice(-3), next]);
  }

  const brightnessFit = calc.deliveredLumens >= calc.requiredLumens;
  const brightnessPosition = Math.min(100, Math.max(0, calc.footLamberts / 100 * 100));
  const brightnessClass = calc.footLamberts < 22 ? "Dark room" : calc.footLamberts < 40 ? "Controlled presentation" : calc.footLamberts < 70 ? "Classroom / meeting room" : "Bright ambient light";
  const projectorLeft = Math.min(43, Math.max(8, 55 - calc.selectedDistance * 1.35));
  const projectorTop = projectionAlignment === "top" ? 23 : projectionAlignment === "bottom" ? 73 : 48;
  const beamScreenTop = 22;
  const beamScreenBottom = 78;

  function chooseAspect(nextAspect: string) {
    setAspect(nextAspect);
    const sizes = screenPresets[nextAspect];
    if (!customSize && !sizes.includes(screenInput)) setScreenInput(sizes[Math.min(5, sizes.length - 1)]);
  }

  function stepScreen(amount: number) {
    setCustomSize(true);
    setScreenInput((current) => Math.max(24, Math.min(2400, current + amount)));
  }

  return <main className="projection-lab">
    <header className="topbar">
      <a className="brand" href="/resources"><Image src="/bmt-logo-white.png" alt="Black Mountain Technologies" width={420} height={116} priority /><span>Projection Lab</span></a>
      <nav><a href="/resources">Resources</a><a href="#calculator">Calculator</a><a href="#brightness">Brightness</a><a href="#method">Method</a></nav>
      <div className="header-actions"><button className="share" onClick={() => window.print()}>Print design</button><button className="share" onClick={share}>{shareLabel} <span>↗</span></button></div>
    </header>

    <section className="hero">
      <div><p className="eyebrow">BMT / Preliminary projection design</p><h1>Get the image on the wall.<br /><em>Before the ceiling closes.</em></h1><p className="lede">Solve screen geometry, throw distance, lens range, shift, and usable brightness in one deliberately practical workspace.</p></div>
      <div className="hero-signal"><span>SELECTED LENS THROW RANGE</span><strong>{projector.throwMin.toFixed(2)}–{projector.throwMax.toFixed(2)}</strong><small>: 1</small><div className="meter"><i style={{ width: `${Math.min(100, projector.throwMax / 3 * 100)}%` }} /></div></div>
    </section>

    {shortlist.length > 0 && <section className="compare-section">
      <div className="section-title compact"><p className="eyebrow dark">Shortlist</p><h2>Compare the physics.</h2><p>Same screen, room, and loss assumptions. No star ratings, no affiliate nonsense.</p></div>
        <div className="compare-grid">{shortlist.map((item) => {
        const min = item.throwMin * calc.width, max = item.throwMax * calc.width;
        const lumens = brightnessMode === "measured" && item.model === projector.model ? measuredLumens : brightnessMode === "calibrated" ? item.lumens * (1 - lightLoss / 100) : item.lumens;
        const fl = lumens * gain / calc.area;
        return <article key={`${item.brand}-${item.model}-${item.lens}`}><button className="remove" onClick={() => toggleShortlist(item)}>×</button><span>{item.brand}</span><h3>{item.model}</h3><p>{item.lens || "Integrated lens"}</p><dl><div><dt>Throw</dt><dd>{min.toFixed(1)}–{max.toFixed(1)} ft</dd></div><div><dt>Light</dt><dd>{fl.toFixed(0)} fL</dd></div><div><dt>Shift</dt><dd>+{item.shiftVUp}/−{item.shiftVDown}% V</dd></div></dl><button className="secondary" onClick={() => activateProjector(item, false)}>Make active</button></article>;
      })}</div>
    </section>}

    <section className="projector-source">
      <div><span className="selection-label">Active projector + lens</span><strong>{projector.brand} <b>{projector.model}</b></strong><small>{projector.lumens.toLocaleString()} lm · {projector.throwMin.toFixed(2)}–{projector.throwMax.toFixed(2)}:1 · {projector.resolution}</small></div>
      <button className="primary" onClick={() => setDialog(true)}>Find projector or lens <span>↗</span></button>
    </section>

    <section className="workspace" id="calculator">
      <aside className="card controls">
        <div className="card-head"><span>01</span><div><p>Define the image</p><h2>Screen geometry</h2></div></div>
        <div className="mode-picker" aria-label="Calculation mode">
          <button className={calculationMode === "screen" ? "active" : ""} onClick={() => setCalculationMode("screen")}><b>I know the screen</b><small>Find mounting range</small></button>
          <button className={calculationMode === "distance" ? "active" : ""} onClick={() => setCalculationMode("distance")}><b>I know the distance</b><small>Find image sizes</small></button>
          <button className={calculationMode === "fit" ? "active" : ""} onClick={() => setCalculationMode("fit")}><b>I know both</b><small>Check lens fit</small></button>
        </div>
        <label className="field"><span>Aspect ratio</span><select value={aspect} onChange={(event) => chooseAspect(event.target.value)}>{Object.keys(ratios).map((item) => <option key={item}>{item}</option>)}</select></label>
        {calculationMode !== "distance" && <label className="field"><span>Image diagonal</span>{customSize || !screenPresets[aspect].includes(screenInput) ? <><span className="size-picker custom-size"><button type="button" onClick={() => stepScreen(-1)} aria-label="Decrease diagonal by one inch">−</button><span className="custom-number"><input type="number" min="24" max="2400" step="1" value={screenInput} onFocus={(event) => event.currentTarget.select()} onChange={(event) => setScreenInput(Number(event.target.value))} onBlur={() => setScreenInput((value) => Math.max(24, Math.min(2400, value || 24)))} aria-label="Custom image diagonal" /><b>″ diagonal</b></span><button type="button" onClick={() => stepScreen(1)} aria-label="Increase diagonal by one inch">+</button></span><button type="button" className="preset-return" onClick={() => { setCustomSize(false); setScreenInput(screenPresets[aspect][screenPresets[aspect].length - 1]); }}>← Back to common sizes</button></> : <span className="size-picker"><button type="button" onClick={() => stepScreen(-1)} aria-label="Decrease diagonal by one inch">−</button><select value={screenInput} onInput={(event) => event.currentTarget.value === "custom" && setCustomSize(true)} onChange={(event) => { if (event.target.value === "custom") setCustomSize(true); else setScreenInput(Number(event.target.value)); }} aria-label="Common image diagonal">{screenPresets[aspect].map((size) => <option value={size} key={size}>{size}″ diagonal</option>)}<option value="custom">Custom size…</option></select><button type="button" onClick={() => stepScreen(1)} aria-label="Increase diagonal by one inch">+</button></span>}</label>}
        {calculationMode !== "screen" && <Field label="Known lens-to-screen distance" value={knownDistance} onChange={setKnownDistance} unit="ft" step={.1} min={.1} />}
        {calculationMode === "distance" && <label className="range-field"><span>Throw position across lens range <b>{selectedThrow.toFixed(2)}:1</b></span><input type="range" min={projector.throwMin} max={projector.throwMax} step=".01" value={selectedThrow} onChange={(event) => setSelectedThrow(Number(event.target.value))} /><small>Possible image diagonal: {(calc.possibleDiagonalMin * 12).toFixed(0)}–{(calc.possibleDiagonalMax * 12).toFixed(0)}″</small></label>}
        <p className="preset-note">Common nominal sizes from current Da-Lite, Draper, and Stewart tables. Use − / + for a custom diagonal.</p>
        <div className="two"><Field label="Screen bottom AFF" value={screenBottom} onChange={setScreenBottom} unit="ft" step={.1} /><Field label="Screen gain" value={gain} onChange={setGain} step={.1} /></div>
        <div className="spec-strip"><span>Image width <b>{calc.width.toFixed(1)} ft</b></span><span>Image height <b>{calc.height.toFixed(1)} ft</b></span></div>
      </aside>

      <section className="card visual">
        <div className="card-head"><span>02</span><div><p>Verify the geometry</p><h2>Throw + optical axis</h2></div><div className={`status-pill ${calc.shiftFit ? "pass" : "review"}`}>{calc.shiftFit ? "Geometry passes" : "Review lens shift"}</div></div>
        <div className="projection-stage">
          <div className="ceiling-line" />
          <div className="projector-rig" style={{ left: `${projectorLeft}%`, top: `${projectorTop}%` }}><div className="projector-body"><i /></div><span>LENS CL · {projectionAlignment.toUpperCase()}</span></div>
          <div className="beam" style={{ clipPath: `polygon(${projectorLeft}% ${projectorTop - .7}%, 92% ${beamScreenTop}%, 92% ${beamScreenBottom}%, ${projectorLeft}% ${projectorTop + .7}%)` }} />
          <div className="screen-wall" />
          <div className="shift-envelope"><span>SHIFT ENVELOPE</span></div>
          <div className="screen-label"><span>{aspect} IMAGE</span><b>{(calc.diagonalFt * 12).toFixed(0)}″ DIAGONAL</b><small>{calc.width.toFixed(1)} FT W × {calc.height.toFixed(1)} FT H</small></div>
          <div className="dimension throw-dimension" style={{ left: `${projectorLeft}%` }}><i /><span>{calc.minDistance.toFixed(1)}–{calc.maxDistance.toFixed(1)} ft lens-to-screen</span><i /></div>
        </div>
        <div className="geometry-controls">
          <div className="calculated-field"><span>{calculationMode === "distance" ? "Possible image diagonal" : "Calculated distance range"}</span><strong>{calculationMode === "distance" ? `${(calc.possibleDiagonalMin * 12).toFixed(0)}–${(calc.possibleDiagonalMax * 12).toFixed(0)}″` : `${calc.minDistance.toFixed(1)}–${calc.maxDistance.toFixed(1)} ft`}</strong><em>{calculationMode === "fit" ? `Required ratio ${calc.requiredThrow.toFixed(2)}:1 · ${calc.distanceFit ? "fits" : "outside lens range"}` : "Image width × lens throw range"}</em></div>
          <label className="field"><span>Projection alignment</span><select value={projectionAlignment} onChange={(event) => setProjectionAlignment(event.target.value as "bottom" | "center" | "top" | "manual")}><option value="bottom">Bottom of screen</option><option value="center">Screen center</option><option value="top">Top of screen</option><option value="manual">Manual lens center AFF</option></select></label>
          {projectionAlignment === "manual" && <Field label="Lens center AFF" value={manualLensHeight} onChange={setManualLensHeight} unit="ft" step={.1} />}
          <Field label="Horizontal offset" value={horizontalOffset} onChange={setHorizontalOffset} unit="ft" step={.1} />
        </div>
        {calculationMode === "screen" && <label className="range-field mount-range"><span>Selected mounting distance <b>{calc.selectedDistance.toFixed(1)} ft</b></span><input type="range" min={calc.minDistance} max={calc.maxDistance} step=".1" value={calc.selectedDistance} onChange={(event) => setMountDistance(Number(event.target.value))} /><small>{Math.max(0, calc.selectedDistance - calc.minDistance).toFixed(1)} ft from wide end · {Math.max(0, calc.maxDistance - calc.selectedDistance).toFixed(1)} ft from long end</small></label>}
        <div className="engineering-grid">
          <div><span>Lens center envelope</span><b>{calc.lensHeightMin.toFixed(1)}–{calc.lensHeightMax.toFixed(1)} ft AFF</b><small>Selected: {calc.lensHeight.toFixed(1)} ft</small></div>
          <div><span>Horizontal envelope</span><b>±{calc.horizontalLimit.toFixed(1)} ft</b><small>Selected: {horizontalOffset.toFixed(1)} ft</small></div>
          <div><span>Throw position</span><b>{Math.max(0, Math.min(100, calc.throwPosition * 100)).toFixed(0)}% across range</b><small>{calc.requiredThrow.toFixed(2)}:1 required</small></div>
          <div><span>Rear clearance line</span><b>{calc.clearanceDistance.toFixed(1)} ft from screen</b><small>Rear face at {calc.rearFaceDistance.toFixed(1)} ft</small></div>
        </div>
        <details className="body-details"><summary>Projector body + service assumptions</summary><div className="three"><Field label="Chassis depth" value={chassisDepth} onChange={setChassisDepth} unit="ft" step={.05} /><Field label="Lens inset" value={lensInset} onChange={setLensInset} unit="ft" step={.05} /><Field label="Rear clearance" value={serviceClearance} onChange={setServiceClearance} unit="ft" step={.1} /></div></details>
        <div className="metric-row">
          <article><span>Lens throw range</span><strong>{projector.throwMin.toFixed(2)}–{projector.throwMax.toFixed(2)}<small>:1</small></strong><em>Selected projector + lens</em></article>
          <article><span>Distance range</span><strong>{calc.minDistance.toFixed(1)}–{calc.maxDistance.toFixed(1)}<small> ft</small></strong><em>Driven by {calc.width.toFixed(1)} ft image width</em></article>
          <article><span>Lens shift</span><strong>{Math.abs(calc.verticalShift).toFixed(0)}% <small>V</small></strong><em>{Math.abs(calc.horizontalShift).toFixed(0)}% H · {calc.shiftFit ? "within range" : "outside range"}</em></article>
        </div>
      </section>
    </section>

    <section className="brightness" id="brightness">
      <div className="section-title"><p className="eyebrow dark">03 / Light budget</p><h2>Brightness that survives<br />the actual room.</h2><p>Manufacturer lumens are the beginning of the conversation, not the end. Apply system loss, screen gain, and ambient-light intent here.</p></div>
      <div className="brightness-grid">
        <div className="card brightness-controls">
          <div className="mode-picker brightness-modes"><button className={brightnessMode === "rated" ? "active" : ""} onClick={() => setBrightnessMode("rated")}><b>Rated</b><small>Nameplate output</small></button><button className={brightnessMode === "calibrated" ? "active" : ""} onClick={() => setBrightnessMode("calibrated")}><b>Estimated</b><small>Apply system loss</small></button><button className={brightnessMode === "measured" ? "active" : ""} onClick={() => setBrightnessMode("measured")}><b>Measured</b><small>Field value</small></button></div>
          <label className="field"><span>Ambient-light condition</span><select value={ambient} onChange={(event) => setAmbient(event.target.value)}>{Object.entries(presets).map(([key, item]) => <option value={key} key={key}>{item.label} · {item.fc} fL target</option>)}</select></label>
          {brightnessMode === "calibrated" && <Field label="Calibration + optical + aging loss" value={lightLoss} onChange={setLightLoss} unit="%" />}
          {brightnessMode === "measured" && <Field label="Measured usable lumens" value={measuredLumens} onChange={setMeasuredLumens} unit="lm" step={100} />}
          <div className="unit-toggle"><span>Display luminance</span><button className={brightnessUnit === "fL" ? "active" : ""} onClick={() => setBrightnessUnit("fL")}>fL</button><button className={brightnessUnit === "nits" ? "active" : ""} onClick={() => setBrightnessUnit("nits")}>nits</button></div>
          <div className="loss-note">Delivered light budget: <b>{calc.deliveredLumens.toLocaleString(undefined, { maximumFractionDigits: 0 })} lumens</b></div>
        </div>
        <article className="brightness-result"><span>CALCULATED SCREEN LUMINANCE</span><strong>{brightnessUnit === "fL" ? calc.footLamberts.toFixed(0) : calc.nits.toFixed(0)}</strong><small>{brightnessUnit}</small><p><b>{brightnessClass}.</b> {brightnessFit ? "Above" : "Below"} the {brightnessUnit === "fL" ? presets[ambient].fc : Math.round(presets[ambient].fc * 3.426)} {brightnessUnit} preliminary target for {presets[ambient].label.toLowerCase()}.</p><div className={`status ${brightnessFit ? "pass" : "review"}`}><i />{brightnessFit ? "BRIGHTNESS MARGIN AVAILABLE" : "MORE LIGHT OR LESS IMAGE AREA REQUIRED"}</div></article>
        <div className="card requirement-card"><span>Required projector output</span><strong>{Math.ceil(calc.requiredLumens / 100) * 100}<small> lm</small></strong><p>Before the {lightLoss}% loss allowance, this design needs roughly {Math.ceil(calc.requiredLumens / (1 - lightLoss / 100) / 100) * 100} rated lumens.</p><div className="load-bar"><i style={{ width: `${Math.min(100, calc.requiredLumens / Math.max(calc.deliveredLumens, 1) * 100)}%` }} /></div></div>
        <div className="brightness-benchmark">
          <div className="benchmark-head"><span>Screen-brightness benchmark</span><b>{calc.footLamberts.toFixed(0)} fL delivered</b></div>
          <div className="benchmark-track">{brightnessZones.map((zone) => <div key={zone.label}><span>{zone.label}</span><small>{zone.range}</small></div>)}<i style={{ left: `${brightnessPosition}%` }}><b>{calc.footLamberts.toFixed(0)}</b></i></div>
          <p>Calculated from {calc.deliveredLumens.toLocaleString(undefined, { maximumFractionDigits: 0 })} delivered lumens, {calc.area.toFixed(0)} ft² of image area, and {gain.toFixed(1)} screen gain.</p>
        </div>
      </div>
    </section>

    <section className="method" id="method"><div><p className="eyebrow dark">Design notes</p><h2>Useful math.<br />Not a stamped drawing.</h2></div><div className="method-list">
      <article><b>01</b><h3>Throw is lens-to-screen</h3><p>Use optical distance, not room length. Account for wall build-outs, lens position within the chassis, and mounting hardware.</p></article>
      <article><b>02</b><h3>Shift is not magic</h3><p>Published shift limits can shrink when horizontal and vertical shift are combined. Confirm the exact lens and manufacturer shift chart.</p></article>
      <article><b>03</b><h3>Light needs margin</h3><p>Real systems lose output to calibration, aging, optics, and ambient light. This tool exposes the allowance instead of pretending physics is optional.</p></article>
    </div></section>

    <section className="print-report">
      <h1>BMT Projection Lab · Preliminary Design</h1><p className="print-subtitle">{projector.brand} {projector.model} · {projector.lens}</p>
      <div className="print-grid"><div><span>Image</span><b>{(calc.diagonalFt * 12).toFixed(0)}″ · {aspect}</b><small>{calc.width.toFixed(2)} ft W × {calc.height.toFixed(2)} ft H</small></div><div><span>Lens-to-screen</span><b>{calc.selectedDistance.toFixed(2)} ft</b><small>Allowable {calc.minDistance.toFixed(2)}–{calc.maxDistance.toFixed(2)} ft</small></div><div><span>Required throw</span><b>{calc.requiredThrow.toFixed(2)}:1</b><small>{calc.distanceFit ? "Within published range" : "Outside published range"}</small></div><div><span>Lens center</span><b>{calc.lensHeight.toFixed(2)} ft AFF</b><small>Envelope {calc.lensHeightMin.toFixed(2)}–{calc.lensHeightMax.toFixed(2)} ft</small></div><div><span>Screen luminance</span><b>{calc.footLamberts.toFixed(1)} fL / {calc.nits.toFixed(0)} nits</b><small>{calc.deliveredLumens.toFixed(0)} usable lm · gain {gain.toFixed(1)}</small></div><div><span>Rear service line</span><b>{calc.clearanceDistance.toFixed(2)} ft</b><small>Measured from screen face</small></div></div>
      <h2>Assumptions</h2><p>{brightnessMode === "rated" ? "Manufacturer-rated light output used." : brightnessMode === "measured" ? "User-measured usable light output used." : `${lightLoss}% calibration, optical, and aging loss applied.`} Throw distances are measured from the projector lens reference plane to the screen image plane.</p>
      <p className="print-warning">Preliminary design only. Verify lens compatibility, combined-axis shift limits, chassis dimensions, installation orientation, and current manufacturer specifications before construction.</p>
    </section>
    <footer><strong>BMT PROJECTION LAB</strong><p>For preliminary design and coordination only. Confirm final geometry, lens compatibility, brightness, orientation, and shift limits with current manufacturer documentation.</p></footer>

    {dialog && <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setDialog(false)}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="find-title">
      <button className="close" onClick={() => setDialog(false)} aria-label="Close">×</button>
      <div className="dialog-title"><p className="eyebrow dark">Projector + lens specifications</p><h2 id="find-title">Choose equipment data</h2><p>Research a model, drop in a specification sheet, or enter known parameters manually.</p></div>
      <div className="tabs"><button className={dialogTab === "ai" ? "active" : ""} onClick={() => { setDialogTab("ai"); setMessage(""); setResults([]); }}>AI research</button><button className={dialogTab === "upload" ? "active" : ""} onClick={() => { setDialogTab("upload"); setMessage(""); setResults([]); }}>Spec sheet</button><button className={dialogTab === "manual" ? "active" : ""} onClick={() => { setDialogTab("manual"); setMessage(""); setResults([]); }}>Manual entry</button></div>
      <div className="dialog-body">
        {dialogTab === "ai" && <><label className="search-box"><span>Manufacturer, projector, lens, or requirement</span><div><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && search()} placeholder="e.g. Epson, an 8K-lumen classroom projector, or EB-PU2010 at 1.3:1" /><button onClick={search} disabled={searching}>{searching ? "Researching…" : "Search with AI"}</button></div></label><div className="constraint-grid"><label><span>Screen diagonal</span><input value={constraints.screen} onChange={(event) => setConstraints({ ...constraints, screen: event.target.value })} placeholder="180 in" /></label><label><span>Minimum throw</span><input value={constraints.minDistance} onChange={(event) => setConstraints({ ...constraints, minDistance: event.target.value })} placeholder="18 ft" /></label><label><span>Maximum throw</span><input value={constraints.maxDistance} onChange={(event) => setConstraints({ ...constraints, maxDistance: event.target.value })} placeholder="30 ft" /></label><label><span>Resolution</span><input value={constraints.resolution} onChange={(event) => setConstraints({ ...constraints, resolution: event.target.value })} /></label><label><span>Mounting</span><select value={constraints.mounting} onChange={(event) => setConstraints({ ...constraints, mounting: event.target.value })}><option>Ceiling</option><option>Floor / table</option><option>Rear projection</option><option>Portrait</option></select></label><label><span>Required connections</span><input value={constraints.connections} onChange={(event) => setConstraints({ ...constraints, connections: event.target.value })} placeholder="HDBaseT, SDI…" /></label></div><p className="hint">The search uses these room constraints to return engineering-fit combinations and flag conflicts. Confirm the final choice in current manufacturer documentation—because the useful number may still be hiding on page 73.</p></>}
        {dialogTab === "upload" && <label className="upload"><input type="file" accept=".pdf,.txt,application/pdf,text/plain" onChange={(event) => importSpecification(event.target.files?.[0])} /><span className="upload-mark">↓</span><h3>{searching ? "Reading specification…" : "Drop in a projector or lens spec sheet"}</h3><p>PDF or text · processed locally in this browser</p><span className="upload-button">Choose specification</span></label>}
        {dialogTab === "manual" && <div className="manual-grid">
          <label><span>Manufacturer</span><input value={manual.brand} onChange={(event) => setManual({ ...manual, brand: event.target.value })} /></label>
          <label><span>Projector model</span><input value={manual.model} onChange={(event) => setManual({ ...manual, model: event.target.value })} /></label>
          <label><span>Lens model</span><input value={manual.lens} onChange={(event) => setManual({ ...manual, lens: event.target.value })} /></label>
          <label><span>Resolution</span><input value={manual.resolution} onChange={(event) => setManual({ ...manual, resolution: event.target.value })} /></label>
          <label><span>Rated output · lm</span><input type="number" min="1" value={manual.lumens} onChange={(event) => setManual({ ...manual, lumens: Number(event.target.value) })} /></label>
          <label><span>Minimum throw ratio</span><input type="number" min=".01" step=".01" value={manual.throwMin} onChange={(event) => setManual({ ...manual, throwMin: Number(event.target.value) })} /></label>
          <label><span>Maximum throw ratio</span><input type="number" min=".01" step=".01" value={manual.throwMax} onChange={(event) => setManual({ ...manual, throwMax: Number(event.target.value) })} /></label>
          <label><span>Vertical shift up · %</span><input type="number" min="0" value={manual.shiftVUp} onChange={(event) => setManual({ ...manual, shiftVUp: Number(event.target.value) })} /></label>
          <label><span>Vertical shift down · %</span><input type="number" min="0" value={manual.shiftVDown} onChange={(event) => setManual({ ...manual, shiftVDown: Number(event.target.value) })} /></label>
          <label><span>Horizontal shift · ±%</span><input type="number" min="0" value={manual.shiftH} onChange={(event) => setManual({ ...manual, shiftH: Number(event.target.value) })} /></label>
          <button className="primary wide" onClick={() => activateProjector(manual)} disabled={!manual.brand || !manual.model || manual.throwMin <= 0 || manual.throwMax < manual.throwMin || manual.lumens <= 0}>Use manual parameters <span>→</span></button>
        </div>}
        {message && <div className="message">{message}</div>}
        {results.length > 0 && <div className="search-results"><span className="selection-label">{dialogTab === "upload" ? "Extracted specification" : `${results.length} researched option${results.length === 1 ? "" : "s"}`}</span>{results.map((result) => <article className="search-result" key={`${result.brand}-${result.model}-${result.lens}`}><h3>{result.brand} <b>{result.model}</b></h3><div className="result-specs"><span>Output<b>{result.lumens.toLocaleString()} lm</b></span><span>Throw range<b>{result.throwMin}–{result.throwMax}:1</b></span><span>Lens<b>{result.lens || "Integrated"}</b></span><span>Shift<b>+{result.shiftVUp}/−{result.shiftVDown}% V · ±{result.shiftH}% H</b></span></div><p>{result.note}</p>{result.source && <a href={result.source} target="_blank" rel="noreferrer">Open manufacturer source ↗</a>}<div className="result-actions"><button className="primary" onClick={() => activateProjector(result)}>Use this combination <span>→</span></button><button className="secondary" onClick={() => toggleShortlist(result)}>{shortlist.some((item) => item.brand === result.brand && item.model === result.model && item.lens === result.lens) ? "Remove from compare" : "Add to compare"}</button></div></article>)}</div>}
        <div className="library"><span className="selection-label">Reference library</span>{library.map((item) => <button key={`${item.brand}-${item.model}`} className={item.model === projector.model ? "selected" : ""} onClick={() => activateProjector(item)}><b>{item.brand}</b><span>{item.model}</span><em>{item.throwMin}–{item.throwMax}:1</em></button>)}</div>
      </div>
    </section></div>}
  </main>;
}
