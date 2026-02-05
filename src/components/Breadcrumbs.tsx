"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import {
  House,
  Flask,
  ShoppingCart,
  ChatCircle,
  CaretRight,
  FileText,
  Sparkle,
} from "@phosphor-icons/react";

type Segment = { href: string; label: string; Icon: typeof House };

const ROUTE_BREADCRUMBS: Record<string, Segment[]> = {
  [ROUTES.home]: [],
  [ROUTES.store]: [{ href: ROUTES.home, label: "Home", Icon: House }, { href: ROUTES.store, label: "Shop", Icon: Flask }],
  [ROUTES.cart]: [{ href: ROUTES.home, label: "Home", Icon: House }, { href: ROUTES.cart, label: "Cart", Icon: ShoppingCart }],
  [ROUTES.contact]: [{ href: ROUTES.home, label: "Home", Icon: House }, { href: ROUTES.contact, label: "Contact", Icon: ChatCircle }],
  [ROUTES.termsOfService]: [{ href: ROUTES.home, label: "Home", Icon: House }, { href: ROUTES.termsOfService, label: "Terms of Service", Icon: FileText }],
  [ROUTES.shippingReturns]: [{ href: ROUTES.home, label: "Home", Icon: House }, { href: ROUTES.shippingReturns, label: "Shipping & Returns", Icon: FileText }],
  [ROUTES.paymentPolicy]: [{ href: ROUTES.home, label: "Home", Icon: House }, { href: ROUTES.paymentPolicy, label: "Payment Policy", Icon: FileText }],
  [ROUTES.privacyPolicy]: [{ href: ROUTES.home, label: "Home", Icon: House }, { href: ROUTES.privacyPolicy, label: "Privacy Policy", Icon: FileText }],
};

function getBreadcrumbs(pathname: string): Segment[] {
  if (pathname in ROUTE_BREADCRUMBS) return ROUTE_BREADCRUMBS[pathname];
  const productMatch = pathname.match(/^\/product\/(.+)$/);
  if (productMatch) {
    return [
      { href: ROUTES.home, label: "Home", Icon: House },
      { href: ROUTES.store, label: "Shop", Icon: Flask },
      { href: pathname, label: "Product", Icon: Sparkle },
    ];
  }
  return [{ href: ROUTES.home, label: "Home", Icon: House }];
}

/**
 * Global breadcrumbs with icons – shown on all pages except home (home shows nothing or single Home).
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = getBreadcrumbs(pathname);
  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-slate-200/80 bg-white/80 px-4 py-2.5 backdrop-blur sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1.5 text-sm text-slate-600">
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          const { href, label, Icon } = seg;
          return (
            <span key={href} className="flex items-center gap-1.5">
              {i > 0 && (
                <CaretRight size={14} weight="bold" className="shrink-0 text-[#2854a6]" aria-hidden />
              )}
              {isLast ? (
                <span className="flex items-center gap-1.5 font-medium text-slate-900">
                  <Icon size={16} weight="regular" className="shrink-0 text-[#2854a6]" />
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="flex items-center gap-1.5 text-slate-600 no-underline transition hover:text-[#2854a6]"
                >
                  <Icon size={16} weight="regular" className="shrink-0 text-[#2854a6]" />
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
