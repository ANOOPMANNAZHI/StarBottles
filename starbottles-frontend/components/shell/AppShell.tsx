"use client";

import { useState } from "react";
import Link from "next/link";
/* eslint-disable @next/next/no-img-element */
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Menu, X, LogOut, Search, Bell, ChevronRight,
  LayoutDashboard, MessageSquare, Users, GraduationCap, BarChart2, Package, Globe,
  Inbox, BookOpen, ClipboardList, Settings, RefreshCw, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationBell from "@/components/shell/NotificationBell";
import GlobalSearch, { useGlobalSearch } from "@/components/shell/GlobalSearch";
import ErpSyncIndicator from "@/components/shell/ErpSyncIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type NavItem = { label: string; href: string; icon: React.ElementType; section?: string; permission?: string; hideForAdmin?: boolean; adminOnly?: boolean };

const ALL_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard",     icon: LayoutDashboard, section: "Overview",   permission: "dashboard" },
  { label: "Enquiries", href: "/enquiries",      icon: MessageSquare,   section: "Overview",   permission: "enquiries", adminOnly: true },
  { label: "Users",     href: "/users",          icon: Users,           section: "Management", permission: "users" },
  { label: "Training",  href: "/training",       icon: GraduationCap,   section: "Management", permission: "training-manage" },
  { label: "Reports",   href: "/reports",        icon: BarChart2,       section: "Analytics",  permission: "reports" },
  { label: "Products",    href: "/admin/products",            icon: Package,  section: "Analytics",  permission: "products" },
  { label: "Categories", href: "/admin/products/categories", icon: Layers,   section: "Analytics",  permission: "products" },
  { label: "Website",   href: "/cms",            icon: Globe,           section: "Content",    permission: "cms" },
  { label: "Catalogue", href: "/admin/catalogue",     icon: BookOpen,    section: "Content",    permission: "catalogue", adminOnly: true },
  { label: "ERP Sync",  href: "/admin/erp-settings", icon: RefreshCw,   section: "Content",    permission: "erp-sync", adminOnly: true },
  { label: "Roles",     href: "/admin/roles",    icon: Settings,        section: "Content",    permission: "roles" },
  { label: "My Enquiries", href: "/inbox",       icon: Inbox,                                  permission: "enquiries",     hideForAdmin: true },
  { label: "Products",  href: "/products",       icon: Package,                                permission: "training-view", hideForAdmin: true },
  { label: "Learning",  href: "/learning",       icon: BookOpen,                               permission: "training-view", hideForAdmin: true },
  { label: "Quiz",      href: "/quiz",           icon: ClipboardList,                          permission: "quiz-view",     hideForAdmin: true },
];

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/enquiries": "Enquiries",
  "/users": "Team Members",
  "/training": "Training",
  "/reports": "Reports & Analytics",
  "/admin/products": "Product Catalogue",
  "/admin/products/categories": "Product Categories",
  "/admin/catalogue": "Product Catalogue PDF",
  "/admin/erp-settings": "ERP Settings",
  "/products": "Products",
  "/profile": "My Profile",
  "/cms": "Website CMS",
  "/cms/media": "Media Library",
  "/cms/banners": "Banners",
  "/cms/settings": "Site Settings",
  "/cms/pages": "Page Content",
  "/cms/seo": "SEO Settings",
  "/cms/testimonials": "Testimonials",
  "/cms/milestones": "Milestones",
  "/cms/company-stats": "Company Stats",
  "/inbox": "My Enquiries",
  "/learning": "Learning Hub",
  "/quiz": "Quizzes",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [];
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return crumbs;

  // Build breadcrumbs from path
  let path = "";
  for (const seg of segments) {
    path += "/" + seg;
    if (PAGE_LABELS[path]) {
      crumbs.push({ label: PAGE_LABELS[path], href: path });
    }
  }

  // Mark last as current (no link)
  if (crumbs.length > 0) {
    crumbs[crumbs.length - 1] = { label: crumbs[crumbs.length - 1].label };
  }

  return crumbs;
}

function StarBottlesLogo({ size = "default" }: { size?: "default" | "small" }) {
  return (
    <img
      src="/logo-white.png"
      alt="Star Bottles"
      width={size === "default" ? 180 : 150}
      height={size === "default" ? 45 : 38}
    />
  );
}

export default function AppShell({
  role: roleProp,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const globalSearch = useGlobalSearch();

  const user = session?.user as { name?: string; email?: string; role?: string; permissions?: string[] } | undefined;
  const role = user?.role ?? roleProp;
  const displayName = user?.name ?? user?.email ?? "User";
  const initials = getInitials(displayName);
  const userPerms = user?.permissions ?? [];
  const isAdmin = role === "admin";
  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (isAdmin) return !item.hideForAdmin;
    if (item.adminOnly) return false;
    if (!item.permission) return true;
    return userPerms.includes(item.permission);
  });
  const breadcrumbs = getBreadcrumbs(pathname);

  function isActive(href: string) {
    if (pathname === href) return true;
    // Only match as prefix if no other nav item matches the current path exactly
    if (pathname.startsWith(href + "/")) {
      return !navItems.some((item) => item.href !== href && pathname === item.href);
    }
    return false;
  }

  // Group nav items by section
  const sections = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.section ?? "";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sidebar = (
    <nav className="flex flex-col h-full bg-[var(--sidebar)]">
      {/* Logo */}
      <div className="px-5 py-5 flex flex-col gap-1.5">
        <StarBottlesLogo />
        {role && (
          <Badge
            variant="outline"
            className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35 border-white/10 px-1.5 py-0 mt-1"
          >
            {role}
          </Badge>
        )}
      </div>

      <div className="mx-4 border-t border-white/[0.06]" />

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            {section && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                {section}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                      active
                        ? "bg-white/[0.12] text-white shadow-sm"
                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                    )}
                  >
                    <Icon
                      size={16}
                      strokeWidth={active ? 2 : 1.75}
                      className={cn(
                        "shrink-0 transition-all duration-200",
                        active
                          ? "text-[oklch(0.72_0.18_218)]"
                          : "text-white/35 group-hover:text-white/60"
                      )}
                    />
                    {label}
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.18_218)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar footer */}
      <div className="border-t border-white/[0.06] px-3 py-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200"
        >
          <LogOut size={15} strokeWidth={1.75} className="shrink-0" />
          Sign Out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-border/50">
        {sidebar}
      </aside>

      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col lg:hidden shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          className="absolute top-4 right-3 z-10 p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
        {sidebar}
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header bar */}
        <header className="flex items-center justify-between h-[56px] px-4 lg:px-6 bg-card border-b border-border/60 shrink-0">
          {/* Left: hamburger + breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            {/* Mobile logo */}
            <div className="lg:hidden">
              <img src="/logo-sm.png" alt="Star Bottles" width={120} height={30} />
            </div>

            {/* Desktop breadcrumbs */}
            <nav className="hidden lg:flex items-center gap-1.5 text-sm min-w-0" aria-label="Breadcrumbs">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && <ChevronRight size={12} className="text-muted-foreground/40 shrink-0" />}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 truncate"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-foreground truncate">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            {/* Search trigger */}
            <button
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-muted/50 border border-border/60 text-muted-foreground text-xs hover:bg-muted hover:text-foreground transition-all duration-200"
              onClick={() => globalSearch.setOpen(true)}
            >
              <Search size={13} />
              <span className="hidden md:inline">Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-medium text-muted-foreground/70 ml-2">
                <span className="text-[9px]">Ctrl</span>K
              </kbd>
            </button>

            {/* ERP sync indicator — only for users with erp-sync permission */}
            {(isAdmin || userPerms.includes("erp-sync")) && <ErpSyncIndicator />}

            {/* Notifications */}
            <NotificationBell />

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 ml-1 px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-all duration-200">
                  <Avatar className="h-7 w-7 ring-2 ring-border">
                    <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-[oklch(0.58_0.20_218)] to-[oklch(0.48_0.18_228)] text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-semibold text-foreground leading-tight">{displayName}</span>
                    <span className="text-[10px] text-muted-foreground capitalize leading-tight">{role}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-2 md:hidden">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => window.location.href = "/profile"}>
                  <Settings size={14} />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut size={14} />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <GlobalSearch open={globalSearch.open} onOpenChange={globalSearch.setOpen} />
    </div>
  );
}
