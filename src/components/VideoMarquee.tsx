"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { longVideos, shortVideos, type LongVideo, type ShortVideo } from "../lib/videos";
type Format = "shorts" | "long";

function MarqueeCard({ video, format, duplicate }: { video: LongVideo | ShortVideo; format: Format; duplicate: boolean }) {
  const cardRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const element = cardRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting);
      if (!entry.isIntersecting) setReady(false);
    }, { threshold: 0.05 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow || !/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(event.origin)) return;
      try {
        const message = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (message?.event === "onReady" || message?.info?.playerState === 1) setReady(true);
      } catch { /* Other player messages do not affect the poster. */ }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  const isShort = format === "shorts";
  return <article className="video-marquee__card" ref={cardRef} aria-hidden={duplicate || undefined}>
    <Image src={`/images/${isShort ? "short" : "film"}-${video.id}.jpg`} alt="" width={isShort ? 480 : 640} height={isShort ? 854 : 360} sizes={isShort ? "150px" : "280px"} />
    {active && <iframe ref={iframeRef} className={ready ? "is-ready" : undefined} onLoad={() => iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: video.id }), "https://www.youtube-nocookie.com")} src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&loop=1&playlist=${video.id}&controls=0&playsinline=1&rel=0&enablejsapi=1`} title={video.title} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" tabIndex={-1} aria-hidden="true" />}
    <a href={isShort ? `https://www.youtube.com/shorts/${video.id}` : `https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer" tabIndex={duplicate ? -1 : 0} aria-label={`Watch ${video.title}${"views" in video ? `, ${video.views} views` : ""} on YouTube`}>
      {"views" in video && <span className="video-marquee__views">{video.views}<small> views</small></span>}
      <span className="video-marquee__index">{isShort ? "YOUTUBE SHORT" : "LONG-FORM"}</span><span className="video-marquee__title">{video.shortTitle}</span><span className="video-marquee__arrow" aria-hidden="true">↗</span>
    </a>
  </article>;
}
export default function VideoMarquee() {
  const [format, setFormat] = useState<Format>("shorts");
  const [paused, setPaused] = useState(false);
  const videos = format === "shorts" ? shortVideos : longVideos;
  return <div className={`video-marquee video-marquee--${format}${paused ? " is-paused" : ""}`} aria-label="Selected Rakshit Jain videos">
    <div className="video-marquee__top"><span>{format === "shorts" ? "MOST-WATCHED SHORTS" : "THE LONG-FORM CUT"} / YOUTUBE</span><div className="video-marquee__controls"><div className="video-format" role="group" aria-label="Video format"><button type="button" aria-pressed={format === "shorts"} onClick={() => setFormat("shorts")}>Shorts</button><button type="button" aria-pressed={format === "long"} onClick={() => setFormat("long")}>Long-form</button></div><button className="video-marquee__pause" type="button" aria-label={paused ? "Resume video strip" : "Pause video strip"} onClick={() => setPaused(!paused)}>{paused ? "▶" : "Ⅱ"}</button></div></div>
    <div className="video-marquee__window"><div className="video-marquee__track" key={format}>{[false, true].map(duplicate => <div className="video-marquee__group" key={String(duplicate)} aria-hidden={duplicate || undefined}>{videos.map(video => <MarqueeCard key={video.id} video={video} format={format} duplicate={duplicate} />)}</div>)}</div></div>
    <p className="video-marquee__note">{format === "shorts" ? "Public YouTube view counts at selection. Hover to pause." : "A little more time with the idea. Hover to pause."}</p>
  </div>;
}
