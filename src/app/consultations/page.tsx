import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { modules } from "../../lib/content";

export const metadata: Metadata = { title: "Consultations", description: "Private 1:1 creator strategy with Rakshit Jain: discover what to make, improve content performance, and build a creator business." };

const chapters = [
  {
    image: "/images/raksh-city.webp",
    eyebrow: "Find your creative direction",
    headline: <>Stop guessing.<br/><em>Start creating.</em></>,
    intro: "For the creator with ambition, ideas everywhere, and no clear direction yet. We find your creator DNA, design the content system around it, and leave you with a practical starting plan.",
    prep: "Creator DNA questionnaire before the first call",
    deliverable: "15 personalized ideas + a 15-day action roadmap",
    days: [
      { n: "01", name: "Discover", detail: "Your identity, strengths, motivations, goals and the audience you want to reach." },
      { n: "02", name: "Design", detail: "Content pillars, formats, recurring concepts, idea generation, and the topics to pursue or avoid." },
      { n: "03", name: "Build", detail: "A creator blueprint, 15 personalized ideas, and a 15-day plan for publishing and testing." },
    ],
  },
  {
    image: "/images/raksh-stage.webp",
    eyebrow: "Make the work land harder",
    headline: <>Better ideas.<br/><em>Better execution.</em></>,
    intro: "For the creator who is already publishing, but knows the work can perform better. We study what your content is telling us and rebuild the decisions that shape reach and retention.",
    prep: "Performance audit and account context before the first call",
    deliverable: "A practical testing and iteration roadmap",
    days: [
      { n: "01", name: "Analyse data", detail: "Diagnose performance, spot opportunities, and decide what to stop, continue or test." },
      { n: "02", name: "Hook & retention", detail: "First frames, curiosity, pacing, loops, and frameworks that earn the next second." },
      { n: "03", name: "Content & storytelling", detail: "Structure, escalation, conflict, payoff, and a stronger creator voice." },
      { n: "04", name: "Packaging", detail: "Titles, thumbnails, first frames, captions, and a pre-publish evaluation habit." },
      { n: "05", name: "Optimize & scale", detail: "Testing, metrics, iteration, and a growth roadmap based on what actually works." },
    ],
  },
  {
    image: "/images/raksh-about.webp",
    eyebrow: "Build beyond yourself",
    headline: <>From creator<br/><em>to founder.</em></>,
    intro: "For established creators ready to make the business stronger. We look at people, process, profit, and the decisions that help an operation keep working as it grows.",
    prep: "Creator business assessment before the first call",
    deliverable: "An operating and 12–24 month direction plan",
    days: [
      { n: "01", name: "Audit", detail: "Revenue, expenses, operations, bottlenecks, and where the business is losing energy." },
      { n: "02", name: "Organize", detail: "Roles, an org chart, ownership, and the right decisions to delegate." },
      { n: "03", name: "Hire", detail: "Who to hire, when, freelancer versus employee, evaluations and trial projects." },
      { n: "04", name: "Systemize", detail: "SOPs and a clear workflow from ideas through production to analytics." },
      { n: "05", name: "Handle", detail: "Team leadership, feedback, accountability and quality standards." },
      { n: "06", name: "Profit", detail: "Monetization, costs, margins and revenue diversification." },
      { n: "07", name: "Future-proof", detail: "Rakshit's real creator revenue breakdown, the views-to-profit chain, IP, resilience, and a 12–24 month vision." },
    ],
  },
];

export default function Consultations() {
  return <>
    <section className="consult-hero">
      <div className="consult-hero__image" data-parallax="0.05" />
      <div className="wrap consult-hero__content"><p className="eyebrow">Private creator strategy / 1:1 with Rakshit</p><h1>Your next move<br/><em>starts with clarity.</em></h1><p>What to make. How to make it perform. How to build the business behind it. Three distinct stages, each with a strategy shaped around you.</p><div className="button-row"><Link className="pill-button" href="#choose">Find your module <span>↓</span></Link><span className="consult-hero__note">Private Google Meet calls · Personalized direction</span></div></div>
      <div className="consult-hero__bottom wrap"><span>STRATEGY FROM THE WORK / NOT A TEMPLATE</span><span>SCROLL ↓</span></div>
    </section>

    <section className="consult-overview section" id="choose"><div className="wrap"><div className="section-heading"><div><p className="eyebrow">Find the right starting point</p><h2 className="display-title">Three questions.<br/><em>Three deep dives.</em></h2></div><p>You can enter at the stage that fits. Every module is a sequence of private calls, with preparation and follow-up.</p></div><div className="consult-overview__grid">{modules.map((m,i)=><a href={`#module-${m.number}`} className="consult-overview__item" key={m.number}><span>0{i+1} / {m.days}</span><h3>{m.short}</h3><p>{m.audience}</p><div><strong>{m.price}</strong><b>↗</b></div></a>)}</div><p className="consult-overview__tax">All prices include taxes. Availability and booking details are confirmed on enquiry.</p></div></section>

    {chapters.map((chapter, i) => {
      const offer = modules[i];
      return <section className={`consultation-chapter consultation-chapter--${i+1}`} id={`module-${offer.number}`} key={offer.number}>
        <div className="consultation-chapter__visual"><Image src={chapter.image} alt={`Rakshit Jain creator strategy module ${offer.number}`} width={1200} height={1500}/><span>MODULE / {offer.number}</span></div>
        <div className="consultation-chapter__body"><div className="consultation-chapter__intro"><p className="eyebrow">{chapter.eyebrow}</p><p className="consultation-chapter__formal">{offer.name}</p><h2>{chapter.headline}</h2><p>{chapter.intro}</p><div className="consultation-chapter__meta"><span>{offer.days}</span><span>{offer.duration}</span><span>{offer.support}</span></div></div><div className="consultation-chapter__curriculum"><p className="eyebrow">The journey / call by call</p>{chapter.days.map(day=><div className="chapter-row" key={day.n}><span>{day.n}</span><div><h3>{day.name}</h3><p>{day.detail}</p></div></div>)}</div><div className="consultation-chapter__finish"><div><span>BEFORE WE START</span><p>{chapter.prep}</p></div><div><span>WHAT YOU TAKE AWAY</span><p>{chapter.deliverable}</p></div><div className="consultation-chapter__price"><strong>{offer.price}</strong><small>Taxes included</small></div><Link className="pill-button" href={`/contact?module=${offer.number}#slot-request`}>Request Module {offer.number} slot <span>↗</span></Link></div></div>
      </section>;
    })}

    <section className="consult-process section"><div className="wrap"><div className="section-heading"><div><p className="eyebrow">How we work together</p><h2 className="display-title">Focused calls.<br/><em>Real decisions.</em></h2></div><p>Each session builds on the previous one. The work between calls makes the strategy useful.</p></div><div className="consult-process__steps"><div><span>01 / REQUEST</span><h3>Tell me where you are.</h3><p>Choose your module and preferred first-call slot. We confirm availability and next steps by email.</p></div><div><span>02 / PREPARE</span><h3>We study the context.</h3><p>Complete the relevant pre-call form and share account, content or business information after confirmation.</p></div><div><span>03 / BUILD</span><h3>Work through the plan.</h3><p>Meet privately on Google Meet over 3, 5 or 7 calls, depending on the module.</p></div><div><span>04 / EXECUTE</span><h3>Put it to work.</h3><p>Use the included async follow-up window for reasonable questions as you implement.</p></div></div></div></section>

    <section className="consult-expectations section"><div className="wrap expectation-grid"><div><p className="eyebrow">A clear working agreement</p><h2 className="display-title">Direction is powerful.<br/><em>Execution is yours.</em></h2></div><div><p>These are strategy consultations, not done-for-you services. They do not include production, editing, thumbnail design, channel management or hiring on your behalf.</p><p>Views, subscribers, income and growth cannot be guaranteed. The plan depends on your execution and changing platform and audience conditions.</p><Link href="/booking-policy" className="underlined-link">Booking and session policies ↗</Link></div></div></section>
    <section className="cinema-ending"><div className="cinema-ending__bg" data-parallax="0.05"/><div className="wrap cinema-ending__inner"><p className="eyebrow">Ready for a clearer next move?</p><h2>Let&apos;s find<br/><em>your direction.</em></h2><p>Tell me your stage and what you want to solve.</p><Link className="pill-button" href="/contact#slot-request">Request a first-call slot <span>↗</span></Link></div></section>
  </>;
}
