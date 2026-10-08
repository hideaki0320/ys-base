import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site";

const CANONICAL_HOST = new URL(SITE_URL).host;

/**
 * Railway の既定ドメイン（*.up.railway.app）で開かれたページを正式ドメインへ 301 転送する。
 * 同じページが2つの URL で検索エンジンに載るのを防ぐため。
 * /api は対象外（Stripe の webhook は転送に追従しないため、旧ドメイン宛てでも直接受ける）。
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (host.endsWith(".up.railway.app") && host !== CANONICAL_HOST) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, SITE_URL);
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/).*)"],
};
