import { Container } from "@/components/Container";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { BLOG_POST_SLUGS, BLOG_POST_TITLES } from "@/data/blog-posts";
import { LEGACY_BLOG_ARTICLES } from "@/data/legacy-blog-articles";
import { FileText, Newspaper } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Blog – Product Guides & Articles | Success Chemistry",
  description:
    "Comprehensive guides and research on our premium supplement formulas. Science-backed information for better health decisions.",
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Container className="py-8 sm:py-12">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          <FileText size={32} weight="regular" className="text-[#2854a6]" />
          Blog
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Product guides and articles on supplements, eye health, and wellness. Science-backed information to support your health decisions.
        </p>

        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800">
            <FileText size={24} weight="regular" className="text-[#2854a6]" />
            Product guides
          </h2>
          <p className="mb-6 max-w-2xl text-sm text-slate-600">
            In-depth guides covering our best-selling supplements.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_POST_SLUGS.map((slug) => (
              <li key={slug}>
                <Link
                  href={ROUTES.blogPost(slug)}
                  className="block rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-[#2854a6]/30 hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {BLOG_POST_TITLES[slug]}
                  </h3>
                  <span className="mt-2 inline-block text-sm font-medium text-[#2854a6]">
                    Read guide →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800">
            <Newspaper size={24} weight="regular" className="text-[#2854a6]" />
            More articles
          </h2>
          <p className="mb-6 max-w-2xl text-sm text-slate-600">
            Eye health, natural supplements, and wellness reads from our blog.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LEGACY_BLOG_ARTICLES.map(({ slug, title }) => (
              <li key={slug}>
                <Link
                  href={`/blog-articles/${slug}.html`}
                  className="block rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-[#2854a6]/30 hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-3">
                    {title}
                  </h3>
                  <span className="mt-2 inline-block text-sm font-medium text-[#2854a6]">
                    Read article →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </div>
  );
}
