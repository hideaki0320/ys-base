import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "YS-BASE 天然芝サッカーコート";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const heroPath = join(process.cwd(), "public/images/hero_img.png");
  const heroBuffer = await readFile(heroPath);
  const heroBase64 = `data:image/png;base64,${heroBuffer.toString("base64")}`;

  const logoPath = join(process.cwd(), "public/images/icon-512.png");
  const logoBuffer = await readFile(logoPath);
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
        }}
      >
        {/* Background image */}
        <img
          src={heroBase64}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,26,51,0.7) 0%, rgba(0,51,102,0.5) 50%, rgba(0,26,51,0.8) 100%)",
            display: "flex",
          }}
        />
        {/* Content */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
          }}
        >
          <img
            src={logoBase64}
            alt=""
            width={80}
            height={80}
            style={{ marginBottom: 20 }}
          />
          <div
            style={{
              color: "#c5a55a",
              fontSize: 16,
              letterSpacing: "0.3em",
              marginBottom: 12,
            }}
          >
            SPORTS PARK BY YSCC
          </div>
          <div
            style={{
              color: "white",
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: "0.1em",
              marginBottom: 16,
            }}
          >
            YS-BASE
          </div>
          <div
            style={{
              width: 60,
              height: 3,
              background: "#c5a55a",
              marginBottom: 24,
            }}
          />
          <div
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 24,
              textAlign: "center",
            }}
          >
            横浜市瀬谷区の天然芝サッカーコート
          </div>
        </div>
        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#c5a55a",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
