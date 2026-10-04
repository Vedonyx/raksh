"use client";
import Image from "next/image";
import { useState } from "react";
import type { CreatorLink, CreatorVideo } from "../lib/creator-types";
export default function CreatorVideoGallery({
  videos,
  links,
}: {
  videos: CreatorVideo[];
  links: CreatorLink[];
}) {
  const [format, setFormat] = useState("all");
  const [playing, setPlaying] = useState<string | null>(null);
  const visible = videos.filter((v) => format === "all" || v.format === format);
  return (
    <>
      <div
        className="creator-video-filters"
        role="group"
        aria-label="Filter videos"
      >
        {[
          ["all", "All videos"],
          ["short", "Shorts"],
          ["long", "Long-form"],
        ].map(([key, label]) => (
          <button
            type="button"
            aria-pressed={format === key}
            key={key}
            onClick={() => {
              setFormat(key);
              setPlaying(null);
            }}
          >
            {label}
          </button>
        ))}
        <span>
          {visible.length} {visible.length === 1 ? "video" : "videos"}
        </span>
      </div>
      <div className="creator-videos">
        {visible.map((video) => {
          const referrals = links.filter((link) => link.parent_id === video.id);
          return (
            <article className="creator-video" key={video.id}>
              <div className="creator-video__player">
                {playing === video.id ? (
                  <>
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&rel=0&playsinline=1`}
                      title={video.title}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                    <button
                      className="creator-video__close"
                      type="button"
                      onClick={() => setPlaying(null)}
                      aria-label="Close video"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <button
                    className="creator-video__poster"
                    type="button"
                    onClick={() => setPlaying(video.id)}
                    aria-label={`Play ${video.title}`}
                  >
                    <Image
                      src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`}
                      alt=""
                      fill
                      sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                    />
                    <span aria-hidden="true">▶</span>
                    <small>{video.format === "short" ? "SHORT" : "FILM"}</small>
                  </button>
                )}
              </div>
              <div className="creator-video__body">
                <h2>{video.title}</h2>
                {video.description && <p>{video.description}</p>}
                <a
                  className="creator-video__watch"
                  href={`/go/video/${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on YouTube ↗
                </a>
                {referrals.length > 0 && (
                  <div className="creator-video__links">
                    <span>LINKS FROM THIS VIDEO</span>
                    {referrals.map((link) => (
                      <a
                        href={`/go/videoLink/${link.id}`}
                        key={link.id}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                      >
                        <span>
                          <strong>{link.label}</strong>
                          {link.description && (
                            <small>{link.description}</small>
                          )}
                        </span>
                        <b aria-hidden="true">↗</b>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!visible.length && (
        <p className="creator-hub__empty">New videos will appear here soon.</p>
      )}
    </>
  );
}
