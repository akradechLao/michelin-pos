"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Minus, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, type MenuItem } from "@/lib/supabase";
import { useCart } from "@/lib/cart-context";

const categories = ["All", "อาหารไทย", "ของหวาน", "กาแฟร้อน", "กาแฟเย็น"];

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
      <div className="flex items-center justify-center h-64">
        <div className="text-coffee-light">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-coffee text-cream hover:bg-coffee-light"
                : "border-gold/40 text-coffee hover:bg-coffee/5"
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-coffee-light">
          <UtensilsCrossed className="w-12 h-12 mb-4 opacity-50" />
          <p>No items available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const qty = getCartQuantity(item.id);
            return (
              <Card
                key={item.id}
                className="border-gold/20 hover:border-gold/40 transition-all duration-200 hover:shadow-luxury cursor-pointer group"
                onClick={() => addItem(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-coffee truncate">
                        {item.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="mt-1 bg-cream-dark text-coffee-light text-xs"
                      >
                        {item.category}
                      </Badge>
                    </div>
                    <span className="font-display text-lg font-bold text-gold ml-2">
                      ฿{item.price.toFixed(0)}
                    </span>
                  </div>

                  {qty > 0 && (
                    <div
                      className="flex items-center justify-between mt-3 pt-3 border-t border-gold/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-gold/40"
                        onClick={() => updateQuantity(item.id, qty - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-display font-semibold text-coffee">
                        {qty}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-gold/40"
                        onClick={() => updateQuantity(item.id, qty + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
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
