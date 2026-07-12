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
import { useTheme } from "@/components/providers/theme-provider";
import { useEffect, useState } from "react";
import { MessageSidebar } from "@/components/features/messages/message-sidebar";
import { NotificationSidebar } from "@/components/features/notifications/notification-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/lib/auth-client";
import { useSimplifiedCartSync } from "@/lib/hooks/use-simplified-cart-sync";
import { useSimplifiedSessionSync } from "@/lib/hooks/use-simplified-session-sync";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { HydrationSafe } from "@/components/hydration-safe";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
// Route exclusion logic has been moved to ConditionalNavbar component
// This navbar component now always renders when called
interface CategoryItem {
  id: string;
  name: string;
  productCount: number;
}
export function UnifiedNavbar() {
  // ALL HOOKS MUST BE CALLED IN EXACT SAME ORDER EVERY TIME
  // Core hooks - must be called first, always
  const router = useRouter();
  const { actualTheme, setTheme, mounted } = useTheme();
  // State hooks - must be called in same order
  const [searchQuery, setSearchQuery] = useState("");
  const [siteTitle, setSiteTitle] = useState("E-Store");
  const [hydrated, setHydrated] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  // ALWAYS call hooks at top level - never conditionally
  const { user, isAuthenticated, isLoading } = useSimplifiedSessionSync();
  const { itemCount: cartCount } = useSimplifiedCartSync();
  const { getItemCount: getWishlistCount } = useWishlistStore();
  // Use translations directly from next-intl
  const t = useTranslations("Navigation");
  const tPages = useTranslations("Navigation.pages");
  const tBlog = useTranslations("Navigation.blog");
  const blogLabel = tBlog("grid").split(" ")[0];
  // Locale is handled via cookies in this project (localePrefix: "never")
  // No need to extract locale from pathname for URL generation
  // Effects - must be called after all state hooks
  useEffect(() => {
    const controller = new AbortController();
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          const activeCategories = (data.categories || []).filter((cat: CategoryItem) => cat.productCount > 0);
          setCategories(activeCategories);
        }
      } catch (error) {
        if (error instanceof Error && (error.name === "AbortError" || error.message === "Failed to fetch")) return;
        console.error("Failed to fetch categories:", error);
      }
    };
    void fetchCategories();
    return () => controller.abort();
  }, []);
  useEffect(() => {
    setHydrated(true);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const fetchSiteSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings", { signal: controller.signal });
        if (!res.ok) return;
        const result = await res.json();
        if (result?.settings)
          setSiteTitle(result.settings.siteTitleEn || "E-Store");
      } catch (error) {
        if (error instanceof Error && (error.name === "AbortError" || error.message === "Failed to fetch")) return;
        console.error("Failed to fetch site settings:", error);
      }
    };
    void fetchSiteSettings();
    return () => controller.abort();
  }, []);
  // Computed values - no hooks here
  const showAuthenticatedUser = isAuthenticated && !isLoading;
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
          className="border-border/60 bg-background/85 text-foreground transition-all hover:bg-accent hover:text-accent-foreground dark:bg-background/90 cursor-pointer"
          data-testid="theme-toggle"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only cursor-pointer">Toggle theme</span>
        </Button>
      );
    }
    // Toggle explicit light/dark mode so the button always changes the visible theme.
    const getNextTheme = (current: "light" | "dark"): "light" | "dark" => {
      return current === "dark" ? "light" : "dark";
    };
    const getThemeIcon = (current: "light" | "dark") => {
      if (current === "light") return <Sun className="h-4 w-4" />;
      return <Moon className="h-4 w-4" />;
    };
    const nextTheme = getNextTheme(actualTheme);
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(nextTheme)}
        className="border-border/60 bg-background/85 text-foreground transition-all hover:bg-accent hover:text-accent-foreground dark:bg-background/90 cursor-pointer"
        data-testid="theme-toggle"
        aria-label={`Current theme: ${actualTheme}. Click to switch to ${nextTheme}`}
        aria-pressed={actualTheme === "dark"}
      >
        {getThemeIcon(actualTheme)}
        <span className="sr-only">Toggle theme (current: {actualTheme})</span>
      </Button>
    );
  };
  const mobileNavItems = [
    { href: "/popular", label: t("popular") },
    { href: "/products", label: t("shop") },
    { href: "/categories", label: t("categories") },
    { href: "/deals", label: t("deals") },
    { href: "/blog", label: blogLabel },
    { href: "/contact", label: t("contact") },
  ];
  // Ensure consistent rendering by always rendering the same structure
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 text-foreground shadow-sm"
      suppressHydrationWarning={true}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-foreground hover:text-primary transition-colors">
            {siteTitle}
          </span>
        </Link>
        {/* Desktop Menu (hidden on mobile) */}
        <div className="hidden md:flex flex-1 items-center justify-center space-x-6">
          {/* Popular */}
          <Link
            href="/popular"
            className="text-sm font-bold text-foreground/90 transition-colors hover:text-primary"
          >
            {t("popular")}
          </Link>
          {/* Shop */}
          <Link
            href="/products"
            className="text-sm font-bold text-foreground/90 transition-colors hover:text-primary"
          >
            {t("shop")}
          </Link>
          {/* Pages Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button variant="ghost" className="text-sm font-bold text-foreground/90 transition-colors hover:text-primary">
                Pages
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem asChild={true}>
                <Link href="/products" className="flex items-center w-full">
                  {tPages("shopWithoutSidebar")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/checkout" className="flex items-center w-full">
                  {tPages("checkout")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/cart" className="flex items-center w-full">
                  {tPages("cart")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/wishlist" className="flex items-center w-full">
                  {tPages("wishlist")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/auth/signin" className="flex items-center w-full">
                  {tPages("signIn")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/auth/signup" className="flex items-center w-full">
                  {tPages("signUp")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/" className="flex items-center w-full">
                  {tPages("error")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/contact" className="flex items-center w-full">
                  {tPages("mailSuccess")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/privacy-policy" className="flex items-center w-full">
                  {tPages("privacyPolicy")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/terms-condition" className="flex items-center w-full">
                  {tPages("termsConditions")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Blog Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button variant="ghost" className="text-sm font-bold text-foreground/90 transition-colors hover:text-primary">
                {blogLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem asChild={true}>
                <Link href="/blog" className="flex items-center w-full">
                  {tBlog("grid")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/blog/blog-grid-with-sidebar" className="flex items-center w-full">
                  {tBlog("gridWithSidebar")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/blog/blog-details-with-sidebar" className="flex items-center w-full">
                  {tBlog("detailsWithSidebar")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href="/blog/blog-details" className="flex items-center w-full">
                  {tBlog("details")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Contact */}
          <Link
            href="/contact"
            className="text-sm font-bold text-foreground/90 transition-colors hover:text-primary"
          >
            {t("contact")}
          </Link>
        </div>
        {/* Desktop Search Bar and User Actions (hidden on mobile) */}
        <div className="hidden md:flex flex-row items-center space-x-4">
          <ThemeToggle />
          <LanguageSwitcher />
          {/* Search Bar */}
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative p-2 hover:bg-accent rounded-md transition-colors"
            suppressHydrationWarning={true}
          >
            <Heart className="h-4 w-4" />
            {hydrated && wishlistCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
                suppressHydrationWarning={true}
              >
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>
          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 hover:bg-accent rounded-md transition-colors"
            suppressHydrationWarning={true}
          >
            <ShoppingCart className="h-4 w-4" />
            {hydrated && cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
                suppressHydrationWarning={true}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          {/* User Menu (if authenticated) or Login/Signup (if not) */}
          {showAuthenticatedUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild={true}>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.name || ""}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold">{user?.name}</p>
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
                        className="flex items-center text-primary"
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
                <Link href="/auth/signin">{tPages("signIn")}</Link>
              </Button>
              <Button asChild={true} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/auth/signup">{tPages("signUp")}</Link>
              </Button>
            </div>
          )}
        </div>
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild={true}>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(88vw,22rem)] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-left font-persian">{siteTitle}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </form>
                <nav className="space-y-2">
                  {mobileNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-2xl px-4 py-3 text-sm font-bold text-foreground transition hover:bg-primary/10 hover:text-primary"
                      onClick={() => setSearchQuery("")}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                {categories.length > 0 && (
                  <div>
                    <p className="mb-2 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Categories
                    </p>
                    <div className="space-y-1">
                      {categories.slice(0, 8).map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, "-"))}`}
                          className="block rounded-2xl px-4 py-2 text-sm text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-t pt-4">
                  {!showAuthenticatedUser ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild={true} variant="outline">
                        <Link href="/auth/signin">{tPages("signIn")}</Link>
                      </Button>
                      <Button asChild={true} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href="/auth/signup">{tPages("signUp")}</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button asChild={true} variant="outline" className="w-full justify-start">
                        <Link href="/account"><User className="mr-2 h-4 w-4" />{t("account")}</Link>
                      </Button>
                      <Button asChild={true} variant="outline" className="w-full justify-start">
                        <Link href="/cart"><ShoppingCart className="mr-2 h-4 w-4" />{t("cart")}</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* Sidebars */}
      <MessageSidebar open={messagesOpen} onOpenChange={setMessagesOpen} />
      <NotificationSidebar open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </header>
  );
}