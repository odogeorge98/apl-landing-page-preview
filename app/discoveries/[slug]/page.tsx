import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/landing";
import { ArticleView } from "@/components/discoveries/ArticleView";
import { ARTICLES } from "@/components/discoveries/data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = ARTICLES[slug];
  return { title: a ? `${a.title} · Academic Pavilion` : "Not found" };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) notFound();
  return (
    <SiteShell>
      <ArticleView a={article} />
    </SiteShell>
  );
}
