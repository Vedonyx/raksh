import Image from "next/image";
import Link from "next/link";

const sourceFolder = "https://drive.google.com/drive/folders/1Qd2MSGyrdPK_A-4rKDFRRbNgsVJpUjJ0?usp=sharing";

export default function HomeProof() {
  return (
    <section className="proof-showcase" id="home-proof" aria-labelledby="home-proof-title">
      <div className="wrap proof-showcase__inner">
        <header className="proof-showcase__header">
          <div>
            <p className="proof-showcase__eyebrow"><span /> THE PERFORMANCE FILE / 2024—25</p>
            <h2 id="home-proof-title">The audience<br /><em>is in the details.</em></h2>
          </div>
          <p>These are real captures from Raksh&apos;s YouTube Studio and Instagram insights. Open any frame to see the numbers at full size.</p>
        </header>

        <div className="proof-showcase__chapter"><span>01 / YOUTUBE</span><span>FROM THE SUPPLIED STUDIO RECORDINGS</span></div>
        <div className="proof-showcase__youtube">
          <article className="proof-showcase__story proof-showcase__story--short">
            <div className="proof-showcase__story-copy">
              <span className="proof-showcase__index">01 — ONE SHORT</span>
              <strong className="proof-showcase__number">19.7<span>M</span></strong>
              <h3>One idea.<br />A huge response.</h3>
              <p>The Studio capture records <b>19,759,366 views</b> on a single Short and <b>36.4K subscribers gained</b> from that upload.</p>
              <div className="proof-showcase__micro"><span className="proof-showcase__micro-dot" /> SOURCE: YOUTUBE STUDIO / SHORT ANALYTICS</div>
            </div>
            <figure className="proof-showcase__screen proof-showcase__screen--short">
              <a href="/images/youtube-short-proof.webp" target="_blank" rel="noreferrer" aria-label="Open the original YouTube Short analytics frame at full size">
                <Image src="/images/youtube-short-proof.webp" alt="Original YouTube Studio frame showing 19,759,366 views and 36.4K subscribers gained on one Short" width={980} height={836} sizes="(max-width: 900px) 100vw, 790px" />
                <span>VIEW ORIGINAL FRAME ↗</span>
              </a>
              <figcaption><span>STUDIO CAPTURE / SHORT PERFORMANCE</span><b>19,759,366 VIEWS</b></figcaption>
            </figure>
          </article>

          <article className="proof-showcase__story proof-showcase__story--channel">
            <figure className="proof-showcase__screen proof-showcase__screen--channel">
              <a href="/images/youtube-subs-proof.webp" target="_blank" rel="noreferrer" aria-label="Open the original YouTube channel growth frame at full size">
                <Image src="/images/youtube-subs-proof.webp" alt="Original YouTube Studio channel-growth frame showing 1,550,060 subscribers and the growth chart" width={1648} height={1080} sizes="(max-width: 900px) 100vw, 790px" />
                <span>VIEW ORIGINAL FRAME ↗</span>
              </a>
              <figcaption><span>STUDIO CAPTURE / CHANNEL GROWTH</span><b>1,550,060 SUBSCRIBERS</b></figcaption>
            </figure>
            <div className="proof-showcase__story-copy">
              <span className="proof-showcase__index">02 — THE CHANNEL</span>
              <strong className="proof-showcase__number">1.55<span>M</span></strong>
              <h3>Built over time.<br />Visible in the data.</h3>
              <p>The supplied channel recording shows <b>1,550,060 subscribers</b> and the growth curve behind that figure.</p>
              <div className="proof-showcase__micro"><span className="proof-showcase__micro-dot" /> SOURCE: YOUTUBE STUDIO / CHANNEL GROWTH</div>
            </div>
          </article>
        </div>

        <div className="proof-showcase__chapter proof-showcase__chapter--instagram"><span>02 / INSTAGRAM</span><span>REEL INSIGHTS / SELECTED RESULTS</span></div>
        <div className="proof-showcase__instagram">
          <div className="proof-showcase__instagram-copy">
            <span className="proof-showcase__index">BEYOND ONE PLATFORM</span>
            <h3>Stories travel<br /><em>across screens.</em></h3>
            <p>The two Reel insights below record <b>3,068,113</b> and <b>1,007,801</b> views. Both are original Instagram screenshots supplied with the project.</p>
            <div className="proof-showcase__instagram-metrics"><div><strong>3.06M</strong><span>views / selected Reel</span></div><div><strong>1M+</strong><span>views / second Reel</span></div></div>
          </div>
          <div className="proof-showcase__instagram-gallery">
            <figure className="proof-showcase__reel">
              <a href="/images/instagram-3m.webp" target="_blank" rel="noreferrer" aria-label="Open the Instagram Reel insight showing 3,068,113 views at full size"><Image src="/images/instagram-3m.webp" alt="Instagram Reel insights screenshot showing 3,068,113 views" width={830} height={1800} sizes="(max-width: 650px) 90vw, 360px" /><span>OPEN FULL SIZE ↗</span></a>
              <figcaption><span>01 / REEL INSIGHTS</span><b>3,068,113 VIEWS</b></figcaption>
            </figure>
            <figure className="proof-showcase__reel">
              <a href="/images/instagram-1m.webp" target="_blank" rel="noreferrer" aria-label="Open the Instagram Reel insight showing 1,007,801 views at full size"><Image src="/images/instagram-1m.webp" alt="Instagram Reel insights screenshot showing 1,007,801 views" width={830} height={1800} sizes="(max-width: 650px) 90vw, 360px" /><span>OPEN FULL SIZE ↗</span></a>
              <figcaption><span>02 / REEL INSIGHTS</span><b>1,007,801 VIEWS</b></figcaption>
            </figure>
          </div>
        </div>

        <footer className="proof-showcase__footer">
          <p>Figures reflect the supplied screenshots at capture time; they are not live counters.</p>
          <div><a href={sourceFolder} target="_blank" rel="noreferrer">View supplied source folder ↗</a><Link href="/work#the-proof">More on the work page ↗</Link></div>
        </footer>
      </div>
    </section>
  );
}
