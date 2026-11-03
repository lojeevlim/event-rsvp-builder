import { APP_NAME } from "@/lib/brand";

// one solid colour: the app accent on light backgrounds, white on dark ones
const COLOR = { accent: "var(--color-accent-600)", light: "#ffffff" } as const;

/** The wordmark: the app name in the playful display font. `height` is in px (the width follows); use `tone="light"` on dark backgrounds. */
export default function Logo({ height = 28, tone = "accent", className }: { height?: number; tone?: keyof typeof COLOR; className?: string }) {
  return (
    <span
      role="img"
      aria-label={APP_NAME}
      className={`inline-block whitespace-nowrap leading-none tracking-wide ${className ?? ""}`}
      style={{ fontFamily: "var(--font-accent), cursive", fontSize: height * 0.95, lineHeight: `${height}px`, height, color: COLOR[tone] }}
    >
      {APP_NAME}
    </span>
  );
}
