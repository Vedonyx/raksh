"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const targets = document.querySelectorAll<HTMLElement>(
      ".section-heading, .module-cinema, .feature-layout, .case-panel, .proof-grid figure, .result-grid article, .timeline-row, .offer-card, .contact-card, .story-collage, .work-photo-story__grid, .about-film, .brand-editorial, .brand-video-grid .video-card, .chapter-row, .consultation-chapter__intro, .consultation-chapter__visual, .consult-overview__item, .consult-process__steps>div, .stage-grid article, .reference-avatar__copy, .reference-avatar__stage, .reference-journey__card, .reference-why__grid>div, .reference-work__feature, .reference-work__stats>div, .reference-price, .reference-brands__names span, .reference-brands__videos .video-card, .reference-faq__list details, .work-hero__film, .work-process__story, .work-process__step, .work-longform__card, .work-proofnote, .work-lastword, .recognition__grid article, .brand-storyboard__grid article, .slot-section__intro, .slot-form, .narrative-columns p, .faq-list details, .social-list a"
    );
    const newTargets = document.querySelectorAll<HTMLElement>(".proof-showcase__header, .proof-gallery, .revenue-preview, .module-revenue");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { rootMargin: "0px 0px 0px 0px", threshold: 0.01 }
    );
    targets.forEach((target, index) => {
      target.classList.add("reveal-on-scroll");
      target.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 45}ms`);
      observer.observe(target);
    });
    newTargets.forEach((target) => {
      target.classList.add("reveal-on-scroll");
      observer.observe(target);
    });

    const proofCards = document.querySelectorAll<HTMLElement>(".avatar-proof");
    const popObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-popped");
        popObserver.unobserve(entry.target);
      }
    }), { rootMargin: "0px 0px -6% 0px", threshold: 0.2 });
    proofCards.forEach((card, index) => {
      card.style.setProperty("--pop-delay", `${index * 145}ms`);
      popObserver.observe(card);
    });
    document.documentElement.classList.add("motion-ready");

    const parallax = document.querySelectorAll<HTMLElement>("[data-parallax]");
    const scrollImages = document.querySelectorAll<HTMLElement>("[data-scroll-image]");
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty("--page-progress", `${Math.min(100, Math.max(0, window.scrollY / scrollable * 100))}%`);
      parallax.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const speed = Number(element.dataset.parallax || "0.08");
        element.style.setProperty("--parallax-y", `${Math.round((window.innerHeight / 2 - rect.top - rect.height / 2) * speed)}px`);
      });
      scrollImages.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const distance = (window.innerHeight / 2 - rect.top - rect.height / 2) / window.innerHeight;
        element.style.setProperty("--image-pan", `${Math.max(-18, Math.min(18, Math.round(distance * 30)))}px`);
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      popObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      document.documentElement.classList.remove("motion-ready");
      document.documentElement.style.removeProperty("--page-progress");
    };
  }, [pathname]);

  return null;
}
