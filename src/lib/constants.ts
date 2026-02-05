/**
 * Shared constants – one place for colors and copy.
 */

export const SC = {
  blue: "#2854a6",
  blueDark: "#1e3a8a",
  blueLight: "rgba(40, 84, 166, 0.1)",
} as const;

export const ROUTES = {
  home: "/",
  store: "/store",
  cart: "/cart",
  admin: "/admin",
  preview: "/preview",
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
  blogSample: "/blog-sample",
  blogIngredients: "/blog/ingredients-we-use",
  product: (slug: string) => `/product/${slug}`,
  termsOfService: "/terms-of-service",
  shippingReturns: "/shipping-returns",
  paymentPolicy: "/payment-policy",
  privacyPolicy: "/privacy-policy",
  contact: "/contact",
} as const;

export const CONTACT = {
  email: "info@successchemistry.com",
  phone: "(929) 642-7553",
  phoneRaw: "+19296427553",
  address: "8400 West Sunset Road",
  cityStateZip: "Las Vegas NV, 89113",
} as const;
