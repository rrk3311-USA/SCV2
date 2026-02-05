"use client";

import { useState, useMemo } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { PayPalProductButtons } from "@/components/PayPalProductButtons";
import type { Product, BundleOption } from "@/data/products";

type ProductPurchaseBlockProps = {
  product: Product;
};

/** Build options list: use bundle_options if present, else single option at base price. */
function getOptions(product: Product): Array<BundleOption & { label: string }> {
  if (product.bundle_options && product.bundle_options.length > 0) {
    return product.bundle_options.map((o) => ({ ...o, label: o.label }));
  }
  return [{ label: "1 bottle", quantity: 1, price: product.price }];
}

export function ProductPurchaseBlock({ product }: ProductPurchaseBlockProps) {
  const options = useMemo(() => getOptions(product), [product.sku, product.price, product.bundle_options]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSubscription, setIsSubscription] = useState(false);

  const subscribePercent = product.subscribe_save_percent ?? 10;
  const selected = options[selectedIndex]!;
  const basePrice = selected.price;
  const discount = isSubscription ? (basePrice * subscribePercent) / 100 : 0;
  const effectivePrice = basePrice - discount;
  const effectiveQuantity = selected.quantity;
  const optionLabel = selected.label;

  return (
    <>
      {/* Bundle / quantity options – all products */}
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-slate-700">Options</p>
        <div className="flex flex-wrap gap-2">
          {options.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                i === selectedIndex
                  ? "border-[#2854a6] bg-[#2854a6]/10 text-[#2854a6]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#2854a6] hover:bg-[#2854a6]/5"
              }`}
            >
              {opt.label}
              {opt.savePercent != null && (
                <span className="ml-1 text-green-600">Save {opt.savePercent}%</span>
              )}
              <span className="ml-1">${opt.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subscribe & Save – all products */}
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-slate-700">Delivery</p>
        <div className="flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="delivery"
              checked={!isSubscription}
              onChange={() => setIsSubscription(false)}
              className="h-4 w-4 border-slate-300 text-[#2854a6] focus:ring-[#2854a6]"
            />
            <span className="text-slate-700">One-time purchase</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="delivery"
              checked={isSubscription}
              onChange={() => setIsSubscription(true)}
              className="h-4 w-4 border-slate-300 text-[#2854a6] focus:ring-[#2854a6]"
            />
            <span className="text-slate-700">
              Subscribe & Save {subscribePercent}% off
            </span>
            <span className="text-xs text-slate-500">(delivered every 30 days)</span>
          </label>
        </div>
        {isSubscription && (
          <p className="text-sm text-green-700">
            ${effectivePrice.toFixed(2)} per order · Save ${discount.toFixed(2)}
          </p>
        )}
      </div>

      {/* Price summary */}
      <p className="mt-4 text-2xl font-bold text-[#2854a6]">
        ${effectivePrice.toFixed(2)}
        {effectiveQuantity > 1 && (
          <span className="ml-2 text-lg font-normal text-slate-600">
            ({effectiveQuantity} {effectiveQuantity === 1 ? "unit" : "units"})
          </span>
        )}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <AddToCartButton
          sku={product.sku}
          name={product.name}
          price={effectivePrice}
          image={product.image}
          quantity={effectiveQuantity}
          optionLabel={optionLabel}
          isSubscription={isSubscription}
        />
      </div>

      <PayPalProductButtons
        sku={product.sku}
        name={product.name}
        price={effectivePrice}
        quantity={effectiveQuantity}
      />
    </>
  );
}
