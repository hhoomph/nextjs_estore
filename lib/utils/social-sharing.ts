/**
 * Social sharing utilities for e-commerce products
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

export interface ProductShareData {
  title: string;
  description: string;
  url: string;
  image?: string;
  price?: number;
  currency?: string;
}

export interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
  shareUrl: (data: ProductShareData) => string;
  isMobile?: boolean;
}

/**
 * Social sharing platforms configuration
 */
export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  whatsapp: {
    name: "WhatsApp",
    icon: "whatsapp",
    color: "#25D366",
    shareUrl: (data) =>
      `https://wa.me/?text=${encodeURIComponent(
        `${data.title}\n${data.description}\nقیمت: ${data.price?.toLocaleString("fa-IR")} ${data.currency || "تومان"}\n${data.url}`,
      )}`,
    isMobile: true,
  },
  telegram: {
    name: "Telegram",
    icon: "telegram",
    color: "#0088CC",
    shareUrl: (data) =>
      `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(
        `${data.title}\n${data.description}\nقیمت: ${data.price?.toLocaleString("fa-IR")} ${data.currency || "تومان"}`,
      )}`,
  },
  eitaa: {
    name: "Eitaa",
    icon: "eitaa",
    color: "#00A884",
    shareUrl: (data) =>
      `https://eitaa.com/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(
        `${data.title}\n${data.description}\nقیمت: ${data.price?.toLocaleString("fa-IR")} ${data.currency || "تومان"}`,
      )}`,
  },
  twitter: {
    name: "Twitter",
    icon: "twitter",
    color: "#1DA1F2",
    shareUrl: (data) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `${data.title} - قیمت: ${data.price?.toLocaleString("fa-IR")} ${data.currency || "تومان"}`,
      )}&url=${encodeURIComponent(data.url)}`,
  },
  facebook: {
    name: "Facebook",
    icon: "facebook",
    color: "#1877F2",
    shareUrl: (data) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`,
  },
  linkedin: {
    name: "LinkedIn",
    icon: "linkedin",
    color: "#0077B5",
    shareUrl: (data) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`,
  },
  email: {
    name: "Email",
    icon: "email",
    color: "#EA4335",
    shareUrl: (data) =>
      `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(
        `${data.description}\n\nقیمت: ${data.price?.toLocaleString("fa-IR")} ${data.currency || "تومان"}\n\nمشاهده محصول: ${data.url}`,
      )}`,
  },
  copy: {
    name: "Copy Link",
    icon: "copy",
    color: "#6B7280",
    shareUrl: (data) => data.url,
  },
};

/**
 * Generate social sharing URLs for all platforms
 */
export function generateShareUrls(
  data: ProductShareData,
): Record<string, string> {
  const urls: Record<string, string> = {};

  Object.keys(SOCIAL_PLATFORMS).forEach((platform) => {
    urls[platform] = SOCIAL_PLATFORMS[platform].shareUrl(data);
  });

  return urls;
}

/**
 * Share product via specific platform
 */
export function shareProduct(platform: string, data: ProductShareData): void {
  const platformConfig = SOCIAL_PLATFORMS[platform];
  if (!platformConfig) {
    console.error(`Unknown social platform: ${platform}`);
    return;
  }

  const shareUrl = platformConfig.shareUrl(data);

  if (platform === "copy") {
    // Handle copy to clipboard
    copyToClipboard(shareUrl);
    return;
  }

  // Open share URL in new window/tab
  const width = 600;
  const height = 400;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  window.open(
    shareUrl,
    `share-${platform}`,
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
  );
}

/**
 * Copy text to clipboard with fallback
 */
export function copyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard && window.isSecureContext) {
      // Use the Clipboard API when available
      navigator.clipboard.writeText(text).then(resolve).catch(reject);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  });
}

/**
 * Check if device supports a specific social platform
 */
export function isPlatformSupported(platform: string): boolean {
  const platformConfig = SOCIAL_PLATFORMS[platform];
  if (!platformConfig) return false;

  // Check for mobile-specific platforms
  if (platform === "whatsapp" && platformConfig.isMobile) {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  return true;
}

/**
 * Get available social platforms for current device
 */
export function getAvailablePlatforms(): string[] {
  return Object.keys(SOCIAL_PLATFORMS).filter(
    (platform) => platform !== "copy" && isPlatformSupported(platform),
  );
}

/**
 * Generate Open Graph meta tags for product sharing
 */
export function generateOpenGraphTags(
  data: ProductShareData,
): Record<string, string> {
  return {
    "og:title": data.title,
    "og:description": data.description,
    "og:url": data.url,
    "og:image": data.image || "/default-product-image.jpg",
    "og:type": "product",
    "og:site_name": "E-Store",
    "product:price:amount": data.price?.toString() || "",
    "product:price:currency": data.currency || "IRR",
  };
}

/**
 * Generate Twitter Card meta tags for product sharing
 */
export function generateTwitterTags(
  data: ProductShareData,
): Record<string, string> {
  return {
    "twitter:card": "summary_large_image",
    "twitter:title": data.title,
    "twitter:description": data.description,
    "twitter:image": data.image || "/default-product-image.jpg",
    "twitter:url": data.url,
  };
}

/**
 * Create shareable product data from product object
 */
export function createProductShareData(
  product: {
    name: string;
    desc?: string;
    slug: string;
    price: number;
    discount_price?: number | null;
    product_pictures?: { picture: { url: string } }[];
  },
  baseUrl: string = typeof window !== "undefined" ? window.location.origin : "",
): ProductShareData {
  const image = product.product_pictures?.[0]?.picture?.url;
  const price =
    product.discount_price && product.discount_price < product.price
      ? product.discount_price
      : product.price;

  return {
    title: product.name,
    description: product.desc || `Check out ${product.name} in our store`,
    url: `${baseUrl}/products/${product.slug}`,
    image,
    price,
    currency: "تومان",
  };
}
