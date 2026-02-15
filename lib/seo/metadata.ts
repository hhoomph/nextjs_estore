/**
 * SEO Metadata Generation Utilities
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  locale?: string;
}

export interface ProductSEOProps extends SEOProps {
  productName: string;
  productDescription: string;
  productImage: string;
  productPrice?: number;
  productCurrency?: string;
  productBrand?: string;
  productCategory?: string;
  productAvailability?: "InStock" | "OutOfStock" | "PreOrder";
  productRating?: number;
  productReviewCount?: number;
}

/**
 * Generate comprehensive SEO metadata
 */
export async function generateSEOMetadata(
  props: SEOProps = {},
): Promise<Metadata> {
  const t = await getTranslations("SEO");

  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    locale = "en",
  } = props;

  // Default values from translations
  const defaultTitle = t("defaultTitle") || "E-Store";
  const defaultDescription =
    t("defaultDescription") || "Your premier online shopping destination";
  const defaultImage = "/og-image.jpg";
  const siteName = t("siteName") || "E-Store";
  const twitterHandle = t("twitterHandle") || "@estore";

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const finalUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const metadata: Metadata = {
    title: {
      default: finalTitle,
      template: `%s | ${siteName}`,
    },
    description: finalDescription,
    keywords: [...keywords, "e-commerce", "shopping", "online store"],
    authors: author ? [{ name: author }] : [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ),
    alternates: {
      canonical: finalUrl,
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: finalUrl,
      siteName,
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
      locale,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [finalImage],
      creator: twitterHandle,
      site: twitterHandle,
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
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
    },
  };

  // Add article-specific metadata
  if (
    type === "article" &&
    (publishedTime || modifiedTime || author || section || tags)
  ) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "article" as const,
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags,
    };
  }

  return metadata;
}

/**
 * Generate product-specific SEO metadata with structured data
 */
export async function generateProductSEOMetadata(
  props: ProductSEOProps,
): Promise<Metadata> {
  const baseMetadata = await generateSEOMetadata({
    ...props,
    type: "website", // Next.js OpenGraph only supports 'website' or 'article'
  });

  const {
    productName,
    productDescription,
    productImage,
    productPrice,
    productCurrency = "USD",
    productBrand,
    productCategory,
    productAvailability = "InStock",
    productRating,
    productReviewCount,
  } = props;

  // Add product-specific Open Graph metadata
  const productMetadata: Metadata = {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: productName,
        },
      ],
    },
    other: {
      // Product structured data
      "product:name": productName,
      "product:description": productDescription,
      "product:image": productImage,
      ...(productPrice && { "product:price": `${productPrice}` }),
      "product:currency": productCurrency,
      ...(productBrand && { "product:brand": productBrand }),
      ...(productCategory && { "product:category": productCategory }),
      "product:availability": productAvailability,
      ...(productRating && { "product:rating": `${productRating}` }),
      ...(productReviewCount && {
        "product:reviewCount": `${productReviewCount}`,
      }),
    },
  };

  return productMetadata;
}

/**
 * Generate category/page-specific SEO metadata
 */
export async function generatePageSEOMetadata(
  pageType: "home" | "category" | "search" | "cart" | "checkout" | "account",
  customProps?: Partial<SEOProps>,
): Promise<Metadata> {
  const t = await getTranslations("SEO");

  const pageConfigs = {
    home: {
      title: t("home.title") || "Welcome to E-Store",
      description:
        t("home.description") || "Discover amazing products at great prices",
    },
    category: {
      title: t("category.title") || "Shop by Category",
      description:
        t("category.description") ||
        "Browse our wide range of product categories",
    },
    search: {
      title: t("search.title") || "Search Products",
      description:
        t("search.description") || "Find the perfect product for you",
    },
    cart: {
      title: t("cart.title") || "Shopping Cart",
      description:
        t("cart.description") || "Review your items and proceed to checkout",
    },
    checkout: {
      title: t("checkout.title") || "Checkout",
      description:
        t("checkout.description") || "Complete your purchase securely",
    },
    account: {
      title: t("account.title") || "My Account",
      description: t("account.description") || "Manage your account and orders",
    },
  };

  const config = pageConfigs[pageType];

  return generateSEOMetadata({
    title: config.title,
    description: config.description,
    ...customProps,
  });
}

/**
 * Generate sitemap URLs for SEO
 */
export function generateSitemapEntry(
  url: string,
  lastModified?: Date,
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never",
  priority?: number,
) {
  return {
    url,
    lastModified: lastModified || new Date(),
    changeFrequency: changeFrequency || "weekly",
    priority: priority || 0.5,
  };
}
