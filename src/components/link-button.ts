/** Class names that make a Next <Link> or <a> look like a button (the lojee-ui Button is for actions, not navigation). */
const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2";
const sizes = { sm: "px-4 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" } as const;
const variants = {
  primary: "bg-accent-600 text-white hover:bg-accent-500",
  outline: "border border-border bg-surface text-fg hover:bg-surface-muted",
  ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg",
} as const;

export const linkButton = (variant: keyof typeof variants = "primary", size: keyof typeof sizes = "md") => `${base} ${sizes[size]} ${variants[variant]}`;
