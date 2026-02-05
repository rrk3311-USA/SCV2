import { Container } from "@/components/Container";
import { ShoppingCart } from "@phosphor-icons/react/dist/ssr";
import { BeginCheckoutTracker } from "@/components/BeginCheckoutTracker";
import { CartContents } from "@/components/CartContents";

export const metadata = {
  title: "Cart - Success Chemistry",
  description: "Your shopping cart. View and checkout your Success Chemistry supplements.",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <BeginCheckoutTracker />
      <Container className="py-8 sm:py-12">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          <ShoppingCart size={32} weight="regular" className="text-[#2854a6]" />
          Cart
        </h1>
        <CartContents />
      </Container>
    </div>
  );
}
