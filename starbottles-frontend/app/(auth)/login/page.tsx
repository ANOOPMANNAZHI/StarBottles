"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
/* eslint-disable @next/next/no-img-element */
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/dashboard",
  executive: "/dashboard",
  trainee: "/dashboard",
};

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  InvalidCredentials: "Invalid email or password.",
  AccountDeactivated: "Account is deactivated. Contact your administrator.",
  RateLimited: "Too many attempts. Please try again later.",
};

function WavePattern() {
  return (
    <svg
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path
        d="M0,300 C100,220 200,380 300,300 C400,220 500,380 600,300 C700,220 750,320 800,280 L800,600 L0,600 Z"
        fill="white"
        fillOpacity="0.03"
      />
      <path
        d="M0,360 C80,290 180,430 280,360 C380,290 480,430 580,360 C680,290 740,370 800,340 L800,600 L0,600 Z"
        fill="white"
        fillOpacity="0.05"
      />
      <path
        d="M0,430 C60,370 160,490 260,430 C360,370 460,490 560,430 C660,370 730,440 800,410 L800,600 L0,600 Z"
        fill="white"
        fillOpacity="0.07"
      />
      <circle cx="680" cy="120" r="140" fill="white" fillOpacity="0.03" />
      <circle cx="680" cy="120" r="90" fill="white" fillOpacity="0.03" />
      <circle cx="80" cy="520" r="100" fill="white" fillOpacity="0.03" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      const errorCode =
        result.url
          ? new URL(result.url).searchParams.get("error") ?? result.error
          : result.error;

      setAuthError(ERROR_MESSAGES[errorCode] ?? "Something went wrong. Please try again.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role: string = (session?.user as { role?: string })?.role ?? "";

    router.push(ROLE_REDIRECTS[role] ?? "/");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Brand panel */}
      <div
        className="relative lg:w-[55%] flex flex-col justify-between overflow-hidden"
        style={{
          background: "linear-gradient(145deg, oklch(0.17 0.06 252) 0%, oklch(0.28 0.12 252) 35%, oklch(0.45 0.18 228) 100%)",
          minHeight: "clamp(200px, 40vw, 100vh)",
        }}
      >
        <WavePattern />

        <div className="relative z-10 flex flex-col justify-center flex-1 px-10 py-14 lg:px-16 lg:py-20">
          {/* Logo */}
          <div className="mb-10 lg:mb-14">
            <img src="/logo-white.png" alt="Star Bottles" width={200} height={50} />
          </div>

          {/* Hero */}
          <div className="space-y-4 max-w-md">
            <h1 className="text-3xl lg:text-[42px] font-bold text-white leading-[1.1] tracking-tight">
              Your sales intelligence platform
            </h1>
            <p className="text-base lg:text-lg text-white/45 leading-relaxed max-w-sm">
              Manage enquiries, track products, and develop your team — all in one place.
            </p>
          </div>

          {/* Feature list */}
          <div className="mt-10 lg:mt-14 space-y-4 hidden lg:block">
            {[
              { text: "Real-time ERP product sync", desc: "Always up-to-date catalogue" },
              { text: "Multi-role access control", desc: "Admin, executive & trainee views" },
              { text: "Integrated training platform", desc: "Quizzes, videos & materials" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-[oklch(0.58_0.20_218)]/20 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.19_218)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">{item.text}</p>
                  <p className="text-xs text-white/30 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 px-10 pb-8 lg:px-16 lg:pb-10 hidden lg:block">
          <p className="text-xs text-white/20 tracking-wide">
            &copy; {new Date().getFullYear()} StarBottles Enterprise
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="lg:w-[45%] flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-sm">

          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <img src="/logo-sm.png" alt="Star Bottles" width={120} height={30} />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Error banner */}
            {authError && (
              <div className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3 bg-destructive/6 border border-destructive/15 text-destructive">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className={[
                  "h-11 bg-background border-border text-foreground placeholder:text-muted-foreground/50",
                  "focus-visible:ring-accent focus-visible:border-accent",
                  errors.email ? "border-destructive focus-visible:ring-destructive" : "",
                ].join(" ")}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={[
                    "h-11 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground/50",
                    "focus-visible:ring-accent focus-visible:border-accent",
                    errors.password ? "border-destructive focus-visible:ring-destructive" : "",
                  ].join(" ")}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-200"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm group"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>

          {/* Mobile footer */}
          <p className="lg:hidden mt-10 text-center text-xs text-muted-foreground/40">
            &copy; {new Date().getFullYear()} StarBottles Enterprise
          </p>
        </div>
      </div>
    </div>
  );
}
