/**
 * Module for footer
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { LayoutDashboard, Package, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
// Use client-side API route to fetch settings to avoid importing server actions
import { IranSansLoader } from "@/components/features/persian-font-loader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSimplifiedSessionSync } from "@/lib/hooks/use-simplified-session-sync";

export function Footer() {
  const { user, isAuthenticated } = useSimplifiedSessionSync();
  const [siteTitle, setSiteTitle] = useState("E-Store");
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
  });

  // Fetch site settings for dynamic title
  useEffect(() => {
    const controller = new AbortController();
    const fetchSiteSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings", { signal: controller.signal });
        if (!res.ok) return;
        const result = await res.json();
        if (result?.settings) {
          setSiteTitle(result.settings.siteTitleEn || "E-Store");
          setContactInfo({
            phone: result.settings.phoneEn || "",
            email: result.settings.emailEn || "",
          });
        }
      } catch (error) {
        if (error instanceof Error && (error.name === "AbortError" || error.message === "Failed to fetch")) return;
        console.error("Failed to fetch site settings for footer:", error);
      }
    };

    void fetchSiteSettings();
    return () => controller.abort();
  }, []);

  return (
    <IranSansLoader>
      <footer className="bg-background border-t">
        <div className="container px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-xl text-foreground font-persian">
                  {siteTitle}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-persian">
                Your premier online shopping destination
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 font-persian">Products</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/products"
                    className="text-muted-foreground hover:text-foreground font-persian"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-muted-foreground hover:text-foreground font-persian"
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/deals"
                    className="text-muted-foreground hover:text-foreground font-persian"
                  >
                    Deals
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 font-persian">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground font-persian"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-muted-foreground hover:text-foreground font-persian"
                  >
                    Help
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 font-persian">Account</h3>
              {isAuthenticated ? (
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-blue-600/10 text-blue-600 text-xs">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground font-persian">
                      {user?.name || "User"}
                    </span>
                  </li>
                  <li>
                    <Link
                      href="/account"
                      className="text-muted-foreground hover:text-foreground font-persian"
                    >
                      <User className="inline-block h-3 w-3 mr-1" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/orders"
                      className="text-muted-foreground hover:text-foreground font-persian"
                    >
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/wishlist"
                      className="text-muted-foreground hover:text-foreground font-persian"
                    >
                      Wishlist
                    </Link>
                  </li>
                  {user?.role === "ADMIN" && (
                    <li>
                      <Link
                        href="/admin"
                        className="text-blue-600 hover:text-blue-700 font-persian font-medium"
                      >
                        <LayoutDashboard className="inline-block h-3 w-3 mr-1" />
                        Dashboard
                      </Link>
                    </li>
                  )}
                </ul>
              ) : (
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/auth/signin"
                      className="text-muted-foreground hover:text-foreground font-persian"
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/signup"
                      className="text-muted-foreground hover:text-foreground font-persian"
                    >
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/orders"
                      className="text-muted-foreground hover:text-foreground font-persian"
                    >
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/wishlist"
                      className="text-muted-foreground hover:text-foreground font-persian"
                    >
                      Wishlist
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
          <div className="mt-12 border-t pt-8">
            <p className="text-center text-sm text-muted-foreground font-persian">
              © 2025 E-Store. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </IranSansLoader>
  );
}
