"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import { Flask, List, ShoppingCart, X } from "@phosphor-icons/react";

const NAV_LINKS = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.store, label: "Shop", icon: Flask },
  { href: ROUTES.blog, label: "Blog" },
  { href: ROUTES.cart, label: "Cart" },
  { href: ROUTES.contact, label: "Contact" },
] as const;

const POLICY_LINKS = [
  { href: ROUTES.termsOfService, label: "Terms of Service" },
  { href: ROUTES.shippingReturns, label: "Shipping & Returns" },
  { href: ROUTES.paymentPolicy, label: "Payment Policy" },
  { href: ROUTES.privacyPolicy, label: "Privacy Policy" },
] as const;

/**
 * Global header – desktop: topbar + blue nav bar; mobile: topbar + hamburger with slide-out nav.
 * Touch-friendly (min 44px targets) and clear Home/Shop/Blog/Cart/Contact so users don't rely on browser back.
 */
export function Header() {
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open; close on escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && setMobileMenuOpen(false);
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onEscape);
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="header-wrapper w-full bg-white">
      <div className="topbar sticky top-0 z-[100] min-h-[98px] max-h-[98px] h-[98px] w-full border-b border-white/80 bg-white/95 pt-6 pb-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="container relative mx-auto w-full max-w-full px-4">
          <div className="topbar-inner flex min-h-[58px] max-h-[58px] h-[58px] w-full items-center justify-between md:justify-center">
            {/* Mobile: hamburger (min 44px touch target) */}
            <button
              type="button"
              aria-label="Open menu"
              className="md:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#2854a6] hover:bg-[#2854a6]/10 active:bg-[#2854a6]/20 touch-manipulation"
              onClick={() => setMobileMenuOpen(true)}
            >
              <List size={28} weight="bold" />
            </button>

            <Link
              href={ROUTES.home}
              className="brand absolute left-1/2 inline-flex -translate-x-1/2 items-center justify-center no-underline md:static md:translate-x-0"
            >
              {!logoError ? (
                <Image
                  src="/images/SC_logo_withR.png"
                  alt="Success Chemistry"
                  width={180}
                  height={58}
                  className="h-[58px] min-h-[58px] max-h-[58px] w-auto"
                  priority
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-xl font-bold text-[#2854a6] tracking-tight">
                  Success Chemistry®
                </span>
              )}
            </Link>

            {/* Mobile: Cart shortcut (min 44px touch target) */}
            <Link
              href={ROUTES.cart}
              aria-label="Cart"
              className="md:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#2854a6] hover:bg-[#2854a6]/10 active:bg-[#2854a6]/20 touch-manipulation"
            >
              <ShoppingCart size={24} weight="regular" />
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop nav bar (hidden on mobile; mobile uses slide-out) */}
      <div className="header-divider header-divider-gradient h-1 w-full shrink-0" aria-hidden />
      <div className="blue-nav hidden md:flex h-[54px] min-h-[54px] max-h-[54px] w-full items-center justify-center bg-[#2854a6] py-2">
        <nav className="container mx-auto flex h-[52px] w-full max-w-full items-center justify-center gap-8 px-4 text-xl" aria-label="Main">
          <Link href={ROUTES.home} className="min-h-[44px] min-w-[44px] flex items-center justify-center px-2 text-[21px] font-medium text-white no-underline opacity-100 transition-opacity hover:opacity-80 py-2">
            Home
          </Link>
          <Link href={ROUTES.store} className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center px-2 text-[23px] font-medium text-white no-underline opacity-100 transition-opacity hover:opacity-80 py-2">
            <Flask size={20} weight="regular" />
            Shop
          </Link>
          <Link href={ROUTES.blog} className="min-h-[44px] min-w-[44px] flex items-center justify-center px-2 text-[21px] font-medium text-white no-underline opacity-100 transition-opacity hover:opacity-80 py-2">
            Blog
          </Link>
          <Link href={ROUTES.cart} className="min-h-[44px] min-w-[44px] flex items-center justify-center px-2 text-[21px] font-medium text-white no-underline opacity-100 transition-opacity hover:opacity-80 py-2">
            Cart
          </Link>
        </nav>
      </div>
      <div className="header-divider header-divider-gradient h-1 w-full shrink-0" aria-hidden />

      {/* Mobile slide-out menu (full-screen overlay + panel) */}
      <div
        className="fixed inset-0 z-[200] md:hidden"
        aria-hidden={!mobileMenuOpen}
        style={{ pointerEvents: mobileMenuOpen ? "auto" : "none" }}
      >
        <button
          type="button"
          aria-label="Close menu"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeMenu}
        />
        <aside
          className={`absolute right-0 top-0 bottom-0 w-full max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-200 ease-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
            <span className="text-lg font-semibold text-slate-800">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              className="flex h-12 w-12 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 touch-manipulation"
              onClick={closeMenu}
            >
              <X size={24} weight="bold" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
            <ul className="space-y-1">
              {NAV_LINKS.map(({ href, label, ...rest }) => {
                const Icon = "icon" in rest ? rest.icon : undefined;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={closeMenu}
                      className="flex min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 text-[17px] font-medium text-slate-800 no-underline hover:bg-[#2854a6]/10 active:bg-[#2854a6]/15 touch-manipulation"
                    >
                      {Icon && <Icon size={22} weight="regular" className="text-[#2854a6] shrink-0" />}
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="my-4 h-px bg-slate-200" />
            <p className="px-4 pb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Policies
            </p>
            <ul className="space-y-1">
              {POLICY_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMenu}
                    className="flex min-h-[44px] items-center rounded-xl px-4 py-2.5 text-[15px] text-slate-600 no-underline hover:bg-slate-100 active:bg-slate-200 touch-manipulation"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
