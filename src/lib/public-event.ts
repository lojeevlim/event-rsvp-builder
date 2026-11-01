import { cacheTag } from "next/cache";
import { getPublicEvent } from "./data";

/** The public event page data, cached until the event is saved, hidden or its owner is disabled (tag `event:<slug>`). */
export async function getCachedPublicEvent(slug: string) {
  "use cache";
  cacheTag(`event:${slug}`);
  return getPublicEvent(slug);
}
