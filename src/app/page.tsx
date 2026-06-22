"use client";

import { CartProvider } from "@/lib/cart-context";
import { MenuGrid } from "@/components/menu-grid";
import { Cart } from "@/components/cart";
import { Sparkles } from "lucide-react";

export default function POSPage() {
  return (
    <CartProvider>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="font-black text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-coral via-hot-pink to-sunny bg-clip-text text-transparent flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-sunny" />
            Menu
          </h1>
          <p className="text-coral-light mt-1.5 sm:mt-2 font-medium text-base sm:text-lg">
            Select items to add to order
          </p>
        </div>

        {/* Main Content - Mobile: stacked, Desktop: side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <MenuGrid />
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-20">
              <Cart />
            </div>
          </div>
        </div>
      </div>
    </CartProvider>
  );
}
