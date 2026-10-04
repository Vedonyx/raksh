import type { Metadata } from "next";
import CreatorVideoGallery from "../../components/CreatorVideoGallery";
import { getContent } from "../../lib/creator-store";
import "../creator-pages.css";
export const metadata: Metadata = {
  title: "Videos & links",
  description:
    "Watch Rakshit Jain's videos and find the products, tools and referral links mentioned in them.",
};
export const dynamic = "force-dynamic";
export default async function Videos() {
  const data = await getContent();
  return (
    <section className="creator-library wrap">
      <header>
        <p className="eyebrow">RAKSHIT JAIN / FROM THE VIDEOS</p>
        <h1>
          The video.
          <br />
          <em>The links. All here.</em>
        </h1>
        <p>
          Something caught your eye? Watch the upload and find its links below.
        </p>
        <small>
          Some links may be referral or affiliate links. Rakshit may earn a
          commission when you use them.
        </small>
      </header>
      <CreatorVideoGallery videos={data.videos} links={data.videoLinks} />
    </section>
  );
}
