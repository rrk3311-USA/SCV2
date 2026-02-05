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

export function addToCart(item: {
  sku: string;
  name: string;
  price: number;
  quantity?: number;
  image?: string;
}): CartItem[] {
  const cart = getCart();
  const existing = cart.find((c) => c.sku === item.sku);
  const qty = item.quantity ?? 1;

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      sku: item.sku,
      name: item.name,
      price: item.price.toFixed(2),
      quantity: qty,
      image: item.image,
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
