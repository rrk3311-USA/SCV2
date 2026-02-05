"use client";

import { useEffect } from "react";
import { reportViewItem } from "@/lib/gtag";

type Product = {
  slug: string;
  sku: string;
  name: string;
  price: number;
  category?: string;
};

/**
 * Fires view_item when product page is viewed (deepest linking).
 */
export function ViewItemTracker({ product }: { product: Product }) {
  useEffect(() => {
    reportViewItem({
      item_id: product.sku,
      item_name: product.name,
      price: product.price,
      item_category: product.category,
    });
  }, [product.sku, product.name, product.price, product.category]);

  return null;
}
