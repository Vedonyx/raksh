import Link from "next/link";
import Image from "next/image";
import type { CreatorLink, CreatorPage } from "../lib/creator-types";
import "../app/creator-pages.css";
export default function CreatorLinkPage({
  page,
  links,
}: {
  page: CreatorPage;
  links: CreatorLink[];
}) {
  return (
    <section className="creator-hub">
      <div className="creator-hub__glow" aria-hidden="true" />
      <div className="creator-hub__profile">
        <span className="creator-hub__portrait">
          <Image
            src="/images/raksh-real-cutout.png"
            alt="Rakshit Jain"
            width={1080}
            height={1440}
            priority
          />
        </span>
        <span>
          RAKSHIT JAIN <b aria-label="Official page">✦</b>
        </span>
        <h1>{page.title}</h1>
        {page.description && <p>{page.description}</p>}
      </div>
      <div className="creator-hub__links">
        {links.map((link, i) => (
          <a
            className="creator-hub__link"
            key={link.id}
            href={`/go/pageLink/${link.id}`}
            target={link.url.startsWith("/") ? undefined : "_blank"}
            rel="noopener noreferrer"
          >
            <span className="creator-hub__index">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <strong>{link.label}</strong>
              {link.description && <small>{link.description}</small>}
            </span>
            <b aria-hidden="true">↗</b>
          </a>
        ))}
        {!links.length && (
          <p className="creator-hub__empty">
            New links are on their way. Check back soon.
          </p>
        )}
      </div>
      <Link className="creator-hub__home" href="/">
        Explore the website ↗
      </Link>
    </section>
  );
}
