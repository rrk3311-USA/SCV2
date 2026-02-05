"use client";

import { useState } from "react";
import { ShoppingCart } from "@phosphor-icons/react";
import { addToCart } from "@/lib/cart";
import { reportAddToCart } from "@/lib/gtag";

type AddToCartButtonProps = {
  sku: string;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
  optionLabel?: string;
  isSubscription?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Client button that adds product to cart (localStorage) and triggers StickyCartBanner.
 */
export function AddToCartButton({
  sku,
  name,
  price,
  image,
  quantity = 1,
  optionLabel,
  isSubscription,
  className = "",
  children,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addToCart({ sku, name, price, quantity, image, optionLabel, isSubscription });
    reportAddToCart({ id: sku, name, price, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 ${
        className ||
        "rounded-full bg-[#2854a6] px-8 py-3 font-semibold text-white shadow-md transition hover:bg-[#1e3a8a]"
      }`}
    >
      <ShoppingCart size={22} weight="regular" />
      {added ? "Added!" : children ?? "Add to Cart"}
    </button>
  );
}
