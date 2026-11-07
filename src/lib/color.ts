/** Mix `hex` with another colour: `pct` % of `hex`, the rest `toward`. */
export const hexMix = (hex: string, pct: number, toward: string) => {
  const c = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(c(hex, i) * (pct / 100) + c(toward, i) * (1 - pct / 100)).toString(16).padStart(2, "0")).join("");
};
