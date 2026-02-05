/**
 * Shop categories for SCV2 – half-size frosted cards. Clean data only.
 */

export type Category = {
  id: string;
  name: string;
  count: number;
  image: string;
};

export const CATEGORIES: Category[] = [
  { id: "bestsellers", name: "Best Sellers", count: 15, image: "/images/Catagory Thumbnail Images/Best sellers Catagory image.jpg" },
  { id: "mens", name: "Men's Health", count: 8, image: "/images/Catagory Thumbnail Images/mens health catagory thumb.webp" },
  { id: "womens", name: "Women's Health", count: 11, image: "/images/Catagory Thumbnail Images/womens health thumb.webp" },
  { id: "eye", name: "Eye Health", count: 3, image: "/images/Catagory Thumbnail Images/OPZ-eyeBeautiful-lashes__94531.1721847264.jpg" },
  { id: "weight", name: "Weight Loss", count: 7, image: "/images/Catagory Thumbnail Images/weight loss catagory thumb.webp" },
  { id: "bundles", name: "Bundle Deals", count: 20, image: "/images/Catagory Thumbnail Images/Bundle Deals.webp" },
];
