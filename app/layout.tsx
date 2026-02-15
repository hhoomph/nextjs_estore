/**
 * Root Layout with Cookie-based Internationalization
 *
 * Handles locale detection via cookies with Persian (fa) as default.
 * All i18n is now managed without URL prefixes.
 *
 * @author hh.oomph@gmail.com
 * @version 3.0.0
 * @since 2025-01-01
 */
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { AdvancedErrorBoundary } from "@/components/errors/advanced-error-boundary";
import { ApiErrorBoundary } from "@/components/errors/api-error-boundary";
import { EnhancedErrorBoundary } from "@/components/errors/enhanced-error-boundary";
import { CartSidebar } from "@/components/features/cart/cart-sidebar";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { Footer } from "@/components/layout/footer";
import { BetterAuthProvider } from "@/components/providers/better-auth-provider";
import { HTMLAttributesProvider } from "@/components/providers/html-attributes-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { OverlayProvider } from "@/components/providers/overlay-provider";
import { PerformanceProvider } from "@/components/providers/performance-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { CookieLocale } from "@/lib/i18n/cookie-locale";
import { generateSEOMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return generateSEOMetadata({
    locale,
    keywords: ["فروشگاه", "خرید آنلاین", "محصولات", "e-commerce", "shopping"],
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale and messages from cookie-based detection
  const locale = await getLocale();
  const messages = await getMessages();

  const isRTL = locale === "fa";

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning={true}
    >
      <body suppressHydrationWarning={true}>
        <NextIntlClientProvider
          messages={messages}
          locale={locale as CookieLocale}
        >
          <LocaleProvider initialLocale={locale as CookieLocale}>
            {/* Client-side fallback that updates attributes after hydration */}
            <HTMLAttributesProvider />

            <EnhancedErrorBoundary>
              <PerformanceProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem={true}
                  disableTransitionOnChange={true}
                >
                  <BetterAuthProvider>
                    <OverlayProvider>
                      <div
                        className="min-h-screen flex flex-col"
                        suppressHydrationWarning={true}
                      >
                        <ConditionalNavbar />

                        <ApiErrorBoundary showNetworkStatus={true}>
                          <CartSidebar />
                        </ApiErrorBoundary>

                        <main className="flex-1">
                          <AdvancedErrorBoundary
                            showErrorDetails={
                              process.env.NODE_ENV === "development"
                            }
                            enableReporting={true}
                          >
                            {children}
                          </AdvancedErrorBoundary>
                        </main>

                        <AdvancedErrorBoundary
                          showErrorDetails={
                            process.env.NODE_ENV === "development"
                          }
                          enableReporting={true}
                        >
                          <Footer />
                        </AdvancedErrorBoundary>
                      </div>
                    </OverlayProvider>
                  </BetterAuthProvider>
                </ThemeProvider>
              </PerformanceProvider>
            </EnhancedErrorBoundary>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
