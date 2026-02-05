"use client";

import { useState } from "react";
import Image from "next/image";

const HERO_IMAGE_PRIMARY = "/images/BlendedHomeheader.png";

/**
 * Hero banner image (hands / blended home header). On 404 hides so the hero text (FROM EARTH TO FORMULA) still shows.
 */
export function HeroBannerImage() {
  const [error, setError] = useState(false);

  if (error) return null;
  return (
    <Image
      src={HERO_IMAGE_PRIMARY}
      alt="Success Chemistry – From Earth to Formula"
      width={1200}
      height={709}
      className="hero-banner-float hero-banner-fade h-auto w-full max-w-[1050px] object-contain opacity-90"
      style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))" }}
      sizes="(max-width: 1050px) 100vw, 1050px"
      onError={() => setError(true)}
    />
  );
}
