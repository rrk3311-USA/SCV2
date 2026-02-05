import Link from "next/link";
import { Container } from "@/components/Container";
import { ROUTES } from "@/lib/constants";
import { PurchaseTracker } from "@/components/PurchaseTracker";

export const metadata = {
  title: "Order Confirmed – Success Chemistry",
  description: "Thank you for your order.",
};

type Props = { searchParams: Promise<{ orderId?: string; value?: string }> };

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { orderId, value: valueStr } = await searchParams;
  const value = valueStr != null ? parseFloat(valueStr) : undefined;
  return (
    <Container className="py-16 text-center">
      <PurchaseTracker orderId={orderId} value={Number.isFinite(value) ? value : undefined} />
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Thank you for your order</h1>
      <p className="mt-3 text-slate-600">
        Your payment was successful. We&apos;ll send confirmation details to your email.
      </p>
      {orderId && (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-mono text-sm font-semibold text-slate-800">
          Your order number: <span className="text-[#2854a6]">{orderId}</span>
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href={ROUTES.store}
          className="inline-flex rounded-full bg-[#2854a6] px-6 py-3 font-semibold text-white transition hover:bg-[#1e3a8a]"
        >
          Continue shopping
        </Link>
        <Link
          href={ROUTES.home}
          className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to home
        </Link>
      </div>
    </Container>
  );
}
