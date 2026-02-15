/**
 * Unified Navbar Component
 *
 * Fixed to ensure all hooks are called in consistent order
 * to comply with React's Rules of Hooks.
 *
 * Route exclusion logic has been moved to ConditionalNavbar component.
 * This component now always renders when called.
 *
 * @version 1.3.0
 * @since 2025-01-01
 */
"use client";

import {
  Bell,
  Heart,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Sun,
  User,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MessageSidebar } from "@/components/features/messages/message-sidebar";
import { NotificationSidebar } from "@/components/features/notifications/notification-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Use client fetch to avoid importing server actions into client bundle
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
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/lib/auth-client";
import { useSimplifiedCartSync } from "@/lib/hooks/use-simplified-cart-sync";
import { useSimplifiedSessionSync } from "@/lib/hooks/use-simplified-session-sync";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

// Route exclusion logic has been moved to ConditionalNavbar component
// This navbar component now always renders when called

export function UnifiedNavbar() {
  // ALL HOOKS MUST BE CALLED IN EXACT SAME ORDER EVERY TIME

  // Core hooks - must be called first, always
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // State hooks - must be called in same order
  const [searchQuery, setSearchQuery] = useState("");
  const [siteTitle, setSiteTitle] = useState("E-Store");
  const [mounted, setMounted] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // ALWAYS call hooks at top level - never conditionally
  const { user, isAuthenticated } = useSimplifiedSessionSync();
  const { itemCount: cartCount } = useSimplifiedCartSync();
  const { getItemCount: getWishlistCount } = useWishlistStore();

  // Use translations directly from next-intl
  const t = useTranslations("Navigation");

  // Locale is handled via cookies in this project (localePrefix: "never")
  // No need to extract locale from pathname for URL generation

  // Effects - must be called after all state hooks
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) return;
        const result = await res.json();
        if (result?.settings)
          setSiteTitle(result.settings.siteTitleEn || "E-Store");
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      }
    };

    fetchSiteSettings();
  }, []);

  // Computed values - no hooks here
  const wishlistCount = getWishlistCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  // Only Render theme toggle when mounted to avoid hydration mismatch
  const ThemeToggle = () => {
    if (!mounted) {
      return (
        <Button
          variant="outline"
          size="icon"
          className="border-2 hover:border-blue-600 transition-all"
          data-testid="theme-toggle"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="border-2 hover:border-blue-600 transition-all"
        data-testid="theme-toggle"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  };

  // Ensure consistent rendering by always rendering the same structure
  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
      suppressHydrationWarning={true}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Package className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-foreground hover:text-blue-600 transition-colors">
            {siteTitle}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link
            href="/products"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            {t("products")}
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            {t("categories")}
          </Link>
          <Link
            href="/deals"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            {t("deals")}
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm mx-6">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Messages */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMessagesOpen(true)}
            className="relative p-2 hover:bg-accent rounded-md transition-colors"
            data-testid="messages-button"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="sr-only">Messages</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 hover:bg-accent rounded-md transition-colors"
            data-testid="notifications-button"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative p-2 hover:bg-accent rounded-md transition-colors"
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild={true}>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.name || ""}
                    />
                    <AvatarFallback className="bg-blue-600/10 text-blue-600">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild={true}>
                  <Link href="/account" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {t("account")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild={true}>
                  <Link href="/orders" className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    {t("orders")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild={true}>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("settings")}
                  </Link>
                </DropdownMenuItem>
                {user?.role === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild={true}>
                      <Link
                        href="/admin"
                        className="flex items-center text-blue-600"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        {t("adminPanel")}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild={true}>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild={true}>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild={true}>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </form>

                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-2">
                  <Link
                    href="/products"
                    className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                  >
                    Products
                  </Link>
                  <Link
                    href="/categories"
                    className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                  >
                    Categories
                  </Link>
                  <Link
                    href="/deals"
                    className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                  >
                    Deals
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </Link>
                  <Link
                    href="/account"
                    className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Sidebars */}
      <MessageSidebar open={messagesOpen} onOpenChange={setMessagesOpen} />
      <NotificationSidebar
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </header>
  );
}
