/**
 * Enhanced Navbar Component with next-intl Context Handling
 *
 * Features real-time session monitoring, enhanced animations,
 * performance optimizations, and comprehensive styling improvements.
 *
 * @author hh.oomph@gmail.com
 * @version 3.0.0
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
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IranSansLoader } from "@/components/features/persian-font-loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CursorEnhancer } from "@/components/ui/cursor-enhancer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EnhancedNavbarIcon } from "@/components/ui/enhanced-navbar-icon";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { SessionChangeTransition } from "@/components/ui/navbar-transition";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { PersianSearchInput } from "@/components/ui/persian-input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut, useSession } from "@/lib/auth-client";
import { useCartStore } from "@/lib/stores/cart-store";
import { useGuestCartStore } from "@/lib/stores/guest-cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

export function Navbar() {
  const t = useTranslations("Navigation");
  const { data: sessionData } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false); // Track hydration state
  const [siteTitle, setSiteTitle] = useState("E-Store");
  const router = useRouter();
  const getItemCount = useCartStore((state) => state.getItemCount ?? (() => 0));
  const toggleCart = useCartStore((state) => state.toggleCart ?? (() => {}));
  const getWishlistCount = useWishlistStore(
    (state) => state.getItemCount ?? (() => 0),
  );
  const getGuestCartCount = useGuestCartStore(
    (state) => state.getItemCount ?? (() => 0),
  );
  const { theme, setTheme } = useTheme();

  // Locale is handled via cookies in this project (localePrefix: "never")
  // No need to extract locale from pathname for URL generation

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if user is guest and use appropriate cart store
  const isGuest = !sessionData?.user;
  const cartCount = isGuest ? getGuestCartCount() : getItemCount();
  const wishlistCount = getWishlistCount();

  // Handle Persian search
  const handlePersianSearch = (processedQuery: string) => {
    if (processedQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(processedQuery)}`);
    }
  };

  // Fetch site settings for dynamic title
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

  return (
    <CursorEnhancer>
      <IranSansLoader>
        <header       className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 text-foreground shadow-sm">
          <div className="container flex h-16 items-center justify-between px-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-foreground hover:text-primary transition-colors font-persian">
                {siteTitle}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild={true}>
                    <Link
                      href="/products"
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-active:bg-accent/50 data-[state=open]:bg-accent/50 cursor-pointer"
                    >
                      {t("products")}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild={true}>
                    <Link
                      href="/categories"
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-active:bg-accent/50 data-[state=open]:bg-accent/50 cursor-pointer"
                    >
                      {t("categories")}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild={true}>
                    <Link
                      href="/deals"
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-active:bg-accent/50 data-[state=open]:bg-accent/50 cursor-pointer"
                    >
                      {t("deals")}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild={true}>
                    <Link
                      href="/blog"
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-active:bg-accent/50 data-[state=open]:bg-accent/50 cursor-pointer"
                    >
                      Blog
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Persian Search Bar */}
            <div className="hidden md:flex flex-1 max-w-sm mx-4">
              <PersianSearchInput
                placeholder="Search products..."
                onSearch={handlePersianSearch}
                className="w-full"
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle - Only render after hydration */}
              {mounted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="relative border-border hover:border-primary transition-all duration-300 bg-background hover:bg-accent"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-warning" />
                  <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-primary" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}

              {/* Wishlist */}
              <EnhancedNavbarIcon
                icon={<Heart className="h-4 w-4" />}
                count={wishlistCount}
                href="/wishlist"
                label="Wishlist"
                variant="ghost"
                showBadge={mounted}
              />

              {/* Cart */}
              <EnhancedNavbarIcon
                icon={<ShoppingCart className="h-4 w-4" />}
                count={cartCount}
                onClick={toggleCart}
                label="Shopping cart"
                variant="ghost"
                showBadge={mounted}
              />

              {/* User Menu with Session Transitions */}
              <SessionChangeTransition>
                {sessionData ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild={true}>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full hover:bg-accent transition-colors cursor-pointer"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={sessionData.user.image || ""}
                            alt={sessionData.user.name || ""}
                            loading="lazy"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {sessionData.user.name?.charAt(0).toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 bg-popover/95 backdrop-blur-sm border shadow-lg"
                      align="end"
                      forceMount={true}
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {sessionData.user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {sessionData.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild={true}>
                        <Link
                          href="/account"
                          className="flex items-center px-2 py-2 hover:bg-accent/80 transition-colors duration-200 rounded-md cursor-pointer focus:bg-accent focus:text-accent-foreground"
                        >
                          <User className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="font-medium">Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild={true}>
                        <Link
                          href="/orders"
                          className="flex items-center px-2 py-2 hover:bg-accent/80 transition-colors duration-200 rounded-md cursor-pointer focus:bg-accent focus:text-accent-foreground"
                        >
                          <Package className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="font-medium">Orders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild={true}>
                        <Link
                          href="/wishlist"
                          className="flex items-center px-2 py-2 hover:bg-accent/80 transition-colors duration-200 rounded-md cursor-pointer focus:bg-accent focus:text-accent-foreground"
                        >
                          <Heart className="mr-3 h-4 w-4 text-destructive group-hover:text-destructive transition-colors" />
                          <span className="font-medium">Wishlist</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild={true}>
                        <Link
                          href="/settings"
                          className="flex items-center px-2 py-2 hover:bg-accent/80 transition-colors duration-200 rounded-md cursor-pointer focus:bg-accent focus:text-accent-foreground"
                        >
                          <Settings className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="font-medium">Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      {sessionData?.user?.role === "ADMIN" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild={true}>
                            <Link
                              href="/admin"
                              className="flex items-center px-2 py-2 hover:bg-accent/80 transition-colors duration-200 rounded-md cursor-pointer focus:bg-accent focus:text-accent-foreground"
                            >
                              <Package className="mr-3 h-4 w-4 text-primary" />
                              <span className="font-medium text-primary">
                                Admin Panel
                              </span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleSignOut()}
                        className="text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span className="font-medium">Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" asChild={true}>
                      <Link href="/auth/signin" className="cursor-pointer">
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild={true}>
                      <Link href="/auth/signup" className="cursor-pointer">
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </SessionChangeTransition>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild={true}>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-75 sm:w-100">
                  <div className="flex flex-col space-y-4 mt-4">
                    {/* Mobile Search */}
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

                    {/* Mobile Navigation */}
                    <nav className="flex flex-col space-y-2">
                      <Link
                        href="/products"
                        className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                      >
                        Products
                      </Link>
                      <Link
                        href="/categories"
                        className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                      >
                        Categories
                      </Link>
                      <Link
                        href="/deals"
                        className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                      >
                        Deals
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Wishlist
                      </Link>
                      <Link
                        href="/account"
                        className="flex items-center py-2 px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
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
        </header>
      </IranSansLoader>
    </CursorEnhancer>
  );
}
