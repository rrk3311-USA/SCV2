"use client";

import { useState, useMemo } from "react";
import {
  BatteryVerticalEmpty,
  BatteryVerticalLow,
  BatteryVerticalMedium,
  BatteryVerticalHigh,
  BatteryVerticalFull,
} from "@phosphor-icons/react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { PayPalProductButtons } from "@/components/PayPalProductButtons";
import { GooglePayButton } from "@/components/GooglePayButton";
import type { Product, BundleOption } from "@/data/products";

/** Narrative compliments (Halbert-style) that tell the reader to select this option – each option a different story. */
function getOptionComment(option: BundleOption & { label: string }): string {
  if (option.quantity === 1) {
    return "You're the smart one who tries before committing. Pick this—see how you feel. Then come back for more.";
  }
  if (option.quantity === 2) {
    return "Two bottles—you're thinking ahead. Save 10% and you're set. Good call. Select this.";
  }
  if (option.quantity === 3) {
    return "Our regulars pick this. Best value, 15% off—you're in good company. Wise choice.";
  }
  if (option.quantity >= 5) {
    return "You're the type who plans ahead. Maximum savings, 20% off—select this and you're set. We like you.";
  }
  return "Smart pick. Select this one.";
}

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
        {/* Single battery icon (same place, changes with selection: more = fuller) + narrative bubble */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 shadow-sm">
          <div className="flex shrink-0 items-center transition-all duration-300 ease-out" aria-hidden>
            {effectiveQuantity >= 5 && <BatteryVerticalFull size={36} weight="fill" className="text-[#2854a6]" />}
            {effectiveQuantity === 4 && <BatteryVerticalHigh size={36} weight="fill" className="text-[#2854a6]" />}
            {effectiveQuantity === 3 && <BatteryVerticalMedium size={36} weight="fill" className="text-[#2854a6]" />}
            {effectiveQuantity === 2 && <BatteryVerticalLow size={36} weight="fill" className="text-[#2854a6]" />}
            {effectiveQuantity === 1 && <BatteryVerticalEmpty size={36} weight="fill" className="text-[#2854a6]" />}
          </div>
          <div className="relative min-h-[2.5rem] flex-1 rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-amber-200/60">
            <span className="absolute -left-1.5 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-r-[6px] border-transparent border-r-white" aria-hidden />
            <div className="flex items-center gap-2">
              <i className="ph ph-test-tube shrink-0 text-[18px] text-amber-600" aria-hidden />
              <p className="text-sm font-medium text-slate-800">
                {getOptionComment(selected)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                i === selectedIndex
                  ? "border-[#2854a6] bg-[#2854a6] text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:border-[#2854a6] hover:bg-[#2854a6]/5 hover:text-slate-900"
              }`}
            >
              <span
                className={`inline-block ${i === selectedIndex ? "option-selected-cinematic" : ""}`}
              >
                {opt.label}
                {opt.savePercent != null && (
                  <span className={`ml-1 ${i === selectedIndex ? "text-inherit opacity-90" : "text-green-600"}`}>
                    Save {opt.savePercent}%
                  </span>
                )}
                <span className="ml-1">${opt.price.toFixed(2)}</span>
              </span>
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
      <GooglePayButton
        total={effectivePrice * effectiveQuantity}
        items={[
          {
            sku: product.sku,
            name: product.name,
            price: effectivePrice,
            quantity: effectiveQuantity,
          },
        ]}
        compact
      />
    </>
  );
}
