import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VideoEmbed from "../../components/VideoEmbed";
import { longVideos } from "../../lib/videos";
import "./work.css";

export const metadata: Metadata = {
  title: "The Work",
  description: "Watch RakshXD's selected YouTube films, explore the 19M-view Short, and see the thinking and proof behind the work.",
};

const proofFolder = "https://drive.google.com/drive/folders/1Qd2MSGyrdPK_A-4rKDFRRbNgsVJpUjJ0?usp=sharing";

const results = [
  { value: "19M+", label: "YouTube Short", note: "Audience insight + hook" },
  { value: "16M", label: "YouTube Short", note: "Personal storytelling" },
  { value: "10M", label: "YouTube Short", note: "Creative concept" },
  { value: "9M", label: "YouTube Short", note: "Opening that held attention" },
  { value: "3M / 10 days", label: "YouTube Short", note: "Fast audience response" },
  { value: "3M+", label: "Instagram Reel", note: "Cross-platform hook" },
  { value: "2.8M", label: "Instagram Reel", note: "Hook-first content" },
  { value: "1M", label: "Instagram Reel", note: "Creative concept" },
];

const analytics = [
  { image: "/images/instagram-3m.webp", alt: "Instagram Reel insights showing more than three million views", label: "01 / 3M+ REEL", detail: "Reach and engagement" },
  { image: "/images/instagram-1m.webp", alt: "Instagram Reel insights showing more than one million views", label: "02 / 1M+ REEL", detail: "Audience response" },
  { image: "/images/instagram-retention.webp", alt: "Instagram Reel retention and engagement analytics", label: "03 / RETENTION", detail: "How long people stayed" },
];

export default function Work() {
  return <div className="casework">
    <section className="cw-hero" aria-labelledby="cw-hero-title">
      <div className="cw-hero__photograph"><Image src="/images/raksh-stage.webp" alt="Raksh under a ring of lights at a creator venue" fill priority sizes="(max-width: 800px) 100vw, 58vw" /></div>
      <div className="cw-hero__shade" aria-hidden="true" />
      <div className="cw-hero__orbit" aria-hidden="true" />
      <div className="cw-shell cw-hero__inner">
        <div className="cw-hero__top"><span>RAKSHXD / SELECTED WORK</span><span>YOUTUBE · INSTAGRAM · THE OPERATION</span></div>
        <div className="cw-hero__body">
          <p className="cw-kicker"><span className="cw-pulse" /> THE WORK, IN MOTION</p>
          <h1 id="cw-hero-title">Built to<br/><em>be watched.</em></h1>
          <p>Ideas that start with a real question. Stories that give people a reason to stay. A creator operation built by learning from every response.</p>
          <a className="cw-button" href="#featured-film">Watch the work <span>↓</span></a>
        </div>
        <div className="cw-hero__bottom"><div><strong>1.5M+</strong><span>YouTube subscribers</span></div><div><strong>350M</strong><span>Total views reported by Raksh</span></div><div><strong>19M+</strong><span>On one Short</span></div><span className="cw-hero__scroll">SCROLL TO EXPLORE ↓</span></div>
      </div>
    </section>

    <nav className="cw-index" aria-label="Work page sections"><div className="cw-shell"><span>THE INDEX</span><a href="#featured-film">01 / Featured</a><a href="#selected-films">02 / Films</a><a href="#growth-story">03 / Growth</a><a href="#the-proof">04 / Proof</a><a href="#the-operation">05 / Beyond the upload</a></div></nav>

    <section className="cw-feature" id="featured-film" aria-labelledby="cw-feature-title">
      <div className="cw-shell">
        <div className="cw-heading cw-feature__heading"><div><p className="cw-kicker">01 / THE BREAKTHROUGH</p><h2 id="cw-feature-title">A small question.<br/><em>A huge response.</em></h2></div><p>Could a game run on the cheapest laptop? It was a familiar problem for the audience, framed as a question worth seeing through.</p></div>
        <div className="cw-feature__stage">
          <div className="cw-feature__visual"><div className="cw-feature__halo" aria-hidden="true" /><div className="cw-feature__player"><VideoEmbed id="aIoVDZAW85w" title="Can this game run on the cheapest laptop?" label="19M+ views · YouTube Short" /></div><span className="cw-feature__visual-tag">RAKSHXD / ORIGINAL SHORT</span></div>
          <div className="cw-feature__copy"><span className="cw-feature__counter">19M<span>+</span></span><p className="cw-kicker">ONE IDEA / MILLIONS WATCHING</p><h3>Start with the audience&apos;s reality.</h3><p>The idea paired a relatable low-budget gaming constraint with an immediate curiosity gap. Raksh built the opening, execution and payoff around a question the viewer already cared about.</p><div className="cw-feature__beats"><div><b>01</b><span>A clear audience problem</span></div><div><b>02</b><span>An instantly understood promise</span></div><div><b>03</b><span>A payoff worth staying for</span></div></div><a className="cw-text-link" href="https://www.youtube.com/shorts/aIoVDZAW85w" target="_blank" rel="noreferrer">Watch the Short on YouTube <span>↗</span></a></div>
        </div>
      </div>
    </section>

    <section className="cw-films" id="selected-films" aria-labelledby="cw-films-title"><div className="cw-shell"><div className="cw-heading"><div><p className="cw-kicker">02 / SELECTED FILMS</p><h2 id="cw-films-title">The work is<br/><em>on the screen.</em></h2></div><p>Six long-form uploads, each built around a different reason to click and a story that has to keep earning attention.</p></div><div className="cw-films__grid">{longVideos.map((video, index) => <a className="cw-film" href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer" key={video.id} aria-label={`Watch ${video.title} on YouTube`}><div className="cw-film__image"><Image unoptimized src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" width={640} height={360} sizes="(max-width: 650px) 100vw, (max-width: 950px) 50vw, 55vw"/><span className="cw-film__play" aria-hidden="true">▶</span><span className="cw-film__watch">WATCH FILM ↗</span></div><div className="cw-film__meta"><span>0{index + 1} / RAKSHXD</span><h3>{video.title}</h3><b aria-hidden="true">↗</b></div></a>)}</div><a className="cw-text-link cw-films__channel" href="https://www.youtube.com/@RakshXD" target="_blank" rel="noreferrer">Explore the full channel <span>↗</span></a></div></section>

    <section className="cw-growth" id="growth-story" aria-labelledby="cw-growth-title"><div className="cw-growth__photograph"><Image src="/images/raksh-night.webp" alt="Raksh standing in front of a city skyline at night" fill sizes="(max-width: 850px) 100vw, 48vw" /><span>FROM MAKING VIDEOS TO BUILDING MOMENTUM</span></div><div className="cw-growth__story"><p className="cw-kicker">03 / THE GROWTH STORY</p><h2 id="cw-growth-title">100K to 1M.<br/><em>Eleven months.</em></h2><p>RakshXD started on YouTube in March 2022. The 100K milestone came in November 2024; the channel reached one million subscribers in October 2025.</p><div className="cw-growth__timeline"><div><span>2022</span><p>Start publishing, testing gaming ideas and learning from real uploads.</p></div><div><span>100K</span><p>November 2024. A stronger process for ideas, hooks and formats.</p></div><div><span>1M</span><p>October 2025. Keep experimenting instead of repeating the first hit.</p></div></div><p className="cw-growth__note">Milestone dates and figures are supplied by Raksh. The linked YouTube Studio source covers 01 Oct 2024–01 Oct 2025.</p><a className="cw-text-link" href={proofFolder} target="_blank" rel="noreferrer">Open the supplied analytics <span>↗</span></a></div></section>

    <section className="cw-proof" id="the-proof" aria-labelledby="cw-proof-title"><div className="cw-shell"><div className="cw-heading"><div><p className="cw-kicker">04 / THE RECEIPTS</p><h2 id="cw-proof-title">Beyond the<br/><em>view count.</em></h2></div><p>First-party Instagram screenshots show the response behind the work. These are past content results, not a promise of future performance.</p></div><div className="cw-proof__screens">{analytics.map((item) => <figure key={item.image}><a href={item.image} target="_blank" rel="noreferrer" aria-label={`Open full-size ${item.detail} screenshot`}><Image src={item.image} alt={item.alt} width={600} height={900} sizes="(max-width: 650px) 100vw, 33vw"/><span>VIEW FULL PROOF ↗</span></a><figcaption><b>{item.label}</b>{item.detail}</figcaption></figure>)}</div><div className="cw-proof__scoreboard"><div className="cw-proof__scoreboard-heading"><p className="cw-kicker">CONTENT PERFORMANCE / SELECTED RESULTS</p><p>Additional post links will be added when supplied.</p></div><div className="cw-proof__results">{results.map((result, index) => <div key={`${result.value}-${result.note}`}><span>0{index + 1}</span><strong>{result.value}</strong><p>{result.label}<small>{result.note}</small></p></div>)}</div></div></div></section>

    <section className="cw-operation" id="the-operation" aria-labelledby="cw-operation-title"><div className="cw-operation__photograph" aria-hidden="true"/><div className="cw-shell cw-operation__inner"><div className="cw-operation__top"><p className="cw-kicker">05 / BEYOND THE UPLOAD</p><span>CREATOR → STRATEGIST → OPERATOR</span></div><div className="cw-operation__main"><div><h2 id="cw-operation-title">A channel became<br/><em>an operation.</em></h2><p>As RakshXD grew across channels, the work expanded from making a video to making the whole system better: research, concepts, production, people, quality and the next experiment.</p><Link className="cw-text-link" href="/consultations">See how Raksh works with creators <span>↗</span></Link></div><div className="cw-operation__number"><strong>20–25</strong><span>PEOPLE IN THE CREATIVE OPERATION</span></div></div><div className="cw-operation__rail"><span>THE PROCESS</span><span>FIND THE QUESTION</span><span>SHAPE THE HOOK</span><span>MAKE THE STORY</span><span>READ THE RESPONSE</span></div></div></section>

    <section className="cw-end"><div className="cw-shell"><span>THE NEXT IDEA STARTS WITH A QUESTION</span><p>What should we make<br/><em>worth watching next?</em></p><Link className="cw-button" href="/contact">Start a conversation <span>↗</span></Link></div></section>
  </div>;
}
