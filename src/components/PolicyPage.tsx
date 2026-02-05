/**
 * Shared layout for policy pages (terms, shipping, payment, privacy).
 * Hero + card with consistent typography and spacing.
 */
export function PolicyPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10 sm:py-14">
      <div className="policy-hero mb-6">
        <h1 className="text-2xl font-bold text-[#0a234e] sm:text-3xl md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[#4b5563] text-base leading-relaxed sm:text-lg">
          {description}
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_40px_rgba(10,35,78,0.08)] sm:p-8">
        <div className="policy-card space-y-6 text-[#4b5563]">
          {children}
        </div>
      </div>
    </section>
  );
}

/** Section heading inside a policy card */
export function PolicyH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[#0a234e] text-lg font-semibold sm:text-xl mt-8 first:mt-0">
      {children}
    </h2>
  );
}
