"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
export default function SiteAnalytics() {
  const path = usePathname();
  const previous = useRef<string | null>(null);
  useEffect(() => {
    if (previous.current === path || /^\/(admin|api|go)(\/|$)/.test(path))
      return;
    previous.current = path;
    if (navigator.doNotTrack === "1") return;
    const body = JSON.stringify({
      id: crypto.randomUUID(),
      path,
      referrer: document.referrer.slice(0, 2048),
    });
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [path]);
  return null;
}
