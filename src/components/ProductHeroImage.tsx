"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Product hero image – transparent style so PNG product shots show through.
 * Tries .png first; if it 404s, falls back to .jpg so products without a
 * transparent hero still show an image.
 */
type Props = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function ProductHeroImage({
  src,
  alt,
  fill = true,
  className = "",
  sizes,
  priority,
}: Props) {
  const [error, setError] = useState(false);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);
  const displaySrc = fallbackSrc ?? src;

  const handleError = () => {
    if (!fallbackSrc && src.endsWith(".png")) {
      setFallbackSrc(src.replace(/\.png$/, ".jpg"));
      return;
    }
    setError(true);
  };

  if (error) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-8 text-slate-500">
        <span className="text-center text-sm font-medium">Product image</span>
      </div>
    );
  }

  return (
    <div className="hero-banner-float relative aspect-square w-full bg-transparent">
      <Image
        src={displaySrc}
        alt={alt}
        fill={fill}
        className={className || "object-contain p-4"}
        sizes={sizes}
        priority={priority}
        onError={handleError}
      />
    </div>
  );
}
