import type { Metadata } from "next";
import Link from "next/link";
import { faqs } from "../../lib/content";

export const metadata: Metadata = { title: "FAQ", description: "Answers about Raksh Jain creator consultations, eligibility, calls, support and results." };

export default function Faq() {
  return <><section className="page-hero wrap faq-hero"><p className="eyebrow">Frequently asked questions</p><h1 className="display-title">The details,<br/><em>up front.</em></h1><p className="lead narrow">Everything you should know before choosing a module or starting a conversation.</p></section><section className="section section-dark"><div className="wrap faq-layout"><div><p className="eyebrow">Consultations</p><h2>Good questions make better decisions.</h2><Link className="underlined-link" href="/contact">Ask something else ↗</Link></div><div className="faq-list">{faqs.map((faq, i) => <details key={faq.q}><summary><span>{String(i + 1).padStart(2, "0")}</span>{faq.q}<b>+</b></summary><p>{faq.a}</p></details>)}</div></div></section><section className="section wrap closing-cta"><p className="eyebrow">Still deciding?</p><h2 className="display-title">Start with<br/><em>your current problem.</em></h2><Link className="pill-button" href="/consultations">Compare the modules <span>↗</span></Link></section></>;
}
