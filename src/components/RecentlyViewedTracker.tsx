"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recentlyViewed";

type Props = {
  slug: string;
  name: string;
  image: string;
};

/**
 * Invisible: records current product as recently viewed on mount.
 */
export function RecentlyViewedTracker({ slug, name, image }: Props) {
  useEffect(() => {
    addRecentlyViewed({ slug, name, image });
  }, [slug, name, image]);
  return null;
}
