"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Info, Briefcase, GraduationCap, ShieldCheck } from "lucide-react";
import { useCreateUser } from "@/hooks/useUsers";
import ResetPasswordDialog from "./ResetPasswordDialog";

const schema = z.object({
  name:  z.string().min(1, "Name is required").max(255),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(1, "Phone is required").max(20),
  role:  z.enum(["admin", "executive", "trainee"], { error: "Select a role" }),
});

type FormValues = z.infer<typeof schema>;

const ROLES = [
  {
    value: "admin" as const,
    label: "Admin",
    description: "Full access to all platform settings",
    Icon: ShieldCheck,
  },
  {
    value: "executive" as const,
    label: "Executive",
    description: "Manages enquiries & customer follow-ups",
    Icon: Briefcase,
  },
  {
    value: "trainee" as const,
    label: "Trainee",
    description: "Accesses learning modules & quizzes",
    Icon: GraduationCap,
  },
];

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormValues) => {
    const res = await createUser.mutateAsync(data);
    setTempPassword(res.data.temporary_password);
    reset();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-[460px]">

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
              <UserPlus size={18} style={{ color: "oklch(0.82 0.12 218)" }} />
            </div>
            <div>
              <DialogHeader>
                <DialogTitle className="text-white text-base font-semibold leading-tight">
                  Add Team Member
                </DialogTitle>
              </DialogHeader>
              <p className="text-white/55 text-[12px] mt-0.5">
                A temporary password will be generated automatically.
              </p>
            </div>
          </div>

          {/* ── Form body ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4 bg-background">

            {/* Name + Email row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Full Name
                </Label>
                <Input
                  placeholder="Jane Smith"
                  className="h-9 text-sm"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Phone
                </Label>
                <Input
                  placeholder="+91 98765 43210"
                  className="h-9 text-sm"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-[11px] text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Email Address
              </Label>
              <Input
                type="email"
                placeholder="jane@company.com"
                className="h-9 text-sm"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[11px] text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Role — visual card picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Role
              </Label>
              <div className="grid grid-cols-3 gap-2.5">
                {ROLES.map(({ value, label, description, Icon }) => {
                  const active = selectedRole === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue("role", value, { shouldValidate: true })}
                      className={`relative flex flex-col items-start gap-1.5 rounded-xl border-2 px-3.5 py-3 text-left transition-all duration-150 ${
                        active
                          ? "border-[oklch(0.62_0.19_218)] bg-[oklch(0.62_0.19_218_/_0.06)]"
                          : "border-border bg-card hover:border-muted-foreground/40 hover:bg-muted/30"
                      }`}
                    >
                      {/* Active ring dot */}
                      {active && (
                        <span
                          className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full"
                          style={{ backgroundColor: "oklch(0.62 0.19 218)" }}
                        />
                      )}
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: active
                            ? "oklch(0.62 0.19 218 / 0.15)"
                            : "oklch(0.94 0.01 252)",
                        }}
                      >
                        <Icon
                          size={14}
                          style={{
                            color: active
                              ? "oklch(0.50 0.18 228)"
                              : "oklch(0.55 0.06 252)",
                          }}
                        />
                      </span>
                      <div>
                        <p className={`text-[13px] font-semibold leading-tight ${active ? "text-foreground" : "text-muted-foreground"}`}>
                          {label}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 leading-snug mt-0.5">
                          {description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.role && (
                <p className="text-[11px] text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Default password notice */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
              <Info size={14} className="shrink-0 text-amber-600 mt-0.5" />
              <p className="text-[12px] text-amber-800 leading-relaxed">
                A <span className="font-semibold">temporary password</span> will be auto-generated and shown once after creation. Share it securely — the user should change it on first login.
              </p>
            </div>

            {createUser.error && (
              <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                Failed to create user. Please try again.
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-9 text-sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createUser.isPending}
                className="flex-1 h-9 text-sm font-semibold text-white gap-2"
                style={{ backgroundColor: "oklch(0.26 0.10 252)" }}
              >
                {(isSubmitting || createUser.isPending) ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserPlus size={14} />
                )}
                {(isSubmitting || createUser.isPending) ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ResetPasswordDialog
        password={tempPassword}
        onClose={() => setTempPassword(null)}
      />
    </>
  );
}
