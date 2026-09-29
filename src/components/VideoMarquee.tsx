"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { longVideos, type LongVideo } from "../lib/videos";

function MarqueeCard({ video, index, duplicate }: { video: LongVideo; index: number; duplicate: boolean }) {
  const cardRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "160px",
      threshold: 0,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <article className="video-marquee__card" ref={cardRef} aria-hidden={duplicate ? "true" : undefined}>
    <Image unoptimized src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" width={480} height={270} sizes="(max-width: 600px) 78vw, 310px" />
    {active && <iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&loop=1&playlist=${video.id}&controls=0&playsinline=1&rel=0&modestbranding=1`} title={duplicate ? `${video.title} loop` : video.title} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" tabIndex={-1} aria-hidden="true" />}
    <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer" tabIndex={duplicate ? -1 : 0} aria-label={`Watch ${video.title} on YouTube`}>
      <span className="video-marquee__index">RAKSHXD / 0{index + 1}</span>
      <span className="video-marquee__title">{video.shortTitle}</span>
      <span className="video-marquee__arrow" aria-hidden="true">↗</span>
    </a>
  </article>;
}

export default function VideoMarquee() {
  return <div className="video-marquee" aria-label="RakshXD long-form videos">
    <div className="video-marquee__top"><span>ON THE CHANNEL / LONG FORM</span><span>SIX STORIES, ALWAYS MOVING <b>●</b></span></div>
    <div className="video-marquee__window">
      <div className="video-marquee__track">
        {[false, true].map((duplicate) => <div className="video-marquee__group" key={String(duplicate)} aria-hidden={duplicate ? "true" : undefined}>{longVideos.map((video, index) => <MarqueeCard key={`${video.id}-${duplicate}`} video={video} index={index} duplicate={duplicate} />)}</div>)}
      </div>
    </div>
  </div>;
}
