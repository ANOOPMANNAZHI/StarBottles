import AppShell from "@/components/shell/AppShell";

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="">{children}</AppShell>;
}
