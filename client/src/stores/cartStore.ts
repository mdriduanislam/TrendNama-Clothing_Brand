import { CartStoreActionsType, CartStoreStateType } from "@/types";
import { create } from "zustand";

const useCartStore = create<CartStoreStateType & CartStoreActionsType>((set) => ({
  cart: [],
  isLoading: true,
  bootstrap: async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        set({ cart: [], isLoading: false });
        return;
      }

      const result = await response.json();
      set({ cart: result.cart || [], isLoading: false });
    } catch {
      set({ cart: [], isLoading: false });
    }
  },
  addToCart: async (product) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          item: {
            productId: product.id,
            selectedSize: product.selectedSize,
            selectedColor: product.selectedColor,
            quantity: product.quantity || 1,
          },
        }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      set({ cart: result.cart || [] });
      return true;
    } catch {
      return false;
    }
  },
  removeFromCart: async (product) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "remove",
          item: {
            productId: product.id,
            selectedSize: product.selectedSize,
            selectedColor: product.selectedColor,
          },
        }),
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();
      set({ cart: result.cart || [] });
    } catch {
      // No-op: keep current cart UI state if request fails.
    }
  },
  clearCart: async () => {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "clear" }),
      });
      set({ cart: [] });
    } catch {
      // No-op: keep current cart UI state if request fails.
    }
  },
}));

export default useCartStore;
