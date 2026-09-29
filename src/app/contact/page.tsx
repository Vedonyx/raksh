import type { Metadata } from "next";
import Link from "next/link";
import BookingRequestForm from "../../components/BookingRequestForm";
import { socialLinks } from "../../lib/content";

export const metadata: Metadata = { title: "Contact", description: "Contact Rakshit Jain for creator consultations or brand collaborations." };

export default async function Contact({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const { module: requestedModule } = await searchParams;
  const selectedModule = ["01", "02", "03"].includes(requestedModule || "") ? requestedModule : "";
  const subject = encodeURIComponent(selectedModule ? `RakshXD Module ${selectedModule} enquiry` : "RakshXD consultation enquiry");
  const body = encodeURIComponent(`Hi Raksh,\n\nMy creator stage: \nModule I'm interested in: ${selectedModule}\nWhat I want help with: \nMy channel/profile: \n`);
  const creatorEmail = `mailto:rakshitjain889@gmail.com?subject=${subject}&body=${body}`;

  return <>
    <section className="page-hero wrap contact-hero"><p className="eyebrow">Contact / Start here</p><h1 className="display-title">Tell me what<br/><em>you&apos;re building.</em></h1><p className="lead narrow">Whether you need a clearer creator direction, a better performing content system or a stronger business behind it, share where you are now.</p></section>
    <section className="section section-dark"><div className="wrap contact-grid">
      <article className="contact-card"><p className="eyebrow">For creators{selectedModule && ` / Module ${selectedModule}`}</p><h2>Consultation enquiry</h2><p>Tell me your current stage, the module you&apos;re interested in and the problem you want to solve. Request a preferred first-call time below, or email directly.</p><Link className="pill-button" href="#slot-request">Request a slot <span>↗</span></Link><a className="contact-card__email" href={creatorEmail}>Prefer email? Write to Raksh ↗</a><p className="small-note">rakshitjain889@gmail.com</p></article>
      <article className="contact-card"><p className="eyebrow">For brands</p><h2>Collaboration enquiry</h2><p>Share the brand, campaign goal, format, timeline and a contact person. Pricing and audience information are available on enquiry.</p><a className="pill-button secondary" href="mailto:raksh@servicemedia.in?subject=RakshXD%20brand%20collaboration">Email the brand team <span>↗</span></a><p className="small-note">raksh@servicemedia.in · +91 78701 25701</p></article>
    </div></section>
    <section className="slot-section section" id="slot-request"><div className="wrap slot-section__layout"><div className="slot-section__intro"><p className="eyebrow">Private Google Meet / Preferred time</p><h2 className="display-title">Request your<br/><em>first slot.</em></h2><p>Choose a module and a preferred first-call time. Calls are offered across the 12 PM–12 AM IST window in 30-minute start intervals, subject to availability.</p><div className="slot-section__steps"><div><span>01</span><p>Choose your stage and preferred time.</p></div><div><span>02</span><p>Send the prepared email request.</p></div><div><span>03</span><p>Receive availability, form and payment details.</p></div></div><Link href="/booking-policy" className="underlined-link">Read booking policies ↗</Link></div><BookingRequestForm key={selectedModule} initialModule={selectedModule} /></div></section>
    <section className="section wrap"><div className="section-heading"><div><p className="eyebrow">Elsewhere</p><h2 className="display-title">Follow the<br/><em>actual work.</em></h2></div><p>Watch the videos, see new experiments and keep up with the wider creator journey.</p></div><div className="social-list">{socialLinks.map((s) => <a href={s.href} key={s.href} target="_blank" rel="noreferrer"><span>{s.label}</span><b>↗</b></a>)}</div><p className="small-note">Consultation calls take place on Google Meet. Typical scheduling window: 12 PM to 12 AM, seven days a week, subject to availability.</p><Link href="/booking-policy" className="underlined-link">Review booking policies ↗</Link></section>
  </>;
}
