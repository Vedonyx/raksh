import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CreatorLinkPage from "../../components/CreatorLinkPage";
import { getLinkPage } from "../../lib/creator-store";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Rakshit Jain official channels, consultation and collaboration links.",
};

export const dynamic = "force-dynamic";
export default async function Links() {
  const data = await getLinkPage("links");
  if (!data) notFound();
  return <CreatorLinkPage {...data} />;
}
