const reserved = new Set([
  "admin",
  "api",
  "about",
  "work",
  "consultations",
  "for-brands",
  "faq",
  "contact",
  "booking-policy",
  "videos",
  "go",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);
export const uuidPattern =
  /^[a-f\d]{8}-[a-f\d]{4}-[1-5][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
export function youtubeId(input: unknown): string {
  if (typeof input !== "string") throw new Error("Enter a YouTube video URL.");
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid YouTube video URL.");
  }
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error("Use an https YouTube URL.");
  const host = url.hostname.replace(/^www\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.split("/")[1];
  if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
    id =
      url.pathname === "/watch"
        ? url.searchParams.get("v")
        : /^\/(shorts|embed|live)\//.test(url.pathname)
          ? url.pathname.split("/")[2]
          : null;
  }
  if (!id || !/^[\w-]{11}$/.test(id))
    throw new Error("Use a YouTube watch, Shorts or share link.");
  return id;
}
export function destination(input: unknown): string {
  if (typeof input !== "string" || !input.trim() || input.length > 2048)
    throw new Error("Enter a destination URL (up to 2,048 characters).");
  const value = input.trim();
  if (/[\x00-\x20\\]/.test(value))
    throw new Error("The URL contains invalid characters.");
  if (/^\/(?!\/)/.test(value)) {
    const path = new URL(value, "https://local.invalid").pathname.toLowerCase();
    if (/^\/(admin|api|go|_next)(\/|$)/.test(path))
      throw new Error("Choose a public page, not an admin or tracking URL.");
    return value;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "Use a full https URL or a website path like /consultations.",
    );
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !url.hostname.includes(".")
  )
    throw new Error("Use a full https URL without credentials.");
  return url.href;
}
export function pageSlug(input: unknown): string {
  if (typeof input !== "string") throw new Error("Enter a page shortcut.");
  const slug = input.trim().replace(/^\//, "").toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,47}$/.test(slug) || reserved.has(slug))
    throw new Error(
      "Use 1–48 letters, numbers or hyphens. This shortcut must not be an existing website route.",
    );
  return slug;
}
export function textField(
  input: unknown,
  label: string,
  max: number,
  required = false,
): string {
  if (
    typeof input !== "string" ||
    input.trim().length > max ||
    (required && !input.trim())
  )
    throw new Error(
      `${label} ${required ? "is required and " : ""}must be under ${max} characters.`,
    );
  return input.trim();
}
