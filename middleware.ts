import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { teamDocsSkipCpAuth } from "@/lib/team-docs-dev-bypass";

const PROTECTED_PATHS = ["/team", "/team/:path*"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = PROTECTED_PATHS.some((path) => {
    if (path.includes(":path*")) {
      const basePath = path.replace("/:path*", "");
      return pathname.startsWith(basePath);
    }
    return pathname === path;
  });

  if (!isProtectedPath) {
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  }

  if (teamDocsSkipCpAuth(request.nextUrl.hostname)) {
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  }

  const sessionId =
    request.cookies.get("__Secure-better-auth.session_token")?.value ??
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth-session_token")?.value ??
    request.cookies.get("better-auth-session_token")?.value;

  if (!sessionId) {
    const cpApiUrl = process.env.NEXT_PUBLIC_CP_API_URL || "https://api.synap.live";
    const loginUrl = new URL(`${cpApiUrl}/auth/sign-in`, request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
