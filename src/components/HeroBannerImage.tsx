"use client";

import { useState } from "react";
import Image from "next/image";

const HERO_IMAGE_PRIMARY = "/images/home/HariLafluerHero.png";
const HERO_IMAGE_FALLBACK = "/images/BlendedHomeheader.png";

/**
 * Hero banner image (Hari Lafluer hero when available, else BlendedHomeheader).
 * On 404 hides so the hero text (FROM EARTH TO FORMULA) still shows.
 */
export function HeroBannerImage() {
  const [src, setSrc] = useState(HERO_IMAGE_PRIMARY);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (src === HERO_IMAGE_PRIMARY) {
      setSrc(HERO_IMAGE_FALLBACK);
    } else {
      setError(true);
    }
  };

  if (error) return null;
  return (
    <Image
      src={src}
      alt="Success Chemistry Banner"
      width={1200}
      height={709}
      className="hero-banner-float hero-banner-fade h-auto w-full max-w-[1050px] object-contain opacity-90"
      style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))" }}
      sizes="(max-width: 1050px) 100vw, 1050px"
      onError={handleError}
    />
  );
}
