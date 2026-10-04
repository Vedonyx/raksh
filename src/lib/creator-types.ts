export type CreatorVideo = {
  id: string;
  title: string;
  youtube_id: string;
  description: string;
  format: "short" | "long";
  position: number;
  published: boolean;
  archived: boolean;
  created_at: string;
};
export type CreatorPage = {
  id: string;
  slug: string;
  title: string;
  description: string;
  published: boolean;
  archived: boolean;
  created_at: string;
};
export type CreatorLink = {
  id: string;
  parent_id: string;
  label: string;
  url: string;
  description: string;
  position: number;
  published: boolean;
  archived: boolean;
  created_at: string;
};
export type ContentSnapshot = {
  videos: CreatorVideo[];
  videoLinks: CreatorLink[];
  pages: CreatorPage[];
  pageLinks: CreatorLink[];
};
export type ContentKind = "video" | "videoLink" | "page" | "pageLink";
export type AnalyticsSummary = {
  views: number;
  visitors: number;
  sessions: number;
  clicks: number;
  referral_clicks: number;
  first_event: string | null;
  daily: { day: string; views: number; clicks: number }[];
  pages: { label: string; count: number }[];
  sources: { label: string; count: number }[];
  devices: { label: string; count: number }[];
  targets: { kind: string; id: string; count: number }[];
};
