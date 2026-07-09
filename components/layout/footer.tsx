"use client";

import { Mail, MapPin, Package, Phone, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type SVGProps } from "react";
import { CurrencySelector } from "@/components/ui/currency-selector";

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

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
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a href="#" aria-label="X" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-primary hover:text-primary-foreground">
                <X className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-primary hover:text-primary-foreground">
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-primary hover:text-primary-foreground">
                <LinkedinIcon className="h-4 w-4" />
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
            <div className="flex flex-wrap items-center gap-4">
              <CurrencySelector />
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
