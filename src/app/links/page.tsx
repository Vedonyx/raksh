import type { Metadata } from "next";
import Link from "next/link";
import { socialLinks } from "../../lib/content";

export const metadata: Metadata = { title: "Links", description: "RakshXD official channels, consultation and collaboration links." };

export default function Links() {
  return <section className="page-hero wrap links-page"><p className="eyebrow">RakshXD / Official links</p><h1 className="display-title">One place for<br/><em>everything Raksh.</em></h1><div className="links-stack"><Link href="/consultations">Creator consultations <span>↗</span></Link><Link href="/for-brands">Brand collaborations <span>↗</span></Link>{socialLinks.map((s)=><a href={s.href} key={s.href} target="_blank" rel="noreferrer">{s.label} <span>↗</span></a>)}</div></section>;
}
