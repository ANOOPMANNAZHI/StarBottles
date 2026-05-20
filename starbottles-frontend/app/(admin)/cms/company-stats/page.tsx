"use client";

import { useState, useEffect } from "react";
import { useCompanyStats, useUpdateCompanyStats, type CompanyStats } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Save, CalendarDays, Users, Package, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";

const DEFAULT: CompanyStats = {
  established: 2010,
  clients: { value: 500, suffix: "+" },
  skus: { value: 1500, suffix: "+" },
  states: { value: 18, suffix: "+" },
  unitsShipped: { value: 10, suffix: "M+" },
};

const STAT_META: {
  key: "clients" | "skus" | "states" | "unitsShipped";
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  { key: "clients", label: "Happy Clients", description: "Total businesses served", icon: Users },
  { key: "skus", label: "SKUs Available", description: "Product variants in catalogue", icon: Package },
  { key: "states", label: "States Covered", description: "Pan-India delivery reach", icon: MapPin },
  { key: "unitsShipped", label: "Units Shipped", description: "Total units delivered", icon: Truck },
];

function StatPreviewCard({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <Card className="p-4 border-border/60 text-center space-y-1">
      <div className="flex justify-center mb-2">
        <div className="p-2 rounded-lg bg-accent/10">
          <Icon size={18} className="text-accent" strokeWidth={1.75} />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}{suffix}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

export default function CompanyStatsPage() {
  const { data, isLoading } = useCompanyStats();
  const save = useUpdateCompanyStats();
  const [form, setForm] = useState<CompanyStats>(DEFAULT);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = <K extends keyof CompanyStats>(key: K, value: CompanyStats[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setStat = (key: "clients" | "skus" | "states" | "unitsShipped", field: "value" | "suffix", val: string) =>
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], [field]: field === "value" ? Number(val) : val } }));

  const handleSave = async () => {
    await save.mutateAsync(form);
    toast.success("Company stats saved");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Stats</h1>
          <p className="text-sm text-muted-foreground mt-1">Numbers displayed in the Hero, Stats, and About sections.</p>
        </div>
        <Button onClick={handleSave} disabled={save.isPending} className="shrink-0">
          {save.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
          Save
        </Button>
      </div>

      {/* Live preview cards */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Live Preview</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STAT_META.map(({ key, label, icon }) => (
            <StatPreviewCard
              key={key}
              icon={icon}
              label={label}
              value={form[key].value}
              suffix={form[key].suffix}
            />
          ))}
        </div>
        <Card className="mt-3 p-4 border-border/60 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-accent/10">
            <CalendarDays size={18} className="text-accent" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-medium">Established {form.established}</p>
            <p className="text-xs text-muted-foreground">Founding year shown in the About section</p>
          </div>
        </Card>
      </div>

      {/* Edit form */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Edit Values</p>
        <Card className="border-border/60 divide-y divide-border/60">
          {/* Established year */}
          <div className="p-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
              <CalendarDays size={16} className="text-muted-foreground" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium block">Year Established</label>
              <p className="text-xs text-muted-foreground">Founding year of the company</p>
            </div>
            <div className="shrink-0">
              <Input
                type="number"
                className="w-28 text-right"
                value={form.established}
                onChange={(e) => set("established", Number(e.target.value))}
              />
            </div>
          </div>

          {/* Stat rows */}
          {STAT_META.map(({ key, label, description, icon: Icon }) => (
            <div key={key} className="p-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-muted-foreground" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium block">{label}</label>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Input
                  type="number"
                  className="w-24 text-right"
                  placeholder="Value"
                  value={form[key].value}
                  onChange={(e) => setStat(key, "value", e.target.value)}
                />
                <Input
                  className="w-16 text-center"
                  placeholder="e.g. +"
                  value={form[key].suffix}
                  onChange={(e) => setStat(key, "suffix", e.target.value)}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[64px]">
                  = <strong className="text-foreground">{form[key].value}{form[key].suffix}</strong>
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Bottom save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={save.isPending}>
          {save.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
          Save Stats
        </Button>
      </div>
    </div>
  );
}
