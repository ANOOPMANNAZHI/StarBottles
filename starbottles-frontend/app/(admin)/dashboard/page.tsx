"use client";

import { useSession } from "next-auth/react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import ExecutiveDashboard from "@/components/dashboard/ExecutiveDashboard";
import TraineeDashboard from "@/components/dashboard/TraineeDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="p-5 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  const user = session?.user as { name?: string; role?: string } | undefined;
  const role = user?.role;
  const userName = user?.name?.split(" ")[0] ?? "User";

  if (role === "executive") return <ExecutiveDashboard userName={userName} />;
  if (role === "trainee") return <TraineeDashboard userName={userName} />;
  return <AdminDashboard userName={userName} />;
}
