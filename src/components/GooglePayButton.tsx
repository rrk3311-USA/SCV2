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

/** ButtonOptions per https://developers.google.com/pay/api/web/reference/request-objects#ButtonOptions */
type ButtonOptions = {
  buttonColor?: "default" | "black" | "white";
  buttonType?: "book" | "buy" | "checkout" | "donate" | "order" | "pay" | "plain" | "subscribe";
  buttonSizeMode?: "static" | "fill";
  buttonLocale?: string;
  onClick?: (event: Event) => void;
};

declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (opts: { environment: string }) => {
            isReadyToPay(request: unknown): Promise<{ result: boolean }>;
            loadPaymentData(request: unknown): Promise<unknown>;
            createButton(opts: ButtonOptions): HTMLElement;
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

/** Google Pay API can attach to window shortly after script load. Wait for it. */
function getGooglePayApi(): typeof window.google | null {
  const g = typeof window !== "undefined" ? (window as Window & { google?: typeof window.google }).google : undefined;
  return g?.payments?.api ? g : null;
}

function waitForGooglePayApi(maxMs = 3000): Promise<NonNullable<ReturnType<typeof getGooglePayApi>>> {
  return new Promise((resolve, reject) => {
    const api = getGooglePayApi();
    if (api) return resolve(api);
    const start = Date.now();
    const t = setInterval(() => {
      if (getGooglePayApi()) {
        clearInterval(t);
        resolve(getGooglePayApi()!);
      } else if (Date.now() - start > maxMs) {
        clearInterval(t);
        reject(new Error("Google Pay script loaded but API not ready. Try Chrome, or disable ad blockers for this site."));
      }
    }, 100);
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
  const handlerRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  handlerRef.current = handlePay;

  useEffect(() => {
    if (!ENABLED || typeof window === "undefined" || total <= 0) return;

    let mounted = true;

    loadScript()
      .then(() => waitForGooglePayApi())
      .then((googlePay) => {
        if (!mounted) return;
        const client = new googlePay.payments.api.PaymentsClient({ environment: ENV });
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

  useEffect(() => {
    if (!ready || !containerRef.current || !window.google?.payments?.api || loading) return;

    const client = new window.google.payments.api.PaymentsClient({ environment: ENV });
    const buttonOptions: ButtonOptions = {
      buttonColor: "white",
      buttonType: "pay",
      buttonSizeMode: "fill",
      onClick: () => handlerRef.current(),
    };
    const gpayButton = client.createButton(buttonOptions);
    if (!gpayButton) return;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(gpayButton);

    return () => {
      if (containerRef.current?.contains(gpayButton)) {
        containerRef.current.removeChild(gpayButton);
      }
    };
  }, [ready, loading, total]);

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
    <div className={compact ? "mt-2" : "mt-4"}>
      <div
        className="min-h-[48px] w-full overflow-hidden rounded-lg border-2 border-white/30 bg-[#2854a6] p-1.5 shadow-sm"
        style={{ minWidth: compact ? 140 : 200 }}
      >
        <div
          ref={containerRef}
          className="flex min-h-[44px] items-stretch justify-center [&_button]:min-h-[44px]"
          style={{ height: compact ? 44 : 52 }}
          aria-label={buttonLabel || "Pay with Google Pay"}
        />
      </div>
      {loading && (
        <p className="mt-2 text-center text-sm text-white/90" role="status">
          Processing…
        </p>
      )}
    </div>
  );
}
