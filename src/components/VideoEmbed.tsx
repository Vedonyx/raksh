"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = { id: string; title: string; label?: string };

export default function VideoEmbed({ id, title, label }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const url = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1&rel=0&enablejsapi=1`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting);
      if (!entry.isIntersecting) setReady(false);
    }, { rootMargin: "100px" });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow || !/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(event.origin)) return;
      try {
        const message = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (message?.event === "onReady" || message?.info?.playerState === 1) setReady(true);
      } catch { /* Ignore unrelated player messages. */ }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="video-card" ref={containerRef}>
      <div className={`video-frame video-frame--poster${ready ? " is-ready" : ""}`}>
        <Image className="video-frame__poster" src={`/images/short-${id}.jpg`} alt="" fill sizes="(max-width: 650px) 85vw, 350px" />
        {!ready && <a className="video-frame__fallback" href={`https://www.youtube.com/shorts/${id}`} target="_blank" rel="noreferrer" aria-label={`Play ${title} on YouTube`}><span aria-hidden="true">▶</span></a>}
        {active && <iframe
          ref={iframeRef}
          onLoad={() => iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id }), "https://www.youtube-nocookie.com")}
          src={url}
          title={title}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />}
      </div>
      <div className="video-caption">
        <div><span className="eyebrow">{label || "Featured video"}</span><h3>{title}</h3></div>
        <a href={`https://www.youtube.com/shorts/${id}`} target="_blank" rel="noreferrer" aria-label={`Watch ${title} on YouTube`}>↗</a>
      </div>
    </div>
  );
}
