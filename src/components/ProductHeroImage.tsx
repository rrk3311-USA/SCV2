"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Product hero image with fallback when asset 404s (e.g. before media deploy).
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

  if (error) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-8 text-slate-500">
        <span className="text-center text-sm font-medium">Product image</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={priority}
        onError={() => setError(true)}
      />
    </div>
  );
}
