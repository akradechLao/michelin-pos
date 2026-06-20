"use client";

import { useState } from "react";
import { Trash2, Plus, Minus, CreditCard, CheckCircle } from "lucide-react";
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
      <Card className="border-gold/20 h-full flex flex-col">
        <CardHeader className="bg-coffee text-cream rounded-t-lg">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold" />
            Current Order
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto max-h-[400px] scrollbar-thin p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center text-coffee-light py-8">
                <p className="font-display">No items in cart</p>
                <p className="text-sm mt-1">Click on menu items to add</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-cream/50 rounded-lg border border-gold/10"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-coffee truncate text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-coffee-light">
                      ฿{item.price.toFixed(0)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-coffee/10"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium text-coffee">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-coffee/10"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <span className="font-medium text-coffee text-sm w-16 text-right">
                    ฿{(item.price * item.quantity).toFixed(0)}
                  </span>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:text-red-500 hover:bg-red-50"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="border-t border-gold/20 p-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-coffee-light">
                  <span>Subtotal</span>
                  <span>฿{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-coffee-light">
                  <span>Service Charge (10%)</span>
                  <span>฿{serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-coffee-light">
                  <span>VAT (7%)</span>
                  <span>฿{vat.toFixed(2)}</span>
                </div>
                <Separator className="bg-gold/30" />
                <div className="flex justify-between font-display font-bold text-lg text-coffee">
                  <span>Total</span>
                  <span className="text-gold">฿{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gold/40 text-coffee hover:bg-coffee/5"
                  onClick={clearCart}
                >
                  Clear
                </Button>
                <Button
                  className="flex-1 bg-coffee text-cream hover:bg-coffee-light"
                  onClick={() => setShowPayment(true)}
                >
                  Pay Now
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md bg-cream border-gold/30">
          <DialogHeader>
            <DialogTitle className="font-display text-coffee">
              Payment
            </DialogTitle>
            <DialogDescription className="text-coffee-light">
              Total amount: ฿{total.toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-coffee/5 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-coffee-light">Subtotal</span>
                <span className="text-coffee">฿{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-coffee-light">Service Charge</span>
                <span className="text-coffee">฿{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-coffee-light">VAT (7%)</span>
                <span className="text-coffee">฿{vat.toFixed(2)}</span>
              </div>
              <Separator className="bg-gold/30" />
              <div className="flex justify-between font-bold text-lg">
                <span className="text-coffee">Total</span>
                <span className="text-gold">฿{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-coffee">
                Payment Amount (฿)
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="border-gold/40 bg-white text-coffee"
                min={total}
              />
            </div>

            {paymentReceived > 0 && (
              <div
                className={`p-3 rounded-lg ${
                  paymentReceived >= total
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    paymentReceived >= total ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {paymentReceived >= total
                    ? `Change: ฿${change.toFixed(2)}`
                    : `Insufficient: Need ฿${(total - paymentReceived).toFixed(2)} more`}
                </p>
              </div>
            )}

            {/* Quick Cash Buttons */}
            <div className="flex flex-wrap gap-2">
              {[100, 200, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className="border-gold/40 text-coffee hover:bg-coffee/5"
                  onClick={() => setPaymentAmount(amount.toString())}
                >
                  ฿{amount}
                </Button>
              ))}
            </div>

            <Button
              className="w-full bg-coffee text-cream hover:bg-coffee-light"
              onClick={handlePayment}
              disabled={paymentReceived < total || processing}
            >
              {processing ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-sm bg-cream border-gold/30">
          <div className="flex flex-col items-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="font-display text-xl font-semibold text-coffee">
              Payment Complete
            </h3>
            <p className="text-coffee-light mt-2">Thank you for your order</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
