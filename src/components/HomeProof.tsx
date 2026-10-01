"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type Slide = { title: string; number: string; label: string; story: string; image: string; width: number; height: number; crop: string; alt: string; metrics: [string, string][] };
const youtube: Slide[] = [
  { title: "Minecraft. A ₹400 laptop. Millions watching.", number: "19.7M", label: "views on one Short", story: "A simple question became the channel's most-watched Short. The same upload brought 36.4K new subscribers.", image: "youtube-short-source.webp", width: 980, height: 836, crop: "short", alt: "YouTube Studio showing 19,759,366 views and 36.4K subscribers gained on the cheapest-laptop Short", metrics: [["19,759,366", "Total views"], ["36.4K", "Subscribers gained"]] },
  { title: "The audience behind the uploads.", number: "1.55M", label: "YouTube subscribers", story: "From the first uploads to a million-plus audience. This is a snapshot of the channel inside YouTube Studio.", image: "youtube-channel-source.webp", width: 1648, height: 1080, crop: "channel", alt: "YouTube Studio channel snapshot showing RakshXD with 1,550,060 subscribers", metrics: [["1,550,060", "Subscribers at capture"], ["RakshXD", "Main YouTube channel"]] },
];
const instagram: Slide[] = [
  { title: "The idea travelled to another platform.", number: "3.06M", label: "views on a Reel", story: "One of the highest-performing Reels, with more than three million views and 2,095 follows recorded in its insights.", image: "instagram-3m-source.webp", width: 1179, height: 2556, crop: "reel", alt: "Instagram Reel insights showing 3,068,113 views, 2,145,417 viewers and 2,095 follows", metrics: [["3,068,113", "Total views"], ["2,095", "Follows from this Reel"]] },
  { title: "Gaming curiosity, a wider audience.", number: "2.81M", label: "views on a Reel", story: "A gaming-cafe story reached more than 2.2 million accounts. The insight shows a 37-second average watch time.", image: "instagram-2m-source.webp", width: 1179, height: 2556, crop: "reel", alt: "Instagram Reel insights showing 2,811,076 views and 2,287,768 accounts reached", metrics: [["2,811,076", "Total views"], ["2,287,768", "Accounts reached"]] },
  { title: "Another upload. Another million views.", number: "1.00M", label: "views on a Reel", story: "The blue gaming-cafe Reel recorded over a million views, with a 40-second average watch time.", image: "instagram-1m-source.webp", width: 1179, height: 2556, crop: "reel", alt: "Instagram Reel insights showing 1,007,801 views and 878,785 accounts reached", metrics: [["1,007,801", "Total views"], ["878,785", "Accounts reached"]] },
  { title: "People did more than watch.", number: "91.7K", label: "shares on the 3M Reel", story: "The same three-million-view Reel recorded 112K likes, 91.7K shares and 67.3K saves. Here is its engagement view.", image: "instagram-engagement-source.webp", width: 1179, height: 2556, crop: "reel", alt: "Instagram engagement capture showing 112K likes, 91.7K shares and 67.3K saves", metrics: [["91.7K", "Shares"], ["67.3K", "Saves"]] },
];

function Capture({ slide, full = false }: { slide: Slide; full?: boolean }) {
  return <div className={`proof-capture proof-capture--${slide.crop}${full ? " proof-capture--full" : ""}`}><Image src={`/images/${slide.image}`} alt={slide.alt} width={slide.width} height={slide.height} sizes={full ? "900px" : "(max-width: 700px) 90vw, 650px"} /></div>;
}

export default function HomeProof() {
  const [platform, setPlatform] = useState<"youtube" | "instagram">("youtube");
  const [indices, setIndices] = useState({ youtube: 0, instagram: 0 });
  const [expanded, setExpanded] = useState<Slide | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const slides = platform === "youtube" ? youtube : instagram;
  const index = indices[platform];
  const slide = slides[index];
  const move = (direction: number) => setIndices(previous => ({ ...previous, [platform]: (previous[platform] + direction + slides.length) % slides.length }));
  const open = () => { setExpanded(slide); dialog.current?.showModal(); };
  return <section className="proof-showcase" id="home-proof" aria-labelledby="home-proof-title">
    <div className="wrap proof-showcase__inner">
      <header className="proof-showcase__header"><div><p className="reference-kicker">INSIDE THE ANALYTICS</p><h2 id="home-proof-title">You&apos;ve seen the videos.<br/><em>Here are the numbers.</em></h2></div><p>From YouTube Studio to Reel insights. A closer look at the audience, reach and response behind the work.</p></header>
      <div className="proof-showcase__toolbar"><div className="proof-platforms" role="group" aria-label="Analytics platform"><button type="button" aria-pressed={platform === "youtube"} onClick={() => setPlatform("youtube")}><span aria-hidden="true">▶</span> YouTube</button><button type="button" aria-pressed={platform === "instagram"} onClick={() => setPlatform("instagram")}><span aria-hidden="true">◎</span> Instagram</button></div><span className="proof-showcase__category">{platform === "youtube" ? "SHORTS & CHANNEL GROWTH" : "HIGHEST-PERFORMING REELS"}</span></div>
      <div className="proof-gallery" role="region" aria-roledescription="carousel" aria-label={`${platform === "youtube" ? "YouTube" : "Instagram"} analytics`} tabIndex={0} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }} onTouchStart={event => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={event => { if (touchStart.current === null) return; const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1); touchStart.current = null; }}>
        <article className={`proof-gallery__slide proof-gallery__slide--${platform}`} key={`${platform}-${index}`} aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}>
          <div className="proof-gallery__copy"><p className="proof-gallery__index">{platform === "youtube" ? "YOUTUBE STUDIO" : "REEL INSIGHTS"} / {String(index + 1).padStart(2, "0")}</p><div className="proof-gallery__number">{slide.number}</div><p className="proof-gallery__label">{slide.label}</p><h3>{slide.title}</h3><p className="proof-gallery__story">{slide.story}</p><dl className="proof-gallery__metrics">{slide.metrics.map(([value,label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
          <figure className="proof-gallery__visual"><button type="button" onClick={open} aria-label={`Enlarge ${slide.alt}`}><Capture slide={slide} /><span className="proof-gallery__zoom">View full insight <span aria-hidden="true">↗</span></span></button><figcaption>{platform === "youtube" ? "CAPTURED IN YOUTUBE STUDIO" : "CAPTURED IN INSTAGRAM INSIGHTS"}</figcaption></figure>
        </article>
        <div className="proof-gallery__navigation"><span aria-live="polite" aria-atomic="true">{platform === "youtube" ? "YouTube" : "Instagram"} / {String(index + 1).padStart(2, "0")} of {String(slides.length).padStart(2, "0")}</span><div className="proof-gallery__dots">{slides.map((item,i) => <button key={item.image} type="button" onClick={() => setIndices(previous => ({ ...previous, [platform]: i }))} aria-label={`Show ${item.title}`} aria-current={i === index ? "true" : undefined} />)}</div><div className="proof-gallery__arrows"><button type="button" aria-label="Previous analytics screenshot" onClick={() => move(-1)}>←</button><button type="button" aria-label="Next analytics screenshot" onClick={() => move(1)}>→</button></div></div>
      </div>
      <footer className="proof-showcase__footer"><p>These figures are from the original analytics captures, rather than live counters.</p><Link href="/work#the-proof">Explore more of the work <span>↗</span></Link></footer>
    </div>
    <dialog className="proof-dialog" ref={dialog} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} onClose={() => setExpanded(null)}><div className="proof-dialog__header"><p>{expanded?.title}</p><button type="button" autoFocus aria-label="Close full-size analytics" onClick={() => dialog.current?.close()}>Close ×</button></div>{expanded && <><Capture slide={expanded} full /><p className="proof-dialog__caption">{expanded.alt}</p></>}</dialog>
  </section>;
}
