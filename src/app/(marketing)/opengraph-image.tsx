import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WORDS = [
  { text: "One" },
  { text: "system" },
  { text: "to" },
  { text: "run", color: "#f5821f" },
  { text: "your" },
  { text: "exotic" },
  { text: "rental" },
  { text: "fleet." },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0b0d",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              position: "relative",
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "#f5821f",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 20,
                top: 17,
                width: 8,
                height: 30,
                borderRadius: 3,
                backgroundColor: "#0b0b0d",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 36,
                top: 17,
                width: 18,
                height: 8,
                borderRadius: 3,
                backgroundColor: "#0b0b0d",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 36,
                top: 32,
                width: 18,
                height: 8,
                borderRadius: 3,
                backgroundColor: "#0b0b0d",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#f5f5f7" }}>
            ferro<span style={{ color: "#f5821f" }}>_</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
            fontSize: 56,
            fontWeight: 800,
            color: "#f5f5f7",
            textAlign: "center",
            maxWidth: 940,
            letterSpacing: -1.5,
          }}
        >
          {WORDS.map((word) => (
            <span key={word.text} style={{ color: word.color ?? "#f5f5f7" }}>
              {word.text}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#9a9aa0", marginTop: 28 }}>
          Website · CRM · Calendar · Invoicing · Fleet listings
        </div>
      </div>
    ),
    { ...size }
  );
}
