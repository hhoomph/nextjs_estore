/**
 * SEO Metadata Management
 *
 * Centralized SEO metadata for all pages and routes
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import type { Metadata } from "next";

/**
 * Site-wide metadata
 */
export const siteMetadata = {
  title: "NextJS E-Store",
  titleTemplate: "%s | NextJS E-Store",
  description:
    "Your premium e-commerce destination for quality products with fast delivery and excellent customer service.",
  keywords: [
    "e-commerce",
    "online shopping",
    "nextjs",
    "ecommerce",
    "web store",
    "online retail",
  ],
  authors: [{ name: "hh.oomph@gmail.com" }],
  creator: "hh.oomph@gmail.com",
  publisher: "hh.oomph@gmail.com",
  canonical: "https://yourdomain.com",
  language: "en-US",
  og: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com",
  },
  twitter: {
    card: "summary_large_image",
    handle: "@yourhandle",
    site: "@yourhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com",
    title: "NextJS E-Store",
    description:
      "Your premium e-commerce destination for quality products with fast delivery and excellent customer service.",
    siteName: "NextJS E-Store",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NextJS E-Store",
      },
    ],
  },
  verification: {
    google: "your-google-verification-code",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NextJS E-Store",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  themeColor: "#000000",
};

/**
 * Homepage metadata
 */
export const homepageMetadata = {
  title: "NextJS E-Store - Premium E-Commerce",
  description:
    "Discover amazing products at unbeatable prices. Shop from a wide range of categories including electronics, fashion, home & garden, and more.",
  keywords: [
    "e-commerce",
    "online shopping",
    "nextjs",
    "ecommerce",
    "web store",
    "online retail",
    "shop online",
    "buy products",
  ],
  openGraph: {
    ...siteMetadata.og,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NextJS E-Store - Homepage",
      },
    ],
  },
  twitter: {
    ...siteMetadata.twitter,
    card: "summary_large_image",
  },
};

/**
 * Product page metadata
 */
export function getProductPageMetadata(
  productName: string,
  category?: string,
): {
  title: string;
  description: string;
  keywords: string[];
  openGraph: {
    type: string;
    images: Array<{ url: string; width: number; height: number; alt: string }>;
  };
} {
  return {
    title: `${productName} - NextJS E-Store`,
    description: `Buy ${productName} at the best price. Quality guaranteed with fast shipping and secure payment options.`,
    keywords: [
      productName,
      category || "e-commerce",
      "online shopping",
      "nextjs",
      "ecommerce",
      "buy ${productName.toLowerCase()}",
    ],
    openGraph: {
      type: "article",
      images: [
        {
          url: `/og-product-${productName.replace(/\s+/g, "-").toLowerCase()}.jpg`,
          width: 1200,
          height: 630,
          alt: productName,
        },
      ],
    },
  };
}

/**
 * Category page metadata
 */
export function getCategoryPageMetadata(
  categoryName: string,
  itemCount?: number,
): {
  title: string;
  description: string;
  keywords: string[];
} {
  return {
    title: `${categoryName} - Products - NextJS E-Store`,
    description: `Browse and buy ${itemCount || "quality"} products from ${categoryName} category. Best prices, fast shipping.`,
    keywords: [
      categoryName,
      "e-commerce",
      "online shopping",
      "nextjs",
      "ecommerce",
      `buy ${categoryName.toLowerCase()}`,
    ],
  };
}

/**
 * Search page metadata
 */
export function getSearchPageMetadata(query: string): {
  title: string;
  description: string;
  keywords: string[];
} {
  return {
    title: `Search: ${query} - NextJS E-Store`,
    description: `Search results for "${query}". Browse quality products across all categories.`,
    keywords: [query, "e-commerce", "search", "nextjs", "ecommerce"],
  };
}

/**
 * Deals page metadata
 */
export const dealsPageMetadata = {
  title: "Hot Deals & Special Offers - NextJS E-Store",
  description:
    "Discover amazing deals, discounts, and special offers on premium products. Limited time offers you don't want to miss!",
  keywords: [
    "deals",
    "offers",
    "discounts",
    "sales",
    "special offers",
    "cheap products",
    "last chance",
  ],
  openGraph: {
    type: "website",
    images: [
      {
        url: "/og-deals.jpg",
        width: 1200,
        height: 630,
        alt: "Hot Deals - NextJS E-Store",
      },
    ],
  },
};

/**
 * Contact page metadata
 */
export const contactPageMetadata = {
  title: "Contact Us - NextJS E-Store",
  description:
    "Get in touch with our customer service team. We're here to help with any questions about your orders.",
  keywords: ["contact", "support", "help", "customer service", "questions"],
};

/**
 * Terms & Conditions page metadata
 */
export const termsPageMetadata = {
  title: "Terms & Conditions - NextJS E-Store",
  description:
    "Read our terms and conditions for online shopping. Understand your rights and responsibilities as a customer.",
  keywords: ["terms", "conditions", "terms and conditions", "policy"],
};

/**
 * Privacy Policy page metadata
 */
export const privacyPageMetadata = {
  title: "Privacy Policy - NextJS E-Store",
  description:
    "We care about your privacy. Read our privacy policy to understand how we collect, use, and protect your personal information.",
  keywords: ["privacy policy", "privacy", "data protection", "gdpr"],
};

/**
 * Cart page metadata
 */
export const cartPageMetadata = {
  title: "Shopping Cart - NextJS E-Store",
  description:
    "Review and manage your shopping cart. Ready to checkout and complete your purchase?",
  keywords: ["cart", "shopping cart", "checkout", "basket", "view cart"],
};

/**
 * Wishlist page metadata
 */
export const wishlistPageMetadata = {
  title: "Wishlist - NextJS E-Store",
  description:
    "Save your favorite products for later. View and manage your wishlist items.",
  keywords: ["wishlist", "saved items", "favorites", "saved products"],
};

/**
 * Orders page metadata
 */
export const ordersPageMetadata = {
  title: "My Orders - NextJS E-Store",
  description:
    "Track and manage your orders. View order history, shipping status, and track your packages.",
  keywords: ["orders", "order history", "track order", "my orders"],
};

/**
 * Dashboard page metadata
 */
export const dashboardPageMetadata = {
  title: "Dashboard - NextJS E-Store",
  description:
    "Manage your account, view orders, update profile, and access all your account settings.",
  keywords: ["dashboard", "account", "my account", "account settings"],
};

/**
 * Settings page metadata
 */
export const settingsPageMetadata = {
  title: "Settings - NextJS E-Store",
  description: "Manage your account settings, preferences, and notification preferences.",
  keywords: ["settings", "account settings", "preferences", "notifications"],
};

/**
 * Admin pages metadata (sensitive - should be protected)
 */
export const adminPageMetadata = {
  title: "Admin Dashboard - NextJS E-Store",
  description: "Admin panel for managing the e-store. Access restricted.",
  keywords: ["admin", "dashboard", "management", "panel"],
};

/**
 * Auth pages metadata
 */
export const authPageMetadata = {
  title: "Authentication - NextJS E-Store",
  description: "Sign in or create an account to access your order history and saved products.",
  keywords: ["sign in", "login", "register", "signup", "account"],
};

/**
 * Blog page metadata
 */
export const blogPageMetadata = {
  title: "Blog - NextJS E-Store",
  description:
    "Read our latest articles, news, and tips for e-commerce success. Stay updated with industry trends.",
  keywords: ["blog", "articles", "news", "tips", "e-commerce", "nextjs"],
};

/**
 * Blog post page metadata
 */
export function getBlogPostPageMetadata(
  title: string,
  category?: string,
): {
  title: string;
  description: string;
  keywords: string[];
} {
  return {
    title: `${title} - Blog - NextJS E-Store`,
    description: `Read about ${title} in our blog. Expert insights and tips for e-commerce success.`,
    keywords: [
      title,
      category || "blog",
      "e-commerce",
      "nextjs",
      "blog post",
    ],
  };
}

/**
 * Popular page metadata
 */
export const popularPageMetadata = {
  title: "Popular Products - NextJS E-Store",
  description:
    "Discover the most popular and trending products among our customers. Shop the best-sellers now!",
  keywords: ["popular", "trending", "best sellers", "top products"],
};

/**
 * Compare page metadata
 */
export const comparePageMetadata = {
  title: "Product Comparison - NextJS E-Store",
  description:
    "Compare products side by side. Make informed decisions with our comparison feature.",
  keywords: ["compare", "compare products", "product comparison"],
};

/**
 * Generate SEO metadata dynamically
 *
 * @param params - Parameters for generating metadata
 * @param params.locale - The locale code (e.g., 'en', 'fa')
 * @param params.keywords - Array of keywords
 * @returns Metadata object
 */
export function generateSEOMetadata(
  params: { locale: string; keywords?: string[] },
): Metadata {
  const { locale, keywords = [] } = params;

  const siteTitle = locale === "fa" ? "فروشگاه آنلاین" : "NextJS E-Store";

  return {
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description:
      locale === "fa"
        ? "خرید محصولات با کیفیت و تحویل سریع. بهترین قیمت و خدمات مشتریان."
        : "Your premium e-commerce destination for quality products with fast delivery and excellent customer service.",
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      type: "website",
      locale: locale === "fa" ? "fa_IR" : "en_US",
      url: "https://yourdomain.com",
      siteName: siteTitle,
      title: siteTitle,
      description:
        locale === "fa"
          ? "خرید محصولات با کیفیت و تحویل سریع. بهترین قیمت و خدمات مشتریان."
          : "Your premium e-commerce destination for quality products with fast delivery and excellent customer service.",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@yourhandle",
      title: siteTitle,
      description:
        locale === "fa"
          ? "خرید محصولات با کیفیت و تحویل سریع. بهترین قیمت و خدمات مشتریان."
          : "Your premium e-commerce destination for quality products with fast delivery and excellent customer service.",
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: "your-google-verification-code",
    },
  };
}

