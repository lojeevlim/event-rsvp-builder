// The RSVP mark: the letters R, S, V and P drawn as ONE continuous stroke (each letter sweeps into the next), in the same style as the lojeeUI mark.
const PATH = "M6 28V4H13A6 6 0 0 1 13 16H9C13 17 14 28 21 28Q27 28 27 22C27 28 40 28 40 21C40 14 27 17 27 10C27 3 40 3 40 8C42 4 44 4 47 4C49 18 52 28 56 28C60 28 63 18 65 4C66 12 72 14 72 28V4H79A6 6 0 0 1 79 16H72";

// one solid colour: the app accent on light backgrounds, white on dark ones
const COLOR = { accent: "var(--color-accent-600)", light: "#ffffff" } as const;

/** The full RSVP logo. `height` is in px (the width follows); use `tone="light"` on dark backgrounds. */
export default function Logo({ height = 28, tone = "accent", className }: { height?: number; tone?: keyof typeof COLOR; className?: string }) {
  return (
    <svg width={(height * 92) / 32} height={height} viewBox="0 0 92 32" fill="none" role="img" aria-label="Event RSVP" className={className}>
      <path d={PATH} stroke={COLOR[tone]} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
