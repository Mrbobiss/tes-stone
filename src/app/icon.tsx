import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #ffd666 0%, #ffa94d 52%, #c4b5fd 100%)",
          color: "#111827",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: 72,
            background: "rgba(255,255,255,0.76)",
            border: "2px solid rgba(255,255,255,0.78)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 150, lineHeight: 1 }}>😶‍🌫️</div>
          <div style={{ fontSize: 54, fontWeight: 800 }}>T&apos;es stone ?</div>
        </div>
      </div>
    ),
    size,
  );
}
