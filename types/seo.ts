/**
 * Module for seo
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
// SEO-related type definitions

export interface SEOData {
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image?: string;
  canonical_url?: string;
}

export interface SiteSettingsData {
  site_title_en: string;
  site_title_fa: string;
  phone_en?: string;
  phone_fa?: string;
  description_en?: string;
  description_fa?: string;
  default_seo_title?: string;
  default_seo_description?: string;
  default_og_image?: string;
  google_analytics_id?: string;
  maintenance_mode: boolean;
  allow_registration: boolean;
  default_currency: string;
  low_stock_threshold: number;
}

// Product SEO interface
export interface ProductWithSEO {
  id: string;
  name: string;
  desc: string;
  slug: string;
  price: number;
  discount_price?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image?: string;
  canonical_url?: string;
  category: {
    id: string;
    name: string;
  };
  product_pictures: Array<{
    picture: {
      url: string;
    };
  }>;
}

// SEO Meta Tags component props
export interface SEOMetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  siteSettings?: SiteSettingsData | null;
  baseUrl?: string;
  noindex?: boolean;
}

// Product SEO Metadata component props
export interface ProductSEOMetadataProps {
  product: ProductWithSEO;
  baseUrl?: string;
}

// SEO validation schemas (for reference)
export const seoValidationRules = {
  seo_title: {
    maxLength: 60, // Recommended for search engines
  },
  seo_description: {
    maxLength: 160, // Recommended for search engines
  },
  seo_keywords: {
    maxLength: 255,
  },
  og_image: {
    required: false,
    url: true,
  },
  canonical_url: {
    required: false,
    url: true,
  },
};

// SEO utility functions
export const generateSEOMetadata = (
  product: ProductWithSEO,
  baseUrl: string = "http://localhost:3000",
) => {
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const productImage =
    product.og_image || product.product_pictures[0]?.picture.url;

  return {
    title: product.seo_title || `${product.name} - ${product.category.name}`,
    description:
      product.seo_description ||
      (product.desc
        ? product.desc.substring(0, 155) +
          (product.desc.length > 155 ? "..." : "")
        : `Buy ${product.name} online. Best price guaranteed. Fast shipping.`),
    keywords:
      product.seo_keywords ||
      `${product.category.name}, ${product.name}, buy online, best price`,
    image: productImage,
    url: product.canonical_url || productUrl,
  };
};

export const generateSiteMetadata = (
  siteSettings?: SiteSettingsData | null,
  baseUrl: string = "http://localhost:3000",
) => {
  if (!siteSettings) {
    return {
      title: "E-Store - Modern E-commerce Platform",
      description:
        "A modern e-commerce platform with user management and admin features",
      image: null,
      url: baseUrl,
    };
  }

  return {
    title: siteSettings.site_title_en || "E-Store",
    description: siteSettings.description_en || "A modern e-commerce platform",
    image: siteSettings.default_og_image,
    url: baseUrl,
    analyticsId: siteSettings.google_analytics_id,
  };
};

// Structured data generators
export const generateProductStructuredData = (
  product: ProductWithSEO,
  baseUrl: string = "http://localhost:3000",
) => {
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const productImage =
    product.og_image || product.product_pictures[0]?.picture.url;
  const productPrice = product.discount_price || product.price;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc || `Buy ${product.name} online`,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Your Store Name",
    },
    category: product.category.name,
    offers: {
      "@type": "Offer",
      price: productPrice,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: productUrl,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    image: productImage ? [productImage] : [],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "10",
    },
  };
};

export const generateOrganizationStructuredData = (
  siteSettings?: SiteSettingsData | null,
  baseUrl: string = "http://localhost:3000",
) => {
  if (!siteSettings) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteSettings.site_title_en,
    description: siteSettings.description_en,
    url: baseUrl,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteSettings.phone_en,
      contactType: "customer service",
    },
  };
};

// SEO API response types
export interface SEOApiResponse {
  success: boolean;
  data?: SEOData;
  error?: string;
}

export interface SiteSettingsApiResponse {
  success: boolean;
  settings?: SiteSettingsData;
  error?: string;
}

// SEO constants
export const SEO_DEFAULTS = {
  TITLE_MAX_LENGTH: 60,
  DESCRIPTION_MAX_LENGTH: 160,
  KEYWORDS_MAX_LENGTH: 255,
  OG_IMAGE_WIDTH: 1200,
  OG_IMAGE_HEIGHT: 630,
};

export const SEO_ROBOTS_OPTIONS = [
  { value: "index,follow", label: "Index and Follow" },
  { value: "index,nofollow", label: "Index but Don't Follow" },
  { value: "noindex,follow", label: "Don't Index but Follow" },
  { value: "noindex,nofollow", label: "Don't Index or Follow" },
] as const;
