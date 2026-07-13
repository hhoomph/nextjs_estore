/**
 * Module for admin layout
 *
 * @author hh.oomph@gmail.com
 * @version 4.0.0
 * @since 2025-01-01
 */
"use client";
import {
  LayoutDashboard,
  LogOut,
  Package,
  User,
  ShoppingCart,
  Users,
  BarChart3,
  FolderTree,
  Settings,
  Palette,
  Search,
  Globe,
  Menu,
  ChevronDown,
  Command,
  Monitor,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AdvancedErrorBoundary } from "@/components/errors/advanced-error-boundary";
import { ApiErrorBoundary } from "@/components/errors/api-error-boundary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applyColorPreset, COLOR_PRESETS } from "@/lib/utils/admin-color-presets";
import { useCallback, useEffect, useRef, useState } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { useAdminTheme } from "@/lib/utils/theme-admin-overrides";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { cn } from "@/lib/utils";
// Type definitions
interface BetterAuthSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  session?: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  };
}
interface User {
  name: string;
  email: string;
  image: string;
  role: string;
}
// Density options
type Density = "compact" | "comfortable" | "spacious";
const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
];
// Admin sidebar navigation item definition
interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: "dashboard" | "commerce" | "content" | "users" | "settings";
}
// Admin navigation groups
const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/", label: "Main Page", icon: Globe, group: "dashboard" as const },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, group: "dashboard" as const },
  // Commerce
  { href: "/admin/products", label: "Products", icon: Package, group: "commerce" as const },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, group: "commerce" as const },
  { href: "/admin/collections", label: "Collections", icon: Package, group: "commerce" as const },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, group: "commerce" as const },
  // Content
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, group: "content" as const },
  // Users
  { href: "/admin/users", label: "Users", icon: Users, group: "users" as const },
  // Settings
  { href: "/admin/settings", label: "Settings", icon: Settings, group: "settings" as const },
  { href: "/admin/settings/seo", label: "SEO", icon: Search, group: "settings" as const },
  { href: "/admin/settings/site", label: "Site", icon: Globe, group: "settings" as const },
  { href: "/admin/settings/theme", label: "Theme", icon: Palette, group: "settings" as const },
];
// Group metadata for sidebar section headers
const NAV_GROUPS: Record<string, { label: string }> = {
  dashboard: { label: "Overview" },
  commerce: { label: "Commerce" },
  content: { label: "Content" },
  users: { label: "Users" },
  settings: { label: "Settings" },
};
const GROUP_ORDER: Readonly<Array<keyof typeof NAV_GROUPS>> = ["dashboard", "commerce", "content", "users", "settings"];
/**
 * Normalize the Better Auth session shape into a single user record.
 */
function getSessionUser(session: BetterAuthSession | null): User | null {
  if (!session) return null;
  const user = session.user ?? session.session?.user ?? null;
  if (!user) return null;
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? undefined,
    role: user.role ?? "",
  } as User;
}
/**
 * Reset admin visual identity when component unmounts
 */
function useAdminThemeReset() {
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.dataset.adminTheme ?? "";
    root.dataset.adminTheme = "apex";
    return () => {
      if (previousTheme) {
        root.dataset.adminTheme = previousTheme;
        return;
      }
      delete root.dataset.adminTheme;
    };
  }, []);
}
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const sidebarTheme = useAdminTheme();
  const navbarClasses = sidebarTheme.getAdminNavbarClasses();
  const sidebarClasses = sidebarTheme.getAdminSidebarClasses();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [density, setDensity] = useState<Density>("comfortable");
  const [searchOpen, setSearchOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const hasFetchedSession = useRef(false);
  useAdminThemeReset();
  // Load persisted density
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("apex-density") as Density | null;
      if (stored && ["compact", "comfortable", "spacious"].includes(stored)) {
        setDensity(stored);
        document.documentElement.classList.add(`density-${stored}`);
      } else {
        document.documentElement.classList.add("density-comfortable");
      }
    } catch {
      document.documentElement.classList.add("density-comfortable");
    }
  }, []);
  // Persist density
  const handleDensityChange = useCallback((value: Density) => {
    setDensity(value);
    try {
      window.localStorage.setItem("apex-density", value);
    } catch {
      // ignore storage errors
    }
    document.documentElement.classList.remove("density-compact", "density-comfortable", "density-spacious");
    document.documentElement.classList.add(`density-${value}`);
  }, []);
  // Load persisted color preset
  useEffect(() => {
    try {
      const presetId = window.localStorage.getItem("apex-color-preset-id");
      if (!presetId) return;
      const preset = COLOR_PRESETS.find((item) => item.id === presetId);
      if (preset) {
        applyColorPreset(preset);
      }
    } catch {
      // ignore storage errors
    }
  }, []);
  const handleApplyColorPreset = useCallback((preset: (typeof COLOR_PRESETS)[number]) => {
    applyColorPreset(preset);
    try {
      window.localStorage.setItem("apex-color-preset-id", preset.id);
    } catch {
      // ignore storage errors
    }
  }, []);
  const handleSwitchLanguage = useCallback(
    async (newLocale: "en" | "fa") => {
      if (newLocale === locale) return;
      try {
        const response = await fetch("/api/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: newLocale }),
        });
        if (response.ok) {
          window.location.reload();
        }
      } catch {
        // ignore language switch errors
      }
    },
    [locale],
  );
  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  // Skip auth check on sign-in page
  const isSignInPage = pathname === "/admin/signin";
  // Handle navigation with mobile sidebar close
  const handleNavigation = useCallback(
    (href: string) => {
      if (isMobile) {
        setSidebarOpen(false);
        setTimeout(() => router.push(href), 300);
      } else {
        router.push(href);
      }
    },
    [isMobile, router],
  );
  // Check if a nav item is active (matches current pathname)
  const isActive = useCallback(
    (href: string) => {
      if (href === "/admin") {
        return pathname === "/admin" || pathname === "/admin/";
      }
      return pathname.startsWith(href);
    },
    [pathname],
  );
  // Redirect handling
  useEffect(() => {
    if (hasFetchedSession.current || isPending || isSignInPage) return;
    hasFetchedSession.current = true;
    const userObj = getSessionUser(session as BetterAuthSession | null);
    if (!userObj) {
      router.push("/admin/signin");
      return;
    }
    if (userObj.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [session, isPending, router, isSignInPage]);
  // Handle sign out
  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/admin/signin");
        },
      },
    });
  };
  if (isSignInPage) {
    if (isPending) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">Loading...</h2>
          </div>
        </div>
      );
    }
    return (
      <AdvancedErrorBoundary showErrorDetails={process.env.NODE_ENV === "development"} enableReporting={true}>
        <div className="min-h-screen bg-background">
          <main className="p-6">{children}</main>
        </div>
      </AdvancedErrorBoundary>
    );
  }
  // While session is loading, show a spinner
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">Checking Permissions</h2>
          <p className="text-sm text-muted-foreground">Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }
  // Extract user from session
  const userObj = getSessionUser(session as BetterAuthSession | null);
  const isAdmin = userObj?.role === "ADMIN";
  // Show loading while redirect is in progress
  if (!userObj || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">Redirecting...</h2>
        </div>
      </div>
    );
  }
  return (
    <AdvancedErrorBoundary showErrorDetails={process.env.NODE_ENV === "development"} enableReporting={true}>
      <div className="min-h-screen overflow-hidden bg-background text-foreground">
        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border transition-transform duration-300 ease-in-out",
            isMobile && !sidebarOpen && "-translate-x-full",
            isMobile && sidebarOpen && "translate-x-0",
            !isMobile && "translate-x-0",
            sidebarClasses.background,
          )}
        >
          {/* Logo area */}
          <div className={cn("flex h-16 items-center border-b border-border px-5", sidebarClasses.background)}>
            <Link href="/admin" className="flex items-center gap-3" onClick={(e) => e.preventDefault()}>
              <div className="apex-gradient-icon flex h-9 w-9 items-center justify-center rounded-2xl shrink-0">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className={cn("text-base font-semibold tracking-tight", sidebarClasses.text)} suppressHydrationWarning={true}>
                {t("adminPanel")}
              </span>
            </Link>
          </div>
          {/* Navigation */}
          <nav className="mt-6 flex-1 space-y-6 overflow-y-auto px-4 pb-5">
            {GROUP_ORDER.map((groupKey) => {
              const groupItems = ADMIN_NAV_ITEMS.filter((item) => item.group === groupKey);
              if (groupItems.length === 0) return null;
              return (
                <div key={groupKey} className="mb-6">
                  {/* Group section title */}
                  <p className={cn("mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground", sidebarClasses.section.title)}>
                    {NAV_GROUPS[groupKey].label}
                  </p>
                  {/* Group items */}
                  <div className="space-y-1">
                    {groupItems.map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.href}
                          onClick={() => handleNavigation(item.href)}
                          className={cn(
                            "mb-1 flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left",
                            active ? cn("bg-primary/10 text-primary", sidebarClasses.menu.active) : sidebarClasses.menu.item,
                          )}
                        >
                          <Icon className="mr-3 h-5 w-5 shrink-0 rtl:ml-3 rtl:mr-0" />
                          <span suppressHydrationWarning={true}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {/* Sign Out at bottom */}
            <div className="mt-auto border-t border-border px-2 pt-4">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className={cn("mb-1 w-full justify-start rounded-xl px-3 py-2.5 text-sm font-medium", sidebarClasses.menu.item)}
              >
                <LogOut className="mr-3 h-5 w-5 shrink-0 rtl:ml-3 rtl:mr-0" />
                <span suppressHydrationWarning={true}>{t("signOut")}</span>
              </Button>
            </div>
          </nav>
        </div>
        {/* Main Content */}
        <div className="apex-admin-shell pl-0 md:pl-72">
          {/* Top Bar */}
          <div className={cn("sticky top-0 z-40", navbarClasses.background)}>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen((prev) => !prev)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <h1 className={cn("text-xl font-semibold tracking-tight", navbarClasses.text)} suppressHydrationWarning={true}>
                  {t("adminPanel")}
                </h1>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                {/* Search trigger */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    "hidden md:flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground",
                  )}
                >
                  <Search className="h-4 w-4 shrink-0" />
                  <span>Search...</span>
                  <kbd className="ml-4 inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </button>
                {/* Density / Customize */}
                <DropdownMenu open={customizeOpen} onOpenChange={setCustomizeOpen}>
                  <DropdownMenuTrigger asChild={true}>
                    <Button variant="ghost" size="icon" className={cn("rounded-xl border border-border", navbarClasses.avatar.background)}>
                      <Palette className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-72 rounded-2xl border border-border bg-popover/95 p-2 shadow-lg z-50 backdrop-blur-sm"
                    align="end"
                    forceMount={true}
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-foreground">Customize</p>
                        <p className="text-xs leading-none text-muted-foreground">Layout, density, and theme</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <div className="p-2 space-y-4">
                      {/* Density */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Density</p>
                        <Select value={density} onValueChange={(value: Density) => handleDensityChange(value)}>
                          <SelectTrigger className="rounded-xl border-border bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DENSITY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Theme mode */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Theme</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: "light", label: "Light", icon: Sun },
                            { value: "dark", label: "Dark", icon: Moon },
                            { value: "system", label: "System", icon: Monitor },
                          ].map((themeOption) => {
                            const Icon = themeOption.icon;
                            return (
                              <button
                                key={themeOption.value}
                                onClick={() => sidebarTheme.setTheme(themeOption.value as "light" | "dark" | "system")}
                                className="flex flex-col items-center gap-1 rounded-xl border border-border p-2 text-xs transition-colors hover:bg-muted"
                              >
                                <Icon className="h-4 w-4" />
                                {themeOption.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Color preset */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color Preset</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild={true}>
                            <Button variant="outline" className="w-full rounded-xl justify-between">
                              <span className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-primary" />
                                Apex Blue
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-40" align="end">
                            {COLOR_PRESETS.map((preset) => (
                              <ColorPresetItem key={preset.id} label={preset.label} hex={preset.primary} onClick={() => handleApplyColorPreset(preset)} />
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {/* Language */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Language</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { code: "fa" as const, label: "فارسی", flag: "🇮🇷" },
                            { code: "en" as const, label: "English", flag: "🇺🇸" },
                          ].map((lang) => (
                            <Button
                              key={lang.code}
                              variant={locale === lang.code ? "secondary" : "outline"}
                              className="rounded-xl justify-center gap-2"
                              onClick={() => handleSwitchLanguage(lang.code)}
                            >
                              <span className="mr-2 text-xs font-medium"> {lang.flag} </span>
                              <span className="mr-2 text-xs font-medium"> {lang.label} </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Command palette shortcut */}
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(true)}>
                  <Search className="h-5 w-5" />
                </Button>
                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild={true}>
                    <Button
                      variant="ghost"
                      className={cn("relative h-10 w-10 rounded-2xl border border-border", navbarClasses.avatar.background, "transition-colors")}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userObj.image} alt={userObj.name} loading="lazy" />
                        <AvatarFallback className={cn(navbarClasses.avatar.text, "font-semibold")}>
                          {(userObj.name || "A").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 rounded-2xl border border-border bg-popover/95 p-2 shadow-lg z-50 backdrop-blur-sm"
                    align="end"
                    forceMount={true}
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-foreground">{userObj.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{userObj.email}</p>
                        <Badge variant="secondary" className="w-fit text-xs bg-primary/10 text-primary">
                          {userObj.role}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild={true}>
                      <Link
                        href="/admin"
                        className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground" suppressHydrationWarning={true}>
                          {t("dashboard")}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild={true}>
                      <Link
                        href="/account"
                        className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <User className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground" suppressHydrationWarning={true}>
                          {t("profile")}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={handleSignOut} className="rounded-xl text-destructive focus:text-destructive hover:bg-destructive/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span suppressHydrationWarning={true}>{t("signOut")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          {/* Search Modal */}
          {searchOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
              <div className="relative w-full max-w-xl rounded-2xl border border-border bg-popover p-4 shadow-2xl">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    autoFocus
                    placeholder="Search pages, actions, and settings..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setSearchOpen(false);
                    }}
                  />
                  <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    ESC
                  </kbd>
                </div>
                <div className="mt-4">
                  <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick Links</p>
                  <div className="space-y-1">
                    <SearchQuickLink
                      href="/admin"
                      label="Dashboard"
                      icon={LayoutDashboard}
                      onSelect={() => {
                        setSearchOpen(false);
                        router.push("/admin");
                      }}
                    />
                    <SearchQuickLink
                      href="/admin/products"
                      label="Products"
                      icon={Package}
                      onSelect={() => {
                        setSearchOpen(false);
                        router.push("/admin/products");
                      }}
                    />
                    <SearchQuickLink
                      href="/admin/users"
                      label="Users"
                      icon={Users}
                      onSelect={() => {
                        setSearchOpen(false);
                        router.push("/admin/users");
                      }}
                    />
                    <SearchQuickLink
                      href="/admin/analytics"
                      label="Analytics"
                      icon={BarChart3}
                      onSelect={() => {
                        setSearchOpen(false);
                        router.push("/admin/analytics");
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Page Content */}
          <ApiErrorBoundary showNetworkStatus={true}>
            <main className="space-y-6 p-6">{children}</main>
          </ApiErrorBoundary>
        </div>
      </div>
    </AdvancedErrorBoundary>
  );
}
function SearchQuickLink({ href, label, icon: Icon, onSelect }: { href: string; label: string; icon: LucideIcon; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="font-medium text-foreground">{label}</span>
    </button>
  );
}
function ColorPresetItem({ label, hex, onClick }: { label: string; hex: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted">
      <div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: hex }} />
      {label}
    </button>
  );
}
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
