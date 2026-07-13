/**
 * High-performance Product Image Gallery
 *
 * Features:
 * - Smooth CSS transform-based sliding carousel
 * - Hover zoom with magnifier lens
 * - Fullscreen lightbox with zoom controls (+/-)
 * - Touch/swipe support for mobile
 * - Keyboard navigation
 * - Lazy loading thumbnails
 * - Optimized with next/image
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PLACEHOLDER_IMAGE } from "@/lib/utils/image-utils";
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
}

interface LensPosition {
  x: number;
  y: number;
  visible: boolean;
}

export function ProductImageGallery({
  images,
  alt = "Product image",
  className = "",
}: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lensPos, setLensPos] = useState<LensPosition>({ x: 0, y: 0, visible: false });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const galleryRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const lightboxImageRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const safeImages = images && images.length > 0 ? images : [PLACEHOLDER_IMAGE];

  // Ensure currentIndex is valid when images change
  useEffect(() => {
    if (currentIndex >= safeImages.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, safeImages.length]);

  // Carousel navigation
  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  }, [safeImages.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Lightbox navigation
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setLightboxOpen(true);
  }, []);

  const nextLightboxImage = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % safeImages.length);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [safeImages.length]);

  const prevLightboxImage = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [safeImages.length]);

  // Zoom controls for lightbox
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Hover zoom lens for main image
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current || isDragging) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setLensPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      visible: true,
    });
  }, [isDragging]);

  const handleMouseLeave = useCallback(() => {
    setLensPos((prev) => ({ ...prev, visible: false }));
  }, []);

  // Touch swipe support for main carousel
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        prevImage();
      } else {
        nextImage();
      }
    }

    touchStartRef.current = null;
  }, [nextImage, prevImage]);

  // Touch swipe for lightbox
  const handleLightboxTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleLightboxTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        prevLightboxImage();
      } else {
        nextLightboxImage();
      }
    }

    touchStartRef.current = null;
  }, [nextLightboxImage, prevLightboxImage]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          prevLightboxImage();
          break;
        case "ArrowRight":
          nextLightboxImage();
          break;
        case "Escape":
          setLightboxOpen(false);
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, nextLightboxImage, prevLightboxImage, handleZoomIn, handleZoomOut]);

  // Scroll thumbnail into view when current index changes
  useEffect(() => {
    const thumbnail = thumbnailRefs.current[currentIndex];
    if (thumbnail) {
      thumbnail.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentIndex]);

  const currentImage = safeImages[currentIndex];

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Main Image with Carousel */}
      <div
        ref={galleryRef}
        className="relative group aspect-square overflow-hidden rounded-2xl bg-muted border border-border/60"
      >
        {/* Main Image */}
        <div
          ref={mainImageRef}
          className="relative w-full h-full cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => openLightbox(currentIndex)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={currentImage}
            alt={`${alt} ${currentIndex + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
            className="object-cover transition-transform duration-300"
            priority
          />

          {/* Zoom Lens */}
          {lensPos.visible && safeImages.length > 1 && (
            <div
              className="absolute w-24 h-24 border-2 border-primary rounded-full pointer-events-none transition-opacity duration-200"
              style={{
                left: `${lensPos.x}%`,
                top: `${lensPos.y}%`,
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)",
                opacity: 1,
              }}
            />
          )}
        </div>

        {/* Navigation Arrows */}
        {safeImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border-0 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border-0 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-border/60">
            {currentIndex + 1} / {safeImages.length}
          </div>
        )}

        {/* Zoom indicator */}
        <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium shadow-sm border border-border/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Click to zoom
        </div>
      </div>

      {/* Thumbnail Strip */}
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rounded-full">
          {safeImages.map((image, index) => (
            <button
              key={index}
              ref={(el) => { thumbnailRefs.current[index] = el; }}
              onClick={() => goToImage(index)}
              className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 relative ${
                currentIndex === index
                  ? "border-primary shadow-md scale-105"
                  : "border-transparent opacity-70 hover:opacity-100 hover:border-muted-foreground/40"
              }`}
            >
              <Image
                src={image}
                alt={`${alt} ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                loading={index < 3 ? "eager" : "lazy"}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 border-0 bg-black/95">
          <DialogTitle className="sr-only">Product Image Gallery</DialogTitle>
          <DialogDescription className="sr-only">
            View and navigate through product images with zoom controls
          </DialogDescription>

          <div className="relative w-full h-full flex items-center justify-center">
            {/* Lightbox Image with Zoom and Pan */}
            <div
              ref={lightboxImageRef}
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onTouchStart={handleLightboxTouchStart}
              onTouchEnd={handleLightboxTouchEnd}
            >
              <div
                className="relative transition-transform duration-200 cursor-move"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                  maxWidth: "90vw",
                  maxHeight: "85vh",
                }}
              >
                <Image
                  src={safeImages[lightboxIndex]}
                  alt={`${alt} ${lightboxIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[85vh] object-contain"
                  priority
                />
              </div>
            </div>

            {/* Lightbox Navigation */}
            {safeImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 p-0 bg-background/20 hover:bg-background/40 text-white backdrop-blur-md border-0 rounded-full"
                  onClick={prevLightboxImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 p-0 bg-background/20 hover:bg-background/40 text-white backdrop-blur-md border-0 rounded-full"
                  onClick={nextLightboxImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Close Button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 h-10 w-10 p-0 bg-background/20 hover:bg-background/40 text-white backdrop-blur-md border-0 rounded-full"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-background/20 hover:bg-background/40 backdrop-blur-md rounded-full p-1 border border-white/10">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/10 rounded-full"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-white text-sm font-medium w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/10 rounded-full"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 4}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-6 left-6 bg-background/20 hover:bg-background/40 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium border border-white/10">
              {lightboxIndex + 1} / {safeImages.length}
            </div>

            {/* Thumbnail Strip in Lightbox */}
            {safeImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw]">
                {safeImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setLightboxIndex(index);
                      setZoomLevel(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className={`shrink-0 w-14 h-14 rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                      lightboxIndex === index
                        ? "border-white shadow-lg"
                        : "border-white/30 hover:border-white/60"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${alt} ${index + 1}`}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
