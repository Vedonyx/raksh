import type { Metadata } from "next";
import Link from "next/link";
import { socialLinks } from "../lib/content";
import SiteMotion from "../components/SiteMotion";
import SiteAnalytics from "../components/SiteAnalytics";
import "./globals.css";
import "./cinematic.css";
import "./blue-system.css";
import "./reference-blue.css";
import "./reference-home-tune.css";
import "./motion-upgrades.css";
import "./raksh-proof-tune.css";
import "./client-revisions.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rakshitjain.com"),
  title: { default: "Rakshit Jain | Creator & Strategy Consultations", template: "%s | Rakshit Jain" },
  description: "Private creator strategy with Rakshit Jain. Find what to make, improve your short-form content and build the business behind it.",
  openGraph: { title: "Rakshit Jain | Creator & Strategy Consultations", description: "Private 1:1 strategy for your content and creator business.", type: "website" },
};

const nav = [
  { href: "/about", label: "About" },
  { href: "/work", label: "The Work" },
  { href: "/consultations", label: "Consultations" },
  { href: "/for-brands", label: "For Brands" },
  { href: "/faq", label: "FAQ" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteMotion />
        <SiteAnalytics />
        <div className="site-shell">
          <header className="site-header">
            <Link href="/" className="brand-mark" aria-label="Rakshit Jain home"><span>RAKSHIT <span className="acid">JAIN</span></span></Link>
            <nav className="desktop-nav" aria-label="Main navigation">{nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
            <Link className="header-cta" href="/consultations">Work with me <span>↗</span></Link>
            <details className="mobile-nav"><summary aria-label="Open menu">Menu <span>☰</span></summary><nav aria-label="Mobile navigation">{nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href="/contact">Contact</Link></nav></details>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            <div className="footer-top"><div><p className="eyebrow">Creator / Strategist / Operator</p><h2>Make the next move<br/><em>the right one.</em></h2></div><Link className="pill-button" href="/contact">Start a conversation <span>↗</span></Link></div>
            <div className="footer-bottom"><div><Link href="/" className="footer-logo">RAKSHIT <span>JAIN</span></Link><p>Rakshit Jain · New Delhi, India</p></div><div className="footer-links"><Link href="/links">Links</Link><Link href="/videos">Videos &amp; links</Link><Link href="/booking-policy">Booking policy</Link><Link href="/contact">Contact</Link></div><div className="footer-links">{socialLinks.slice(0, 2).map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div></div>
            <p className="fineprint">© {new Date().getFullYear()} Rakshit Jain. Consultation guidance does not guarantee views, subscribers, revenue or growth.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
