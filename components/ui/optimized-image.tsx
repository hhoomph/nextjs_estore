/**
 * Module for optimized-image
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import Image from "next/image";
import * as React from "react";
import { useLazyLoad } from "@/lib/lazy";
import { getOptimizedImageUrl } from "@/lib/performance";
import { cn } from "@/lib/utils";

interface OptimizedImageProps
  extends Omit<React.ComponentProps<typeof Image>, "src" | "placeholder"> {
  src: string;
  alt: string;
  priority?: boolean;
  lazy?: boolean;
  placeholder?: string; // Custom placeholder for loading state
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

export const OptimizedImage = React.forwardRef<
  HTMLImageElement,
  OptimizedImageProps
>(
  (
    {
      src,
      alt,
      priority = false,
      lazy = true,
      placeholder,
      quality = 80,
      onLoad,
      onError,
      className,
      width,
      height,
      ...props
    },
    ref,
  ) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);
    const [optimizedSrc, setOptimizedSrc] = React.useState(src);

    // Use intersection observer for lazy loading
    const { ref: lazyRef, hasIntersected } = useLazyLoad({
      threshold: 0.1,
      rootMargin: "50px",
    });

    React.useEffect(() => {
      if (hasIntersected && !isLoaded) {
        // Generate optimized image URL
        const optimized = getOptimizedImageUrl(src, {
          width: width as number,
          height: height as number,
          quality,
          format: "webp",
        });
        setOptimizedSrc(optimized);
      }
    }, [hasIntersected, src, width, height, quality, isLoaded]);

    const handleLoad = () => {
      setIsLoaded(true);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      onError?.();
    };

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLImageElement | null) => {
        if (ref) {
          if (typeof ref === "function") {
            ref(node);
          } else {
            (ref as React.MutableRefObject<HTMLImageElement | null>).current =
              node;
          }
        }
        (lazyRef as React.MutableRefObject<HTMLImageElement | null>).current =
          node;
      },
      [ref, lazyRef],
    );

    if (lazy && !hasIntersected && !priority) {
      // Show placeholder before intersection
      return (
        <div
          ref={lazyRef}
          className={cn(
            "bg-muted animate-pulse flex items-center justify-center text-muted-foreground text-sm",
            className,
          )}
          style={{ width, height }}
        >
          <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      );
    }

    if (hasError) {
      // Error state
      return (
        <div
          ref={combinedRef}
          className={cn(
            "bg-muted flex items-center justify-center text-muted-foreground",
            className,
          )}
          style={{ width, height }}
        >
          <div className="text-center">
            <div className="text-xs mb-1">Failed to load</div>
            <div className="text-xs opacity-70">Click to retry</div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative overflow-hidden">
        {/* Placeholder/blur effect */}
        {placeholder && !isLoaded && (
          <Image
            src={placeholder}
            alt=""
            fill={true}
            className="object-cover blur-sm scale-110"
            aria-hidden="true"
          />
        )}

        {/* Loading overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse z-10" />
        )}

        <Image
          {...props}
          ref={combinedRef}
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className,
          )}
        />

        {/* Retry button for error state */}
        {hasError && (
          <button
            onClick={() => {
              setHasError(false);
              setIsLoaded(false);
              // Force reload
              setOptimizedSrc(src + "?t=" + Date.now());
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm hover:bg-black/70 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  },
);

OptimizedImage.displayName = "OptimizedImage";

// Image gallery component with lazy loading
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
  itemClassName?: string;
  columns?: number;
}

export function ImageGallery({
  images,
  className,
  itemClassName,
  columns = 3,
}: ImageGalleryProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4",
        gridCols[columns as keyof typeof gridCols],
        className,
      )}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={image.src + index}
          src={image.src}
          alt={image.alt}
          width={image.width || 400}
          height={image.height || 300}
          priority={index < 3} // Prioritize first 3 images
          lazy={index >= 3} // Lazy load after first 3
          className={cn("w-full h-auto rounded-lg", itemClassName)}
        />
      ))}
    </div>
  );
}

// Progressive image loading with blur placeholder
interface ProgressiveImageProps extends OptimizedImageProps {
  blurDataURL?: string;
  placeholderSrc?: string;
}

export function ProgressiveImage({
  blurDataURL,
  placeholderSrc,
  ...props
}: ProgressiveImageProps) {
  return (
    <OptimizedImage {...props} placeholder={placeholderSrc || blurDataURL} />
  );
}

// Hero image with optimized loading
interface HeroImageProps extends OptimizedImageProps {
  overlay?: boolean;
  overlayContent?: React.ReactNode;
}

export function HeroImage({
  overlay = false,
  overlayContent,
  className,
  ...props
}: HeroImageProps) {
  return (
    <div className="relative">
      <OptimizedImage
        {...props}
        priority={true} // Hero images should be prioritized
        className={cn("w-full", className)}
      />

      {overlay && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white">{overlayContent}</div>
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;
