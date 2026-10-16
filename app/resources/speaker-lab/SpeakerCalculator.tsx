"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";

type Speaker = {
  brand: string;
  model: string;
  coverage: number;
  sensitivity: number;
  taps: number[];
  impedance?: number;
  source?: string;
  sourceTitle?: string;
  note?: string;
};

const starterSpeakers: Speaker[] = [
  { brand: "JBL", model: "Control 26CT", coverage: 110, sensitivity: 89, taps: [7.5, 15, 30, 60], impedance: 8, note: "Starter reference — verify against current manufacturer data." },
  { brand: "QSC", model: "AD-C820", coverage: 90, sensitivity: 91, taps: [12.5, 25, 50, 100], impedance: 8, note: "Starter reference — verify against current manufacturer data." },
  { brand: "SoundTube", model: "CM800i", coverage: 100, sensitivity: 90, taps: [4, 8, 16, 32, 64], impedance: 8, note: "Starter reference — verify against current manufacturer data." },
];

type Amplifier = { brand: string; model: string; channels: number; power70v: number; minImpedance: number; lowZRatings: { ohms: number; watts: number }[]; source?: string; sourceTitle?: string; note?: string };
const starterAmplifier: Amplifier = { brand: "Custom", model: "Power amplifier", channels: 2, power70v: 500, minImpedance: 4, lowZRatings: [{ ohms: 8, watts: 250 }, { ohms: 4, watts: 500 }] };

type FieldProps = { label: string; value: number; onChange: (n: number) => void; unit?: string; step?: number; min?: number; max?: number };
function Field({ label, value, onChange, unit, step = 1, min = 0, max }: FieldProps) {
  return <label className="field"><span>{label}</span><span className="input-wrap"><input type="number" value={value} step={step} min={min} max={max} onChange={e => onChange(Number(e.target.value))}/>{unit && <b>{unit}</b>}</span></label>;
}

function parseTaps(value: string) {
  return value.split(/[,\s/]+/).map(Number).filter(n => Number.isFinite(n) && n > 0).sort((a,b) => a-b);
}

function splColor(value: number, target: number) {
  const difference = value - target;
  if (difference < -8) return "#2e6ca4";
  if (difference < -3) return "#43a4a0";
  if (difference < 2) return "#75b86f";
  if (difference < 6) return "#d5ba54";
  if (difference < 10) return "#cc7b38";
  return "#b94b45";
}

type SpeakerPosition = { x: number; y: number };
type SharedProject = {
  v: 1;
  speaker: Speaker;
  amplifier: Amplifier;
  tap: number;
  room: { length: number; width: number; ceiling: number; ear: number };
  spl: { target: number; loss: number; headroom: number };
  layout: { positions: SpeakerPosition[] };
  system: {
    mode: "70v" | "lowz";
    ampWatts: number;
    speakerOhms: number;
    channels: number;
    speakersPerChannel: number;
    loadLimit: number;
    cableLength: number;
    wireR: number;
  };
};

function arrangedPositions(count: number): SpeakerPosition[] {
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const itemsInRow = Math.min(columns, count - row * columns);
    return { x: ((column + 1) / (itemsInRow + 1)) * 100, y: ((row + 1) / (rows + 1)) * 100 };
  });
}

function encodeProject(project: SharedProject) {
  const bytes = new TextEncoder().encode(JSON.stringify(project));
  let binary = "";
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeProject(value: string): SharedProject {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function filenameIdentity(filename: string) {
  const clean = filename.replace(/\.[^.]+$/, "").replace(/\b(spec(?:ification)?[\s_-]*sheet|datasheet|data[\s_-]*sheet|product[\s_-]*data)\b/gi, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const parts = clean.split(" ");
  return { brand: parts.shift() || "Custom", model: parts.join(" ") || clean || "Imported speaker" };
}

function extractSpeakerFromText(text: string, filename: string): Speaker | null {
  const flat = text.replace(/\u00a0/g, " ").replace(/\s+/g, " ");
  const identity = filenameIdentity(filename);
  const coveragePatterns = [
    /(?:nominal\s+)?coverage(?:\s+angle|\s+pattern)?[^\d]{0,45}(\d{2,3}(?:\.\d+)?)\s*(?:°|degrees?)/i,
    /(\d{2,3}(?:\.\d+)?)\s*(?:°|degrees?)\s+(?:conical|coverage)/i,
  ];
  const sensitivityPatterns = [
    /sensitivity[^\d]{0,45}(\d{2,3}(?:\.\d+)?)\s*dB/i,
    /(\d{2,3}(?:\.\d+)?)\s*dB[^.]{0,35}(?:1\s*W\s*\/\s*1\s*m|SPL)/i,
  ];
  const coverage = Number(coveragePatterns.map(pattern => flat.match(pattern)?.[1]).find(Boolean) || 0);
  const sensitivity = Number(sensitivityPatterns.map(pattern => flat.match(pattern)?.[1]).find(Boolean) || 0);
  const voltageIndex = flat.search(/70(?:\.7)?\s*V/i);
  const tapWindow = voltageIndex >= 0 ? flat.slice(Math.max(0, voltageIndex - 100), voltageIndex + 700) : flat;
  const tapMatches = [...tapWindow.matchAll(/(?:^|[^\d.])(\d{1,3}(?:\.\d+)?)\s*W\b/gi)].map(match => Number(match[1])).filter(value => value > 0 && value <= 500);
  const taps = [...new Set(tapMatches)].sort((a,b)=>a-b).slice(0, 10);
  if (!coverage || !sensitivity || !taps.length) return null;
  const impedance = Number(flat.match(/(?:nominal\s+)?impedance[^\d]{0,30}(\d{1,2}(?:\.\d+)?)\s*(?:Ω|ohms?)/i)?.[1] || 8);
  return { ...identity, coverage, sensitivity, taps, impedance, sourceTitle: filename, note: "Extracted locally from the selected specification sheet. Review each value against the manufacturer document before final design." };
}

function parseRatings(value: string) {
  return value.split(/[,;]+/).map(item => item.trim().match(/(\d+(?:\.\d+)?)\s*(?:Ω|ohms?)?\s*[:=@/-]\s*(\d+(?:\.\d+)?)/i)).filter(Boolean).map(match => ({ ohms: Number(match![1]), watts: Number(match![2]) })).filter(rating => rating.ohms > 0 && rating.watts > 0).sort((a,b)=>b.ohms-a.ohms);
}

function extractAmplifierFromText(text: string, filename: string): Amplifier | null {
  const flat = text.replace(/\u00a0/g, " ").replace(/\s+/g, " ");
  const identity = filenameIdentity(filename);
  const channels = Number(flat.match(/(\d{1,2})\s*[- ]?channel/i)?.[1] || 2);
  const power70v = Number(flat.match(/(?:70(?:\.7)?\s*V)[^\d]{0,60}(\d{2,5})\s*W/i)?.[1] || flat.match(/(\d{2,5})\s*W[^.]{0,60}70(?:\.7)?\s*V/i)?.[1] || 0);
  const lowZRatings = [...flat.matchAll(/(2|4|8|16)\s*(?:Ω|ohms?)[^\d]{0,45}(\d{2,5})\s*W/gi)].map(match => ({ ohms:Number(match[1]), watts:Number(match[2]) })).filter((rating,index,array)=>array.findIndex(item=>item.ohms===rating.ohms)===index).sort((a,b)=>b.ohms-a.ohms);
  const minImpedance = lowZRatings.length ? Math.min(...lowZRatings.map(rating=>rating.ohms)) : Number(flat.match(/minimum\s+(?:load\s+)?impedance[^\d]{0,30}(\d+(?:\.\d+)?)\s*(?:Ω|ohms?)/i)?.[1] || 4);
  if (!power70v && !lowZRatings.length) return null;
  return { ...identity, channels, power70v, minImpedance, lowZRatings, sourceTitle: filename, note:"Extracted locally from the amplifier specification sheet. Confirm channel, load, and operating-mode qualifications in the manufacturer document." };
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
    pages.push(content.items.map(item => "str" in item ? item.str : "").join(" "));
  }
  return pages.join("\n");
}

export default function SpeakerCalculator() {
  const [speaker, setSpeaker] = useState<Speaker>(starterSpeakers[0]);
  const [library, setLibrary] = useState<Speaker[]>(starterSpeakers);
  const [tap, setTap] = useState(30);
  const [roomL, setRoomL] = useState(40);
  const [roomW, setRoomW] = useState(30);
  const [ceiling, setCeiling] = useState(14);
  const [ear, setEar] = useState(5);
  const [target, setTarget] = useState(85);
  const [loss, setLoss] = useState(1.1);
  const [headroom, setHeadroom] = useState(3);
  const [ampWatts, setAmpWatts] = useState(500);
  const [amplifier, setAmplifier] = useState<Amplifier>(starterAmplifier);
  const [systemMode, setSystemMode] = useState<"70v"|"lowz">("70v");
  const [speakerOhms, setSpeakerOhms] = useState(8);
  const [channels, setChannels] = useState(2);
  const [speakersPerChannel, setSpeakersPerChannel] = useState(4);
  const [loadLimit, setLoadLimit] = useState(80);
  const [cableLength, setCableLength] = useState(300);
  const [wireR, setWireR] = useState(1.8);
  const [layoutCount, setLayoutCount] = useState(4);
  const [positions, setPositions] = useState<SpeakerPosition[]>(arrangedPositions(4));
  const [ampPickerOpen, setAmpPickerOpen] = useState(false);
  const [ampMode, setAmpMode] = useState<"search"|"sheet"|"manual">("search");
  const [ampQuery, setAmpQuery] = useState("");
  const [ampResult, setAmpResult] = useState<Amplifier | null>(null);
  const [ampMessage, setAmpMessage] = useState("");
  const [ampManual, setAmpManual] = useState({ brand:"", model:"", channels:"2", power70v:"500", minImpedance:"4", ratings:"8:250, 4:500" });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mode, setMode] = useState<"search"|"sheet"|"manual">("search");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [result, setResult] = useState<Speaker | null>(null);
  const [manual, setManual] = useState({ brand: "", model: "", coverage: "90", sensitivity: "90", taps: "7.5, 15, 30, 60", impedance: "8" });
  const fileRef = useRef<HTMLInputElement>(null);
  const ampFileRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const draggedSpeakerRef = useRef<number | null>(null);

  useEffect(() => {
    // Restore browser-only saved state after mount, preserving server render defaults.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { const saved = localStorage.getItem("bmt-speaker-library"); if (saved) setLibrary(JSON.parse(saved)); } catch {}
    try {
      const encodedProject = new URLSearchParams(location.search).get("project");
      if (!encodedProject) return;
      const project = decodeProject(encodedProject);
      if (project.v !== 1 || !project.speaker?.model || !project.amplifier?.model || !Array.isArray(project.layout?.positions)) return;
      const sharedPositions = project.layout.positions.slice(0, 24).map(position => ({
        x: Math.max(0, Math.min(100, Number(position.x))),
        y: Math.max(0, Math.min(100, Number(position.y))),
      })).filter(position => Number.isFinite(position.x) && Number.isFinite(position.y));
      setSpeaker(project.speaker);
      setLibrary(current => [project.speaker, ...current.filter(item => `${item.brand}|${item.model}` !== `${project.speaker.brand}|${project.speaker.model}`)]);
      setAmplifier(project.amplifier);
      setTap(Number(project.tap));
      setRoomL(Number(project.room.length));
      setRoomW(Number(project.room.width));
      setCeiling(Number(project.room.ceiling));
      setEar(Number(project.room.ear));
      setTarget(Number(project.spl.target));
      setLoss(Number(project.spl.loss));
      setHeadroom(Number(project.spl.headroom));
      setPositions(sharedPositions.length ? sharedPositions : arrangedPositions(1));
      setLayoutCount(Math.max(1, sharedPositions.length));
      setSystemMode(project.system.mode === "lowz" ? "lowz" : "70v");
      setAmpWatts(Number(project.system.ampWatts));
      setSpeakerOhms(Number(project.system.speakerOhms));
      setChannels(Number(project.system.channels));
      setSpeakersPerChannel(Number(project.system.speakersPerChannel));
      setLoadLimit(Number(project.system.loadLimit));
      setCableLength(Number(project.system.cableLength));
      setWireR(Number(project.system.wireR));
    } catch {
      // Ignore malformed or incomplete shared links and retain safe defaults.
    }
  }, []);

  const calc = useMemo(() => {
    const height = Math.max(.1, ceiling - ear);
    const radius = height * Math.tan((speaker.coverage / 2) * Math.PI / 180);
    const area = Math.PI * radius * radius * .75;
    const count = Math.max(1, Math.ceil((roomL * roomW) / Math.max(area, .1)));
    const distanceM = height / 3.28084;
    const centerSpl = speaker.sensitivity + 10 * Math.log10(Math.max(tap, .01)) - 20 * Math.log10(distanceM) - loss;
    const maxTap = ampWatts * (loadLimit / 100) / Math.max(1, speakersPerChannel);
    const channelLoad = tap * speakersPerChannel;
    const totalLoad = channelLoad * channels;
    const reserve = ampWatts - channelLoad;
    const z = channelLoad ? (70.7 ** 2) / channelLoad : 0;
    const loopR = 2 * cableLength * wireR / 1000;
    const cableDb = z ? 20 * Math.log10(z / (z + loopR)) : 0;
    const lowZLoad = speakerOhms / Math.max(1, speakersPerChannel);
    const maxParallelSpeakers = Math.max(1, Math.floor(speakerOhms / Math.max(amplifier.minImpedance,.1)));
    const wattsPerSpeaker = ampWatts / Math.max(1, speakersPerChannel);
    return { height, radius, count, centerSpl, maxTap, channelLoad, totalLoad, reserve, cableDb, lowZLoad, maxParallelSpeakers, wattsPerSpeaker };
  }, [speaker, tap, roomL, roomW, ceiling, ear, loss, ampWatts, loadLimit, speakersPerChannel, channels, cableLength, wireR, speakerOhms, amplifier.minImpedance]);

  const pass = systemMode === "70v" ? calc.channelLoad <= ampWatts * loadLimit / 100 : calc.lowZLoad >= amplifier.minImpedance;
  const predictionGrid = useMemo(() => {
    const columns = 17, rows = 11;
    return Array.from({ length: columns * rows }, (_, index) => {
      const x = (index % columns) * roomL / (columns - 1);
      const y = Math.floor(index / columns) * roomW / (rows - 1);
      const energy = positions.reduce((sum, position) => {
        const speakerX = position.x / 100 * roomL;
        const speakerY = position.y / 100 * roomW;
        const horizontal = Math.hypot(x - speakerX, y - speakerY);
        const distanceM = Math.max(.1, Math.hypot(horizontal, calc.height) / 3.28084);
        const radiusRatio = horizontal / Math.max(calc.radius, .1);
        const directivityLoss = radiusRatio <= 1 ? 6 * radiusRatio * radiusRatio : 6 + 18 * (radiusRatio - 1);
        const level = speaker.sensitivity + 10 * Math.log10(Math.max(tap, .01)) - 20 * Math.log10(distanceM) - loss - directivityLoss;
        return sum + Math.pow(10, level / 10);
      }, 0);
      return 10 * Math.log10(Math.max(energy, .000001));
    });
  }, [positions, roomL, roomW, calc.height, calc.radius, speaker.sensitivity, tap, loss]);
  const setSpeakerCount = (count: number) => {
    const safeCount = Math.max(1, Math.min(24, Math.round(count || 1)));
    setLayoutCount(safeCount);
    setPositions(arrangedPositions(safeCount));
  };
  const changeSpeakerCount = (delta: number) => {
    const nextCount = Math.max(1, Math.min(24, layoutCount + delta));
    if (nextCount === layoutCount) return;
    setLayoutCount(nextCount);
    setPositions(current => delta > 0 ? [...current, { x: 50, y: 50 }] : current.slice(0, nextCount));
  };
  const moveSpeakerTo = (index: number, clientX: number, clientY: number) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setPositions(current => current.map((position, positionIndex) => positionIndex === index ? { x, y } : position));
  };
  useEffect(() => {
    const moveDraggedSpeaker = (event: PointerEvent) => {
      if (draggedSpeakerRef.current === null || !mapRef.current) return;
      event.preventDefault();
      const rect = mapRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
      const draggedIndex = draggedSpeakerRef.current;
      setPositions(current => current.map((position, index) => index === draggedIndex ? { x, y } : position));
    };
    const stopDragging = () => { draggedSpeakerRef.current = null; };
    window.addEventListener("pointermove", moveDraggedSpeaker, { passive: false });
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      window.removeEventListener("pointermove", moveDraggedSpeaker);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, []);
  const chooseSpeaker = (next: Speaker) => {
    const normalized = { ...next, coverage: Number(next.coverage), sensitivity: Number(next.sensitivity), impedance: Number(next.impedance || 8), taps: next.taps.map(Number).filter(Boolean).sort((a,b)=>a-b) };
    setSpeaker(normalized);
    setSpeakerOhms(normalized.impedance || 8);
    setTap(normalized.taps[Math.min(2, normalized.taps.length - 1)] || 1);
    const nextLibrary = [normalized, ...library.filter(s => `${s.brand} ${s.model}`.toLowerCase() !== `${normalized.brand} ${normalized.model}`.toLowerCase())].slice(0, 20);
    setLibrary(nextLibrary);
    localStorage.setItem("bmt-speaker-library", JSON.stringify(nextLibrary));
    setPickerOpen(false); setResult(null); setMessage("");
  };

  async function aiSearch() {
    if (!query.trim()) return;
    setBusy(true); setMessage(""); setResult(null);
    try {
      const response = await fetch("/api/speakers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search could not be completed.");
      setResult(data.speaker);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Search could not be completed."); }
    finally { setBusy(false); }
  }

  async function importSheet(file?: File) {
    if (!file) return;
    setBusy(true); setMessage(""); setResult(null);
    try {
      if (file.size > 30_000_000) throw new Error("Choose a specification sheet smaller than 30 MB.");
      let text = "";
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        text = await readSpecificationText(file);
      } else {
        text = await file.text();
      }
      const extracted = extractSpeakerFromText(text, file.name);
      if (extracted) setResult(extracted);
      else {
        const identity = filenameIdentity(file.name);
        setManual({ brand: identity.brand, model: identity.model, coverage: "", sensitivity: "", taps: "", impedance: "8" });
        setMode("manual");
        setMessage("The document opened successfully, but one or more required values could not be identified reliably. Enter the missing coverage, sensitivity, and tap values from the sheet.");
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "The specification sheet could not be read."); }
    finally { setBusy(false); }
  }

  function addManual() {
    const next: Speaker = { brand: manual.brand.trim() || "Custom", model: manual.model.trim() || "Untitled speaker", coverage: Number(manual.coverage), sensitivity: Number(manual.sensitivity), taps: parseTaps(manual.taps), impedance: Number(manual.impedance || 8), note: "Manually entered — verify against current manufacturer data." };
    if (!next.coverage || !next.sensitivity || !next.taps.length) { setMessage("Enter coverage, sensitivity, and at least one transformer tap."); return; }
    chooseSpeaker(next);
  }

  function chooseAmplifier(next: Amplifier) {
    setAmplifier(next);
    setChannels(Math.max(1, next.channels || 1));
    const lowZDefault = next.lowZRatings.find(rating=>rating.ohms===8) || next.lowZRatings[0];
    setAmpWatts(systemMode === "70v" ? (next.power70v || ampWatts) : (lowZDefault?.watts || ampWatts));
    setAmpPickerOpen(false); setAmpResult(null); setAmpMessage("");
  }

  async function aiAmpSearch() {
    if (!ampQuery.trim()) return;
    setBusy(true); setAmpMessage(""); setAmpResult(null);
    try {
      const response = await fetch("/api/speakers", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ kind:"amplifier", query:ampQuery }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Amplifier search could not be completed.");
      setAmpResult(data.amplifier);
    } catch (error) { setAmpMessage(error instanceof Error ? error.message : "Amplifier search could not be completed."); }
    finally { setBusy(false); }
  }

  async function importAmpSheet(file?: File) {
    if (!file) return;
    setBusy(true); setAmpMessage(""); setAmpResult(null);
    try {
      if (file.size > 30_000_000) throw new Error("Choose a specification sheet smaller than 30 MB.");
      const text = await readSpecificationText(file);
      const extracted = extractAmplifierFromText(text, file.name);
      if (extracted) setAmpResult(extracted);
      else {
        const identity = filenameIdentity(file.name);
        setAmpManual({ brand:identity.brand, model:identity.model, channels:"2", power70v:"", minImpedance:"4", ratings:"" });
        setAmpMode("manual");
        setAmpMessage("The document opened, but the amplifier ratings could not be identified reliably. Enter the published channel and output ratings below.");
      }
    } catch (error) { setAmpMessage(error instanceof Error ? error.message : "The amplifier specification sheet could not be read."); }
    finally { setBusy(false); }
  }

  function addManualAmplifier() {
    const ratings = parseRatings(ampManual.ratings);
    const next: Amplifier = { brand:ampManual.brand.trim()||"Custom", model:ampManual.model.trim()||"Power amplifier", channels:Number(ampManual.channels)||1, power70v:Number(ampManual.power70v)||0, minImpedance:Number(ampManual.minImpedance)||4, lowZRatings:ratings, note:"Manually entered — verify operating mode and load qualifications against current manufacturer data." };
    if (!next.power70v && !ratings.length) { setAmpMessage("Enter a 70 V channel rating, one or more Low-Z ratings, or both."); return; }
    chooseAmplifier(next);
  }

  function selectSystemMode(mode: "70v"|"lowz") {
    setSystemMode(mode);
    if (mode === "70v" && amplifier.power70v) setAmpWatts(amplifier.power70v);
    if (mode === "lowz") {
      const rating = amplifier.lowZRatings.find(item=>item.ohms===speakerOhms) || amplifier.lowZRatings[0];
      if (rating) setAmpWatts(rating.watts);
    }
  }

  async function copyProjectLink() {
    const project: SharedProject = {
      v: 1,
      speaker,
      amplifier,
      tap,
      room: { length: roomL, width: roomW, ceiling, ear },
      spl: { target, loss, headroom },
      layout: { positions },
      system: { mode: systemMode, ampWatts, speakerOhms, channels, speakersPerChannel, loadLimit, cableLength, wireR },
    };
    const url = `${location.origin}${location.pathname}?project=${encodeProject(project)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2200);
    } catch {
      window.prompt("Copy this project link:", url);
    }
  }

  return <main className="speaker-lab">
    <header className="topbar">
      <a className="brand" href="https://blackmountain.tech" aria-label="Return to the Black Mountain Technologies home page"><img src="/speaker-lab/bmt-monogram-white.png" alt="BMT"/><span>Speaker Lab</span></a>
      <nav><a href="#coverage">Coverage</a><a href="#amplifier">Amplifier</a><a href="#method">Method</a></nav>
      <button className="share" onClick={copyProjectLink}>{shareCopied ? "Project link copied ✓" : "Copy project link"}</button>
    </header>

    <section className="hero" id="top">
      <div><p className="eyebrow">BMT SYSTEM DESIGN / PRELIMINARY TOOL</p><h1>Start with any speaker.<br/><em>Test the system.</em></h1><p className="lede">Find a model with AI, extract a manufacturer specification sheet, or enter the engineering data yourself—then explore coverage, SPL, and amplifier loading.</p></div>
      <div className="hero-signal"><span>SINGLE-SPEAKER REFERENCE</span><strong>{calc.centerSpl.toFixed(1)}</strong><small>dB SPL on axis</small><div className="meter"><i style={{width: `${Math.min(100, Math.max(5, calc.centerSpl))}%`}}/></div></div>
    </section>

    <section className="speaker-source" aria-label="Selected speaker">
      <div><span className="selection-label">Selected loudspeaker</span><strong>{speaker.brand} <b>{speaker.model}</b></strong><small>{speaker.coverage}° nominal · {speaker.sensitivity} dB sensitivity · {speaker.taps.join(" / ")} W taps</small></div>
      <button className="primary" onClick={() => setPickerOpen(true)}>Find or add a speaker <span>→</span></button>
    </section>

    <section className="workspace" id="coverage">
      <aside className="controls card">
        <div className="card-head"><span>01</span><div><p>System inputs</p><h2>Define the room</h2></div></div>
        <label className="field"><span>Speaker library</span><select value={`${speaker.brand}|${speaker.model}`} onChange={e => { const selected=library.find(s=>`${s.brand}|${s.model}`===e.target.value); if(selected) chooseSpeaker(selected); }}>{library.map(s=><option value={`${s.brand}|${s.model}`} key={`${s.brand}|${s.model}`}>{s.brand} · {s.model}</option>)}</select></label>
        <label className="field"><span>Transformer tap</span><select value={tap} onChange={e=>setTap(Number(e.target.value))}>{speaker.taps.map(t=><option value={t} key={t}>{t} W</option>)}</select></label>
        <div className="two"><Field label="Room length" value={roomL} onChange={setRoomL} unit="ft"/><Field label="Room width" value={roomW} onChange={setRoomW} unit="ft"/></div>
        <div className="two"><Field label="Ceiling height" value={ceiling} onChange={setCeiling} unit="ft" step={.5}/><Field label="Listener height" value={ear} onChange={setEar} unit="ft" step={.5}/></div>
        <div className="two"><Field label="Target level" value={target} onChange={setTarget} unit="dB"/><Field label="System loss" value={loss} onChange={setLoss} unit="dB" step={.1}/></div>
        <div className="two"><Field label="Design headroom" value={headroom} onChange={setHeadroom} unit="dB"/><Field label="Speakers in layout" value={layoutCount} onChange={setSpeakerCount} min={1} max={24}/></div>
        <div className="spec-strip"><span><b>{speaker.sensitivity}</b> dB sensitivity</span><span><b>{speaker.coverage}°</b> coverage</span><span><b>{speaker.impedance||8} Ω</b> Low-Z</span></div>
        {speaker.source && <a className="source-link" href={speaker.source} target="_blank" rel="noreferrer">Review source: {speaker.sourceTitle || "manufacturer data"} ↗</a>}
      </aside>

      <div className="visual card">
        <div className="card-head"><span>02</span><div><p>Listener plane</p><h2>Coverage + SPL layout</h2></div><div className="layout-actions"><span>Drag numbered speaker targets</span><div className="speaker-stepper" aria-label="Speaker quantity"><button onClick={()=>changeSpeakerCount(-1)} disabled={layoutCount<=1} aria-label="Remove a speaker">−</button><b>{layoutCount}</b><button onClick={()=>changeSpeakerCount(1)} disabled={layoutCount>=24} aria-label="Add a speaker">+</button></div><button className="arrange-button" onClick={()=>setPositions(arrangedPositions(layoutCount))}>Auto arrange</button></div></div>
        <div className="room-label"><span>{roomW} ft</span><b>{speaker.brand} {speaker.model}</b><span>{roomL} ft</span></div>
        <div ref={mapRef} className="coverage-map" style={{aspectRatio:`${Math.max(roomL,.1)} / ${Math.max(roomW,.1)}`}}><div className="spl-layer">{predictionGrid.map((level,index)=><i key={index} style={{background:splColor(level,target)}} title={`${level.toFixed(1)} dB SPL`}/>)}</div>{positions.map((position,index)=><div className="coverage-speaker" key={index} style={{left:`${position.x}%`,top:`${position.y}%`,width:`${(calc.radius*2/Math.max(roomL,.1))*100}%`,height:`${(calc.radius*2/Math.max(roomW,.1))*100}%`}}><span className="coverage-ring"/><button type="button" className="speaker-drag-handle" onPointerDown={event=>{event.preventDefault();event.stopPropagation();draggedSpeakerRef.current=index;moveSpeakerTo(index,event.clientX,event.clientY)}} title={`Move speaker ${index+1} · ${(position.x/100*roomL).toFixed(1)} ft × ${(position.y/100*roomW).toFixed(1)} ft`} aria-label={`Drag speaker ${index+1}`}>{index+1}</button></div>)}</div>
        <div className="map-legend"><span><i className="legend-low"/>Below target</span><span><i className="legend-target"/>Near target</span><span><i className="legend-high"/>Above target</span></div>
        <div className="geometry-note"><i/>Color estimates combine all positioned speakers using distance, tap, sensitivity, and a simplified nominal-coverage loss. Coverage rings remain geometry references, not manufacturer polar data.</div>
        <div className="metric-row"><article><span>Coverage radius</span><strong>{calc.radius.toFixed(1)}<small> ft</small></strong></article><article><span>Coverage diameter</span><strong>{(calc.radius*2).toFixed(1)}<small> ft</small></strong></article><article><span>Placed speakers</span><strong>{layoutCount}<small> speakers</small></strong></article></div>
      </div>
    </section>

    <section className="amp-section" id="amplifier">
      <div className="section-title"><p className="eyebrow">AMPLIFIER & CHANNEL LOAD</p><h2>Match the amplifier to the distribution method.</h2><p>Use constant-voltage tap loading or calculate parallel Low-Z impedance without mixing the two methods.</p></div>
      <div className="amp-selection card"><div><span className="selection-label">Selected amplifier</span><strong>{amplifier.brand} {amplifier.model}</strong><small>{amplifier.channels} channels · {amplifier.power70v?`${amplifier.power70v} W/ch at 70 V`:"No 70 V rating entered"} · {amplifier.lowZRatings.length?amplifier.lowZRatings.map(r=>`${r.watts} W @ ${r.ohms} Ω`).join(" / "):"No Low-Z ratings entered"}</small></div><button className="primary" onClick={()=>setAmpPickerOpen(true)}>Find or add amplifier <span>→</span></button></div>
      <div className="mode-switch" role="group" aria-label="Distribution mode"><button className={systemMode==="70v"?"active":""} onClick={()=>selectSystemMode("70v")}>70.7 V / 100 V</button><button className={systemMode==="lowz"?"active":""} onClick={()=>selectSystemMode("lowz")}>Low-Z / 8 Ω</button></div>
      <div className="amp-grid"><div className="amp-controls card"><div className="two"><Field label="Power per channel" value={ampWatts} onChange={setAmpWatts} unit="W"/><Field label="Channels in use" value={channels} onChange={setChannels} min={1}/></div><div className="two"><Field label="Speakers / channel" value={speakersPerChannel} onChange={setSpeakersPerChannel} min={1}/>{systemMode==="70v"?<Field label="Design load limit" value={loadLimit} onChange={setLoadLimit} unit="%" max={100}/>:<Field label="Speaker impedance" value={speakerOhms} onChange={setSpeakerOhms} unit="Ω" min={1}/>}</div><div className="two"><Field label="One-way cable" value={cableLength} onChange={setCableLength} unit="ft"/><Field label="Cable resistance" value={wireR} onChange={setWireR} unit="Ω/kft" step={.01}/></div></div><div className="max-tap card"><span>{systemMode==="70v"?"MAXIMUM DESIGN TAP / SPEAKER":"PARALLEL LOAD / CHANNEL"}</span><strong>{systemMode==="70v"?calc.maxTap.toFixed(1):calc.lowZLoad.toFixed(2)}<small>{systemMode==="70v"?" W":" Ω"}</small></strong><p>{systemMode==="70v"?`At ${speakersPerChannel} speakers per channel and a ${loadLimit}% design limit.`:`${speakersPerChannel} × ${speakerOhms} Ω speakers in parallel. Amplifier minimum: ${amplifier.minImpedance} Ω.`}</p><div className={`status ${pass?"pass":"review"}`}><i/>{pass?(systemMode==="70v"?"Current tap is within limit":"Parallel load is within minimum"):(systemMode==="70v"?"Reduce tap or speaker count":"Too many parallel speakers for this amplifier")}</div></div><div className="load-card card">{systemMode==="70v"?<><div><span>Connected / channel</span><strong>{calc.channelLoad.toFixed(0)} W</strong></div><div><span>Reserve / channel</span><strong>{calc.reserve.toFixed(0)} W</strong></div><div><span>Total connected load</span><strong>{calc.totalLoad.toFixed(0)} W</strong></div><div><span>Estimated cable loss</span><strong>{calc.cableDb.toFixed(2)} dB</strong></div><div className="load-bar"><i style={{width:`${Math.min(100,calc.channelLoad/ampWatts*100)}%`}}/></div></>:<><div><span>Calculated channel load</span><strong>{calc.lowZLoad.toFixed(2)} Ω</strong></div><div><span>Minimum amplifier load</span><strong>{amplifier.minImpedance.toFixed(1)} Ω</strong></div><div><span>Maximum parallel speakers</span><strong>{calc.maxParallelSpeakers}</strong></div><div><span>Approx. watts / speaker</span><strong>{calc.wattsPerSpeaker.toFixed(0)} W</strong></div><div className="load-bar"><i style={{width:`${Math.min(100,amplifier.minImpedance/calc.lowZLoad*100)}%`}}/></div></>}</div></div>
    </section>

    <section className="method" id="method"><div><p className="eyebrow">WHAT THIS MODEL DOES</p><h2>Useful physics, visible assumptions.</h2></div><div className="method-list"><article><b>01</b><h3>Coverage geometry</h3><p>Nominal conical coverage projected from mounting height to the listener plane.</p></article><article><b>02</b><h3>Listener SPL</h3><p>Sensitivity + power gain − distance loss − simplified nominal-coverage loss.</p></article><article><b>03</b><h3>Channel loading</h3><p>70.7 V tap totals and reserve, or parallel Low-Z impedance checked against amplifier limits.</p></article></div></section>
    <footer><div className="brand footer-brand"><img src="/speaker-lab/bmt-lockup-white.png" alt="Black Mountain Technologies"/><span>Speaker Lab</span></div><p>Preliminary design estimate. Validate final selections, rigging, code compliance, and acoustic performance with current manufacturer data and qualified engineering review.</p></footer>

    {pickerOpen && <div className="dialog-backdrop" onMouseDown={e => { if(e.target===e.currentTarget) setPickerOpen(false); }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="speaker-dialog-title"><button className="close" aria-label="Close" onClick={()=>setPickerOpen(false)}>×</button><div className="dialog-title"><p className="eyebrow">OPEN SPEAKER INPUT</p><h2 id="speaker-dialog-title">Use any ceiling speaker.</h2><p>Find a model that is not in the library, extract a manufacturer document, or enter verified values directly.</p></div><div className="tabs" role="tablist"><button className={mode==="search"?"active":""} onClick={()=>{setMode("search");setResult(null);setMessage("")}}>AI search</button><button className={mode==="sheet"?"active":""} onClick={()=>{setMode("sheet");setResult(null);setMessage("")}}>Spec sheet</button><button className={mode==="manual"?"active":""} onClick={()=>{setMode("manual");setResult(null);setMessage("")}}>Manual entry</button></div>
      <div className="dialog-body">
        {mode==="search" && <div className="source-mode"><label className="search-box"><span>Manufacturer and model</span><div><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&aiSearch()} placeholder="Example: AtlasIED FAP63T"/><button onClick={aiSearch} disabled={busy}>{busy?"Searching…":"Search the web"}</button></div></label><p className="hint">AI web lookup requires a connected OpenAI API key. Manual entry and PDF extraction work without one.</p></div>}
        {mode==="sheet" && <div className="source-mode upload" onClick={()=>fileRef.current?.click()}><input ref={fileRef} type="file" accept="application/pdf,text/plain" onChange={e=>importSheet(e.target.files?.[0])}/><span className="upload-mark">↓</span><h3>{busy?"Reading specification sheet…":"Choose a manufacturer spec sheet"}</h3><p>PDF or text · processed on this device · up to 30 MB</p><button disabled={busy}>Browse files</button></div>}
        {mode==="manual" && <div className="manual-grid"><label><span>Manufacturer</span><input value={manual.brand} onChange={e=>setManual({...manual,brand:e.target.value})} placeholder="Manufacturer"/></label><label><span>Model</span><input value={manual.model} onChange={e=>setManual({...manual,model:e.target.value})} placeholder="Model number"/></label><label><span>Nominal coverage</span><div className="unit-input"><input type="number" value={manual.coverage} onChange={e=>setManual({...manual,coverage:e.target.value})}/><b>°</b></div></label><label><span>Sensitivity</span><div className="unit-input"><input type="number" step=".1" value={manual.sensitivity} onChange={e=>setManual({...manual,sensitivity:e.target.value})}/><b>dB</b></div></label><label><span>Nominal Low-Z impedance</span><div className="unit-input"><input type="number" value={manual.impedance} onChange={e=>setManual({...manual,impedance:e.target.value})}/><b>Ω</b></div></label><label><span>70.7 V transformer taps</span><input value={manual.taps} onChange={e=>setManual({...manual,taps:e.target.value})} placeholder="7.5, 15, 30, 60"/></label><button className="primary wide" onClick={addManual}>Use this speaker <span>→</span></button></div>}
        {message && <div className="message">{message}</div>}
        {result && <div className="search-result"><span className="selection-label">Specification found</span><h3>{result.brand} {result.model}</h3><div className="result-specs"><span><b>{result.coverage}°</b> coverage</span><span><b>{result.sensitivity} dB</b> sensitivity</span><span><b>{result.taps.join(" / ")} W</b> taps</span></div>{result.note&&<p>{result.note}</p>}{result.source&&<a href={result.source} target="_blank" rel="noreferrer">Open manufacturer source ↗</a>}<button className="primary" onClick={()=>chooseSpeaker(result)}>Use this speaker <span>→</span></button></div>}
      </div></section></div>}
    {ampPickerOpen && <div className="dialog-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setAmpPickerOpen(false)}}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="amp-dialog-title"><button className="close" aria-label="Close" onClick={()=>setAmpPickerOpen(false)}>×</button><div className="dialog-title"><p className="eyebrow">OPEN AMPLIFIER INPUT</p><h2 id="amp-dialog-title">Use any power amplifier.</h2><p>Search for a current model, extract a manufacturer specification sheet, or enter 70 V and Low-Z ratings directly.</p></div><div className="tabs"><button className={ampMode==="search"?"active":""} onClick={()=>{setAmpMode("search");setAmpResult(null);setAmpMessage("")}}>AI search</button><button className={ampMode==="sheet"?"active":""} onClick={()=>{setAmpMode("sheet");setAmpResult(null);setAmpMessage("")}}>Spec sheet</button><button className={ampMode==="manual"?"active":""} onClick={()=>{setAmpMode("manual");setAmpResult(null);setAmpMessage("")}}>Manual entry</button></div><div className="dialog-body">
      {ampMode==="search"&&<div className="source-mode"><label className="search-box"><span>Manufacturer and model</span><div><input value={ampQuery} onChange={event=>setAmpQuery(event.target.value)} onKeyDown={event=>event.key==="Enter"&&aiAmpSearch()} placeholder="Example: LEA Connect 704"/><button onClick={aiAmpSearch} disabled={busy}>{busy?"Searching…":"Search the web"}</button></div></label><p className="hint">AI lookup extracts channel count, constant-voltage output, minimum impedance, and published Low-Z power ratings.</p></div>}
      {ampMode==="sheet"&&<div className="source-mode upload" onClick={()=>ampFileRef.current?.click()}><input ref={ampFileRef} type="file" accept="application/pdf,text/plain" onChange={event=>importAmpSheet(event.target.files?.[0])}/><span className="upload-mark">↓</span><h3>{busy?"Reading amplifier specification…":"Choose an amplifier spec sheet"}</h3><p>PDF or text · processed on this device · up to 30 MB</p><button disabled={busy}>Browse files</button></div>}
      {ampMode==="manual"&&<div className="manual-grid"><label><span>Manufacturer</span><input value={ampManual.brand} onChange={event=>setAmpManual({...ampManual,brand:event.target.value})}/></label><label><span>Model</span><input value={ampManual.model} onChange={event=>setAmpManual({...ampManual,model:event.target.value})}/></label><label><span>Channels</span><input type="number" value={ampManual.channels} onChange={event=>setAmpManual({...ampManual,channels:event.target.value})}/></label><label><span>70 V watts / channel</span><input type="number" value={ampManual.power70v} onChange={event=>setAmpManual({...ampManual,power70v:event.target.value})}/></label><label><span>Minimum Low-Z load</span><div className="unit-input"><input type="number" value={ampManual.minImpedance} onChange={event=>setAmpManual({...ampManual,minImpedance:event.target.value})}/><b>Ω</b></div></label><label><span>Low-Z ratings (Ω:W)</span><input value={ampManual.ratings} onChange={event=>setAmpManual({...ampManual,ratings:event.target.value})} placeholder="8:250, 4:500"/></label><button className="primary wide" onClick={addManualAmplifier}>Use this amplifier <span>→</span></button></div>}
      {ampMessage&&<div className="message">{ampMessage}</div>}
      {ampResult&&<div className="search-result"><span className="selection-label">Amplifier specification found</span><h3>{ampResult.brand} {ampResult.model}</h3><div className="result-specs"><span><b>{ampResult.channels}</b> channels</span><span><b>{ampResult.power70v||"—"} W</b> at 70 V</span><span><b>{ampResult.minImpedance} Ω</b> minimum</span></div><p>{ampResult.lowZRatings.map(rating=>`${rating.watts} W @ ${rating.ohms} Ω`).join(" · ")||"No Low-Z ratings extracted"}</p>{ampResult.note&&<p>{ampResult.note}</p>}{ampResult.source&&<a href={ampResult.source} target="_blank" rel="noreferrer">Open manufacturer source ↗</a>}<button className="primary" onClick={()=>chooseAmplifier(ampResult)}>Use this amplifier <span>→</span></button></div>}
    </div></section></div>}
  </main>;
}
