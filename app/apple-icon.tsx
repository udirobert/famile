import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#1a1438",
        }}
      >
        <div
          style={{
            width: 86,
            height: 86,
            marginTop: 25,
            borderRadius: "50%",
            background:
              "linear-gradient(to bottom, #ffc581, #ffb8e0 30%, #c4b0ff 65%, #7ee8c8)",
            display: "flex",
          }}
        />
        <div
          style={{
            width: 130,
            height: 6,
            marginTop: 8,
            background: "#c4b0ff",
            opacity: 0.55,
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
