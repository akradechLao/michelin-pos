"use client";

import { CartProvider } from "@/lib/cart-context";
import { MenuGrid } from "@/components/menu-grid";
import { Cart } from "@/components/cart";

export default function POSPage() {
  return (
    <CartProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-coffee">
            Menu
          </h1>
          <p className="text-coffee-light mt-1">
            Select items to add to order
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MenuGrid />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Cart />
            </div>
          </div>
        </div>
      </div>
    </CartProvider>
  );
}
