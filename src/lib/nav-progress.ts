/**
 * The navigation progress bar's state, kept outside React on purpose: going to "Super admin" swaps one layout for another,
 * which unmounts the navbar (and the bar inside it) and mounts a new one. State that lives here survives that swap, so the
 * bar keeps going instead of being cut off or left hanging.
 */
export type NavProgressState = { value: number; shown: boolean };

const IDLE: NavProgressState = { value: 0, shown: false };
let state = IDLE;
const subs = new Set<() => void>();
const set = (p: Partial<NavProgressState>) => {
  state = { ...state, ...p };
  subs.forEach((l) => l());
};

export const subscribeNavProgress = (l: () => void) => {
  subs.add(l);
  return () => void subs.delete(l);
};
export const getNavProgress = () => state;
export const getServerNavProgress = () => IDLE;

let running = false;
let startedAt = 0;
let lastPath: string | null = null;
let tick: ReturnType<typeof setInterval> | undefined;
let guard: ReturnType<typeof setTimeout> | undefined;
let fade: ReturnType<typeof setTimeout> | undefined;
let wait: ReturnType<typeof setInterval> | undefined;

const clearRun = () => {
  clearInterval(tick);
  clearTimeout(guard);
  clearInterval(wait);
};

/** Call when a client-side navigation begins (links are picked up on their own; router.push calls this by hand). */
export function startNavProgress() {
  if (running) return;
  running = true;
  startedAt = Date.now();
  clearTimeout(fade);
  set({ value: 8, shown: true });
  // each step covers a share of what is left, so it slows down the longer the wait
  tick = setInterval(() => set({ value: Math.min(92, state.value + Math.max(0.4, (92 - state.value) * 0.07)) }), 220);
  guard = setTimeout(finish, 15000); // a navigation that never changes the route must not leave the bar hanging
}

// a navigation that is over almost at once still shows the bar for a moment, so it is never just a flicker
function finish() {
  if (!running) return;
  running = false;
  clearRun();
  fade = setTimeout(() => {
    set({ value: 100 });
    fade = setTimeout(() => {
      set({ shown: false });
      fade = setTimeout(() => set({ value: 0 }), 300);
    }, 260);
  }, Math.max(0, 700 - (Date.now() - startedAt)));
}

/** The route changed, but the new screen may still be a loading skeleton: keep going until no "Loading…" placeholder is left. */
export function navPathChanged(path: string) {
  if (lastPath === null) {
    lastPath = path;
    return;
  }
  if (path === lastPath) return;
  lastPath = path;
  if (!running) return; // a change we did not start (back button, redirect): nothing to show
  clearInterval(wait);
  const since = Date.now();
  wait = setInterval(() => {
    if (document.querySelector('[role="status"][aria-label^="Loading"]') === null || Date.now() - since > 12000) {
      clearInterval(wait);
      finish();
    }
  }, 120);
}

let installed = false;
/** Listens (once) for clicks on internal links. */
export function installNavProgress() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  document.addEventListener(
    "click",
    (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return; // other sites and same-page jumps don't navigate
      startNavProgress();
    },
    true,
  );
}
