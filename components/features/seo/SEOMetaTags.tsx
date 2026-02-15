/**
 * Module for SEOMetaTags
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import Head from "next/head";
import { useEffect } from "react";

interface SiteSettings {
  siteTitleEn: string | null;
  siteTitleFa: string | null;
  phoneEn: string | null;
  phoneFa: string | null;
  descriptionEn: string | null;
  descriptionFa: string | null;
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  defaultOgImage: string | null;
  googleAnalyticsId: string | null;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultCurrency: string;
  lowStockThreshold: number;
}

interface SEOMetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  siteSettings?: SiteSettings | null;
  baseUrl?: string;
  noindex?: boolean;
}

export function SEOMetaTags({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  siteSettings,
  baseUrl = "http://localhost:3000",
  noindex = false,
}: SEOMetaTagsProps) {
  // Generate final SEO values
  const siteTitle = siteSettings?.siteTitleEn || "E-commerce Store";
  const siteDescription =
    siteSettings?.descriptionEn || "Your trusted online shopping destination";

  const finalTitle =
    title || siteSettings?.defaultSeoTitle || `${siteTitle} - Online Shopping`;
  const finalDescription =
    description || siteSettings?.defaultSeoDescription || siteDescription;
  const finalImage = image || siteSettings?.defaultOgImage;
  const finalUrl = url || baseUrl;

  // Generate structured data for organization
  const organizationStructuredData = siteSettings
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteTitle,
        description: siteDescription,
        url: baseUrl,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: siteSettings.phoneEn,
          contactType: "customer service",
        },
      }
    : null;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Canonical URL */}
      <link rel="canonical" href={finalUrl} />

      {/* Robots */}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content={siteTitle} />
      {finalImage && <meta property="og:image" content={finalImage} />}
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {finalImage && <meta name="twitter:image" content={finalImage} />}

      {/* Additional SEO Tags */}
      <meta name="author" content={siteTitle} />
      <meta name="language" content="en-US" />

      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />

      {/* Google Analytics */}
      {siteSettings?.googleAnalyticsId && (
        <>
          <script
            async={true}
            src={`https://www.googletagmanager.com/gtag/js?id=${siteSettings.googleAnalyticsId}`}
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${siteSettings.googleAnalyticsId}');
              `,
            }}
          />
        </>
      )}

      {/* Organization Structured Data */}
      {organizationStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
      )}

      {/* Additional Meta Tags for E-commerce */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta
        httpEquiv="Referrer-Policy"
        content="strict-origin-when-cross-origin"
      />
    </Head>
  );
}
