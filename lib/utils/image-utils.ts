/**
 * Image utility functions for product images
 *
 * Provides shared placeholder image constants and helper functions
 * to ensure all products have valid and visible images.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

/** Default placeholder image URL (local SVG) */
export const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

/** Unsplash sample images used for seeding */
export const SAMPLE_PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
  "https://images.unsplash.com/photo-1526178417617-24d1387740a9?w=400",
];

/**
 * Returns a deterministic image index based on a string value.
 * Used to assign consistent images to products across seed runs.
 */
export function getDeterministicImageIndex(value: string, offset = 0): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return (hash + offset) % SAMPLE_PRODUCT_IMAGES.length;
}

/**
 * Returns a deterministic Unsplash image URL for a given product identifier.
 */
export function getProductImageUrl(value: string, offset = 0): string {
  return SAMPLE_PRODUCT_IMAGES[getDeterministicImageIndex(value, offset)];
}

/**
 * Returns a safe image URL for a product, falling back to the placeholder.
 *
 * @param images - Array of image URLs from productPictures
 * @param ogImage - The product's ogImage field
 * @returns A single safe image URL, or the placeholder if none available
 */
export function getSafeProductImage(
  images: string[] | undefined | null,
  ogImage?: string | null,
): string {
  if (images && images.length > 0 && images[0]) {
    return images[0];
  }
  if (ogImage) {
    return ogImage;
  }
  return PLACEHOLDER_IMAGE;
}

/**
 * Returns a safe array of image URLs for a product, falling back to the placeholder.
 *
 * @param images - Array of image URLs from productPictures
 * @param ogImage - The product's ogImage field
 * @returns An array with at least one safe image URL
 */
export function getSafeProductImages(
  images: string[] | undefined | null,
  ogImage?: string | null,
): string[] {
  if (images && images.length > 0) {
    return images;
  }
  if (ogImage) {
    return [ogImage];
  }
  return [PLACEHOLDER_IMAGE];
}