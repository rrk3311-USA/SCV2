/**
 * Cart utilities – same localStorage key as deploy-site for compatibility.
 * Use only in client components (localStorage).
 */

export const CART_STORAGE_KEY = "successChemistryCart";

export type CartItem = {
  sku: string;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  optionLabel?: string;
  isSubscription?: boolean;
};

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cartUpdated"));
}

/** Same option = same cart line (so 1-bottle and 3-pack are separate lines). */
function sameLine(a: CartItem, sku: string, optionLabel?: string, isSubscription?: boolean): boolean {
  if (a.sku !== sku) return false;
  const optA = a.optionLabel ?? "";
  const optB = optionLabel ?? "";
  if (optA !== optB) return false;
  const subA = a.isSubscription ?? false;
  const subB = isSubscription ?? false;
  return subA === subB;
}

export function addToCart(item: {
  sku: string;
  name: string;
  price: number;
  quantity?: number;
  image?: string;
  optionLabel?: string;
  isSubscription?: boolean;
}): CartItem[] {
  const cart = getCart();
  const existing = cart.find((c) => sameLine(c, item.sku, item.optionLabel, item.isSubscription));
  const qty = item.quantity ?? 1;

  if (existing) {
    existing.quantity += qty;
    if (item.optionLabel != null) existing.optionLabel = item.optionLabel;
    if (item.isSubscription != null) existing.isSubscription = item.isSubscription;
    existing.price = item.price.toFixed(2);
  } else {
    cart.push({
      sku: item.sku,
      name: item.name,
      price: item.price.toFixed(2),
      quantity: qty,
      image: item.image,
      optionLabel: item.optionLabel,
      isSubscription: item.isSubscription,
    });
  }

  saveCart(cart);
  return cart;
}

export function getCartSummary(): { count: number; total: number } {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + (i.quantity || 1), 0);
  const total = cart.reduce((s, i) => s + parseFloat(i.price || "0") * (i.quantity || 1), 0);
  return { count, total };
}

export function removeFromCart(
  sku: string,
  optionLabel?: string,
  isSubscription?: boolean
): CartItem[] {
  const cart = getCart().filter(
    (c) => !sameLine(c, sku, optionLabel, isSubscription)
  );
  saveCart(cart);
  return cart;
}

export function updateCartQuantity(
  sku: string,
  quantity: number,
  optionLabel?: string,
  isSubscription?: boolean
): CartItem[] {
  const cart = getCart();
  const item = cart.find((c) => sameLine(c, sku, optionLabel, isSubscription));
  if (!item) return cart;
  if (quantity < 1) return removeFromCart(sku, optionLabel, isSubscription);
  item.quantity = quantity;
  saveCart(cart);
  return cart;
}
