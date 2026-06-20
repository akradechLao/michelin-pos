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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <div className="flex items-center justify-center h-96">
        <div className="text-coffee-light">Loading admin data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-coffee">
          Dashboard
        </h1>
        <p className="text-coffee-light mt-1">
          Manage menu and view daily reports
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-coffee/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-coffee" />
              </div>
              <div>
                <p className="text-xs text-coffee-light">Today&apos;s Revenue</p>
                <p className="font-display text-xl font-bold text-coffee">
                  ฿{todayTotal.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-coffee/10 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-coffee" />
              </div>
              <div>
                <p className="text-xs text-coffee-light">Orders Today</p>
                <p className="font-display text-xl font-bold text-coffee">
                  {todayOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-coffee/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-coffee" />
              </div>
              <div>
                <p className="text-xs text-coffee-light">Avg. Order Value</p>
                <p className="font-display text-xl font-bold text-coffee">
                  ฿{avgOrderValue.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-coffee/10 rounded-lg">
                <Clock className="w-5 h-5 text-coffee" />
              </div>
              <div>
                <p className="text-xs text-coffee-light">Menu Items</p>
                <p className="font-display text-xl font-bold text-coffee">
                  {menuItems.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gold/20">
          <CardHeader className="bg-coffee text-cream rounded-t-lg flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">
              Menu Management
            </CardTitle>
            <Button
              size="sm"
              className="bg-gold text-coffee-dark hover:bg-gold-light"
              onClick={openAdd}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow className="border-gold/20">
                    <TableHead className="text-coffee">Name</TableHead>
                    <TableHead className="text-coffee">Category</TableHead>
                    <TableHead className="text-coffee text-right">
                      Price
                    </TableHead>
                    <TableHead className="text-coffee">Status</TableHead>
                    <TableHead className="text-coffee text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => (
                    <TableRow key={item.id} className="border-gold/10">
                      <TableCell className="font-medium text-coffee">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-cream-dark text-coffee-light text-xs"
                        >
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-coffee">
                        ฿{item.price}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "available" ? "default" : "secondary"
                          }
                          className={
                            item.status === "available"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:text-coffee"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:text-red-500"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold/20">
          <CardHeader className="bg-coffee text-cream rounded-t-lg">
            <CardTitle className="font-display text-lg">
              Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {topItems.length === 0 ? (
              <p className="text-center text-coffee-light py-8">
                No sales data yet
              </p>
            ) : (
              <div className="space-y-3">
                {topItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-cream/50 rounded-lg border border-gold/10"
                  >
                    <div className="w-8 h-8 bg-coffee/10 rounded-full flex items-center justify-center">
                      <span className="font-display font-bold text-coffee text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-coffee">{item.name}</p>
                      <p className="text-xs text-coffee-light">
                        {item.count} orders
                      </p>
                    </div>
                    <span className="font-display font-semibold text-gold">
                      ฿{item.revenue.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-gold/20 mt-6">
        <CardHeader className="bg-coffee text-cream rounded-t-lg">
          <CardTitle className="font-display text-lg">
            Recent Orders Today
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="border-gold/20">
                  <TableHead className="text-coffee">Time</TableHead>
                  <TableHead className="text-coffee">Items</TableHead>
                  <TableHead className="text-coffee text-right">
                    Total
                  </TableHead>
                  <TableHead className="text-coffee text-right">
                    Paid
                  </TableHead>
                  <TableHead className="text-coffee text-right">
                    Change
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-coffee-light py-8">
                      No orders today
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="border-gold/10">
                      <TableCell className="text-coffee">
                        {format(new Date(order.created_at), "HH:mm")}
                      </TableCell>
                      <TableCell className="text-coffee">
                        {(order.items_json as CartItem[]).length} items
                      </TableCell>
                      <TableCell className="text-right font-medium text-coffee">
                        ฿{order.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-coffee">
                        ฿{order.payment_received.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        ฿{order.change.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-cream border-gold/30">
          <DialogHeader>
            <DialogTitle className="font-display text-coffee">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
            <DialogDescription className="text-coffee-light">
              {editingItem
                ? "Update the item details below"
                : "Fill in the details for the new item"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-coffee">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Menu item name"
                className="border-gold/40 bg-white text-coffee"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-coffee">Price (฿)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="border-gold/40 bg-white text-coffee"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-coffee">Category</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={formData.category === cat ? "default" : "outline"}
                    size="sm"
                    className={`${
                      formData.category === cat
                        ? "bg-coffee text-cream"
                        : "border-gold/40 text-coffee"
                    }`}
                    onClick={() => setFormData({ ...formData, category: cat })}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-coffee">Status</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.status === "available" ? "default" : "outline"}
                  size="sm"
                  className={`${
                    formData.status === "available"
                      ? "bg-green-600 text-white"
                      : "border-gold/40 text-coffee"
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
                  className={`${
                    formData.status === "unavailable"
                      ? "bg-red-600 text-white"
                      : "border-gold/40 text-coffee"
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

          <DialogFooter>
            <Button
              variant="outline"
              className="border-gold/40 text-coffee"
              onClick={() => setShowDialog(false)}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              className="bg-coffee text-cream hover:bg-coffee-light"
              onClick={handleSave}
              disabled={!formData.name}
            >
              <Save className="w-4 h-4 mr-1" />
              {editingItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
