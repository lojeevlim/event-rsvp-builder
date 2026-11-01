"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** A read-only link with a copy button. */
export default function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the field is selectable */
    }
  }
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-surface-muted py-1 pl-4 pr-1">
      <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Event link" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      <button type="button" onClick={copy} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-accent-500">
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
