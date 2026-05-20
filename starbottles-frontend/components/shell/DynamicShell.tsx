"use client";

import { useSession } from "next-auth/react";
import AppShell from "./AppShell";

export default function DynamicShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "trainee";
  return <AppShell role={role}>{children}</AppShell>;
}
