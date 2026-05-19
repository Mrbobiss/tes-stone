/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  APP_NAME,
  APP_PROMISE,
  APP_TAGLINE,
  BRAND_LOGO_SRC,
  DEFAULT_MODE,
  HOME_DISCLAIMER,
  MAX_UPLOAD_BYTES,
} from "@/lib/constants";
import { modes } from "@/lib/content";
import { getAchievementSummary } from "@/lib/local-achievements";
import {
  getCurrentStreak,
  getLocalResultStats,
  readLocalResults,
  saveLocalResult,
  type LocalResultEntry,
} from "@/lib/local-results";
import { generateResult } from "@/lib/result-engine";
import type { AnalyzeResponse, AppMode, ResultCardData, VisionAnalysis } from "@/lib/types";
import { AchievementsPanel } from "@/components/achievements-panel";
import { HistoryPanel } from "@/components/history-panel";
import { PersonalRanking } from "@/components/personal-ranking";
import { RESULT_CARD_THEMES, ResultCard, type ResultCardThemeKey } from "@/components/result-card";

type Step = "home" | "result";

async function compressImage(file: File) {
  if (typeof window === "undefined") {
    return file;
  }

  if (file.size <= 2.2 * 1024 * 1024) {
    return file;
  }

  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Impossible de lire l’image."));
      img.src = sourceUrl;
    });

    const maxSide = isLikelyMobileDevice() ? 960 : 1280;
    const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((nextBlob) => resolve(nextBlob), "image/jpeg", 0.78);
    });

    canvas.width = 1;
    canvas.height = 1;

    if (!blob) {
      return file;
    }

    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

async function inspectImageReadability(file: File) {
  if (typeof window === "undefined") {
    return { ok: true as const };
  }

  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Impossible de lire l’image."));
      img.src = sourceUrl;
    });

    const sampleSize = 48;
    const ratio = Math.min(1, sampleSize / Math.max(image.width, image.height));
    const width = Math.max(8, Math.round(image.width * ratio));
    const height = Math.max(8, Math.round(image.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return { ok: true as const };
    }

    context.drawImage(image, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;

    let totalLuma = 0;
    let totalSquaredLuma = 0;
    let darkPixels = 0;
    let brightPixels = 0;
    let minLuma = 255;
    let maxLuma = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const alpha = pixels[index + 3] / 255;
      const luma = (0.299 * r + 0.587 * g + 0.114 * b) * alpha;

      totalLuma += luma;
      totalSquaredLuma += luma * luma;
      minLuma = Math.min(minLuma, luma);
      maxLuma = Math.max(maxLuma, luma);

      if (luma < 18) {
        darkPixels += 1;
      }

      if (luma > 210) {
        brightPixels += 1;
      }
    }

    const pixelCount = pixels.length / 4;
    const averageLuma = totalLuma / pixelCount;
    const variance = totalSquaredLuma / pixelCount - averageLuma * averageLuma;
    const stdDev = Math.sqrt(Math.max(variance, 0));
    const dynamicRange = maxLuma - minLuma;
    const darkRatio = darkPixels / pixelCount;
    const brightRatio = brightPixels / pixelCount;

    canvas.width = 1;
    canvas.height = 1;

    if (darkRatio > 0.94 || averageLuma < 22) {
      return {
        ok: false as const,
        reason: "Photo trop noire. On a besoin d’un visage visible, pas d’un écran éteint 😅",
      };
    }

    if (dynamicRange < 20 || stdDev < 10) {
      return {
        ok: false as const,
        reason: "Photo trop uniforme ou vide. Reprends un selfie avec un peu de lumière et ton visage bien visible.",
      };
    }

    if (brightRatio > 0.96 && dynamicRange < 24) {
      return {
        ok: false as const,
        reason: "Photo presque blanche ou cramée. Reprends-la avec une lumière plus propre.",
      };
    }

    return { ok: true as const };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function isLikelyMobileDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 768px)").matches;
}

interface TasDormiAppProps {
  exampleResult: ResultCardData;
}

export function TasDormiApp({ exampleResult }: TasDormiAppProps) {
  const [step, setStep] = useState<Step>("home");
  const [mode, setMode] = useState<AppMode>(DEFAULT_MODE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);
  const [result, setResult] = useState<ResultCardData | null>(null);
  const [historyEntries, setHistoryEntries] = useState<LocalResultEntry[]>(() => readLocalResults());
  const [usedFallback, setUsedFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [shareDraft, setShareDraft] = useState("");
  const [cardTheme, setCardTheme] = useState<ResultCardThemeKey>("mode");
  const [variantSeed, setVariantSeed] = useState<string>("demo-seed");
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const exportCardRef = useRef<HTMLDivElement | null>(null);
  const selfiePanelRef = useRef<HTMLDivElement | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);

  function stopEmbeddedCamera() {
    liveStreamRef.current?.getTracks().forEach((track) => track.stop());
    liveStreamRef.current = null;

    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }

    setIsCameraOpen(false);
    setIsCameraStarting(false);
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      stopEmbeddedCamera();
    };
  }, [previewUrl]);

  useEffect(() => {
    if (shareStatus) {
      const timeout = window.setTimeout(() => setShareStatus(null), 2600);
      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [shareStatus]);

  useEffect(() => {
    if (step !== "result") {
      return;
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [step]);

  useEffect(() => {
    if (!error || step !== "home") {
      return;
    }

    window.requestAnimationFrame(() => {
      selfiePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [error, step]);

  const modeMeta = modes[mode];
  const modeEntries = Object.entries(modes) as Array<[AppMode, (typeof modes)[AppMode]]>;
  const currentResult = result;
  const streak = useMemo(() => getCurrentStreak(historyEntries), [historyEntries]);
  const localStats = useMemo(() => getLocalResultStats(historyEntries), [historyEntries]);
  const achievementSummary = useMemo(() => getAchievementSummary(historyEntries), [historyEntries]);
  const hasHistory = historyEntries.length > 0;
  const cardResult = currentResult ?? exampleResult;

  function buildRecentSelections(targetMode: AppMode) {
    const recentEntries = historyEntries.filter((entry) => entry.mode === targetMode).slice(0, 8);

    return {
      badges: recentEntries.map((entry) => entry.badge),
      lines: recentEntries.flatMap((entry) => (entry.line ? [entry.line] : [])),
      shareLines: recentEntries.flatMap((entry) => (entry.shareLine ? [entry.shareLine] : [])),
      challenges: [],
    };
  }

  function applyMode(nextMode: AppMode) {
    setMode(nextMode);

    if (analysis) {
      const nextResult = generateResult(analysis, nextMode, {
        usedFallback,
        variantSeed,
        recentSelections: buildRecentSelections(nextMode),
      });
      setResult(nextResult);
      setShareDraft(nextResult.shareText);
    }
  }

  async function handleFile(file: File | null) {
    setError(null);
    stopEmbeddedCamera();

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Prends une vraie image, pas un fichier random 😌");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES * 2.5) {
      setError("Image trop lourde. Garde-la simple pour le MVP.");
      return;
    }

    let workingFile = file;

    try {
      workingFile = await compressImage(file);
    } catch {
      setError("Le navigateur manque de mémoire pour cette photo. Essaie un selfie plus léger ou ferme les autres applis ouvertes.");
      return;
    }

    if (workingFile.size > MAX_UPLOAD_BYTES) {
      setError("Image encore trop lourde après compression. Essaie un selfie plus simple ou un peu moins net.");
      return;
    }

    try {
      const readability = await inspectImageReadability(workingFile);
      if (!readability.ok) {
        setError(readability.reason);
        return;
      }
    } catch {
      setError("Impossible de vérifier cette photo. Essaie un selfie plus clair et cadré.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(workingFile);
    setPreviewUrl(URL.createObjectURL(workingFile));
    setStep("home");

    if (isLikelyMobileDevice()) {
      window.setTimeout(() => {
        void onAnalyze(workingFile);
      }, 120);
    }
  }

  function openPicker(kind: "camera" | "gallery") {
    setError(null);
    setStep("home");

    if (kind === "gallery") {
      stopEmbeddedCamera();
    }

    const input = kind === "camera" ? cameraInputRef.current : galleryInputRef.current;
    input?.click();
  }

  async function openEmbeddedCamera() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      openPicker("camera");
      return;
    }

    setError(null);
    setStep("home");
    setIsCameraStarting(true);

    try {
      stopEmbeddedCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });

      liveStreamRef.current = stream;
      setIsCameraOpen(true);
      setIsCameraStarting(false);

      window.requestAnimationFrame(() => {
        const video = liveVideoRef.current;
        if (!video) {
          return;
        }

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        void video.play().catch(() => {
          setError("La caméra s'ouvre, mais le navigateur bloque l'aperçu. Essaie sinon 'Choisir une photo'.");
        });
      });
    } catch {
      setIsCameraStarting(false);
      setIsCameraOpen(false);
      setError("Impossible d'ouvrir la caméra ici. Essaie 'Choisir une photo' ou autorise la caméra dans le navigateur.");
    }
  }

  async function captureEmbeddedSelfie() {
    const video = liveVideoRef.current;
    if (!video || video.videoWidth <= 0 || video.videoHeight <= 0) {
      setError("La caméra n'est pas encore prête. Attends une seconde et réessaie.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setError("Impossible de capturer l'image depuis la caméra.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((nextBlob) => resolve(nextBlob), "image/jpeg", 0.9);
    });

    canvas.width = 1;
    canvas.height = 1;

    if (!blob) {
      setError("Impossible de créer le selfie capturé.");
      return;
    }

    const file = new File([blob], `tes-stone-live-${Date.now()}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    await handleFile(file);
  }

  async function onAnalyze(fileOverride?: File | null) {
    const fileToAnalyze = fileOverride ?? selectedFile;

    if (!fileToAnalyze) {
      setError("Choisis un selfie avant de lancer le jugement.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", fileToAnalyze);
      formData.append("mode", mode);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as AnalyzeResponse & { error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Impossible d’analyser la photo.");
      }

      const nextVariantSeed = payload.variantSeed ?? `${Date.now()}`;
      const nextResult = generateResult(payload.analysis, mode, {
        usedFallback: payload.usedFallback,
        variantSeed: nextVariantSeed,
        recentSelections: buildRecentSelections(mode),
      });

      setAnalysis(payload.analysis);
      setUsedFallback(payload.usedFallback);
      setVariantSeed(nextVariantSeed);
      setResult(nextResult);
      setShareDraft(nextResult.shareText);
      setHistoryEntries(saveLocalResult(nextResult));
      setStep("result");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Impossible d’analyser la photo.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function buildResultImageFile() {
    if (!currentResult || !exportCardRef.current) {
      return null;
    }

    const { toBlob } = await import("html-to-image");
    const blob = await toBlob(exportCardRef.current, {
      cacheBust: true,
      pixelRatio: 2.5,
      backgroundColor: "#ffffff",
    });

    if (!blob) {
      throw new Error("Export image impossible.");
    }

    return new File([blob], `tes-stone-${currentResult.score}.png`, {
      type: "image/png",
      lastModified: Date.now(),
    });
  }

  async function onExportImage() {
    if (!currentResult) {
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const file = await buildResultImageFile();
      if (!file) {
        return;
      }

      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setShareStatus("Carte PNG exportée ✨");
    } catch {
      setError("Impossible d’exporter la carte pour le moment.");
    } finally {
      setIsExporting(false);
    }
  }

  async function onShare() {
    if (!currentResult) {
      return;
    }

    const shareText = shareDraft.trim() || currentResult.shareText;

    try {
      if (navigator.share) {
        try {
          const file = await buildResultImageFile();
          if (file && navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              files: [file],
              text: shareText,
              title: "T'es stone ?",
            });
            setShareStatus("Image partagée ✨");
            return;
          }
        } catch {
          // Fallback texte juste en dessous.
        }

        await navigator.share({
          text: shareText,
          title: "T'es stone ?",
        });
        setShareStatus("Texte partagé ✨");
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setShareStatus("Texte copié ✨");
    } catch {
      setShareStatus("Partage annulé.");
    }
  }

  async function onCopyShareText() {
    if (!currentResult) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareDraft.trim() || currentResult.shareText);
      setShareStatus("Légende copiée ✨");
    } catch {
      setError("Impossible de copier la légende pour le moment.");
    }
  }

  function resetFlow(nextStep: Step = "home") {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    stopEmbeddedCamera();

    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setResult(null);
    setShareDraft("");
    setUsedFallback(false);
    setVariantSeed("demo-seed");
    setError(null);
    setStep(nextStep);
  }

  return (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-x-hidden px-4 pt-3 pb-28 sm:px-6 sm:pt-5 lg:px-8">
        <div className="absolute left-4 top-3 z-10 flex items-center justify-between gap-3 sm:static sm:left-auto sm:top-auto">
          <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 shadow-sm sm:inline-flex">
            Le stonomètre selfie qui finit en story
          </div>
          <button
            type="button"
            onClick={() => setShowOptionsMenu(true)}
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 lg:hidden"
            aria-label="Ouvrir les options"
          >
            ☰
          </button>
        </div>

        {step === "home" ? (
          <section className="mt-0 rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:mt-3 sm:p-8">
            <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <img
                  src={BRAND_LOGO_SRC}
                  alt="Logo T'es stone ?"
                  className="mx-auto size-16 rounded-[1.35rem] object-cover shadow-[0_18px_50px_rgba(15,23,42,0.12)] ring-1 ring-white/80 sm:size-24 sm:rounded-[2rem]"
                />
                <h1 className="text-center text-[2.4rem] font-black tracking-tight text-zinc-950 sm:text-5xl">{APP_NAME}</h1>
                <p className="text-center text-base font-semibold text-zinc-800 sm:text-2xl">{APP_TAGLINE}</p>
                <p className="mx-auto max-w-2xl text-center text-sm leading-6 text-zinc-600 sm:text-lg sm:leading-7">{APP_PROMISE}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-6">
                <div className="order-1 space-y-4 lg:order-2">
                  <div className="rounded-[1.8rem] border border-zinc-200 bg-zinc-50 p-4 text-left sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Choisis ta ref</p>
                        <p className="mt-1 text-sm text-zinc-600">Choisis d&apos;abord ton personnage, puis balance directement ton selfie.</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                        {modeMeta.icon} {modeMeta.label}
                      </span>
                    </div>

                    <label className="mt-4 block text-sm font-medium text-zinc-700">
                      Référence
                      <select
                        value={mode}
                        onChange={(event) => applyMode(event.target.value as AppMode)}
                        className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base font-medium text-zinc-900 outline-none transition focus:border-zinc-400"
                      >
                        {modeEntries.map(([modeKey, modeOption]) => (
                          <option key={modeKey} value={modeKey}>
                            {modeOption.icon} {modeOption.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-zinc-600">
                      <span className="font-semibold text-zinc-900">{modeMeta.icon} {modeMeta.label}</span>
                      {" · "}
                      {modeMeta.description}
                    </p>
                  </div>
                </div>

                <div className="order-2 space-y-4 lg:order-1">
                  <div ref={selfiePanelRef} className="rounded-[1.8rem] border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center sm:p-5">
                    {isCameraOpen ? (
                      <div className="space-y-4">
                        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[1.8rem] bg-zinc-950 shadow-lg">
                          <video
                            ref={liveVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="h-full w-full scale-x-[-1] object-cover"
                          />
                          <div className="pointer-events-none absolute inset-x-4 top-4 rounded-full bg-black/45 px-3 py-2 text-left text-xs font-medium text-white backdrop-blur-sm">
                            Caméra en direct, cadre ton visage puis capture.
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => {
                              void captureEmbeddedSelfie();
                            }}
                            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-zinc-950 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-zinc-950/10 transition hover:bg-zinc-800"
                          >
                            📸 Capturer ce selfie
                          </button>
                          <button
                            type="button"
                            onClick={stopEmbeddedCamera}
                            className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-base font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50"
                          >
                            ✖️ Fermer la caméra
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => openPicker("gallery")}
                          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                        >
                          🖼️ Sinon, choisir une photo
                        </button>
                      </div>
                    ) : previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="Aperçu selfie"
                          className="mx-auto aspect-square w-full max-w-sm rounded-[1.8rem] object-cover shadow-lg"
                        />
                        <p className="text-sm leading-6 text-zinc-500">Ta photo apparaît ici, au même endroit que les boutons. Elle sert juste au stonomètre du moment.</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => {
                              void openEmbeddedCamera();
                            }}
                            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-zinc-950 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-zinc-950/10 transition hover:bg-zinc-800"
                          >
                            📸 Reprendre un selfie
                          </button>
                          <button
                            type="button"
                            onClick={() => openPicker("gallery")}
                            className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-base font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50"
                          >
                            🖼️ Changer de photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 py-6 sm:py-8">
                        <div className="mx-auto flex size-20 items-center justify-center rounded-[1.8rem] bg-white text-4xl shadow-sm">📸</div>
                        <p className="text-base font-semibold text-zinc-900">Ton selfie apparaîtra ici</p>
                        <p className="text-sm leading-6 text-zinc-500">Tu prends la photo ici, tu la vois ici, puis le stonomètre balance la sentence.</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => {
                              void openEmbeddedCamera();
                            }}
                            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-zinc-950 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-zinc-950/10 transition hover:bg-zinc-800"
                          >
                            📸 Ouvrir la caméra
                          </button>
                          <button
                            type="button"
                            onClick={() => openPicker("gallery")}
                            className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-base font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50"
                          >
                            🖼️ Choisir une photo
                          </button>
                        </div>
                      </div>
                    )}

                    {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-left text-sm font-medium text-rose-700">{error}</p> : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void onAnalyze();
                    }}
                    disabled={!selectedFile || isLoading || isCameraOpen || isCameraStarting}
                    className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-base font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? "Analyse planante en cours..." : isCameraStarting ? "Ouverture de la caméra..." : isCameraOpen ? "Capture d'abord le selfie" : "Lancer le stonomètre"}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200/80 bg-zinc-50/85 p-4 text-left text-sm text-zinc-600 sm:p-5">
                <p className="font-semibold text-zinc-900">{HOME_DISCLAIMER}</p>
                <p className="mt-2">Pas de détection réelle de substance, pas de profilage chelou, pas de selfie gardé dans l’app. Juste une vibe fun, puis un partage si tu l’assumes.</p>
              </div>
            </div>
          </section>
        ) : null}

        {step === "result" && currentResult ? (
          <section className="mt-4 grid min-w-0 gap-6 overflow-x-clip xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
            <div className="min-w-0 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Ta carte</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-950">Prête à poster, envoyer ou garder pour le folklore</h2>
              <div className="mt-5 min-w-0 overflow-hidden">
                <ResultCard result={currentResult} theme={cardTheme} showWatermark premium />
              </div>

              <div className="mt-5 grid gap-3 lg:hidden">
                <button
                  type="button"
                  onClick={onShare}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Partager maintenant
                </button>
                <button
                  type="button"
                  onClick={() => resetFlow("home")}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Refaire le stonomètre
                </button>
                <button
                  type="button"
                  onClick={onExportImage}
                  disabled={isExporting}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isExporting ? "Préparation..." : "Télécharger la carte"}
                </button>
                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                  <label className="block text-sm font-semibold text-zinc-900">
                    Changer de ref
                    <select
                      value={mode}
                      onChange={(event) => applyMode(event.target.value as AppMode)}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base font-medium text-zinc-900 outline-none transition focus:border-zinc-400"
                    >
                      {modeEntries.map(([modeKey, modeOption]) => (
                        <option key={modeKey} value={modeKey}>
                          {modeOption.icon} {modeOption.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="hidden min-w-0 space-y-6 lg:block">
              <div className="min-w-0 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Score</p>
                    <p className="mt-2 text-3xl font-black text-zinc-950">{currentResult.score}/100</p>
                    <p className="mt-1 text-sm text-zinc-600">Ambiance {currentResult.modeLabel.toLowerCase()}.</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Niveau</p>
                    <p className="mt-2 text-lg font-semibold text-zinc-950">{currentResult.level}</p>
                    <p className="mt-1 text-sm text-zinc-600">Ton verdict du jour.</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Trophées</p>
                    <p className="mt-2 text-3xl font-black text-zinc-950">{achievementSummary.unlockedCount}</p>
                    <p className="mt-1 text-sm text-zinc-600">Déjà débloqués ici.</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 rounded-3xl border border-zinc-200 bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Badge, {currentResult.badge}</p>
                    <p className="mt-2 text-base leading-7 text-zinc-700">{currentResult.line}</p>
                  </div>
                  {currentResult.vibeNote ? <p className="rounded-2xl bg-zinc-50 px-3 py-2 text-sm text-zinc-600">{currentResult.vibeNote}</p> : null}
                  {currentResult.photoNote ? <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{currentResult.photoNote}</p> : null}
                  {currentResult.reliabilityNote ? <p className="rounded-2xl bg-sky-50 px-3 py-2 text-sm text-sky-800">{currentResult.reliabilityNote}</p> : null}
                  {usedFallback ? <p className="rounded-2xl bg-fuchsia-50 px-3 py-2 text-sm text-fuchsia-800">Mode estimation fun activé, donc le résultat reste dans l’esprit du jeu.</p> : null}
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">{currentResult.shortDisclaimer}</p>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => resetFlow("home")}
                    className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                  Refaire le stonomètre
                  </button>
                  <button
                    type="button"
                    onClick={onShare}
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    Partager maintenant
                  </button>
                </div>

                <div className="mt-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                  <label className="block text-sm font-semibold text-zinc-900">
                    Changer de ref
                    <select
                      value={mode}
                      onChange={(event) => applyMode(event.target.value as AppMode)}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base font-medium text-zinc-900 outline-none transition focus:border-zinc-400"
                    >
                      {modeEntries.map(([modeKey, modeOption]) => (
                        <option key={modeKey} value={modeKey}>
                          {modeOption.icon} {modeOption.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">Le résultat se met à jour sans reprendre la photo.</p>
                </div>
              </div>

              <div className="min-w-0 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
                <div className="space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Habille ta carte avant de partager</p>
                    <p className="text-sm text-zinc-600">Choisis simplement le fond, la carte garde le logo.</p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {RESULT_CARD_THEMES.map((themeOption) => {
                      const active = themeOption.key === cardTheme;
                      return (
                        <button
                          key={themeOption.key}
                          type="button"
                          onClick={() => setCardTheme(themeOption.key)}
                          className={[
                            "min-w-[92px] rounded-2xl border p-2 text-left transition",
                            active ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-700",
                          ].join(" ")}
                        >
                          <div className={["h-10 rounded-xl bg-gradient-to-r", themeOption.preview].join(" ")} />
                          <p className="mt-2 text-xs font-semibold">{themeOption.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 space-y-3 rounded-3xl border border-zinc-200 bg-white p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-900">Ta légende prête à poster</p>
                    <p className="text-sm text-zinc-600">Tu peux la modifier, la copier, ou la partager juste au-dessus.</p>
                  </div>
                  <textarea
                    value={shareDraft}
                    onChange={(event) => setShareDraft(event.target.value)}
                    rows={5}
                    className="min-h-[140px] w-full rounded-[1.4rem] border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-700 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
                    placeholder="Ta légende apparaît ici"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={onCopyShareText}
                      className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-white"
                    >
                      Copier la légende
                    </button>
                    <button
                      type="button"
                      onClick={() => setShareDraft(currentResult.shareText)}
                      className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-white"
                    >
                      Remettre le texte d’origine
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={onExportImage}
                    disabled={isExporting}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isExporting ? "Préparation..." : "Télécharger la carte"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {error && step !== "home" ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}
        {shareStatus ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{shareStatus}</p> : null}

        <section className="mt-6 hidden gap-6 lg:grid lg:grid-cols-3">
          {hasHistory ? (
            <>
              <PersonalRanking entries={historyEntries} />
              <AchievementsPanel
                achievements={achievementSummary.achievements}
                unlockedCount={achievementSummary.unlockedCount}
                totalCount={achievementSummary.totalCount}
                nextAchievement={achievementSummary.nextAchievement}
              />
              <HistoryPanel entries={historyEntries} streak={streak} averageScore={localStats.averageScore} uniqueModes={localStats.uniqueModes} />
            </>
          ) : (
            <div className="lg:col-span-3 rounded-[2rem] border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-600 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Ton espace perso</p>
              <h3 className="mt-2 text-xl font-bold text-zinc-950">Historique, trophées et classement apparaissent après ton premier verdict</h3>
              <p className="mt-3">Tout reste local sur cet appareil, donc rien n’apparaît tant que tu n’as pas lancé au moins un stonomètre.</p>
            </div>
          )}
        </section>

        <section className="mt-6 hidden gap-3 lg:grid lg:grid-cols-2">
          <Link href="/privacy" className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50">
            <span>Vie privée</span>
            <span>↗</span>
          </Link>
          <Link href="/terms" className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50">
            <span>Conditions</span>
            <span>↗</span>
          </Link>
        </section>
      </main>

      {showOptionsMenu ? (
        <div className="fixed inset-0 z-40 bg-zinc-950/45 p-3 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-white/30 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Options</p>
                <h2 className="mt-1 text-xl font-bold text-zinc-950">Ton espace T&apos;es stone ?</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowOptionsMenu(false)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg font-semibold text-zinc-700"
                aria-label="Fermer les options"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
              <div className="grid gap-3 grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Série</p>
                  <p className="mt-2 text-2xl font-black text-zinc-950">{streak}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Record</p>
                  <p className="mt-2 text-2xl font-black text-zinc-950">{localStats.worstScore || "--"}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Trophées</p>
                  <p className="mt-2 text-2xl font-black text-zinc-950">{achievementSummary.unlockedCount}</p>
                </div>
              </div>

              {hasHistory ? (
                <>
                  <PersonalRanking entries={historyEntries} />
                  <AchievementsPanel
                    achievements={achievementSummary.achievements}
                    unlockedCount={achievementSummary.unlockedCount}
                    totalCount={achievementSummary.totalCount}
                    nextAchievement={achievementSummary.nextAchievement}
                  />
                  <HistoryPanel
                    entries={historyEntries}
                    streak={streak}
                    averageScore={localStats.averageScore}
                    uniqueModes={localStats.uniqueModes}
                  />
                </>
              ) : (
                <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Ton coin perso</p>
                  <h3 className="mt-2 text-xl font-bold text-zinc-950">Il se remplit après ton premier verdict</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    Dès que tu lances un stonomètre, tu débloques ton historique, tes trophées et ton top des vibes les plus mémorables, toujours sur cet appareil.
                  </p>
                </div>
              )}

              <div className="grid gap-3">
                <Link
                  href="/privacy"
                  onClick={() => setShowOptionsMenu(false)}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700"
                >
                  <span>Vie privée</span>
                  <span>↗</span>
                </Link>
                <Link
                  href="/terms"
                  onClick={() => setShowOptionsMenu(false)}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700"
                >
                  <span>Conditions</span>
                  <span>↗</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed left-0 top-0 -translate-x-[220%] overflow-hidden" aria-hidden="true">
        <div
          ref={exportCardRef}
          className="w-[380px] rounded-[2.6rem] bg-[linear-gradient(180deg,#fff7fb_0%,#fff1f6_24%,#fff8ec_58%,#f5fbff_100%)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)]"
        >
          <div className="mx-auto w-full max-w-[268px]">
            <ResultCard result={cardResult} theme={cardTheme} showWatermark premium fixedAspect />
          </div>
        </div>
      </div>
    </>
  );
}
