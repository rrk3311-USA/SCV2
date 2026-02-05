import { Container } from "@/components/Container";
import { PolicyPage, PolicyH2 } from "@/components/PolicyPage";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Terms of Service - Success Chemistry",
  description:
    "Terms of Service for Success Chemistry. Read our terms and conditions for using our website and purchasing our products.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Container className="py-8 sm:py-12">
        <PolicyPage
          title="Terms of Service"
          description="Please read these terms carefully before using our website or purchasing our products."
        >
          <PolicyH2>Acceptance of Terms</PolicyH2>
          <p className="leading-relaxed">
            By accessing and using this website, you accept and agree to be bound
            by the terms and provision of this agreement.
          </p>

          <PolicyH2>Use License</PolicyH2>
          <p className="leading-relaxed">
            Permission is granted to temporarily download one copy of the
            materials on Success Chemistry&apos;s website for personal,
            non-commercial transitory viewing only.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>This is the grant of a license, not a transfer of title.</li>
            <li>You may not modify or copy the materials.</li>
            <li>
              You may not use the materials for any commercial purpose or for
              any public display.
            </li>
            <li>
              You may not remove any copyright or other proprietary notations
              from the materials.
            </li>
          </ul>

          <PolicyH2>Product Information</PolicyH2>
          <p className="leading-relaxed">
            We strive to provide accurate product descriptions and images.
            However, we do not warrant that product descriptions or other
            content on this site is accurate, complete, reliable, current, or
            error-free.
          </p>

          <PolicyH2>Pricing and Payment</PolicyH2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All prices are in USD and are subject to change without notice.</li>
            <li>We reserve the right to modify prices at any time.</li>
            <li>Payment must be received before order processing.</li>
          </ul>

          <PolicyH2>Shipping and Delivery</PolicyH2>
          <p className="leading-relaxed">
            Shipping terms and delivery times are estimates and not guaranteed.
            We are not responsible for delays caused by shipping carriers or
            customs.
          </p>

          <PolicyH2>Returns and Refunds</PolicyH2>
          <p className="leading-relaxed">
            Please review our{" "}
            <Link href={ROUTES.shippingReturns} className="text-[#2854a6] underline hover:no-underline">
              Shipping &amp; Returns
            </Link>{" "}
            policy for information about returns and refunds.
          </p>

          <PolicyH2>Disclaimer</PolicyH2>
          <p className="leading-relaxed">
            The materials on Success Chemistry&apos;s website are provided on
            an &apos;as is&apos; basis. Success Chemistry makes no warranties,
            expressed or implied, and hereby disclaims and negates all other
            warranties including, without limitation, implied warranties or
            conditions of merchantability, fitness for a particular purpose, or
            non-infringement of intellectual property or other violation of
            rights.
          </p>

          <PolicyH2>Limitations</PolicyH2>
          <p className="leading-relaxed">
            In no event shall Success Chemistry or its suppliers be liable for
            any damages (including, without limitation, damages for loss of data
            or profit, or due to business interruption) arising out of the use
            or inability to use the materials on Success Chemistry&apos;s
            website.
          </p>

          <PolicyH2>Revisions</PolicyH2>
          <p className="leading-relaxed">
            Success Chemistry may revise these terms of service at any time
            without notice. By using this website you are agreeing to be bound
            by the then current version of these terms of service.
          </p>

          <PolicyH2>Contact Information</PolicyH2>
          <p className="leading-relaxed">
            If you have any questions about these Terms of Service, please{" "}
            <Link href={ROUTES.contact} className="text-[#2854a6] underline hover:no-underline">
              contact us
            </Link>
            .
          </p>
        </PolicyPage>
      </Container>
    </div>
  );
}
