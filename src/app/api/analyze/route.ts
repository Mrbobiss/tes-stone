import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { analyzeSelfieWithAI } from "@/lib/ai/vision";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { buildFallbackAnalysis } from "@/lib/fallback";
import { generateResult } from "@/lib/result-engine";
import { APP_MODES, type AnalyzeResponse, type AppMode } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAppMode(value: string): value is AppMode {
  return APP_MODES.includes(value as AppMode);
}

function toDataUrl(file: File, buffer: Buffer) {
  return `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const modeValue = String(formData.get("mode") ?? "normal");

    if (!(image instanceof File)) {
      return NextResponse.json({ ok: false, error: "Image manquante." }, { status: 400 });
    }

    if (!isAppMode(modeValue)) {
      return NextResponse.json({ ok: false, error: "Mode invalide." }, { status: 400 });
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "Format image invalide." }, { status: 400 });
    }

    if (image.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Image trop lourde. Garde un selfie léger pour le MVP." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const dataUrl = toDataUrl(image, buffer);
    const variantSeed = createHash("sha1")
      .update(buffer)
      .update(`:${Date.now()}:${randomUUID()}`)
      .digest("hex")
      .slice(0, 16);

    let analysis;
    let usedFallback = false;

    try {
      analysis = await analyzeSelfieWithAI(dataUrl);
    } catch {
      usedFallback = true;
      analysis = buildFallbackAnalysis(`${modeValue}:${image.name}:${image.size}`);
    }

    const result = generateResult(analysis, modeValue, { usedFallback, variantSeed });
    const payload: AnalyzeResponse = {
      ok: true,
      analysis,
      result,
      usedFallback,
      variantSeed,
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Impossible de juger cette photo pour le moment." },
      { status: 500 },
    );
  }
}
