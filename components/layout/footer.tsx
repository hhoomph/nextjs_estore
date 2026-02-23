/**
 * Module for footer
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { Mail, Package, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
// Use client-side API route to fetch settings to avoid importing server actions
import { IranSansLoader } from "@/components/features/persian-font-loader";

export function Footer() {
  const [siteTitle, setSiteTitle] = useState("E-Store");
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
  });

  // Fetch site settings for dynamic title
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
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
        console.error("Failed to fetch site settings for footer:", error);
      }
    };

    fetchSiteSettings();
  }, []);

  return (
    <IranSansLoader>
      <footer className="bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
        <div className="container px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
            <div className="space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-persian">
                  {siteTitle}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-persian leading-relaxed">
                Your premier online shopping destination with premium products and exceptional service
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-5 text-foreground font-persian text-base">Products</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/products"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 font-persian"
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
