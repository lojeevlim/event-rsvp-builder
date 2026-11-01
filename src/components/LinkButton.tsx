"use client";

import { Button } from "@/components/ui";

/** lojee-ui Button that navigates: #anchors scroll, http(s) links open in a new tab. */
export default function LinkButton({ href, animation, children }: { href: string; animation?: string; children: React.ReactNode }) {
  return (
    <Button
      size="lg"
      shape="pill"
      animation={animation}
      className="px-10 text-lg font-bold"
      onClick={() => {
        if (href.startsWith("#")) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
        else window.open(href, "_blank", "noopener,noreferrer");
      }}
    >
      {children}
    </Button>
  );
}
