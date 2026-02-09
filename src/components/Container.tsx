/**
 * Page content container – mobile-first, explicit breakpoints (see DESIGN_RULES.md).
 * Mobile: max-width 100%, padding 16px
 * Tablet (768px+): max-width 720px centered, padding 24px
 * Desktop (1024px+): max-width 1200px centered, padding 32px
 */
export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full min-w-0 max-w-container px-4 md:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
