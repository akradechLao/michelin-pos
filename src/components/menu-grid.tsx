"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Minus, UtensilsCrossed, Flame, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, type MenuItem } from "@/lib/supabase";
import { useCart } from "@/lib/cart-context";

const categories = [
  { name: "All", emoji: "🔥", color: "from-coral to-hot-pink" },
  { name: "อาหารไทย", emoji: "🍜", color: "from-coral to-coral-light" },
  { name: "ของหวาน", emoji: "🍰", color: "from-hot-pink to-hot-pink-light" },
  { name: "กาแฟร้อน", emoji: "☕", color: "from-sunny-dark to-sunny" },
  { name: "กาแฟเย็น", emoji: "🧊", color: "from-mint to-mint-light" },
];

const categoryColors: Record<string, string> = {
  "อาหารไทย": "bg-gradient-to-r from-coral/20 to-coral-light/20 text-coral-dark border-coral/30",
  "ของหวาน": "bg-gradient-to-r from-hot-pink/20 to-hot-pink-light/20 text-hot-pink-dark border-hot-pink/30",
  "กาแฟร้อน": "bg-gradient-to-r from-sunny/20 to-sunny-light/20 text-sunny-dark border-sunny/30",
  "กาแฟเย็น": "bg-gradient-to-r from-mint/20 to-mint-light/20 text-teal-700 border-mint/30",
};

export function MenuGrid() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const { items: cartItems, addItem, updateQuantity } = useCart();

  const fetchMenuItems = useCallback(async () => {
    const { data } = await supabase
      .from("menu")
      .select("*")
      .eq("status", "available")
      .order("category");

    if (data) setMenuItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMenuItems();

    const channel = supabase
      .channel("menu-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu" },
        () => { void fetchMenuItems(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMenuItems]);

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const getCartQuantity = (id: string) => {
    const cartItem = cartItems.find((i) => i.id === id);
    return cartItem?.quantity || 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 sm:h-64 gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-coral/30 border-t-coral rounded-full animate-spin" />
        <div className="text-coral font-medium text-sm sm:text-base">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Category Tabs - Horizontal scroll on mobile */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
        {categories.map((cat) => (
          <Button
            key={cat.name}
            variant={selectedCategory === cat.name ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.name)}
            className={`whitespace-nowrap gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-full font-semibold transition-all duration-300 text-xs sm:text-sm ${
              selectedCategory === cat.name
                ? `bg-gradient-to-r ${cat.color} text-white shadow-warm hover:shadow-warm-lg hover:scale-105`
                : "border-2 border-coral/20 text-coral-dark hover:bg-coral/10 hover:border-coral/40 hover:scale-105"
            }`}
          >
            <span className="text-sm sm:text-lg">{cat.emoji}</span>
            <span className="hidden sm:inline">{cat.name}</span>
            <span className="sm:hidden">{cat.name.length > 6 ? cat.name.substring(0, 6) + "..." : cat.name}</span>
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-muted-foreground">
          <UtensilsCrossed className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 text-coral/40" />
          <p className="text-base sm:text-lg font-medium">No items available</p>
          <p className="text-xs sm:text-sm mt-1">Try selecting a different category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredItems.map((item) => {
            const qty = getCartQuantity(item.id);
            return (
              <Card
                key={item.id}
                className="relative overflow-hidden border-2 border-coral/10 hover:border-coral/40 transition-all duration-300 hover:shadow-warm-lg cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => addItem(item)}
              >
                {/* Gradient top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral via-hot-pink to-sunny opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-0">
                  {/* Food Image */}
                  {item.image_url ? (
                    <div className="relative w-full aspect-square overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <h3 className="font-bold text-sm sm:text-base md:text-lg text-white truncate drop-shadow-lg">
                          {item.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <Badge
                            className={`text-[10px] sm:text-xs font-semibold border ${categoryColors[item.category] || "bg-gray-100 text-gray-600"}`}
                          >
                            {item.category}
                          </Badge>
                          <span className="font-black text-base sm:text-lg md:text-xl text-white drop-shadow-lg">
                            ฿{item.price.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-800 truncate group-hover:text-coral transition-colors">
                            {item.name}
                          </h3>
                          <Badge
                            className={`mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-semibold border ${categoryColors[item.category] || "bg-gray-100 text-gray-600"}`}
                          >
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex flex-col items-end ml-2">
                          <span className="font-black text-base sm:text-lg md:text-xl bg-gradient-to-r from-coral to-hot-pink bg-clip-text text-transparent">
                            ฿{item.price.toFixed(0)}
                          </span>
                          {qty === 0 && (
                            <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-sunny mt-0.5 sm:mt-1 animate-bounce" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick add button when not in cart */}
                  {qty === 0 && (
                    <div className={item.image_url ? "p-3 sm:p-4 pt-0" : "px-3 sm:px-4 pb-3 sm:pb-4"}>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-coral to-hot-pink text-white font-semibold rounded-full hover:shadow-warm transition-all duration-300 text-xs sm:text-sm py-1.5 sm:py-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(item);
                        }}
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Add to Order
                      </Button>
                    </div>
                  )}

                  {/* Quantity controls when in cart */}
                  {qty > 0 && (
                    <div
                      className={`flex items-center justify-between ${item.image_url ? "px-3 sm:px-4 pb-3 sm:pb-4" : "px-3 sm:px-4 pb-3 sm:pb-4 pt-0"}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 border-2 border-coral/30 hover:bg-coral hover:text-white hover:border-coral rounded-full transition-all duration-200"
                          onClick={() => updateQuantity(item.id, qty - 1)}
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <span className="font-black text-sm sm:text-base md:text-lg w-6 sm:w-7 md:w-8 text-center text-coral">
                          {qty}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 border-2 border-coral/30 hover:bg-coral hover:text-white hover:border-coral rounded-full transition-all duration-200"
                          onClick={() => updateQuantity(item.id, qty + 1)}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-sunny fill-sunny" />
                        <span className="font-bold text-xs sm:text-sm text-coral">
                          ฿{(item.price * qty).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
