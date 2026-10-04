import "server-only";
import { supabaseRest } from "./supabase";
import type {
  ContentKind,
  ContentSnapshot,
  CreatorLink,
  CreatorPage,
  CreatorVideo,
} from "./creator-types";
export const contentTables: Record<ContentKind, string> = {
  video: "creator_videos",
  videoLink: "creator_video_links",
  page: "creator_link_pages",
  pageLink: "creator_page_links",
};
async function rows<T>(table: string, filter: string): Promise<T[]> {
  const result: T[] = [];
  for (let offset = 0; ; offset += 1000) {
    const batch = await supabaseRest<T[]>(
      `${table}?select=*&${filter}&order=created_at.asc,id.asc&limit=1000&offset=${offset}`,
    );
    result.push(...batch);
    if (batch.length < 1000) return result;
  }
}
export async function getContent(admin = false): Promise<ContentSnapshot> {
  const filter = admin
    ? "id=not.is.null"
    : "published=eq.true&archived=eq.false";
  const [videos, videoLinks, pages, pageLinks] = await Promise.all([
    rows<CreatorVideo>(contentTables.video, filter),
    rows<CreatorLink>(contentTables.videoLink, filter),
    rows<CreatorPage>(contentTables.page, filter),
    rows<CreatorLink>(contentTables.pageLink, filter),
  ]);
  const publicVideoIds = new Set(videos.map((x) => x.id));
  const publicPageIds = new Set(pages.map((x) => x.id));
  return {
    videos: videos.sort((a, b) => a.position - b.position),
    videoLinks: videoLinks
      .filter((x) => admin || publicVideoIds.has(x.parent_id))
      .sort((a, b) => a.position - b.position),
    pages,
    pageLinks: pageLinks
      .filter((x) => admin || publicPageIds.has(x.parent_id))
      .sort((a, b) => a.position - b.position),
  };
}
export async function getLinkPage(slug: string) {
  const pages = await supabaseRest<CreatorPage[]>(
    `creator_link_pages?slug=eq.${encodeURIComponent(slug.toLowerCase())}&published=eq.true&archived=eq.false&select=*&limit=1`,
  );
  if (!pages[0]) return null;
  const links = await rows<CreatorLink>(
    "creator_page_links",
    `parent_id=eq.${pages[0].id}&published=eq.true&archived=eq.false`,
  );
  return {
    page: pages[0],
    links: links.sort((a, b) => a.position - b.position),
  };
}
