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
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminRedirect } from "@/components/admin-redirect";
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
import { useEffect, useRef } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { useAdminTheme } from "@/lib/utils/theme-admin-overrides";

// Admin sidebar navigation item definition
interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "dashboard" | "commerce" | "content" | "users" | "settings";
}

// All admin sidebar navigation items organized by group
const adminNavItems: AdminNavItem[] = [
  // Dashboard
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

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const sidebarTheme = useAdminTheme();

  const navbarClasses = sidebarTheme.getAdminNavbarClasses();
  const sidebarClasses = sidebarTheme.getAdminSidebarClasses();
  const contentClasses = sidebarTheme.getAdminContentClasses();

  // Skip auth check on sign-in page
  const isSignInPage = pathname === "/admin/signin";

  // Track whether session has been fetched at least once
  const hasFetchedSession = useRef(false);

  useEffect(() => {
    if (!isPending && !hasFetchedSession.current) {
      hasFetchedSession.current = true;
    }
  }, [isPending]);

  // Handle redirects via useEffect — only AFTER session has been fetched
  useEffect(() => {
    if (!hasFetchedSession.current || isPending || isSignInPage) return;

    const userObj = (session?.user as any) || (session?.session as any)?.user;
    const userRole = userObj?.role;

    if (!userObj) {
      router.push("/admin/signin");
      return;
    }

    if (userRole !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [session, isPending, router, isSignInPage]);

  // Allow access to sign-in page without authentication
  if (isSignInPage) {
    if (isPending) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
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
          <main className={`p-6 ${contentClasses.card}`}>{children}</main>
        </div>
      </AdvancedErrorBoundary>
    );
  }

  // While session is loading, show a spinner (do NOT redirect yet)
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Checking Permissions
          </h2>
          <p className="text-gray-600">Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }

  // Extract user from session — better-auth may return { user, session } or { session: { user } }
  const userObj = (session?.user as any) || (session?.session as any)?.user;
  const userRole = userObj?.role;
  const isAdmin = userRole === "ADMIN";

  // Helper to get user property safely
  const getUser = (key: string) => userObj?.[key] ?? "";

  // Show loading while redirect is in progress
  if (!userObj || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
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
      <div className={`min-h-screen ${contentClasses.background}`}>
        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64",
            sidebarClasses.background,
            "shadow-lg",
          )}
        >
          {/* Logo area */}
          <div className={cn("flex h-16 items-center px-6", sidebarClasses.background, "border-b")}>
            <Link href="/admin" className="flex items-center space-x-2">
              <LayoutDashboard className={cn("h-6 w-6", sidebarClasses.text)} />
              <span
                className={cn("font-bold text-xl", sidebarClasses.text)}
                suppressHydrationWarning={true}
              >
                {t("adminPanel")}
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3 overflow-y-auto h-[calc(100vh-4rem)]">
            {groupOrder.map((groupKey) => {
              const groupItems = adminNavItems.filter((item) => item.group === groupKey);
              if (groupItems.length === 0) return null;

              return (
                <div key={groupKey} className="mb-6">
                  {/* Group section title */}
                  <p
                    className={cn(
                      "px-3 mb-2 text-xs font-semibold uppercase tracking-wider",
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
                          className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                            active
                              ? sidebarClasses.menu.active
                              : sidebarClasses.menu.item,
                          )}
                        >
                          <Icon className="mr-3 h-5 w-5 shrink-0" />
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
            <div className="mt-8 pt-4 border-t">
              <Button
                onClick={() => handleSignOut()}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  sidebarClasses.menu.item,
                )}
              >
                <LogOut className="mr-3 h-5 w-5 shrink-0" />
                <span suppressHydrationWarning={true}>{t("signOut")}</span>
              </Button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="pl-64">
          {/* Top Bar */}
          <div className={navbarClasses.background}>
            <div className="flex items-center justify-between px-6 py-4">
              <h1
                className={cn("text-2xl font-semibold", navbarClasses.text)}
                suppressHydrationWarning={true}
              >
                {t("adminPanel")}
              </h1>

              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild={true}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "relative h-8 w-8 rounded-full",
                        navbarClasses.avatar.background,
                        "transition-colors",
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={(session?.session as any)?.user?.image || (session?.user as any)?.image || ""}
                          alt={(session?.session as any)?.user?.name || (session?.user as any)?.name || ""}
                          loading="lazy"
                        />
                        <AvatarFallback
                          className={cn(navbarClasses.avatar.text, "font-medium")}
                        >
                          {((session?.session as any)?.user?.name || (session?.user as any)?.name || "A").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-slate-800/95 backdrop-blur-sm border border-slate-700 shadow-lg"
                    align="end"
                    forceMount={true}
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-slate-100">
                          {(session?.session as any)?.user?.name || (session?.user as any)?.name || ""}
                        </p>
                        <p className="text-xs leading-none text-slate-400">
                          {(session?.session as any)?.user?.email || (session?.user as any)?.email || ""}
                        </p>
                        <Badge
                          variant="secondary"
                          className="w-fit text-xs bg-slate-700 text-slate-300"
                        >
                          {(session?.session as any)?.user?.role || (session?.user as any)?.role || ""}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem asChild={true}>
                      <Link
                        href="/admin"
                        className="flex items-center px-2 py-2 hover:bg-slate-700 transition-colors duration-200 rounded-md"
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-100 transition-colors" />
                        <span
                          className="font-medium text-slate-100"
                          suppressHydrationWarning={true}
                        >
                          {t("dashboard")}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild={true}>
                      <Link
                        href="/account"
                        className="flex items-center px-2 py-2 hover:bg-slate-700 transition-colors duration-200 rounded-md"
                      >
                        <User className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-100 transition-colors" />
                        <span
                          className="font-medium text-slate-100"
                          suppressHydrationWarning={true}
                        >
                          {t("profile")}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      onClick={() => handleSignOut()}
                      className="text-red-400 focus:text-red-400 hover:bg-red-900/20"
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
            <main className={`p-6 ${contentClasses.card}`}>{children}</main>
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