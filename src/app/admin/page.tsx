"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase, type MenuItem, type Order, type CartItem } from "@/lib/supabase";
import { format } from "date-fns";

type MenuFormData = {
  name: string;
  price: number;
  category: string;
  status: "available" | "unavailable";
};

const categories = ["อาหารไทย", "ของหวาน", "กาแฟร้อน", "กาแฟเย็น"];

export default function AdminPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    name: "",
    price: 0,
    category: "อาหารไทย",
    status: "available",
  });

  const fetchMenu = useCallback(async () => {
    const { data } = await supabase
      .from("menu")
      .select("*")
      .order("category", { ascending: true });
    if (data) setMenuItems(data);
  }, []);

  const fetchOrders = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
  }, []);

  const fetchData = useCallback(async () => {
    await Promise.all([fetchMenu(), fetchOrders()]);
    setLoading(false);
  }, [fetchMenu, fetchOrders]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();

    const menuChannel = supabase
      .channel("menu-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu" },
        () => { void fetchMenu(); }
      )
      .subscribe();

    const orderChannel = supabase
      .channel("orders-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => { void fetchOrders(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(menuChannel);
      supabase.removeChannel(orderChannel);
    };
  }, [fetchData, fetchMenu, fetchOrders]);

  async function handleSave() {
    if (editingItem) {
      await supabase
        .from("menu")
        .update(formData)
        .eq("id", editingItem.id);
    } else {
      await supabase.from("menu").insert(formData);
    }
    setShowDialog(false);
    setEditingItem(null);
    resetForm();
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this item?")) {
      await supabase.from("menu").delete().eq("id", id);
    }
  }

  function openEdit(item: MenuItem) {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      status: item.status,
    });
    setShowDialog(true);
  }

  function openAdd() {
    resetForm();
    setEditingItem(null);
    setShowDialog(true);
  }

  function resetForm() {
    setFormData({
      name: "",
      price: 0,
      category: "อาหารไทย",
      status: "available",
    });
  }

  const todayTotal = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const todayOrders = orders.length;
  const avgOrderValue = todayOrders > 0 ? todayTotal / todayOrders : 0;

  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.forEach((order) => {
    const items = order.items_json as CartItem[];
    items.forEach((item) => {
      if (!itemCounts[item.id]) {
        itemCounts[item.id] = { name: item.name, count: 0, revenue: 0 };
      }
      itemCounts[item.id].count += item.quantity;
      itemCounts[item.id].revenue += item.price * item.quantity;
    });
  });
  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 sm:h-96 gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-coral/30 border-t-coral rounded-full animate-spin" />
        <div className="text-coral font-medium text-sm sm:text-base">Loading admin data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h1 className="font-black text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-coral via-hot-pink to-sunny bg-clip-text text-transparent flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
          <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-coral" />
          Dashboard
        </h1>
        <p className="text-coral-light mt-1.5 sm:mt-2 font-medium text-sm sm:text-base md:text-lg">
          Manage menu and view daily reports
        </p>
      </div>

      {/* Stats Cards - Responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card className="border-2 border-coral/20 hover:border-coral/40 transition-all duration-300 hover:shadow-warm hover:scale-[1.02]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-coral to-coral-light rounded-lg sm:rounded-xl">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Revenue</p>
                <p className="font-black text-base sm:text-lg md:text-2xl bg-gradient-to-r from-coral to-hot-pink bg-clip-text text-transparent">
                  ฿{todayTotal.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-hot-pink/20 hover:border-hot-pink/40 transition-all duration-300 hover:shadow-warm hover:scale-[1.02]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-hot-pink to-hot-pink-light rounded-lg sm:rounded-xl">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Orders</p>
                <p className="font-black text-base sm:text-lg md:text-2xl text-hot-pink">
                  {todayOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-sunny/30 hover:border-sunny/60 transition-all duration-300 hover:shadow-warm hover:scale-[1.02]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-sunny to-sunny-light rounded-lg sm:rounded-xl">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-800" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Avg. Value</p>
                <p className="font-black text-base sm:text-lg md:text-2xl text-sunny-dark">
                  ฿{avgOrderValue.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-mint/30 hover:border-mint/60 transition-all duration-300 hover:shadow-warm hover:scale-[1.02]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-mint to-mint-light rounded-lg sm:rounded-xl">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Menu Items</p>
                <p className="font-black text-base sm:text-lg md:text-2xl text-teal-600">
                  {menuItems.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Menu Management */}
        <Card className="border-2 border-coral/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-coral to-hot-pink text-white rounded-t-xl flex flex-row items-center justify-between p-3 sm:p-4">
            <CardTitle className="font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">Menu Management</span>
            </CardTitle>
            <Button
              size="sm"
              className="bg-white text-coral hover:bg-white/90 font-semibold rounded-full text-xs sm:text-sm flex-shrink-0"
              onClick={openAdd}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto scrollbar-thin">
              {/* Mobile: Card layout */}
              <div className="sm:hidden divide-y divide-coral/10">
                {menuItems.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-coral/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                        <Badge className="mt-1 text-[10px] font-medium bg-gradient-to-r from-coral/10 to-hot-pink/10 text-coral-dark border border-coral/20">
                          {item.category}
                        </Badge>
                      </div>
                      <span className="font-bold text-coral text-sm ml-2">฿{item.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          item.status === "available"
                            ? "bg-gradient-to-r from-green-400 to-emerald-400 text-white font-medium text-[10px]"
                            : "bg-gradient-to-r from-red-400 to-pink-400 text-white font-medium text-[10px]"
                        }
                      >
                        {item.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 hover:bg-coral/10 hover:text-coral rounded-full"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-500 rounded-full"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-coral/10 bg-coral/5">
                      <th className="text-left text-xs font-semibold text-gray-700 p-3">Name</th>
                      <th className="text-left text-xs font-semibold text-gray-700 p-3">Category</th>
                      <th className="text-right text-xs font-semibold text-gray-700 p-3">Price</th>
                      <th className="text-left text-xs font-semibold text-gray-700 p-3">Status</th>
                      <th className="text-right text-xs font-semibold text-gray-700 p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map((item) => (
                      <tr key={item.id} className="border-b border-coral/10 hover:bg-coral/5 transition-colors">
                        <td className="font-semibold text-gray-800 p-3 text-sm">{item.name}</td>
                        <td className="p-3">
                          <Badge className="text-xs font-medium bg-gradient-to-r from-coral/10 to-hot-pink/10 text-coral-dark border border-coral/20">
                            {item.category}
                          </Badge>
                        </td>
                        <td className="text-right font-bold text-coral p-3 text-sm">฿{item.price}</td>
                        <td className="p-3">
                          <Badge
                            className={
                              item.status === "available"
                                ? "bg-gradient-to-r from-green-400 to-emerald-400 text-white font-medium text-xs"
                                : "bg-gradient-to-r from-red-400 to-pink-400 text-white font-medium text-xs"
                            }
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 hover:bg-coral/10 hover:text-coral rounded-full"
                              onClick={() => openEdit(item)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-500 rounded-full"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card className="border-2 border-hot-pink/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-hot-pink to-sunny text-white rounded-t-xl p-3 sm:p-4">
            <CardTitle className="font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {topItems.length === 0 ? (
              <p className="text-center text-gray-500 py-6 sm:py-8 font-medium text-sm sm:text-base">
                No sales data yet
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {topItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-coral/5 to-hot-pink/5 rounded-xl border border-coral/10 hover:border-coral/20 transition-all duration-200"
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                      index === 0 ? "bg-gradient-to-r from-sunny to-sunny-light text-gray-800" :
                      index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-300" :
                      index === 2 ? "bg-gradient-to-r from-orange-400 to-orange-300" :
                      "bg-gradient-to-r from-coral/60 to-hot-pink/60"
                    }`}>
                      <span className="text-xs sm:text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        {item.count} orders
                      </p>
                    </div>
                    <span className="font-bold text-xs sm:text-sm bg-gradient-to-r from-coral to-hot-pink bg-clip-text text-transparent flex-shrink-0">
                      ฿{item.revenue.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-2 border-sunny/20 mt-4 sm:mt-6 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-sunny to-sunny-light rounded-t-xl p-3 sm:p-4">
          <CardTitle className="font-bold text-sm sm:text-base md:text-lg flex items-center gap-2 text-gray-800">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            Recent Orders Today
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto scrollbar-thin">
            {/* Mobile: Card layout */}
            <div className="sm:hidden divide-y divide-sunny/10">
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-6 font-medium text-sm">
                  No orders today
                </p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="p-3 hover:bg-sunny/5 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800 text-sm">
                        {format(new Date(order.created_at), "HH:mm")}
                      </span>
                      <span className="font-bold text-coral text-sm">
                        ฿{order.total_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{(order.items_json as CartItem[]).length} items</span>
                      <span>Paid: ฿{order.payment_received.toFixed(2)}</span>
                      <span className="text-green-600">Change: ฿{order.change.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sunny/20 bg-sunny/5">
                    <th className="text-left text-xs font-semibold text-gray-700 p-3">Time</th>
                    <th className="text-left text-xs font-semibold text-gray-700 p-3">Items</th>
                    <th className="text-right text-xs font-semibold text-gray-700 p-3">Total</th>
                    <th className="text-right text-xs font-semibold text-gray-700 p-3">Paid</th>
                    <th className="text-right text-xs font-semibold text-gray-700 p-3">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-500 py-8 font-medium text-sm">
                        No orders today
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="border-b border-sunny/10 hover:bg-sunny/5 transition-colors">
                        <td className="font-medium text-gray-800 p-3 text-sm">
                          {format(new Date(order.created_at), "HH:mm")}
                        </td>
                        <td className="text-gray-700 p-3 text-sm">
                          {(order.items_json as CartItem[]).length} items
                        </td>
                        <td className="text-right font-bold text-coral p-3 text-sm">
                          ฿{order.total_amount.toFixed(2)}
                        </td>
                        <td className="text-right text-gray-700 p-3 text-sm">
                          ฿{order.payment_received.toFixed(2)}
                        </td>
                        <td className="text-right font-medium text-green-600 p-3 text-sm">
                          ฿{order.change.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog - Full width on mobile */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] sm:max-w-md bg-white border-2 border-coral/20 rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg sm:text-xl text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-coral to-hot-pink rounded-full flex items-center justify-center flex-shrink-0">
                {editingItem ? <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
              </div>
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-xs sm:text-sm">
              {editingItem
                ? "Update the item details below"
                : "Fill in the details for the new item"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-gray-700 font-semibold text-xs sm:text-sm">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Menu item name"
                className="border-2 border-coral/30 rounded-xl focus:border-coral focus:ring-coral/20 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-gray-700 font-semibold text-xs sm:text-sm">Price (฿)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="border-2 border-coral/30 rounded-xl focus:border-coral focus:ring-coral/20 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-gray-700 font-semibold text-xs sm:text-sm">Category</Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={formData.category === cat ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full font-semibold transition-all duration-200 text-xs sm:text-sm ${
                      formData.category === cat
                        ? "bg-gradient-to-r from-coral to-hot-pink text-white"
                        : "border-2 border-coral/30 text-coral hover:bg-coral/10"
                    }`}
                    onClick={() => setFormData({ ...formData, category: cat })}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-gray-700 font-semibold text-xs sm:text-sm">Status</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.status === "available" ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full font-semibold transition-all duration-200 text-xs sm:text-sm ${
                    formData.status === "available"
                      ? "bg-gradient-to-r from-green-400 to-emerald-400 text-white"
                      : "border-2 border-green-300 text-green-600 hover:bg-green-50"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, status: "available" })
                  }
                >
                  Available
                </Button>
                <Button
                  type="button"
                  variant={formData.status === "unavailable" ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full font-semibold transition-all duration-200 text-xs sm:text-sm ${
                    formData.status === "unavailable"
                      ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
                      : "border-2 border-red-300 text-red-600 hover:bg-red-50"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, status: "unavailable" })
                  }
                >
                  Unavailable
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full font-semibold text-xs sm:text-sm"
              onClick={() => setShowDialog(false)}
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-coral to-hot-pink text-white hover:shadow-warm font-semibold rounded-full text-xs sm:text-sm"
              onClick={handleSave}
              disabled={!formData.name}
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {editingItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
