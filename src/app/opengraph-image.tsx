import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          background: "linear-gradient(135deg, #fff8ef 0%, #fff8fb 52%, #eef8ff 100%)",
          padding: "44px",
          fontFamily: "sans-serif",
          color: "#111827",
        }}
      >
        <div
          style={{
            width: "58%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 999,
                padding: "10px 18px",
                background: "rgba(255,255,255,0.82)",
                fontSize: 22,
                fontWeight: 700,
                color: "#6b7280",
              }}
            >
              Stonomètre selfie, fun et partageable
            </div>
            <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.02 }}>T&apos;es stone ?</div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.18 }}>L&apos;IA qui juge ton niveau de vibe planante.</div>
            <div style={{ fontSize: 28, color: "#4b5563", lineHeight: 1.35 }}>
              Prends un selfie, choisis ta ref et récupère un score stone, un badge drôle et une carte à poster.
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              "Divertissement uniquement",
              "Refs Renaud, Bob Marley, Mick Jagger...",
              "Punchlines 100% locales",
            ].map((item) => (
              <div
                key={item}
                style={{
                  borderRadius: 999,
                  background: "#111827",
                  color: "white",
                  padding: "12px 18px",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            width: "34%",
            borderRadius: 42,
            overflow: "hidden",
            background: "linear-gradient(180deg, #f59e0b 0%, #fb7185 52%, #60a5fa 100%)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 25px 80px rgba(15,23,42,0.18)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, fontWeight: 700 }}>
            <div>T&apos;es stone ?</div>
            <div>😶‍🌫️</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.78)", borderRadius: 28, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#6b7280" }}>Score stone</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={{ fontSize: 112, fontWeight: 900, lineHeight: 0.9 }}>84</div>
              <div style={{ fontSize: 34, color: "#6b7280", paddingBottom: 10 }}>/100</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>Badge, Orbite sociale sponsor officiel</div>
            <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2 }}>
              “Ton regard a déjà pris la navette et ton corps gère l&apos;accueil.”
            </div>
          </div>
          <div style={{ background: "rgba(17,24,39,0.86)", color: "white", borderRadius: 28, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 19, opacity: 0.7, textTransform: "uppercase", letterSpacing: 2 }}>Conseil express</div>
            <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25 }}>Reste simple, hydraté et très canapé-compatible.</div>
            <div style={{ fontSize: 20, opacity: 0.9 }}>Le texte final vient de la bibliothèque locale, pas du modèle.</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
