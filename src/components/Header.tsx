"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import { Flask } from "@phosphor-icons/react";

/**
 * Global header – matches deploy-site universal header (topbar + blue-nav).
 * Only Shop has an icon in the nav; Home and Cart are text only.
 */
export function Header() {
  return (
    <div className="header-wrapper w-full bg-white">
      <div className="topbar sticky top-0 z-[100] min-h-[98px] max-h-[98px] h-[98px] w-full border-b border-white/80 bg-white/95 pt-6 pb-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="container relative mx-auto w-full max-w-full px-4">
          <div className="topbar-inner flex min-h-[58px] max-h-[58px] h-[58px] w-full items-center justify-center gap-4">
            <Link
              href={ROUTES.home}
              className="brand absolute left-1/2 inline-flex -translate-x-1/2 items-center justify-center no-underline"
            >
              <Image
                src="/images/SC_logo_withR.png"
                alt="Success Chemistry"
                width={180}
                height={58}
                className="h-[58px] min-h-[58px] max-h-[58px] w-auto"
                priority
              />
            </Link>
          </div>
        </div>
      </div>
      <div
        className="header-divider h-1 w-full shrink-0"
        style={{
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)",
          backgroundSize: "200% 100%",
        }}
      />
      <div className="blue-nav flex h-[54px] min-h-[54px] max-h-[54px] w-full items-center justify-center bg-[#2854a6] py-2">
        <div className="container mx-auto flex h-[52px] w-full max-w-full items-center justify-center gap-8 px-4 text-xl">
          <Link href={ROUTES.home} className="text-[21px] font-medium text-white no-underline opacity-100 transition-opacity hover:opacity-80">
            Home
          </Link>
          <Link href={ROUTES.store} className="flex items-center gap-1.5 text-[23px] font-medium text-white no-underline opacity-100 transition-opacity hover:opacity-80">
            <Flask size={20} weight="regular" />
            Shop
          </Link>
          <Link href={ROUTES.cart} className="text-[21px] font-medium text-white no-underline opacity-100 transition-opacity hover:opacity-80">
            Cart
          </Link>
        </div>
      </div>
      <div
        className="header-divider h-1 w-full shrink-0"
        style={{
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}
