/**
 * Module for image-slider
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./dialog";

interface ImageSliderProps {
  images: string[];
  alt?: string;
  className?: string;
}

export function ImageSlider({
  images,
  alt = "Product image",
  className = "",
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div
        className={`aspect-square bg-muted rounded-lg flex items-center justify-center ${className}`}
      >
        <span className="text-muted-foreground">No image available</span>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        {/* Main Image */}
        <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
          <Image
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            fill={true}
            className="object-cover cursor-pointer transition-transform hover:scale-105"
            onClick={() => openLightbox(currentIndex)}
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnail Images */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  currentIndex === index
                    ? "style={{ borderColor: 'rgb(59, 130, 246)' }}"
                    : "border-muted hover:border-muted-foreground"
                }`}
              >
                <Image
                  src={image}
                  alt={`${alt} ${index + 1}`}
                  fill={true}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          <DialogTitle className="sr-only">Product Image Gallery</DialogTitle>
          <DialogDescription className="sr-only">
            View and navigate through product images in a lightbox gallery
          </DialogDescription>
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <Image
              src={images[lightboxIndex]}
              alt={`${alt} ${lightboxIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />

            {/* Lightbox Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-black/50 hover:bg-black/70 border-0"
                  onClick={prevLightboxImage}
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-black/50 hover:bg-black/70 border-0"
                  onClick={nextLightboxImage}
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </Button>
              </>
            )}

            {/* Close Button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border-0"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-4 w-4 text-white" />
            </Button>

            {/* Lightbox Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded">
              {lightboxIndex + 1} / {images.length}
            </div>

            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto max-w-full justify-center">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setLightboxIndex(index)}
                  className={`shrink-0 w-12 h-12 rounded border-2 transition-all ${
                    lightboxIndex === index
                      ? "border-white"
                      : "border-white/50 hover:border-white"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${alt} ${index + 1}`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded"
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
