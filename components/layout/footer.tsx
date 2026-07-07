"use client";

import {
  Globe,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Footer() {
  const [siteTitle, setSiteTitle] = useState("E-Store");
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchSiteSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings", {
          signal: controller.signal,
        });
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
        if (
          error instanceof Error &&
          (error.name === "AbortError" || error.message === "Failed to fetch")
        ) {
          return;
        }
      }
    };

    void fetchSiteSettings();

    return () => controller.abort();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="bg-background text-foreground">
      <div className="container px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.1fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-xl font-black">{siteTitle}</span>
            </div>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              Your premier online shopping destination for curated products,
              reliable checkout, and thoughtful customer support.
            </p>
            <div className="mt-6 flex gap-3">
                <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-primary hover:text-primary-foreground">
                <Globe className="h-4 w-4" />
              </a>
                <a href="#" aria-label="X" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-primary hover:text-primary-foreground">
                <Globe className="h-4 w-4" />
              </a>
                <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-primary hover:text-primary-foreground">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-primary hover:text-primary-foreground">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-black uppercase tracking-widest text-primary">
              Shop
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/products" className="transition hover:text-primary">Products</Link></li>
              <li><Link href="/categories" className="transition hover:text-primary">Categories</Link></li>
              <li><Link href="/deals" className="transition hover:text-primary">Deals</Link></li>
              <li><Link href="/popular" className="transition hover:text-primary">Popular</Link></li>
              <li><Link href="/cart" className="transition hover:text-primary">Cart</Link></li>
              <li><Link href="/wishlist" className="transition hover:text-primary">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-black uppercase tracking-widest text-primary">
              Help & Support
            </h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={contactInfo.phone ? `tel:${contactInfo.phone}` : "#"} className="transition hover:text-primary">
                  {contactInfo.phone || "+1 (555) 123-4567"}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={contactInfo.email ? `mailto:${contactInfo.email}` : "#"} className="transition hover:text-primary">
                  {contactInfo.email || "support@example.com"}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>685 Market Street, Las Vegas</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-black uppercase tracking-widest text-primary">
              Account
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/auth/signin" className="transition hover:text-primary">Sign In</Link></li>
              <li><Link href="/auth/signup" className="transition hover:text-primary">Sign Up</Link></li>
<li><Link href="/account" className="flex items-center gap-2 transition hover:text-primary"><User className="h-4 w-4" />Profile</Link></li>
<li><Link href="/orders" className="flex items-center gap-2 transition hover:text-primary"><Package className="h-4 w-4" />Orders</Link></li>
              <li><Link href="/wishlist" className="transition hover:text-primary">Wishlist</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-[2rem] bg-muted p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-black">Download App</h3>
              <p className="mt-2 text-sm text-muted-foreground">Get started in seconds – it is fast, free, and easy.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="rounded-2xl border border-border bg-background px-4 py-3 text-left transition hover:bg-primary hover:text-primary-foreground">
                <span className="block text-xs text-muted-foreground">Download on the</span>
                <span className="block text-sm font-black">App Store</span>
              </button>
              <button type="button" className="rounded-2xl border border-border bg-background px-4 py-3 text-left transition hover:bg-primary hover:text-primary-foreground">
                <span className="block text-xs text-muted-foreground">Get it on</span>
                <span className="block text-sm font-black">Google Play</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <div className="flex flex-col justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <p>© {year} {siteTitle}. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy-policy" className="transition hover:text-primary">Privacy Policy</Link>
              <Link href="/terms-condition" className="transition hover:text-primary">Terms of Use</Link>
              <Link href="/contact" className="transition hover:text-primary">Contact</Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Visa", "PayPal", "Mastercard", "Apple Pay", "Google Pay"].map((payment) => (
              <span key={payment} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-foreground">
                {payment}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
