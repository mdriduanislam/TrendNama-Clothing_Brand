"use client";

import { AlertCircle, CheckCircle2, CreditCard, LockKeyhole } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useCartStore from "@/stores/cartStore";

const PaymentForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [didFinalizeOrder, setDidFinalizeOrder] = useState(false);
  const { clearCart } = useCartStore();

  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (status !== "success" || !sessionId || didFinalizeOrder) {
      return;
    }

    const finalizeOrder = async () => {
      try {
        const response = await fetch("/api/orders/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          setPaymentError(result.error || "Could not finalize your order.");
          return;
        }

        await clearCart();
        setDidFinalizeOrder(true);
      } catch {
        setPaymentError("Network error while finalizing order.");
      }
    };

    void finalizeOrder();
  }, [clearCart, didFinalizeOrder, sessionId, status]);

  useEffect(() => {
    if (status !== "success" || !didFinalizeOrder) {
      return;
    }

    const timer = setTimeout(() => {
      router.replace("/");
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [didFinalizeOrder, router, status]);

  const handleStripeCheckout = async () => {
    setPaymentError(null);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
      });

      const result = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        setPaymentError(result.error || "Could not start Stripe checkout.");
        return;
      }

      window.location.assign(result.url);
    } catch {
      setPaymentError("Network error while starting Stripe checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {status === "success" && (
        <p className="text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Payment completed. Finalizing your order...
        </p>
      )}

      {status === "cancelled" && (
        <p className="text-sm text-amber-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Checkout was canceled. You can try again.
        </p>
      )}

      <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
        <p className="text-sm font-semibold text-violet-900">Stripe Test Checkout</p>
        <p className="text-xs text-violet-800 mt-1">
          You will be redirected to Stripe Checkout. Use card 4242 4242 4242 4242,
          any future date, any 3-digit CVC, and any ZIP.
        </p>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Image src="/stripe.png" alt="stripe" width={50} height={25} className="rounded-md" />
        <Image src="/cards.png" alt="cards" width={50} height={25} className="rounded-md" />
        <Image src="/klarna.png" alt="klarna" width={50} height={25} className="rounded-md" />
      </div>

      <p className="text-xs text-gray-500 flex items-center gap-2">
        <LockKeyhole className="w-3 h-3" />
        Card details are entered securely on Stripe-hosted checkout.
      </p>

      {paymentError && (
        <p className="text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {paymentError}
        </p>
      )}

      <button
        type="button"
        onClick={handleStripeCheckout}
        disabled={isProcessing}
        className="w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-60 transition-all duration-300 text-white p-2 rounded-lg cursor-pointer flex items-center justify-center gap-2"
      >
        <CreditCard className="w-3 h-3" />
        {isProcessing ? "Redirecting to Stripe..." : "Pay with Stripe (Test)"}
      </button>
    </div>
  );
};

export default PaymentForm;
