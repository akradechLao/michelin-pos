"use client";

import { useState } from "react";
import { Trash2, Plus, Minus, CreditCard, CheckCircle, ShoppingCart, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCart } from "@/lib/cart-context";
import { supabase } from "@/lib/supabase";

export function Cart() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    serviceCharge,
    vat,
    total,
  } = useCart();

  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  const paymentReceived = parseFloat(paymentAmount) || 0;
  const change = paymentReceived - total;

  async function handlePayment() {
    if (paymentReceived < total) return;

    setProcessing(true);

    const { error } = await supabase.from("orders").insert({
      items_json: items,
      total_amount: total,
      payment_received: paymentReceived,
      change: change,
    });

    if (!error) {
      setShowPayment(false);
      setShowSuccess(true);
      clearCart();
      setPaymentAmount("");
      setTimeout(() => setShowSuccess(false), 3000);
    }

    setProcessing(false);
  }

  return (
    <>
      <Card className="border-2 border-coral/20 h-full flex flex-col overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-coral to-hot-pink text-white rounded-t-xl p-3 sm:p-4">
          <CardTitle className="font-bold text-base sm:text-lg flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="truncate">Current Order</span>
            {items.length > 0 && (
              <span className="ml-auto bg-white/20 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                {items.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto max-h-[300px] sm:max-h-[400px] scrollbar-thin p-3 sm:p-4 space-y-2 sm:space-y-3">
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-coral/40" />
                </div>
                <p className="font-bold text-gray-600 text-sm sm:text-base">No items in cart</p>
                <p className="text-xs sm:text-sm mt-1">Tap menu items to add</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-coral/5 to-hot-pink/5 rounded-xl border border-coral/10 hover:border-coral/20 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate text-xs sm:text-sm">
                      {item.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-coral font-medium">
                      ฿{item.price.toFixed(0)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-coral/10 hover:text-coral rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </Button>
                    <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-bold text-coral">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-coral/10 hover:text-coral rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </Button>
                  </div>

                  <span className="font-bold text-coral text-xs sm:text-sm w-12 sm:w-16 text-right">
                    ฿{(item.price * item.quantity).toFixed(0)}
                  </span>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:text-red-500 hover:bg-red-50 rounded-full flex-shrink-0"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="border-t-2 border-coral/10 p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gradient-to-b from-transparent to-coral/5">
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">฿{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service (2%)</span>
                  <span className="font-medium">฿{serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (7%)</span>
                  <span className="font-medium">฿{vat.toFixed(2)}</span>
                </div>
                <Separator className="bg-coral/20" />
                <div className="flex justify-between font-black text-lg sm:text-xl">
                  <span className="text-gray-800">Total</span>
                  <span className="bg-gradient-to-r from-coral to-hot-pink bg-clip-text text-transparent">
                    ฿{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-coral/30 text-coral hover:bg-coral/10 hover:border-coral/50 font-semibold rounded-full text-xs sm:text-sm"
                  onClick={clearCart}
                >
                  Clear
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-coral to-hot-pink text-white hover:shadow-warm-lg font-semibold rounded-full transition-all duration-300 hover:scale-[1.02] text-xs sm:text-sm"
                  onClick={() => setShowPayment(true)}
                >
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Pay Now
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog - Full width on mobile */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="w-[95vw] sm:max-w-md bg-white border-2 border-coral/20 rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg sm:text-xl text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-coral to-hot-pink rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Payment
            </DialogTitle>
            <DialogDescription className="text-coral font-semibold text-base sm:text-lg">
              Total: ฿{total.toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-coral/5 to-hot-pink/5 rounded-xl space-y-1.5 sm:space-y-2 border border-coral/10">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">฿{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Service Charge</span>
                <span className="font-medium text-gray-800">฿{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">VAT (7%)</span>
                <span className="font-medium text-gray-800">฿{vat.toFixed(2)}</span>
              </div>
              <Separator className="bg-coral/20" />
              <div className="flex justify-between font-black text-lg sm:text-xl">
                <span className="text-gray-800">Total</span>
                <span className="bg-gradient-to-r from-coral to-hot-pink bg-clip-text text-transparent">
                  ฿{total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">
                Payment Amount (฿)
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="border-2 border-coral/30 bg-white text-gray-800 text-base sm:text-lg font-medium rounded-xl focus:border-coral focus:ring-coral/20"
                min={total}
              />
            </div>

            {paymentReceived > 0 && (
              <div
                className={`p-2.5 sm:p-3 rounded-xl font-medium text-xs sm:text-sm ${
                  paymentReceived >= total
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700"
                    : "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700"
                }`}
              >
                {paymentReceived >= total
                  ? `Change: ฿${change.toFixed(2)}`
                  : `Need ฿${(total - paymentReceived).toFixed(2)} more`}
              </div>
            )}

            {/* Quick Cash Buttons */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[100, 200, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className="border-2 border-coral/30 text-coral hover:bg-coral hover:text-white hover:border-coral font-semibold rounded-full transition-all duration-200 text-xs sm:text-sm"
                  onClick={() => setPaymentAmount(amount.toString())}
                >
                  ฿{amount}
                </Button>
              ))}
            </div>

            <Button
              className="w-full bg-gradient-to-r from-coral to-hot-pink text-white hover:shadow-warm-lg font-bold text-base sm:text-lg py-4 sm:py-6 rounded-full transition-all duration-300 hover:scale-[1.02]"
              onClick={handlePayment}
              disabled={paymentReceived < total || processing}
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Complete Payment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="w-[90vw] sm:max-w-sm bg-white border-2 border-green-200 rounded-2xl">
          <div className="flex flex-col items-center py-4 sm:py-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-3 sm:mb-4 animate-bounce-in">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h3 className="font-bold text-xl sm:text-2xl text-gray-800">
              Payment Complete!
            </h3>
            <p className="text-gray-600 mt-1.5 sm:mt-2 font-medium text-sm sm:text-base">Thank you for your order</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
