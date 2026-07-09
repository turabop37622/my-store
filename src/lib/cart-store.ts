import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  product_id: string;
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  quantity: number;
  qty2_discount_percent?: number;
  qty3_discount_percent?: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: Omit<CartItem, "quantity"> & { qty2_discount_percent?: number; qty3_discount_percent?: number }, qty?: number, openCart?: boolean) => void;
  remove: (product_id: string) => void;
  setQty: (product_id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      add: (item, qty = 1, openCart = true) =>
        set((s) => {
          const existing = s.items.find((i) => i.product_id === item.product_id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, quantity: Math.min(50, i.quantity + qty) }
                  : i,
              ),
              isOpen: openCart ? true : s.isOpen,
            };
          }
          return { items: [...s.items, { ...item, quantity: qty }], isOpen: openCart ? true : s.isOpen };
        }),
      remove: (product_id) =>
        set((s) => ({ items: s.items.filter((i) => i.product_id !== product_id) })),
      setQty: (product_id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.product_id === product_id ? { ...i, quantity: Math.max(1, Math.min(50, qty)) } : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => {
        const qty2 = i.qty2_discount_percent !== undefined ? i.qty2_discount_percent : 3;
        const qty3 = i.qty3_discount_percent !== undefined ? i.qty3_discount_percent : 5;
        let disc = 0;
        if (i.quantity === 2) disc = qty2;
        else if (i.quantity >= 3) disc = qty3;
        const finalPrice = Math.round(i.price * (1 - disc / 100));
        return s + finalPrice * i.quantity;
      }, 0),
    }),
    { name: "breezy-cart-v1" },
  ),
);
