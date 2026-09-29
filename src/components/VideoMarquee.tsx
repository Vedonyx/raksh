"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { shortVideos, type ShortVideo } from "../lib/videos";

function MarqueeCard({ video, index, duplicate }: { video: ShortVideo; index: number; duplicate: boolean }) {
  const cardRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting);
      if (!entry.isIntersecting) setReady(false);
    }, {
      rootMargin: "0px",
      threshold: 0,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      try {
        const message = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (message?.event === "onReady") setReady(true);
      } catch { /* Ignore unrelated player messages. */ }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <article className="video-marquee__card" ref={cardRef} aria-hidden={duplicate ? "true" : undefined}>
    <Image src={`/images/short-${video.id}.jpg`} alt="" width={480} height={360} sizes="(max-width: 600px) 118px, 150px" />
    {active && <iframe ref={iframeRef} className={ready ? "is-ready" : undefined} src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&loop=1&playlist=${video.id}&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`} title={duplicate ? `${video.title} loop` : video.title} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" tabIndex={-1} aria-hidden="true" />}
    <a href={`https://www.youtube.com/shorts/${video.id}`} target="_blank" rel="noreferrer" tabIndex={duplicate ? -1 : 0} aria-label={`Watch ${video.title} on YouTube Shorts`}>
      <span className="video-marquee__index">SHORT / 0{index + 1}</span>
      <span className="video-marquee__title">{video.shortTitle}</span>
      <span className="video-marquee__arrow" aria-hidden="true">↗</span>
    </a>
  </article>;
}

export default function VideoMarquee() {
  return <div className="video-marquee" aria-label="Raksh Jain YouTube Shorts">
    <div className="video-marquee__top"><span>THE SHORT-FORM CUT / ON YOUTUBE</span><span>IDEAS IN MOTION <b>●</b></span></div>
    <div className="video-marquee__window">
      <div className="video-marquee__track">
        {[false, true].map((duplicate) => <div className="video-marquee__group" key={String(duplicate)} aria-hidden={duplicate ? "true" : undefined}>{shortVideos.map((video, index) => <MarqueeCard key={`${video.id}-${duplicate}`} video={video} index={index} duplicate={duplicate} />)}</div>)}
      </div>
    </div>
  </div>;
}
