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

/** Local placeholder images used for seeding and fallbacks */
export const SAMPLE_PRODUCT_IMAGES = [
  "/placeholder-product.svg",
  "/placeholder-product.svg",
  "/placeholder-product.svg",
  "/placeholder-product.svg",
  "/placeholder-product.svg",
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
 * Returns a safe image URL for a given product identifier.
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
