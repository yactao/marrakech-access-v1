'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartExtra {
  id: string;
  name: string;
  category: string;
  price: number;
  priceUnit: string;
  quantity: number;
  date?: string;
}

export interface CartState {
  propertyId: string | null;
  propertyName: string;
  propertySlug: string;
  propertyDistrict: string;
  propertyType: string;
  pricePerNight: number;
  currency: string;
  cleaningFee: number;
  maxCapacity: number;
  minNights: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  extras: CartExtra[];
}

const emptyCart: CartState = {
  propertyId: null,
  propertyName: '',
  propertySlug: '',
  propertyDistrict: '',
  propertyType: '',
  pricePerNight: 0,
  currency: 'MAD',
  cleaningFee: 0,
  maxCapacity: 1,
  minNights: 1,
  checkIn: '',
  checkOut: '',
  guests: 1,
  extras: [],
};

interface CartContextType {
  cart: CartState;
  setProperty: (property: any) => void;
  setDates: (checkIn: string, checkOut: string) => void;
  setGuests: (guests: number) => void;
  addExtra: (extra: CartExtra) => void;
  removeExtra: (extraId: string) => void;
  updateExtraQuantity: (extraId: string, quantity: number) => void;
  clearCart: () => void;
  nights: number;
  accommodationTotal: number;
  extrasTotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(emptyCart);

  // Charger depuis sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('cart');
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Sauvegarder dans sessionStorage
  useEffect(() => {
    if (cart.propertyId) {
      sessionStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const setProperty = (property: any) => {
    setCart((prev) => ({
      ...prev,
      propertyId: property.id,
      propertyName: property.name,
      propertySlug: property.slug,
      propertyDistrict: property.district,
      propertyType: property.type,
      pricePerNight: parseFloat(property.priceLowSeason),
      currency: property.currency || 'MAD',
      cleaningFee: parseFloat(property.cleaningFee || '0'),
      maxCapacity: property.capacity,
      minNights: property.minNights || 1,
    }));
  };

  const setDates = (checkIn: string, checkOut: string) => {
    setCart((prev) => ({ ...prev, checkIn, checkOut }));
  };

  const setGuests = (guests: number) => {
    setCart((prev) => ({ ...prev, guests }));
  };

  const addExtra = (extra: CartExtra) => {
    setCart((prev) => {
      const existing = prev.extras.find((e) => e.id === extra.id);
      if (existing) {
        return {
          ...prev,
          extras: prev.extras.map((e) =>
            e.id === extra.id ? { ...e, quantity: e.quantity + 1 } : e
          ),
        };
      }
      return { ...prev, extras: [...prev.extras, extra] };
    });
  };

  const removeExtra = (extraId: string) => {
    setCart((prev) => ({
      ...prev,
      extras: prev.extras.filter((e) => e.id !== extraId),
    }));
  };

  const updateExtraQuantity = (extraId: string, quantity: number) => {
    if (quantity <= 0) {
      removeExtra(extraId);
      return;
    }
    setCart((prev) => ({
      ...prev,
      extras: prev.extras.map((e) =>
        e.id === extraId ? { ...e, quantity } : e
      ),
    }));
  };

  const clearCart = () => {
    setCart(emptyCart);
    sessionStorage.removeItem('cart');
  };

  // Calculs
  const nights = cart.checkIn && cart.checkOut
    ? Math.ceil((new Date(cart.checkOut).getTime() - new Date(cart.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const accommodationTotal = cart.pricePerNight * nights;
  const extrasTotal = cart.extras.reduce((sum, e) => sum + e.price * e.quantity, 0);
  const total = accommodationTotal + cart.cleaningFee + extrasTotal;

  return (
    <CartContext.Provider value={{
      cart, setProperty, setDates, setGuests,
      addExtra, removeExtra, updateExtraQuantity, clearCart,
      nights, accommodationTotal, extrasTotal, total,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}