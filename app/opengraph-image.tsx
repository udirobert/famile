import { ImageResponse } from "next/og";

export const alt = "famile - a suite of health products, AI-native and AI-enabled";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#1a1438",
          fontFamily: "sans-serif",
        }}
      >
        {/* Aurora layers */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(196,176,255,0.38), transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse 50% 40% at 80% 70%, rgba(126,232,200,0.28), transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse 40% 30% at 50% 50%, rgba(255,184,224,0.22), transparent 70%)",
          }}
        />
        {/* Warm amber dawn glow low - keeps the canvas calm, not cold */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse 70% 35% at 50% 100%, rgba(255,197,129,0.26), transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "80px",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 38,
                fontStyle: "italic",
                color: "#c4b0ff",
                letterSpacing: -1,
              }}
            >
              famile
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#7ee8c8",
                  display: "flex",
                }}
              />
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#ffb8e0",
                  display: "flex",
                }}
              />
            </div>
          </div>

          {/* Headline + tagline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 88,
                  fontWeight: 500,
                  color: "#f5edff",
                  letterSpacing: -3,
                  lineHeight: 1.05,
                }}
              >
                Care, in
              </div>
              <div
                style={{
                  fontSize: 88,
                  fontWeight: 500,
                  letterSpacing: -3,
                  lineHeight: 1.05,
                  background:
                    "linear-gradient(100deg, #ffb8e0, #c4b0ff 40%, #7ee8c8 80%, #ffc581)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                continuous motion.
              </div>
            </div>
            <div
              style={{
                fontSize: 30,
                color: "#b5a8d6",
                maxWidth: 740,
                lineHeight: 1.4,
              }}
            >
              A suite of AI-native and AI-enabled health products. Quiet to
              live with, present when it matters.
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(196,176,255,0.18)",
              paddingTop: 36,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 24,
                fontSize: 28,
                color: "#f5edff",
              }}
            >
              <span>Sukari</span>
              <span style={{ color: "#6b5e8a" }}>·</span>
              <span>Orbura</span>
            </div>
            <div style={{ fontSize: 28, color: "#6b5e8a" }}>famile.xyz</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
