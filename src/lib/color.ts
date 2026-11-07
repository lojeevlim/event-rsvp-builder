/** Mix `hex` with another colour: `pct` % of `hex`, the rest `toward`. */
export const hexMix = (hex: string, pct: number, toward: string) => {
  const c = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(c(hex, i) * (pct / 100) + c(toward, i) * (1 - pct / 100)).toString(16).padStart(2, "0")).join("");
};



/* ---- colour helpers: every template follows the same rules — one accent, tints of it for backgrounds, and text that always reads (WCAG AA) ---- */
const lum = (hex: string) => {
  const ch = (i: number) => {
    const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(0) + 0.7152 * ch(1) + 0.0722 * ch(2);
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** true when white text reads better on this colour */
export const isDarkHex = (hex: string) => contrast(hex, "#ffffff") > contrast(hex, "#18181b");
/** darkens an accent until white button text reaches 4.5:1 */
const forWhiteText = (hex: string) => {
  let c = hex;
  for (let i = 0; i < 12 && contrast(c, "#ffffff") < 4.5; i++) c = hexMix(c, 90, "#000000");
  return c;
};
/** lightens an accent until it stands out (3.5:1) on a dark page */
const forDarkPage = (hex: string) => {
  let c = hex;
  for (let i = 0; i < 12 && contrast(c, "#0b0b10") < 3.5; i++) c = hexMix(c, 88, "#ffffff");
  return c;
};

/** An accent that is safe for its mode: white button text reads on it, and on a dark page it still stands out. */
export const fitAccent = (hex: string, mode: "light" | "dark") => (mode === "dark" ? forDarkPage(forWhiteText(hex)) : forWhiteText(hex));
/** contrast of white text on a colour (4.5 or more is comfortable) */
export const whiteContrast = (hex: string) => contrast(hex, "#ffffff");
