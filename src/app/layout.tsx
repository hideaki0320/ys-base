import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/LayoutShell";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://ys-base-production.up.railway.app";
const SITE_NAME = "YS-BASE";
const SITE_DESCRIPTION =
  "横浜市瀬谷区のサッカーコート「YS-BASE」。Y.S.C.C.横浜が運営する天然芝のスポーツパーク。少年サッカーからシニアまで、コート予約・レンタルはこちら。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "YS-BASE | Y.S.C.C.横浜 天然芝スポーツパーク",
    template: "%s | YS-BASE",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "YS-BASE",
    "サッカーコート",
    "天然芝",
    "横浜",
    "瀬谷区",
    "コート予約",
    "レンタル",
    "YSCC",
    "Y.S.C.C.横浜",
    "スポーツパーク",
    "少年サッカー",
    "フットサル",
  ],
  authors: [{ name: "Y.S.C.C.横浜" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "YS-BASE | Y.S.C.C.横浜 天然芝スポーツパーク",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "YS-BASE 天然芝サッカーコート",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YS-BASE | Y.S.C.C.横浜 天然芝スポーツパーク",
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "YS-BASE",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: "045-000-0000",
    email: "info@ys-base.jp",
    address: {
      "@type": "PostalAddress",
      streetAddress: "下瀬谷1丁目41-4",
      addressLocality: "横浜市瀬谷区",
      addressRegion: "神奈川県",
      postalCode: "246-0035",
      addressCountry: "JP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.4594,
      longitude: 139.4984,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "14:00",
        closes: "21:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "09:00",
        closes: "21:00",
      },
    ],
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "天然芝コート", value: true },
      { "@type": "LocationFeatureSpecification", name: "無料駐車場（38台）", value: true },
      { "@type": "LocationFeatureSpecification", name: "ナイター照明", value: true },
    ],
    image: `${SITE_URL}/images/hero_img.png`,
    priceRange: "¥5,500〜¥16,500",
    parentOrganization: {
      "@type": "SportsTeam",
      name: "Y.S.C.C.横浜",
      sport: "サッカー",
    },
  };

  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
