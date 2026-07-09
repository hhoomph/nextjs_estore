/**
 * Module for layout
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
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
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdvancedErrorBoundary } from "@/components/errors/advanced-error-boundary";
import { ApiErrorBoundary } from "@/components/errors/api-error-boundary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { useAdminTheme } from "@/lib/utils/theme-admin-overrides";
import { useIsMobile } from "@/lib/hooks/use-mobile";
// Admin sidebar navigation item definition
interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "dashboard" | "commerce" | "content" | "users" | "settings";
}
// All admin sidebar navigation items organized by group
const adminNavItems: AdminNavItem[] = [
  { href: "/", label: "Main Page", icon: Globe, group: "dashboard" },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, group: "dashboard" },
  // Commerce
  { href: "/admin/products", label: "Products", icon: Package, group: "commerce" },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, group: "commerce" },
  { href: "/admin/collections", label: "Collections", icon: Package, group: "commerce" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, group: "commerce" },
  // Content
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, group: "content" },
  // Users
  { href: "/admin/users", label: "Users", icon: Users, group: "users" },
  // Settings
  { href: "/admin/settings", label: "Settings", icon: Settings, group: "settings" },
  { href: "/admin/settings/seo", label: "SEO", icon: Search, group: "settings" },
  { href: "/admin/settings/site", label: "Site", icon: Globe, group: "settings" },
  { href: "/admin/settings/theme", label: "Theme", icon: Palette, group: "settings" },
];
// Group metadata for sidebar section headers
const navGroups: Record<string, { label: string }> = {
  dashboard: { label: "Overview" },
  commerce: { label: "Commerce" },
  content: { label: "Content" },
  users: { label: "Users" },
  settings: { label: "Settings" },
};
const groupOrder = ["dashboard", "commerce", "content", "users", "settings"];

function applyAdminVisualIdentity() {
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
}

/**
 * Normalize the Better Auth session shape into a single user record.
 *
 * Better Auth's client returns a flat `{ user, session }` shape, but
 * older SSR helpers can still wrap it as `{ session: { user } }`. This
 * helper accepts either and always returns a flat object so the rest of
 * the admin layout can read `user.name`, `user.email`, `user.role`, etc.
 * without re-implementing the fallback chain at every call site.
 */
function getSessionUser(
  session: any,
): { name: string; email: string; image: string; role: string } | null {
  if (!session) return null;
  const user = session.user ?? session.session?.user ?? null;
  if (!user) return null;
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? "",
    role: user.role ?? "",
  };
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const sidebarTheme = useAdminTheme();
  const navbarClasses = sidebarTheme.getAdminNavbarClasses();
  const sidebarClasses = sidebarTheme.getAdminSidebarClasses();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Skip auth check on sign-in page
  const isSignInPage = pathname === "/admin/signin";
  // Track whether session has been fetched at least once
  const hasFetchedSession = useRef(false);
  useEffect(() => applyAdminVisualIdentity(), []);
  useEffect(() => {
    if (!isPending && !hasFetchedSession.current) {
      hasFetchedSession.current = true;
    }
  }, [isPending]);
  // Handle redirects via useEffect — only AFTER session has been fetched
  useEffect(() => {
    if (!hasFetchedSession.current || isPending || isSignInPage) return;
    const userObj = getSessionUser(session);
    if (!userObj) {
      router.push("/admin/signin");
      return;
    }
    if (userObj.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [session, isPending, router, isSignInPage]);
  // Allow access to sign-in page without authentication
  if (isSignInPage) {
    if (isPending) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Loading...
            </h2>
          </div>
        </div>
      );
    }
    return (
      <AdvancedErrorBoundary
        showErrorDetails={process.env.NODE_ENV === "development"}
        enableReporting={true}
      >
        <div className="min-h-screen bg-background">
          <main className="p-6">{children}</main>
        </div>
      </AdvancedErrorBoundary>
    );
  }
  // While session is loading, show a spinner (do NOT redirect yet)
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Checking Permissions
          </h2>
          <p className="text-muted-foreground">Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }
  // Extract user from session — uses the helper above so the
  // `user` / `session.user` / `session.session.user` fallback chain
  // lives in exactly one place.
  const userObj = getSessionUser(session);
  const isAdmin = userObj?.role === "ADMIN";
  // `getUser` is retained for any future use; `userObj` is a
  // guaranteed-shape object now, so direct property access is safe.
  void userObj;
  // Show loading while redirect is in progress
  if (!userObj || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Redirecting...
          </h2>
        </div>
      </div>
    );
  }
  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/admin/signin");
        },
      },
    });
  };
  // Check if a nav item is active (matches current pathname)
  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname.startsWith(href);
  };
  return (
    <AdvancedErrorBoundary
      showErrorDetails={process.env.NODE_ENV === "development"}
      enableReporting={true}
    >
      <div className="min-h-screen overflow-hidden bg-background text-foreground">
        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
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
            <Link href="/admin" className="flex items-center gap-3">
              <div className="apex-gradient-icon flex h-9 w-9 items-center justify-center rounded-2xl">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span
                className={cn("text-base font-bold tracking-tight", sidebarClasses.text)}
                suppressHydrationWarning={true}
              >
                {t("adminPanel")}
              </span>
            </Link>
          </div>
          {/* Navigation */}
          <nav className="mt-6 flex-1 space-y-6 overflow-y-auto px-4 pb-5">
            {groupOrder.map((groupKey) => {
              const groupItems = adminNavItems.filter((item) => item.group === groupKey);
              if (groupItems.length === 0) return null;
              return (
                <div key={groupKey} className="mb-6">
                  {/* Group section title */}
                  <p
                    className={cn(
                      "mb-2 px-3 text-xs font-semibold uppercase tracking-[0.14em]",
                      sidebarClasses.section.title,
                    )}
                  >
                    {navGroups[groupKey].label}
                  </p>
                  {/* Group items */}
                  <div className="space-y-1">
                    {groupItems.map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            if (isMobile) setSidebarOpen(false);
                          }}
                          className={cn(
                            "mb-1 flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                            active
                              ? cn("text-primary", sidebarClasses.menu.active)
                              : sidebarClasses.menu.item,
                          )}
                        >
                          <Icon className="mr-3 h-5 w-5 shrink-0 rtl:ml-3 rtl:mr-0" />
                          <span suppressHydrationWarning={true}>
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {/* Sign Out at bottom */}
            <div className="mt-auto border-t border-border px-2 pt-4">
              <Button
                onClick={() => handleSignOut()}
                variant="ghost"
                className={cn(
                  "mb-1 justify-start rounded-xl px-3 py-2.5 text-sm font-medium",
                  sidebarClasses.menu.item,
                )}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSidebarOpen((prev) => !prev)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <h1
                  className={cn("text-xl font-bold tracking-tight", navbarClasses.text)}
                  suppressHydrationWarning={true}
                >
                  {t("adminPanel")}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild={true}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "relative h-10 w-10 rounded-2xl border border-border",
                        navbarClasses.avatar.background,
                        "transition-colors",
                        )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={userObj.image}
                          alt={userObj.name}
                          loading="lazy"
                        />
                        <AvatarFallback
                          className={cn(navbarClasses.avatar.text, "font-semibold")}
                        >
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
                        <p className="text-sm font-semibold leading-none text-foreground">
                          {userObj.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userObj.email}
                        </p>
                        <Badge
                          variant="secondary"
                          className="w-fit text-xs bg-primary/10 text-primary"
                        >
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
                        <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                        <span
                          className="font-medium text-foreground"
                          suppressHydrationWarning={true}
                        >
                          {t("dashboard")}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild={true}>
                      <Link
                        href="/account"
                        className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <User className="mr-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                        <span
                          className="font-medium text-foreground"
                          suppressHydrationWarning={true}
                        >
                          {t("profile")}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={() => handleSignOut()}
                      className="rounded-xl text-destructive focus:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span suppressHydrationWarning={true}>
                        {t("signOut")}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          {/* Page Content */}
          <ApiErrorBoundary showNetworkStatus={true}>
            <main className="space-y-6 p-6">{children}</main>
          </ApiErrorBoundary>
        </div>
      </div>
    </AdvancedErrorBoundary>
  );
}
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}