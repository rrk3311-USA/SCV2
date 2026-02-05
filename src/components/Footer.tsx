"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";

/**
 * Global footer – matches deploy-site universal footer (VIEW ALL / VIEW CART, badges, policy links).
 */
export function Footer() {
  return (
    <footer className="footer mt-auto w-full bg-[#2854a6]">
      <div className="flex flex-wrap items-center justify-center gap-4 px-5 pt-12 pb-6 text-center">
        <Link
          href={ROUTES.store}
          className="footer-btn inline-block rounded-full border-[3px] border-transparent bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-[#2854a6] no-underline shadow-md transition hover:opacity-90"
          style={{
            backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, #5eead4 0%, #3b82f6 50%, #8b5cf6 100%)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          VIEW ALL
        </Link>
        <Link
          href={ROUTES.cart}
          className="footer-btn inline-block rounded-full border-[3px] border-transparent bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-[#2854a6] no-underline shadow-md transition hover:opacity-90"
          style={{
            backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, #5eead4 0%, #3b82f6 50%, #8b5cf6 100%)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          VIEW CART
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 px-5 pt-0 pb-5">
        <Image
          src="/images/Footer-Badges-.png"
          alt="Certification Badges"
          width={350}
          height={80}
          className="max-w-[350px] h-auto"
        />
      </div>
      <div className="h-0.5 w-full bg-gradient-to-r from-[#4fd0ff] via-[#ffd34d] to-[#4fd0ff]" />
      <div className="flex flex-wrap items-center justify-center gap-5 px-5 py-4 text-sm">
        <Link href={ROUTES.termsOfService} className="font-medium text-white no-underline transition-opacity hover:opacity-80">
          Terms of Service
        </Link>
        <span className="text-white/30">|</span>
        <Link href={ROUTES.shippingReturns} className="font-medium text-white no-underline transition-opacity hover:opacity-80">
          Shipping & Returns
        </Link>
        <span className="text-white/30">|</span>
        <Link href={ROUTES.paymentPolicy} className="font-medium text-white no-underline transition-opacity hover:opacity-80">
          Payment Policy
        </Link>
        <span className="text-white/30">|</span>
        <Link href={ROUTES.privacyPolicy} className="font-medium text-white no-underline transition-opacity hover:opacity-80">
          Privacy Policy
        </Link>
        <span className="text-white/30">|</span>
        <Link href={ROUTES.contact} className="font-medium text-white no-underline transition-opacity hover:opacity-80">
          Contact
        </Link>
        <span className="text-white/30">|</span>
        <Link href={ROUTES.blog} className="font-medium text-white no-underline transition-opacity hover:opacity-80">
          Blog
        </Link>
        <span className="text-white/30">|</span>
        <Link href={ROUTES.store} className="font-medium text-white no-underline transition-opacity hover:opacity-80">
          Shop
        </Link>
      </div>
      <div className="h-0.5 w-full bg-gradient-to-r from-[#4fd0ff] via-[#ffd34d] to-[#4fd0ff]" />
      <div className="px-5 py-4 text-center">
        <p className="m-0 mb-3 text-sm text-white">Copyright 2026 – Success Chemistry®</p>
        <p className="text-xs text-white/80">Premium supplements, made in the USA.</p>
      </div>
    </footer>
  );
}
