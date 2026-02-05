/**
 * Tight middle containment – shadcn-style max-width + responsive padding.
 * Use for all page content (above footer, below header) in SCV2.
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
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
