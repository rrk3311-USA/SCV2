/**
 * Commerce types for SCV2
 */

export type Money = {
  amount: number;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: Money;
  compareAtPrice?: Money;
  images: Image[];
  category?: string;
  tags?: string[];
  variants?: ProductVariant[];
  options?: ProductOption[];
  availableForSale: boolean;
  metadata?: Record<string, string>;
};

export type ProductVariant = {
  id: string;
  sku: string;
  name: string;
  price: Money;
  compareAtPrice?: Money;
  availableForSale: boolean;
  selectedOptions?: { name: string; value: string }[];
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type Cart = {
  id: string;
  checkoutUrl?: string;
  lines: CartLine[];
  cost: {
    subtotal: Money;
    tax?: Money;
    shipping?: Money;
    total: Money;
  };
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    product: Product;
    variant?: ProductVariant;
  };
  cost: {
    total: Money;
  };
};

export type Customer = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type Address = {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  provinceCode?: string;
  country?: string;
  countryCode?: string;
  zip?: string;
  phone?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  email?: string;
  financialStatus: 'pending' | 'paid' | 'refunded' | 'partially_refunded';
  fulfillmentStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  lines: OrderLine[];
  shippingAddress?: Address;
  billingAddress?: Address;
  cost: {
    subtotal: Money;
    tax: Money;
    shipping: Money;
    total: Money;
  };
  createdAt: string;
  updatedAt: string;
};

export type OrderLine = {
  id: string;
  title: string;
  quantity: number;
  price: Money;
  variant?: ProductVariant;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: Image;
  products?: Product[];
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  body: string;
  bodySummary?: string;
  seo?: {
    title?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type Menu = {
  id: string;
  title: string;
  items: MenuItem[];
};

export type MenuItem = {
  title: string;
  path: string;
  items?: MenuItem[];
};
