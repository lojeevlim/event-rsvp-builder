export const MAP_HEIGHT = { sm: 200, md: 320, lg: 440, xl: 560 } as const;

/** "lat,lng" → numbers, or null when it isn't set / valid. */
export function parseLatLng(text: string): { lat: number; lng: number } | null {
  const m = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(text);
  return m ? { lat: +m[1], lng: +m[2] } : null;
}
