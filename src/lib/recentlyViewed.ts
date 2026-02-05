/**
 * Recently viewed products – localStorage, client-only.
 * Store slug + name + image so we can render without server lookup.
 */

const STORAGE_KEY = "successChemistryRecentlyViewed";
const MAX_ITEMS = 12;

export type RecentlyViewedItem = {
  slug: string;
  name: string;
  image: string;
};

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
    return Array.isArray(list) ? list.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: RecentlyViewedItem): void {
  if (typeof window === "undefined") return;
  const list = getRecentlyViewed();
  const rest = list.filter((i) => i.slug !== item.slug);
  const next = [item, ...rest].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("recentlyViewedUpdated"));
}
