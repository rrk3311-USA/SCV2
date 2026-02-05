import { Container } from "@/components/Container";
import { PolicyPage, PolicyH2 } from "@/components/PolicyPage";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy - Success Chemistry",
  description:
    "Privacy policy for Success Chemistry. We respect your privacy and protect your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Container className="py-8 sm:py-12">
        <PolicyPage
          title="Privacy Policy"
          description="We respect your privacy and are committed to protecting your personal data."
        >
          <PolicyH2>Information We Collect</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Contact details such as name, email, and shipping address when you
              place an order.
            </li>
            <li>
              Site usage data like device type and pages visited for analytics
              and improvements.
            </li>
          </ul>

          <PolicyH2>How We Use Information</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              To process orders, provide support, and improve our products and
              experience.
            </li>
            <li>
              To send order updates and, if opted in, marketing emails.
            </li>
          </ul>

          <PolicyH2>Sharing</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              We only share data with trusted service providers necessary for
              operations.
            </li>
            <li>We do not sell personal information.</li>
          </ul>

          <PolicyH2>Your Choices</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You can opt out of marketing emails at any time.</li>
            <li>
              You may request access or deletion of your data by contacting
              support.
            </li>
          </ul>

          <PolicyH2>Contact</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Questions? Email{" "}
              <a
                href="mailto:support@successchemistry.com"
                className="text-[#2854a6] underline hover:no-underline"
              >
                support@successchemistry.com
              </a>
              .
            </li>
          </ul>
        </PolicyPage>
      </Container>
    </div>
  );
}
