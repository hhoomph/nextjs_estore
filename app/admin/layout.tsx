/**
 * Module for layout
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { LayoutDashboard, LogOut, Package, User } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminRedirect } from "@/components/admin-redirect";
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
import { signOut, useSession } from "@/lib/auth-client";
import { useAdminTheme } from "@/lib/utils/theme-admin-overrides";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const {
    getAdminNavbarClasses,
    getAdminSidebarClasses,
    getAdminContentClasses,
  } = useAdminTheme();

  const navbarClasses = getAdminNavbarClasses();
  const sidebarClasses = getAdminSidebarClasses();
  const contentClasses = getAdminContentClasses();

  // Skip auth check on sign-in page
  const isSignInPage = pathname === "/admin/signin";

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" suppressHydrationWarning>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderBottomColor: "rgb(37, 99, 235)" }}
            suppressHydrationWarning
          />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Checking Permissions
          </h2>
          <p className="text-muted-foreground">Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }

  // Allow access to sign-in page without authentication
  if (isSignInPage) {
    return (
      <AdvancedErrorBoundary
        showErrorDetails={process.env.NODE_ENV === "development"}
        enableReporting={true}
      >
        <div className="min-h-screen bg-background" suppressHydrationWarning>
          <main className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" suppressHydrationWarning>{children}</main>
        </div>
      </AdvancedErrorBoundary>
    );
  }

  // Check if user is admin - handle role property properly
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";

  // Show redirect component if not signed in or not admin
  if (!session || !isAdmin) {
    return <AdminRedirect />;
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

  return (
    <AdvancedErrorBoundary
      showErrorDetails={process.env.NODE_ENV === "development"}
      enableReporting={true}
    >
      <div className={`min-h-screen ${contentClasses.background}`}>
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 ${sidebarClasses.background} shadow-lg border-r border-slate-700`}
        >
          <div className="flex h-16 items-center border-b border-slate-700 px-6">
            <Link href="/admin" className="flex items-center space-x-2">
              <Package className={`h-6 w-6 ${sidebarClasses.text}`} />
              <span
                className="font-bold text-xl text-slate-200"
                suppressHydrationWarning={true}
              >
                {t("adminPanel")}
              </span>
            </Link>
          </div>

          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {/* Dashboard */}
              <Link
                href="/admin"
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-700 hover:text-slate-100 rounded-md transition-colors duration-200"
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                <span suppressHydrationWarning={true}>{t("dashboard")}</span>
              </Link>

              {/* Collections */}
              <Link
                href="/admin/collections"
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-700 hover:text-slate-100 rounded-md transition-colors duration-200"
              >
                <Package className="mr-3 h-5 w-5" />
                <span suppressHydrationWarning={true}>Collections</span>
              </Link>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-700">
              <Button
                onClick={() => handleSignOut()}
                variant="ghost"
                className="w-full justify-start text-slate-400 hover:bg-slate-700 hover:text-slate-100"
              >
                <LogOut className="mr-3 h-5 w-5 text-slate-400" />
                <span suppressHydrationWarning={true}>{t("signOut")}</span>
              </Button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="pl-64">
          {/* Top Bar */}
          <div className={`${navbarClasses.background} px-6 py-4`}>
            <div className="flex items-center justify-between">
              <h1
                className={`text-2xl font-semibold ${navbarClasses.text}`}
                suppressHydrationWarning={true}
              >
                {t("adminPanel")}
              </h1>

              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild={true}>
                    <Button
                      variant="ghost"
                      className={`relative h-8 w-8 rounded-full ${navbarClasses.avatar.background} transition-colors`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session?.user.image || ""}
                          alt={session?.user.name || ""}
                          loading="lazy"
                        />
                        <AvatarFallback
                          className={`${navbarClasses.avatar.text} font-medium`}
                        >
                          {session?.user.name?.charAt(0).toUpperCase() || "A"}
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
                          {session?.user.name}
                        </p>
                        <p className="text-xs leading-none text-slate-400">
                          {session?.user.email}
                        </p>
                        <Badge
                          variant="secondary"
                          className="w-fit text-xs bg-slate-700 text-slate-300"
                        >
                          {session?.user.role}
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
