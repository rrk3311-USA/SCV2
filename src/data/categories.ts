/**
 * Shop categories for SCV2. Used for filter pills and mapping to product.category.
 */

export type Category = {
  id: string;
  name: string;
  count: number;
  image: string;
};

/** Map category URL param (id) to product.category values for filtering. */
export const CATEGORY_ID_TO_PRODUCT_CATEGORIES: Record<string, string[]> = {
  bestsellers: ["Best Sellers", "Best Seller"],
  mens: ["Men's Health"],
  womens: ["Women's Health"],
  eye: ["Eye Health"],
  weight: ["Weight Loss"],
  /** Bundle Deals = 2-packs, 3-packs, 5-packs, any multi-bottle product. */
  bundles: ["Bundle Deals"],
  legacy: ["Legacy"],
  unisex: ["Unisex"],
  lung: ["Lung Health"],
};

/** Category order: Bundles last. */
export const CATEGORIES: Category[] = [
  { id: "bestsellers", name: "Best Sellers", count: 15, image: "/images/Catagory Thumbnail Images/Best sellers Catagory image.jpg" },
  { id: "mens", name: "Men's Health", count: 8, image: "/images/Catagory Thumbnail Images/mens health catagory thumb.webp" },
  { id: "womens", name: "Women's Health", count: 11, image: "/images/Catagory Thumbnail Images/womens health thumb.webp" },
  { id: "eye", name: "Eye Health", count: 3, image: "/images/Catagory Thumbnail Images/OPZ-eyeBeautiful-lashes__94531.1721847264.jpg" },
  { id: "weight", name: "Weight Loss", count: 7, image: "/images/Catagory Thumbnail Images/weight loss catagory thumb.webp" },
  { id: "bundles", name: "Bundle Deals", count: 20, image: "/images/Catagory Thumbnail Images/Bundle Deals.webp" },
];
