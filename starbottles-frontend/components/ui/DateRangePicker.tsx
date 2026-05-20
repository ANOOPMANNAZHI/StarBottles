"use client";

import { useState } from "react";
import { format, subDays, subMonths, startOfYear } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "@/hooks/useReports";

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS = [
  { label: "Last 7 Days",    range: (): DateRange => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "Last 30 Days",   range: (): DateRange => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: "Last 3 Months",  range: (): DateRange => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: "This Year",      range: (): DateRange => ({ from: startOfYear(new Date()), to: new Date() }) },
];

export default function DateRangePicker({ value, onChange }: Props) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const label = `${format(value.from, "dd MMM yyyy")} – ${format(value.to, "dd MMM yyyy")}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Presets */}
      {PRESETS.map((p) => (
        <Button
          key={p.label}
          size="sm"
          variant="outline"
          onClick={() => onChange(p.range())}
          className="text-xs"
        >
          {p.label}
        </Button>
      ))}

      {/* From date */}
      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("gap-2 text-xs")}>
            <CalendarIcon className="h-3.5 w-3.5" />
            From: {format(value.from, "dd MMM yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value.from}
            onSelect={(d) => {
              if (d) {
                onChange({ from: d, to: value.to });
                setFromOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* To date */}
      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <CalendarIcon className="h-3.5 w-3.5" />
            To: {format(value.to, "dd MMM yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value.to}
            onSelect={(d) => {
              if (d) {
                onChange({ from: value.from, to: d });
                setToOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <span className="text-sm text-muted-foreground hidden sm:inline">{label}</span>
    </div>
  );
}
