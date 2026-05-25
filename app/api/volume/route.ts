import { NextRequest, NextResponse } from "next/server";

import { getVolumeFromDrive } from "@/lib/google-drive";
import { getDefaultDriveSource } from "@/lib/site-config";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const source =
    request.nextUrl.searchParams.get("folder") ??
    request.nextUrl.searchParams.get("source") ??
    getDefaultDriveSource();
  const slug = request.nextUrl.searchParams.get("slug") ?? "";

  if (!slug.trim()) {
    return NextResponse.json({ error: "Slug de tome manquant." }, { status: 400 });
  }

  try {
    const volume = await getVolumeFromDrive(source, slug);

    return NextResponse.json(volume, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
