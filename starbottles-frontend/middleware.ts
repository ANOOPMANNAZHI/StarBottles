import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Map routes to the permission required to access them
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/dashboard":      "dashboard",
  "/users":          "users",
  "/enquiries":      "enquiries",
  "/reports":        "reports",
  "/training":       "training-manage",
  "/admin/products": "products",
  "/admin/roles":    "roles",
  "/cms":            "cms",
  "/inbox":          "enquiries",
  "/learning":       "training-view",
  "/quiz":           "quiz-view",
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users to login
  if (!token) {
    if (pathname === "/login") return NextResponse.next();
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from /login
  if (pathname === "/login") {
    const role = (token as any).role as string;
    const permissions = ((token as any).permissions ?? []) as string[];
    if (role === "admin") return NextResponse.redirect(new URL("/dashboard", request.url));
    if (permissions.includes("dashboard")) return NextResponse.redirect(new URL("/dashboard", request.url));
    if (permissions.includes("training-view")) return NextResponse.redirect(new URL("/learning", request.url));
    if (permissions.includes("enquiries")) return NextResponse.redirect(new URL("/inbox", request.url));
    // Fallback — send to dashboard and let the permission check handle it
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const role = (token as any).role as string;
  const permissions = ((token as any).permissions ?? []) as string[];

  // Admin bypasses all permission checks
  if (role === "admin") {
    return NextResponse.next();
  }

  // Check route permissions
  for (const [route, perm] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      if (!permissions.includes(perm)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|unauthorized|api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
