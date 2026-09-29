import type { Metadata } from "next";
import Link from "next/link";
import BookingRequestForm from "../../components/BookingRequestForm";
import { socialLinks } from "../../lib/content";
import "./presale.css";

export const metadata: Metadata = { title: "Contact", description: "Contact Raksh Jain for creator consultations or brand collaborations." };

export default async function Contact({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const { module: requestedModule } = await searchParams;
  const selectedModule = ["01", "02", "03"].includes(requestedModule || "") ? requestedModule : "";
  const subject = encodeURIComponent(selectedModule ? `Raksh Jain Module ${selectedModule} enquiry` : "Raksh Jain consultation enquiry");
  const body = encodeURIComponent(`Hi Raksh,\n\nMy creator stage: \nModule I'm interested in: ${selectedModule}\nWhat I want help with: \nMy channel/profile: \n`);
  const creatorEmail = `mailto:rakshitjain889@gmail.com?subject=${subject}&body=${body}`;

  return <>
    <section className="page-hero wrap contact-hero"><p className="eyebrow">Contact / Start here</p><h1 className="display-title">Tell me what<br/><em>you&apos;re building.</em></h1><p className="lead narrow">Whether you need a clearer creator direction, a better performing content system or a stronger business behind it, share where you are now.</p></section>
    <section className="section section-dark"><div className="wrap contact-grid">
      <article className="contact-card"><p className="eyebrow">For creators{selectedModule && ` / Module ${selectedModule}`}</p><h2>Consultation pre-sales</h2><p>Tell us your stage and what you want to solve. We&apos;ll contact you with availability and next steps. No payment is taken today.</p><Link className="pill-button" href="#slot-request">Join pre-sales <span>↗</span></Link><a className="contact-card__email" href={creatorEmail}>Prefer email? Write to Raksh ↗</a><p className="small-note">rakshitjain889@gmail.com</p></article>
      <article className="contact-card"><p className="eyebrow">For brands</p><h2>Collaboration enquiry</h2><p>Share the brand, campaign goal, format, timeline and a contact person. Pricing and audience information are available on enquiry.</p><a className="pill-button secondary" href="mailto:raksh@servicemedia.in?subject=Raksh Jain%20brand%20collaboration">Email the brand team <span>↗</span></a><p className="small-note">raksh@servicemedia.in · +91 78701 25701</p></article>
    </div></section>
    <section className="slot-section section" id="slot-request"><div className="wrap slot-section__layout"><div className="slot-section__intro"><p className="eyebrow">Private consultation / Pre-sales open</p><h2 className="display-title">Start with<br/><em>a conversation.</em></h2><p>Choose a module and leave your details. A preferred first-call time is optional. We&apos;ll contact you personally before any booking or payment is confirmed.</p><div className="slot-section__steps"><div><span>01</span><p>Tell us what you&apos;re working on.</p></div><div><span>02</span><p>We review your request and contact you.</p></div><div><span>03</span><p>Confirm availability and next steps together.</p></div></div><Link href="/booking-policy" className="underlined-link">Read booking policies ↗</Link></div><BookingRequestForm key={selectedModule} initialModule={selectedModule} /></div></section>
    <section className="section wrap"><div className="section-heading"><div><p className="eyebrow">Elsewhere</p><h2 className="display-title">Follow the<br/><em>actual work.</em></h2></div><p>Watch the videos, see new experiments and keep up with the wider creator journey.</p></div><div className="social-list">{socialLinks.map((s) => <a href={s.href} key={s.href} target="_blank" rel="noreferrer"><span>{s.label}</span><b>↗</b></a>)}</div><p className="small-note">Consultation calls take place on Google Meet. Typical scheduling window: 12 PM to 12 AM, seven days a week, subject to availability.</p><Link href="/booking-policy" className="underlined-link">Review booking policies ↗</Link></section>
  </>;
}
