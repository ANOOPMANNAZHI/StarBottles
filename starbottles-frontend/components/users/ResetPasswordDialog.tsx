"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, KeyRound, ShieldAlert } from "lucide-react";

interface ResetPasswordDialogProps {
  password: string | null;
  onClose: () => void;
}

export default function ResetPasswordDialog({
  password,
  onClose,
}: ResetPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={!!password} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-[400px]">

        {/* ── Header ── */}
        <div
          className="px-6 py-5 flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg, oklch(0.26 0.10 252) 0%, oklch(0.32 0.12 240) 100%)",
          }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "oklch(0.62 0.19 218 / 0.25)" }}
          >
            <KeyRound size={18} style={{ color: "oklch(0.82 0.12 218)" }} />
          </div>
          <div>
            <DialogHeader>
              <DialogTitle className="text-white text-base font-semibold leading-tight">
                Temporary Password
              </DialogTitle>
            </DialogHeader>
            <p className="text-white/55 text-[12px] mt-0.5">
              This is the default login password for the new user.
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4 bg-background">

          {/* Password display + copy */}
          <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-3">
            <span className="flex-1 font-mono text-xl font-bold tracking-[0.18em] text-foreground select-all">
              {password}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-8 px-3 shrink-0 gap-1.5 text-xs font-semibold"
              style={copied ? { color: "oklch(0.60 0.18 162)" } : {}}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          {/* Warning notice */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
            <ShieldAlert size={14} className="shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[12px] font-semibold text-amber-800">
                Share this password securely
              </p>
              <p className="text-[12px] text-amber-700 leading-relaxed">
                It will <span className="font-semibold">not be shown again</span>. The user should change it after their first login.
              </p>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full h-9 text-sm font-semibold text-white"
            style={{ backgroundColor: "oklch(0.26 0.10 252)" }}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
