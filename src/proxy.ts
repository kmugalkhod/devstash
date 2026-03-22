import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtectedRoute = pathname.startsWith("/dashboard");

  if (isProtectedRoute && !req.auth) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
