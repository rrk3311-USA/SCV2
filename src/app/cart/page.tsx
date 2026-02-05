import { Container } from "@/components/Container";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { ShoppingCart, Flask } from "@phosphor-icons/react/dist/ssr";
import { BeginCheckoutTracker } from "@/components/BeginCheckoutTracker";

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
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-slate-100 p-6">
              <ShoppingCart size={64} weight="regular" className="text-slate-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-slate-900">Your cart is empty</h2>
            <p className="mt-2 max-w-sm text-slate-600">
              Add supplements from our shop to get started. Free shipping on orders over $50.
            </p>
            <Link
              href={ROUTES.store}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2854a6] px-8 py-4 font-semibold text-white no-underline shadow-md transition hover:bg-[#1e3a8a] hover:shadow-lg"
            >
              <Flask size={22} weight="regular" />
              Browse Shop
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
