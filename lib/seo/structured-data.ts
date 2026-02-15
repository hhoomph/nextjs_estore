/**
 * Structured Data (JSON-LD) Generation for SEO
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

export interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    areaServed: string;
    availableLanguage: string[];
  };
  sameAs?: string[];
}

export interface ProductData {
  name: string;
  description: string;
  image: string;
  sku: string;
  brand?: {
    name: string;
  };
  category?: string;
  offers: {
    price: number;
    currency: string;
    availability: "InStock" | "OutOfStock" | "PreOrder";
    priceValidUntil?: string;
    url?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  review?: Array<{
    author: string;
    reviewRating: number;
    reviewBody: string;
    datePublished: string;
  }>;
}

export interface BreadcrumbData {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export interface WebSiteData {
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    target: string;
    "query-input": string;
  };
}

export interface ArticleData {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
  mainEntityOfPage: string;
  articleSection?: string;
  keywords?: string[];
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(data: OrganizationData) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    contactPoint: data.contactPoint
      ? {
          "@type": "ContactPoint",
          telephone: data.contactPoint.telephone,
          contactType: data.contactPoint.contactType,
          areaServed: data.contactPoint.areaServed,
          availableLanguage: data.contactPoint.availableLanguage,
        }
      : undefined,
    sameAs: data.sameAs,
  };
}

/**
 * Generate Product structured data
 */
export function generateProductSchema(data: ProductData) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    description: data.description,
    image: data.image,
    sku: data.sku,
    brand: data.brand
      ? {
          "@type": "Brand",
          name: data.brand.name,
        }
      : undefined,
    category: data.category,
    offers: {
      "@type": "Offer",
      price: data.offers.price,
      priceCurrency: data.offers.currency,
      availability: `https://schema.org/${data.offers.availability}`,
      priceValidUntil: data.offers.priceValidUntil,
      url: data.offers.url,
    },
    aggregateRating: data.aggregateRating
      ? {
          "@type": "AggregateRating",
          ratingValue: data.aggregateRating.ratingValue,
          reviewCount: data.aggregateRating.reviewCount,
          bestRating: data.aggregateRating.bestRating || 5,
          worstRating: data.aggregateRating.worstRating || 1,
        }
      : undefined,
    review: data.review?.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.reviewRating,
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished,
    })),
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(data: BreadcrumbData) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: data.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate WebSite structured data
 */
export function generateWebSiteSchema(data: WebSiteData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    url: data.url,
    description: data.description,
    potentialAction: data.potentialAction
      ? {
          "@type": "SearchAction",
          target: data.potentialAction.target,
          "query-input": data.potentialAction["query-input"],
        }
      : undefined,
  };
}

/**
 * Generate Article structured data
 */
export function generateArticleSchema(data: ArticleData) {
  return {
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
      "@id": data.mainEntityOfPage,
    },
    articleSection: data.articleSection,
    keywords: data.keywords,
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate HowTo structured data
 */
export function generateHowToSchema(data: {
  name: string;
  description: string;
  image?: string;
  totalTime?: string;
  supply?: string[];
  tool?: string[];
  step: Array<{
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: data.name,
    description: data.description,
    image: data.image,
    totalTime: data.totalTime,
    supply: data.supply,
    tool: data.tool,
    step: data.step.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
      url: step.url,
    })),
  };
}

/**
 * Generate LocalBusiness structured data
 */
export function generateLocalBusinessSchema(data: {
  name: string;
  description?: string;
  image?: string;
  telephone?: string;
  email?: string;
  url?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: data.name,
    description: data.description,
    image: data.image,
    telephone: data.telephone,
    email: data.email,
    url: data.url,
    address: {
      "@type": "PostalAddress",
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion,
      postalCode: data.address.postalCode,
      addressCountry: data.address.addressCountry,
    },
    geo: data.geo
      ? {
          "@type": "GeoCoordinates",
          latitude: data.geo.latitude,
          longitude: data.geo.longitude,
        }
      : undefined,
    openingHours: data.openingHours,
    priceRange: data.priceRange,
    aggregateRating: data.aggregateRating
      ? {
          "@type": "AggregateRating",
          ratingValue: data.aggregateRating.ratingValue,
          reviewCount: data.aggregateRating.reviewCount,
        }
      : undefined,
  };
}

/**
 * Generate E-commerce specific structured data
 */
export function generateEcommerceSchema(data: {
  storeName: string;
  storeUrl: string;
  storeDescription?: string;
  currency: string;
  products?: ProductData[];
  categories?: Array<{
    name: string;
    url: string;
    description?: string;
  }>;
}) {
  const schemas = [];

  // Organization schema for the store
  schemas.push(
    generateOrganizationSchema({
      name: data.storeName,
      url: data.storeUrl,
      description: data.storeDescription,
    }),
  );

  // WebSite schema with search functionality
  schemas.push(
    generateWebSiteSchema({
      name: data.storeName,
      url: data.storeUrl,
      description: data.storeDescription,
      potentialAction: {
        target: `${data.storeUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    }),
  );

  return schemas;
}
