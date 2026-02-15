/**
 * Module for ProductSEOMetadata
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import Head from "next/head";

interface Product {
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
  images: Array<{
    id: string;
    url: string;
    alt: string;
  }>;
}

interface ProductSEOMetadataProps {
  product: Product;
  baseUrl?: string;
}

export function ProductSEOMetadata({
  product,
  baseUrl = "http://localhost:3000",
}: ProductSEOMetadataProps) {
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const productImage = product.og_image || product.images?.[0]?.url;
  const productPrice = product.discount_price || product.price;

  // Generate SEO data
  const title =
    product.seo_title || `${product.name} - ${product.category.name}`;
  const description =
    product.seo_description ||
    (product.desc
      ? product.desc.substring(0, 155) +
        (product.desc.length > 155 ? "..." : "")
      : `Buy ${product.name} online. Best price guaranteed. Fast shipping.`);

  const keywords =
    product.seo_keywords ||
    `${product.category.name}, ${product.name}, buy online, best price`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc || description,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Your Store Name", // You might want to make this configurable
    },
    category: product.category.name,
    offers: {
      "@type": "Offer",
      price: productPrice,
      priceCurrency: "USD", // Make this configurable
      availability: "https://schema.org/InStock",
      url: productUrl,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 1 year from now
    },
    image: productImage ? [productImage] : [],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5", // You might want to calculate this from actual reviews
      reviewCount: "10", // You might want to get this from actual data
    },
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={product.canonical_url || productUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={product.canonical_url || productUrl} />
      {productImage && <meta property="og:image" content={productImage} />}
      <meta property="og:image:alt" content={product.name} />
      <meta property="og:site_name" content="Your Store Name" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {productImage && <meta name="twitter:image" content={productImage} />}

      {/* Product-specific Meta Tags */}
      <meta name="product:category" content={product.category.name} />
      <meta name="product:price" content={productPrice.toString()} />
      <meta name="product:currency" content="USD" />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Your Store Name" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </Head>
  );
}
