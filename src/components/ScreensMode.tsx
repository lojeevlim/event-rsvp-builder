"use client";

import { useEffect, useRef } from "react";

/** Makes the page scroll one screen at a time: each section snaps into place. It finds the scrolling box it sits in (the editor's preview) or falls back to the whole page, and undoes itself on leaving. */
export default function ScreensMode() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let el: HTMLElement | null = marker.current?.parentElement ?? null;
    while (el && !/(auto|scroll)/.test(getComputedStyle(el).overflowY)) el = el.parentElement;
    const target = el ?? document.documentElement;
    const before = target.style.scrollSnapType;
    target.style.scrollSnapType = "y mandatory";
    return () => {
      target.style.scrollSnapType = before;
    };
  }, []);
  return <span ref={marker} hidden />;
}
