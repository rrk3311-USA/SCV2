"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";

type Props = { content: string };

/** Internal link: starts with / but not // (protocol-relative). */
function isInternalLink(href: string | undefined): boolean {
  if (!href || typeof href !== "string") return false;
  return href.startsWith("/") && !href.startsWith("//");
}

export function BlogPostBody({ content }: Props) {
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children, ...props }) => {
          if (isInternalLink(href)) {
            return (
              <Link href={href} {...props}>
                {children}
              </Link>
            );
          }
          const isExternal = href?.startsWith("http");
          return (
            <a
              href={href}
              {...props}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
