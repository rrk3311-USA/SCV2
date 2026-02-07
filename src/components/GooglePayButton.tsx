"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_PAY_SCRIPT = "https://pay.google.com/gp/p/js/pay.js";

const ENABLED = process.env.NEXT_PUBLIC_GOOGLE_PAY_ENABLED === "true";
const MERCHANT_ID = process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID || "";
const ENV: "TEST" | "PRODUCTION" =
  (process.env.NEXT_PUBLIC_GOOGLE_PAY_ENVIRONMENT as "TEST" | "PRODUCTION") || "TEST";
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

export type GooglePayLineItem = {
  sku: string;
  name: string;
  price: number;
  quantity: number;
};

type GooglePayButtonProps = {
  /** Total amount in USD (e.g. 29.99) */
  total: number;
  /** Line items for display and for API (cart or single product) */
  items: GooglePayLineItem[];
  /** Optional: clear cart after successful order (e.g. from cart page) */
  onSuccess?: () => void;
  /** Button label override */
  buttonLabel?: string;
  /** Compact style for product page */
  compact?: boolean;
};

declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (opts: { environment: string }) => {
            isReadyToPay(request: unknown): Promise<{ result: boolean }>;
            loadPaymentData(request: unknown): Promise<unknown>;
            createButton(opts: unknown): unknown;
          };
        };
      };
    };
  }
}

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  const existing = document.querySelector(`script[src="${GOOGLE_PAY_SCRIPT}"]`);
  if (existing) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GOOGLE_PAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Pay script"));
    document.head.appendChild(script);
  });
}

function getTokenizationSpec(): { type: string; parameters: Record<string, string> } {
  if (STRIPE_KEY && ENV === "PRODUCTION") {
    return {
      type: "PAYMENT_GATEWAY",
      parameters: {
        gateway: "stripe",
        "stripe:version": "2018-10-31",
        "stripe:publishableKey": STRIPE_KEY,
      },
    };
  }
  // TEST or no Stripe: use example gateway (non-chargeable, for UI testing)
  return {
    type: "PAYMENT_GATEWAY",
    parameters: {
      gateway: "example",
      gatewayMerchantId: "exampleGatewayMerchantId",
    },
  };
}

function buildPaymentDataRequest(total: number, currencyCode: string): unknown {
  const merchantInfo: { merchantName: string; merchantId?: string } = {
    merchantName: "Success Chemistry",
  };
  if (MERCHANT_ID && ENV === "PRODUCTION") {
    merchantInfo.merchantId = MERCHANT_ID;
  }

  const tokenizationSpec = getTokenizationSpec();
  const totalPrice = total.toFixed(2);

  return {
    apiVersion: 2,
    apiVersionMinor: 0,
    merchantInfo,
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          allowedCardNetworks: ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"],
        },
        tokenizationSpecification: tokenizationSpec,
      },
    ],
    transactionInfo: {
      countryCode: "US",
      currencyCode,
      totalPriceStatus: "FINAL",
      totalPrice,
    },
  };
}

export function GooglePayButton({
  total,
  items,
  onSuccess,
  buttonLabel,
  compact,
}: GooglePayButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ENABLED || typeof window === "undefined" || total <= 0) return;

    let mounted = true;

    loadScript()
      .then(() => {
        if (!mounted || !window.google?.payments?.api) {
          setError("Google Pay not available");
          return;
        }
        const client = new window.google.payments.api.PaymentsClient({ environment: ENV });
        const baseRequest = { apiVersion: 2, apiVersionMinor: 0 };
        const tokenizationSpec = getTokenizationSpec();
        const isReadyRequest = {
          ...baseRequest,
          allowedPaymentMethods: [
            {
              type: "CARD",
              parameters: {
                allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                allowedCardNetworks: ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"],
              },
              tokenizationSpecification: tokenizationSpec,
            },
          ],
        };
        return client.isReadyToPay(isReadyRequest).then((res) => {
          if (mounted && res?.result) setReady(true);
        });
      })
      .catch((e) => {
        if (mounted) setError(e instanceof Error ? e.message : "Google Pay unavailable");
      });

    return () => {
      mounted = false;
    };
  }, [total]);

  const handlePay = async () => {
    if (!ready || !window.google?.payments?.api || total <= 0) return;
    setError(null);
    setLoading(true);
    try {
      const client = new window.google.payments.api.PaymentsClient({ environment: ENV });
      const request = buildPaymentDataRequest(total, "USD") as Record<string, unknown>;
      const paymentData = await client.loadPaymentData(request);
      if (!paymentData || typeof paymentData !== "object") {
        throw new Error("No payment data");
      }
      const res = await fetch("/api/google-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodData: (paymentData as { paymentMethodData?: unknown }).paymentMethodData,
          items,
          total,
          currency: "USD",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Payment failed");
      }
      const orderId = data.orderId as string | undefined;
      const value = typeof data.value === "number" ? data.value : total;
      if (onSuccess) onSuccess();
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const params = new URLSearchParams();
      if (orderId) params.set("orderId", orderId);
      params.set("value", String(value));
      window.location.href = `${base}/order-confirmation?${params.toString()}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setLoading(false);
    }
  };

  if (!ENABLED) return null;
  if (error) {
    return (
      <div className={compact ? "mt-2" : "mt-4"}>
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      </div>
    );
  }
  if (!ready) return null;

  return (
    <div ref={containerRef} className={compact ? "mt-2" : "mt-4"}>
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-70"
        aria-label={buttonLabel || "Pay with Google Pay"}
      >
        <img
          src="https://www.gstatic.com/instantbuy/svg/dark_gpay.svg"
          alt=""
          width={compact ? 80 : 100}
          height={40}
          className="h-8 w-auto object-contain"
        />
        {loading && <span className="text-sm">Processing…</span>}
      </button>
    </div>
  );
}
