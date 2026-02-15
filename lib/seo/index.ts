/**
 * Module for SEO utilities and metadata management
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import type { Metadata } from "next";

// SEO Configuration
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  structuredData?: object;
  noIndex?: boolean;
  noFollow?: boolean;
  alternateLanguages?: Array<{
    hrefLang: string;
    href: string;
  }>;
}

// Default SEO configuration
export const defaultSEOConfig = {
  siteName: "Next.js E-commerce Store",
  defaultTitle: "Premium Online Shopping Experience",
  defaultDescription:
    "Discover amazing products at unbeatable prices. Fast shipping, secure payments, and exceptional customer service.",
  defaultKeywords: [
    "ecommerce",
    "shopping",
    "online store",
    "products",
    "deals",
  ],
  defaultImage: "/og-default.jpg",
  twitterHandle: "@ecommerce_store",
  locale: "en_US",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

// Generate comprehensive metadata for pages
export async function generateSEO(
  config: Partial<SEOConfig>,
  locale: string = "en",
): Promise<Metadata> {
  const title = config.title || defaultSEOConfig.defaultTitle;
  const description = config.description || defaultSEOConfig.defaultDescription;
  const keywords = config.keywords || defaultSEOConfig.defaultKeywords;
  const canonical = config.canonical || defaultSEOConfig.siteUrl;
  const ogImage = config.ogImage || defaultSEOConfig.defaultImage;

  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | ${defaultSEOConfig.siteName}`,
    },
    description,
    keywords: keywords.join(", "),
    authors: [{ name: defaultSEOConfig.siteName }],
    creator: defaultSEOConfig.siteName,
    publisher: defaultSEOConfig.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(defaultSEOConfig.siteUrl),
    alternates: {
      canonical,
      languages: config.alternateLanguages?.reduce(
        (acc, alt) => {
          acc[alt.hrefLang] = alt.href;
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
    robots: {
      index: !config.noIndex,
      follow: !config.noFollow,
      googleBot: {
        index: !config.noIndex,
        follow: !config.noFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type:
        config.ogType === "article" || config.ogType === "website"
          ? config.ogType
          : "website",
      locale,
      siteName: defaultSEOConfig.siteName,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    } as any,
    twitter: {
      card: config.twitterCard || "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: defaultSEOConfig.twitterHandle,
      site: defaultSEOConfig.twitterHandle,
    },
    other: {
      "article:author": defaultSEOConfig.siteName,
    },
  };

  // Add structured data if provided
  if (config.structuredData) {
    metadata.other = {
      ...metadata.other,
      "application/ld+json": JSON.stringify(config.structuredData),
    } as any;
  }

  return metadata;
}

// Structured Data generators
export const structuredData = {
  // Organization schema
  organization: (data: {
    name: string;
    url: string;
    logo: string;
    sameAs?: string[];
    contactPoint?: {
      telephone: string;
      contactType: string;
      areaServed: string;
      availableLanguage: string;
    };
  }) => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    logo: data.logo,
    sameAs: data.sameAs,
    contactPoint: data.contactPoint
      ? {
          "@type": "ContactPoint",
          telephone: data.contactPoint.telephone,
          contactType: data.contactPoint.contactType,
          areaServed: data.contactPoint.areaServed,
          availableLanguage: data.contactPoint.availableLanguage,
        }
      : undefined,
  }),

  // Product schema
  product: (data: {
    name: string;
    description: string;
    image: string;
    sku: string;
    brand: string;
    offers: {
      price: number;
      priceCurrency: string;
      availability: string;
      url: string;
    };
    aggregateRating?: {
      ratingValue: number;
      reviewCount: number;
    };
  }) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    description: data.description,
    image: data.image,
    sku: data.sku,
    brand: {
      "@type": "Brand",
      name: data.brand,
    },
    offers: {
      "@type": "Offer",
      price: data.offers.price,
      priceCurrency: data.offers.priceCurrency,
      availability: data.offers.availability,
      url: data.offers.url,
    },
    aggregateRating: data.aggregateRating
      ? {
          "@type": "AggregateRating",
          ratingValue: data.aggregateRating.ratingValue,
          reviewCount: data.aggregateRating.reviewCount,
        }
      : undefined,
  }),

  // Breadcrumb schema
  breadcrumb: (
    items: Array<{
      name: string;
      url: string;
    }>,
  ) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  // Article schema
  article: (data: {
    headline: string;
    description: string;
    image: string;
    datePublished: string;
    dateModified: string;
    author: {
      name: string;
      url?: string;
    };
    publisher: {
      name: string;
      logo: string;
    };
    url: string;
  }) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.headline,
    description: data.description,
    image: data.image,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    author: {
      "@type": "Person",
      name: data.author.name,
      url: data.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: data.publisher.name,
      logo: {
        "@type": "ImageObject",
        url: data.publisher.logo,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": data.url,
    },
  }),

  // Website schema
  website: (data: {
    name: string;
    url: string;
    description: string;
    potentialAction?: {
      target: string;
      queryInput: string;
    };
  }) => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    url: data.url,
    description: data.description,
    potentialAction: data.potentialAction
      ? {
          "@type": "SearchAction",
          target: data.potentialAction.target,
          "query-input": data.potentialAction.queryInput,
        }
      : undefined,
  }),
};

// Sitemap generation utilities
export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  alternates?: Array<{
    hrefLang: string;
    href: string;
  }>;
}

export function generateSitemap(entries: SitemapEntry[]): string {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${entries
  .map((entry) => {
    const url = `  <url>
    <loc>${entry.url}</loc>
${entry.lastModified ? `    <lastmod>${entry.lastModified.toISOString()}</lastmod>` : ""}
${entry.changeFrequency ? `    <changefreq>${entry.changeFrequency}</changefreq>` : ""}
${entry.priority ? `    <priority>${entry.priority}</priority>` : ""}
${
  entry.alternates
    ? entry.alternates
        .map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${alt.hrefLang}" href="${alt.href}" />`,
        )
        .join("\n")
    : ""
}
  </url>`;
    return url;
  })
  .join("\n")}

</urlset>`;

  return sitemap;
}

// Robots.txt generation
export function generateRobotsTxt(disallowPaths: string[] = []): string {
  const baseUrl = defaultSEOConfig.siteUrl;

  return `User-agent: *
${disallowPaths.map((path) => `Disallow: ${path}`).join("\n")}

Sitemap: ${baseUrl}/sitemap.xml
`;
}

// Canonical URL generation
export function generateCanonicalUrl(path: string, locale?: string): string {
  const baseUrl = defaultSEOConfig.siteUrl;
  const url = new URL(path, baseUrl);

  if (locale && locale !== "en") {
    url.searchParams.set("locale", locale);
  }

  return url.toString();
}

// Meta tag utilities
export const metaTags = {
  // Generate theme color meta tags
  themeColor: (color: string) => [
    { name: "theme-color", content: color },
    { name: "msapplication-TileColor", content: color },
    { name: "color-scheme", content: "light dark" },
  ],

  // Generate favicon meta tags
  favicon: (basePath: string = "/") => [
    { rel: "icon", type: "image/x-icon", href: `${basePath}favicon.ico` },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: `${basePath}favicon-32x32.png`,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: `${basePath}favicon-16x16.png`,
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: `${basePath}apple-touch-icon.png`,
    },
    { rel: "manifest", href: `${basePath}site.webmanifest` },
  ],

  // Generate social media meta tags
  social: (data: {
    title: string;
    description: string;
    image: string;
    url: string;
    type?: "article" | "website";
  }) => [
    // Facebook/Open Graph
    { property: "og:title", content: data.title },
    { property: "og:description", content: data.description },
    { property: "og:image", content: data.image },
    { property: "og:url", content: data.url },
    { property: "og:type", content: data.type || "website" },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: data.title },
    { name: "twitter:description", content: data.description },
    { name: "twitter:image", content: data.image },

    // LinkedIn
    { property: "og:title", content: data.title },
    { property: "og:description", content: data.description },
    { property: "og:image", content: data.image },
  ],
};

// Performance monitoring utilities
export const performance = {
  // Core Web Vitals tracking
  trackWebVitals: (metric: any) => {
    // Send to analytics service
    console.log("Web Vitals:", metric);

    // Example: Send to Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", metric.name, {
        event_category: "Web Vitals",
        event_label: metric.id,
        value: Math.round(
          metric.name === "CLS" ? metric.value * 1000 : metric.value,
        ),
        non_interaction: true,
      });
    }
  },

  // Page load performance tracking
  trackPageLoad: (page: string, loadTime: number) => {
    console.log(`Page ${page} loaded in ${loadTime}ms`);

    // Send to analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "page_load_time", {
        event_category: "Performance",
        event_label: page,
        value: loadTime,
      });
    }
  },
};

// Accessibility utilities
export const accessibility = {
  // Generate skip links
  skipLinks: () => [
    { href: "#main-content", children: "Skip to main content" },
    { href: "#navigation", children: "Skip to navigation" },
    { href: "#footer", children: "Skip to footer" },
  ],

  // ARIA live region utilities
  announceToScreenReader: (
    message: string,
    priority: "polite" | "assertive" = "polite",
  ) => {
    if (typeof document === "undefined") return;

    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.style.position = "absolute";
    announcement.style.left = "-10000px";
    announcement.style.width = "1px";
    announcement.style.height = "1px";
    announcement.style.overflow = "hidden";

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
};
