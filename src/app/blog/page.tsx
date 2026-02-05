import { Container } from "@/components/Container";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { BLOG_POST_SLUGS, BLOG_POST_TITLES } from "@/data/blog-posts";
import { FileText } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Blog – Product Guides | Success Chemistry",
  description:
    "Comprehensive guides and research on our premium supplement formulas. Science-backed information for better health decisions.",
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Container className="py-8 sm:py-12">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          <FileText size={32} weight="regular" className="text-[#2854a6]" />
          Product guides
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          In-depth, AI-optimized guides covering our best-selling supplements. Science-backed information to support your health decisions.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POST_SLUGS.map((slug) => (
            <li key={slug}>
              <Link
                href={ROUTES.blogPost(slug)}
                className="block rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-[#2854a6]/30 hover:shadow-md"
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  {BLOG_POST_TITLES[slug]}
                </h2>
                <span className="mt-2 inline-block text-sm font-medium text-[#2854a6]">
                  Read guide →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
