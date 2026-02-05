import { Container } from "@/components/Container";
import { ContactInfoCards } from "./ContactInfoCards";
import { ContactForm } from "./ContactForm";
import { ChatCircle } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Contact Us - Success Chemistry",
  description:
    "Get in touch with Success Chemistry. Contact us for questions about our premium supplements, orders, or customer support.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Container className="py-8 sm:py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-[#0a234e] sm:text-3xl flex items-center justify-center gap-2 flex-wrap">
            <ChatCircle className="shrink-0 text-[#2854a6]" size={32} weight="regular" aria-hidden />
            Get in Touch with Success Chemistry
          </h1>
          <p className="mt-2 max-w-xl mx-auto text-[#4b5563] text-base leading-relaxed">
            We&apos;re here to assist you with any questions or concerns about
            our dietary supplement products and services.
          </p>
        </div>

        <div className="mb-12 max-w-3xl mx-auto">
          <ContactInfoCards />
        </div>

        <div className="max-w-xl mx-auto">
          <ContactForm />
        </div>
      </Container>
    </div>
  );
}
