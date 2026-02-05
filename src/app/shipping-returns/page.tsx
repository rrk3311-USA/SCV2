import { Container } from "@/components/Container";
import { PolicyPage, PolicyH2 } from "@/components/PolicyPage";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Shipping & Returns - Success Chemistry",
  description:
    "Shipping & Returns policy for Success Chemistry. Learn about our shipping times, return policy, and refund process.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Container className="py-8 sm:py-12">
        <PolicyPage
          title="Shipping & Returns"
          description="We aim to ship quickly and make returns simple. Below is our standard policy."
        >
          <PolicyH2>Processing &amp; Shipping</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Orders typically process within 1–2 business days.</li>
            <li>
              Shipping times vary by location and method selected at checkout.
            </li>
          </ul>

          <PolicyH2>Order Tracking</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>A tracking link will be emailed once your order ships.</li>
            <li>
              If tracking hasn&apos;t updated for 72 hours, contact support for
              help.
            </li>
          </ul>

          <PolicyH2>Returns</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              We accept returns within 30 days of delivery for unopened items.
            </li>
            <li>
              To start a return, email support@successchemistry.com with your
              order number.
            </li>
          </ul>

          <PolicyH2>Exchanges &amp; Replacements</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              If your order arrives damaged or incorrect, we&apos;ll replace it
              at no cost.
            </li>
            <li>
              Please send photos of the issue so we can resolve it quickly.
            </li>
          </ul>

          <PolicyH2>Refunds</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Approved refunds are issued to the original payment method.</li>
            <li>
              Refunds may take 5–10 business days to post depending on your
              bank.
            </li>
          </ul>
        </PolicyPage>
      </Container>
    </div>
  );
}
