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

/** Last-resort fallback image (local SVG) */
export const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

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
