/**
 * Commerce hooks for SCV2
 * Client-side React hooks for cart and checkout functionality
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCart, saveCart, addToCart as addToCartUtil, getCartSummary } from '../cart';
import type { CartItem } from '../cart';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncCart = () => setCart(getCart());
    syncCart();
    
    window.addEventListener('cartUpdated', syncCart);
    return () => window.removeEventListener('cartUpdated', syncCart);
  }, []);

  const addToCart = useCallback((item: {
    sku: string;
    name: string;
    price: number;
    quantity?: number;
    image?: string;
    optionLabel?: string;
    isSubscription?: boolean;
  }) => {
    const updatedCart = addToCartUtil(item);
    setCart(updatedCart);
    return updatedCart;
  }, []);

  const removeFromCart = useCallback((sku: string, optionLabel?: string, isSubscription?: boolean) => {
    const updatedCart = getCart().filter(
      (item) => !(item.sku === sku && 
                 (item.optionLabel ?? '') === (optionLabel ?? '') &&
                 (item.isSubscription ?? false) === (isSubscription ?? false))
    );
    saveCart(updatedCart);
    setCart(updatedCart);
    return updatedCart;
  }, []);

  const updateQuantity = useCallback((sku: string, quantity: number, optionLabel?: string, isSubscription?: boolean) => {
    if (quantity < 1) {
      return removeFromCart(sku, optionLabel, isSubscription);
    }
    
    const updatedCart = getCart().map((item) => {
      if (item.sku === sku && 
          (item.optionLabel ?? '') === (optionLabel ?? '') &&
          (item.isSubscription ?? false) === (isSubscription ?? false)) {
        return { ...item, quantity };
      }
      return item;
    });
    
    saveCart(updatedCart);
    setCart(updatedCart);
    return updatedCart;
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    saveCart([]);
    setCart([]);
  }, []);

  const summary = getCartSummary();

  return {
    cart,
    mounted,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount: summary.count,
    total: summary.total,
  };
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCallback(async (items: CartItem[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkout,
    loading,
    error,
  };
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [mounted ? storedValue : initialValue, setValue] as const;
}
