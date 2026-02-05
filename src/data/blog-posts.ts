/**
 * Blog post slugs and display titles for the 11 product guides.
 * Source: success007/blog-content/*.md (English); same slugs used for ES/FR/DE when added.
 */

export const BLOG_POST_SLUGS = [
  "sclera-white-complete-guide",
  "liver-cleanse-complete-guide",
  "str82sleep-complete-guide",
  "babybean-fertility-complete-guide",
  "colon-cleanse-complete-guide",
  "hair-growth-complete-guide",
  "beauty-sleep-complete-guide",
  "irish-sea-moss-complete-guide",
  "ashwagandha-complete-guide",
  "lung-detox-complete-guide",
  "mushroom-immune-complete-guide",
] as const;

export type BlogPostSlug = (typeof BLOG_POST_SLUGS)[number];

/** Short titles for index cards (product/theme). */
export const BLOG_POST_TITLES: Record<BlogPostSlug, string> = {
  "sclera-white-complete-guide": "Sclera White – Eye Health",
  "liver-cleanse-complete-guide": "Liver Cleanse – Detox",
  "str82sleep-complete-guide": "Str82sleep – Sleep Support",
  "babybean-fertility-complete-guide": "BabyBean – Fertility Support",
  "colon-cleanse-complete-guide": "Colon Cleanse – Digestive Health",
  "hair-growth-complete-guide": "Hair Growth – Hair Health",
  "beauty-sleep-complete-guide": "Beauty Sleep – Sleep + Beauty",
  "irish-sea-moss-complete-guide": "Irish Sea Moss – Minerals + Immune",
  "ashwagandha-complete-guide": "Ashwagandha – Stress Relief",
  "lung-detox-complete-guide": "Lung Detox – Respiratory Health",
  "mushroom-immune-complete-guide": "Mushroom Immune – Immune Support",
};

export function isBlogSlug(s: string): s is BlogPostSlug {
  return (BLOG_POST_SLUGS as readonly string[]).includes(s);
}
