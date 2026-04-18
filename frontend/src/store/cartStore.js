/**
 * Cart Store (Zustand)
 * Manages shopping cart state with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  // 'persist' middleware saves cart to localStorage automatically
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      items: [], // Array of { product, quantity }

      // ── Computed ─────────────────────────────────────────────
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, item) => {
          const price = item.product.discountedPrice || item.product.price;
          return sum + price * item.quantity;
        }, 0),

      // ── Actions ───────────────────────────────────────────────
      addToCart: (product, quantity = null) => {
        const qty = quantity || product.moq; // Default to MOQ
        const items = get().items;
        const existingIndex = items.findIndex(
          (item) => item.product._id === product._id
        );

        if (existingIndex >= 0) {
          // Item already in cart → update quantity
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += qty;
          set({ items: updatedItems });
        } else {
          // New item → add to cart
          set({ items: [...items, { product, quantity: qty }] });
        }
      },

      updateQuantity: (productId, quantity) => {
        set({
          items: get().items.map((item) =>
            item.product._id === productId ? { ...item, quantity } : item
          ),
        });
      },

      removeFromCart: (productId) => {
        set({ items: get().items.filter((item) => item.product._id !== productId) });
      },

      clearCart: () => set({ items: [] }),

      isInCart: (productId) =>
        get().items.some((item) => item.product._id === productId),
    }),
    {
      name: 'akshraa_cart', // localStorage key
    }
  )
);

export default useCartStore;
