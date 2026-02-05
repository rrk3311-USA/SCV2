"use client";

import ReactMarkdown from "react-markdown";

type Props = { content: string };

export function BlogPostBody({ content }: Props) {
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children, ...props }) => (
          <a href={href} {...props} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
