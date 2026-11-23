import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 反映の切り替わりで、古いページが消えた CSS・JS を読みに行って崩れるのを防ぐ
  // （公式のセルフホストの説明。ずれたら Next.js が自動で読み直す）
  deploymentId: process.env.RAILWAY_GIT_COMMIT_SHA,
  /* config options here */
};

export default nextConfig;
