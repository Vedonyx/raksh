import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import CreatorLinkPage from "../../components/CreatorLinkPage";
import { getLinkPage } from "../../lib/creator-store";
import { pageSlug } from "../../lib/creator-validation";
export const dynamic = "force-dynamic";
const load = cache(async (slug: string) => {
  try {
    return await getLinkPage(pageSlug(slug));
  } catch {
    return null;
  }
});
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  return data
    ? { title: data.page.title, description: data.page.description }
    : { title: "Page not found", robots: { index: false } };
}
export default async function Shortcut({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  return <CreatorLinkPage {...data} />;
}
