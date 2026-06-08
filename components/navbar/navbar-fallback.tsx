/**
 * Fallback Navbar Component
 *
 * Renders navbar without NextIntl translations when context is missing.
 * Provides basic navigation functionality as a safety net.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import {
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
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Use client-side API endpoint instead of importing server actions
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/lib/auth-client";
import { useSimplifiedCartSync } from "@/lib/hooks/use-simplified-cart-sync";
import { useSimplifiedSessionSync } from "@/lib/hooks/use-simplified-session-sync";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

export function NavbarFallback() {
  // Core hooks - must be called first, always
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // State hooks - must be called in same order
  const [searchQuery, setSearchQuery] = useState("");
  const [siteTitle, setSiteTitle] = useState("E-Store");
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // ALWAYS call hooks at top level - never conditionally
  const { user, isAuthenticated, isLoading } = useSimplifiedSessionSync();
  const { itemCount: cartCount } = useSimplifiedCartSync();
  const { getItemCount: getWishlistCount } = useWishlistStore();

  // Locale is handled via cookies in this project (localePrefix: "never")
  // No need to extract locale from pathname for URL generation

  // Effects - must be called after all state hooks
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track hydration so the cart badge (which depends on persisted
  // localStorage state) does not flash on the first client paint.
  useEffect(() => {
    setHydrated(true);
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

  // Only render theme toggle when mounted to avoid hydration mismatch
  const ThemeToggle = () => {
    if (!mounted) {
      return (
        <Button
          variant="outline"
          size="icon"
          className="border-2 hover:border-blue-600 transition-all"
          data-testid="theme-toggle"
        >
          <Sun className="h-4 w-4" />
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

  // Fallback translations - hardcoded English strings
  const translations = {
    products: "Products",
    categories: "Categories",
    deals: "Deals",
    wishlist: "Wishlist",
    cart: "Cart",
    account: "Account",
    orders: "Orders",
    settings: "Settings",
    adminPanel: "Admin Panel",
    signOut: "Sign Out",
    signIn: "Sign In",
    signUp: "Sign Up",
  };

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
            {translations.products}
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            {translations.categories}
          </Link>
          <Link
            href="/deals"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            {translations.deals}
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm mx-6">
          <form onSubmit={handleSearch} className="w-full">
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
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative p-2 hover:bg-accent rounded-md transition-colors"
            suppressHydrationWarning={true}
          >
            <Heart className="h-4 w-4" />
            {hydrated && wishlistCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                suppressHydrationWarning={true}
              >
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button
            onClick={() => router.push("/cart")}
            className="relative p-2 hover:bg-accent rounded-md transition-colors"
            suppressHydrationWarning={true}
          >
            <ShoppingCart className="h-4 w-4" />
            {hydrated && cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                suppressHydrationWarning={true}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

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
                    {translations.account}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild={true}>
                  <Link href="/orders" className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    {translations.orders}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild={true}>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    {translations.settings}
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
                        {translations.adminPanel}
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
                  {translations.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild={true}>
                <Link href="/auth/signin">{translations.signIn}</Link>
              </Button>
              <Button asChild={true}>
                <Link href="/auth/signup">{translations.signUp}</Link>
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

                {/* Mobile User Info */}
                {isAuthenticated && (
                  <div className="flex items-center space-x-3 px-4 py-3 bg-accent/50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                      <AvatarFallback className="bg-blue-600/10 text-blue-600">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                )}

                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-2">
                  <Link
                    href="/products"
                    className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                  >
                    {translations.products}
                  </Link>
                  <Link
                    href="/categories"
                    className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                  >
                    {translations.categories}
                  </Link>
                  <Link
                    href="/deals"
                    className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                  >
                    {translations.deals}
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {translations.wishlist}
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/account"
                        className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Orders
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                      {user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="flex items-center py-2 px-4 text-sm font-medium text-blue-600 hover:bg-accent rounded-md"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          {translations.adminPanel}
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center py-2 px-4 text-sm font-medium text-destructive hover:bg-accent rounded-md text-left"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {translations.signOut}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/account"
                      className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent rounded-md"
                    >
                      <User className="mr-2 h-4 w-4" />
                      {translations.account}
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
