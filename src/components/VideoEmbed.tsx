"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = { id: string; title: string; label?: string };

export default function VideoEmbed({ id, title, label }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const url = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1&rel=0&enablejsapi=1`;

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

  return (
    <div className="video-card">
      <div className={`video-frame video-frame--poster${ready ? " is-ready" : ""}`}>
        <Image className="video-frame__poster" src={`/images/short-${id}.jpg`} alt="" fill sizes="(max-width: 650px) 85vw, 350px" />
        {!ready && <a className="video-frame__fallback" href={`https://www.youtube.com/shorts/${id}`} target="_blank" rel="noreferrer" aria-label={`Play ${title} on YouTube`}><span aria-hidden="true">▶</span></a>}
        <iframe
          ref={iframeRef}
          src={url}
          title={title}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="video-caption">
        <div><span className="eyebrow">{label || "Featured video"}</span><h3>{title}</h3></div>
        <a href={`https://www.youtube.com/shorts/${id}`} target="_blank" rel="noreferrer" aria-label={`Watch ${title} on YouTube`}>↗</a>
      </div>
    </div>
  );
}
