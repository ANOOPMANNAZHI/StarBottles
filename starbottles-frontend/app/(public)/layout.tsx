import DynamicShell from "@/components/shell/DynamicShell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <DynamicShell>{children}</DynamicShell>;
}
