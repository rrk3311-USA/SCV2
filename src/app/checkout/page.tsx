import { Suspense } from "react";
import { Container } from "@/components/Container";
import { CheckoutContent } from "./CheckoutContent";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-16 text-center">
          <p className="text-slate-500">Loading checkout…</p>
        </Container>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
