import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { BLOG_POST_SLUGS, BLOG_POST_TITLES, isBlogSlug } from "@/data/blog-posts";
import { ROUTES } from "@/lib/constants";
import { BlogPostBody } from "./BlogPostBody";
import type { Metadata } from "next";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return BLOG_POST_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isBlogSlug(slug)) return { title: "Not Found" };
  const title = BLOG_POST_TITLES[slug];
  return {
    title: `${title} – Success Chemistry Blog`,
    description: `Comprehensive guide: ${title}. Science-backed information for your health.`,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  if (!isBlogSlug(slug)) notFound();

  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {
    notFound();
  }

  // Point product links to this site's product pages (relative /product/SLUG)
  const content = raw
    .replace(/https:\/\/successchemistry\.com\/product\/([^)\s#]+)/g, "/product/$1")
    .replace(/https:\/\/successchemistry\.com/g, "");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Container className="py-8 sm:py-12">
        <p className="text-sm text-slate-500">
          <a href={ROUTES.blog} className="hover:text-[#2854a6]">
            ← Blog
          </a>
        </p>
        <article className="blog-article mt-6 max-w-3xl text-slate-700 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:text-lg [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1 [&_a]:text-[#2854a6] [&_a]:underline [&_a]:hover:no-underline">
          <BlogPostBody content={content} />
        </article>
      </Container>
    </div>
  );
}
