import { Container } from "@/components/Container";
import { PolicyPage, PolicyH2 } from "@/components/PolicyPage";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Payment Policy - Success Chemistry",
  description:
    "Payment policy for Success Chemistry. How we process and protect your payments.",
};

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Container className="py-8 sm:py-12">
        <PolicyPage
          title="Payment Policy"
          description="This policy explains how payments are processed and protected."
        >
          <PolicyH2>Accepted Payment Methods</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Major credit/debit cards are accepted at checkout.</li>
            <li>Available payment options may vary by location.</li>
          </ul>

          <PolicyH2>Secure Checkout</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              We use encryption and secure processors to protect your payment
              details.
            </li>
            <li>
              Payment data is handled by trusted third-party processors and is
              not stored on our servers.
            </li>
          </ul>

          <PolicyH2>Billing Issues</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              If a payment fails, please confirm your billing details and try
              again.
            </li>
            <li>
              For charges you don&apos;t recognize, contact support immediately.
            </li>
          </ul>

          <PolicyH2>Taxes</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Sales tax is applied where required by law and calculated at
              checkout.
            </li>
          </ul>
        </PolicyPage>
      </Container>
    </div>
  );
}
