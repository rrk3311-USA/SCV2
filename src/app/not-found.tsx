import Link from "next/link";
import { Container } from "@/components/Container";
import { ROUTES } from "@/lib/constants";
import { House, Flask } from "@phosphor-icons/react/dist/ssr";

/**
 * Custom 404 – SCV2 styling, links home and shop.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="text-6xl font-bold text-slate-200 sm:text-8xl">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-slate-900 sm:text-2xl">
          Page not found
        </h2>
        <p className="mt-2 max-w-md text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-2 rounded-full bg-[#2854a6] px-8 py-4 font-semibold text-white no-underline shadow-md transition hover:bg-[#1e3a8a] hover:shadow-lg"
          >
            <House size={22} weight="regular" />
            Home
          </Link>
          <Link
            href={ROUTES.store}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#2854a6] px-8 py-4 font-semibold text-[#2854a6] no-underline transition hover:bg-[#2854a6] hover:text-white"
          >
            <Flask size={22} weight="regular" />
            Shop
          </Link>
        </div>
      </Container>
    </div>
  );
}
