import AppShell from "@/components/shell/AppShell";

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="executive">{children}</AppShell>;
}
