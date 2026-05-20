"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

const ROLE_HOME: Record<string, string> = {
  admin: "/dashboard",
  executive: "/inbox",
  trainee: "/learning",
};

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const role: string = (session?.user as { role?: string })?.role ?? "";
  const homeHref = ROLE_HOME[role] ?? "/";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.22 0.09 252) 0%, oklch(0.30 0.11 252) 40%, oklch(0.42 0.15 234) 75%, oklch(0.52 0.17 220) 100%)",
      }}
    >
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glow halo behind card */}
        <div
          className="absolute inset-0 rounded-3xl blur-2xl opacity-30 pointer-events-none"
          style={{ background: "oklch(0.62 0.19 218)" }}
        />

        <div className="relative bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.62 0.19 218) 0%, oklch(0.50 0.18 228) 100%)",
              }}
            >
              <ShieldOff size={36} className="text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Access Denied</h1>

          {/* Body text */}
          <p className="text-white/60 text-sm leading-relaxed mb-2">
            You do not have permission to view this page.
          </p>
          {role && (
            <p className="text-white/50 text-sm">
              Your role{" "}
              <span
                className="font-semibold capitalize px-1.5 py-0.5 rounded-md text-white/80"
                style={{ background: "oklch(1 0 0 / 8%)" }}
              >
                {role}
              </span>{" "}
              does not have access to this resource.
            </p>
          )}

          {/* Divider */}
          <div className="my-8 border-t border-white/10" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="h-10 px-6 font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.62 0.19 218) 0%, oklch(0.50 0.18 228) 100%)",
                color: "white",
              }}
            >
              <Link href={homeHref}>Go to Dashboard</Link>
            </Button>
            <Button
              variant="outline"
              className="h-10 px-6 font-semibold text-sm border-white/20 text-white/80 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign Out
            </Button>
          </div>

          {/* Footer note */}
          <p className="mt-8 text-white/30 text-xs">
            StarBottles Enterprise Platform
          </p>
        </div>
      </div>
    </div>
  );
}
