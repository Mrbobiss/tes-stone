import { NextRequest, NextResponse } from "next/server";

import { getLibraryFromDrive } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const source =
    request.nextUrl.searchParams.get("folder") ??
    request.nextUrl.searchParams.get("source") ??
    "";

  if (!source.trim()) {
    return NextResponse.json(
      { error: "Ajoute un lien Google Drive ou un folder ID." },
      { status: 400 },
    );
  }

  try {
    const library = await getLibraryFromDrive(source);

    return NextResponse.json(library, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    const status = /folder ID|dossier|image|GOOGLE_API_KEY/i.test(message) ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
