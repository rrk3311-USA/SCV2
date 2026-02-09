/**
 * Commerce utility functions
 */

import type { Money } from './types';

export function formatPrice(money: Money): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(money.amount);
}

export function createMoney(amount: number, currencyCode: string = 'USD'): Money {
  return {
    amount,
    currencyCode,
  };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currencyCode !== b.currencyCode) {
    throw new Error('Cannot add money with different currency codes');
  }
  
  return {
    amount: a.amount + b.amount,
    currencyCode: a.currencyCode,
  };
}

export function multiplyMoney(money: Money, multiplier: number): Money {
  return {
    amount: money.amount * multiplier,
    currencyCode: money.currencyCode,
  };
}

export function compareMoney(a: Money, b: Money): number {
  if (a.currencyCode !== b.currencyCode) {
    throw new Error('Cannot compare money with different currency codes');
  }
  
  return a.amount - b.amount;
}

export function isDiscounted(price: Money, compareAtPrice?: Money): boolean {
  if (!compareAtPrice) return false;
  return compareMoney(price, compareAtPrice) < 0;
}

export function getDiscountPercentage(price: Money, compareAtPrice: Money): number {
  if (compareAtPrice.amount === 0) return 0;
  return Math.round(((compareAtPrice.amount - price.amount) / compareAtPrice.amount) * 100);
}

export function ensureStartsWith(stringToCheck: string, startsWith: string): string {
  return stringToCheck.startsWith(startsWith)
    ? stringToCheck
    : `${startsWith}${stringToCheck}`;
}

export function validateEnvironmentVariables() {
  const requiredEnvVars = ['NEXT_PUBLIC_SITE_URL'];
  
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn(
      `The following environment variables are missing: ${missingEnvVars.join(', ')}`
    );
  }
}

export function removeEdgesAndNodes<T>(array: { edges: Array<{ node: T }> }): T[] {
  return array.edges.map((edge) => edge.node);
}

export function reshapeCart(cart: any): any {
  // Transform cart data from any backend format to our standard format
  return cart;
}

export function reshapeCollection(collection: any): any {
  // Transform collection data from any backend format to our standard format
  return collection;
}

export function reshapeCollections(collections: any[]): any[] {
  return collections.map(reshapeCollection);
}

export function reshapeProduct(product: any, filterHiddenProducts: boolean = true): any {
  // Transform product data from any backend format to our standard format
  if (filterHiddenProducts && product.status !== 'published') {
    return null;
  }
  
  return product;
}

export function reshapeProducts(products: any[]): any[] {
  return products.map((product) => reshapeProduct(product)).filter(Boolean);
}
