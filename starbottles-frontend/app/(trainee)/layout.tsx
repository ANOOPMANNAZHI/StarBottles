import AppShell from "@/components/shell/AppShell";

export default function TraineeLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="trainee">{children}</AppShell>;
}
