/**
 * Google Ads / GA4 gtag helpers. Safe to call when gtag is not loaded.
 * Enhanced conversions: set user_data (hashed or plain) before conversion events.
 * Deep tracking: view_item, view_item_list, begin_checkout, page_view, outbound.
 */

const ADS_ID = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_ADS_ID : undefined;
const CONVERSION_LABEL =
  typeof window !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL : undefined;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function gtagSafe(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

/** Normalize string for hashing: trim, lowercase. For email: Gmail/Googlemail remove . and +suffix. */
function normalizeEmail(email: string): string {
  let s = email.trim().toLowerCase();
  const at = s.indexOf("@");
  if (at > 0) {
    const domain = s.slice(at + 1);
    if (domain === "gmail.com" || domain === "googlemail.com") {
      const local = s.slice(0, at).replace(/\./g, "").replace(/\+.*$/, "");
      s = local + "@" + domain;
    }
  }
  return s;
}

/** SHA-256 hash then lowercase hex (Google enhanced conversion format). */
async function sha256Hex(value: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return "";
  const encoded = new TextEncoder().encode(value);
  const buf = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Build hashed user_data for enhanced conversions (email, optional name). */
export async function hashUserDataForEnhancedConversion(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  if (data.email) {
    const normalized = normalizeEmail(data.email);
    out.sha256_email_address = await sha256Hex(normalized);
  }
  if (data.firstName) {
    out.sha256_first_name = await sha256Hex(data.firstName.trim().toLowerCase());
  }
  if (data.lastName) {
    out.sha256_last_name = await sha256Hex(data.lastName.trim().toLowerCase());
  }
  if (data.phone) {
    const normalized = data.phone.replace(/\D/g, "");
    const withPlus = normalized.startsWith("1") && normalized.length === 11 ? "+1" + normalized : "+" + normalized;
    out.sha256_phone_number = await sha256Hex(withPlus);
  }
  return out;
}

/** Set user_data for enhanced conversions (call before conversion event). Google can accept plain or hashed. */
export function setEnhancedConversionUserData(userData: Record<string, unknown>) {
  gtagSafe("set", "user_data", userData);
}

/** Fire Google Ads conversion with optional value. */
export function reportGoogleAdsConversion(value?: number, currency = "USD") {
  if (!ADS_ID) return;
  const sendTo = CONVERSION_LABEL ? `${ADS_ID}/${CONVERSION_LABEL}` : ADS_ID;
  gtagSafe("event", "conversion", {
    send_to: sendTo,
    value,
    currency,
  });
}

/** Fire add_to_cart (GA4 + remarketing). */
export function reportAddToCart(item: {
  id?: string;
  name: string;
  price: number;
  quantity?: number;
}) {
  gtagSafe("event", "add_to_cart", {
    currency: "USD",
    value: item.price * (item.quantity ?? 1),
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity ?? 1,
      },
    ],
  });
}

/** Fire purchase (GA4 + Google Ads conversion). Optionally set user_data before calling for enhanced conversion. */
export function reportPurchase(orderId: string, value: number, currency = "USD") {
  gtagSafe("event", "purchase", {
    transaction_id: orderId,
    value,
    currency,
  });
  reportGoogleAdsConversion(value, currency);
}

/** Fire page_view (for client-side route changes; GA4 config sends initial page_view). */
export function setPageView(path: string, title?: string) {
  gtagSafe("event", "page_view", {
    page_path: path,
    page_title: title ?? (typeof document !== "undefined" ? document.title : ""),
  });
}

/** Fire view_item (product detail). */
export function reportViewItem(product: {
  item_id: string;
  item_name: string;
  price: number;
  item_category?: string;
  item_brand?: string;
}) {
  gtagSafe("event", "view_item", {
    currency: "USD",
    value: product.price,
    items: [
      {
        item_id: product.item_id,
        item_name: product.item_name,
        price: product.price,
        item_category: product.item_category,
        item_brand: product.item_brand ?? "Success Chemistry",
      },
    ],
  });
}

/** Fire view_item_list (category/store/home list). */
export function reportViewItemList(
  items: Array<{ item_id: string; item_name: string; price: number; item_category?: string }>,
  listId: string,
  listName?: string
) {
  if (items.length === 0) return;
  gtagSafe("event", "view_item_list", {
    item_list_id: listId,
    item_list_name: listName ?? listId,
    items: items.slice(0, 20).map((p) => ({
      item_id: p.item_id,
      item_name: p.item_name,
      price: p.price,
      item_category: p.item_category,
    })),
  });
}

/** Fire begin_checkout (cart page with items). */
export function reportBeginCheckout(
  items: Array<{ item_id: string; item_name: string; price: number; quantity: number }>,
  value: number
) {
  gtagSafe("event", "begin_checkout", {
    currency: "USD",
    value,
    items: items.map((p) => ({
      item_id: p.item_id,
      item_name: p.item_name,
      price: p.price,
      quantity: p.quantity,
    })),
  });
}

/** Fire generate_lead (contact form, etc.). Call setEnhancedConversionUserData with hashed data before this for enhanced conversion. */
export function reportGenerateLead(value?: number) {
  gtagSafe("event", "generate_lead", { currency: "USD", value: value ?? 0 });
}

/** Fire lead conversion with enhanced conversion (hashed email/name). */
export async function reportLeadWithEnhancedConversion(email: string, fullName?: string) {
  const parts = (fullName ?? "").trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") ?? "";
  const userData = await hashUserDataForEnhancedConversion({ email, firstName, lastName });
  if (Object.keys(userData).length > 0) {
    setEnhancedConversionUserData(userData);
  }
  reportGenerateLead();
}

/** Track outbound link / mailto / tel click. */
export function reportOutboundLink(url: string, linkText?: string) {
  gtagSafe("event", "click", {
    event_category: "outbound",
    event_label: url,
    transport_type: "beacon",
    link_url: url,
    link_text: linkText,
  });
}
