"use client";

import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { Alert, Button, Modal, Spinner } from "@/components/ui";
import { MAP_HEIGHT, parseLatLng } from "@/lib/map";
import type { RouteSummary } from "@/components/MapInner";

// maplibre is large and needs the browser, so it loads on demand and never renders on the server
const MapInner = dynamic(() => import("@/components/MapInner"), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-3xl bg-surface-muted" />,
});

function duration(seconds: number) {
  const m = Math.max(1, Math.round(seconds / 60));
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ""}`.trim() : `${m} min`;
}

export default function MapBlock({ title, location, zoom, size, interactive, avatar = "" }: { title: string; location: string; zoom: string; size: keyof typeof MAP_HEIGHT; interactive: boolean; avatar?: string }) {
  const pos = parseLatLng(location);
  const [from, setFrom] = useState<[number, number] | null>(null);
  const [summary, setSummary] = useState<(RouteSummary & { arrive: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [askOpen, setAskOpen] = useState(false); // our own "enable location" dialog
  const [blocked, setBlocked] = useState(false); // the browser refused (or had already blocked) location
  const resultRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [retryFailed, setRetryFailed] = useState(false); // we asked again and the browser still said no
  // if location was blocked and the visitor allows it from the address bar, carry on by itself
  useEffect(() => {
    if (!askOpen || !blocked) return;
    let status: PermissionStatus | undefined;
    const onChange = () => {
      if (status?.state === "granted") locate();
    };
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((st) => {
        status = st;
        st.addEventListener("change", onChange);
      })
      .catch(() => {});
    return () => status?.removeEventListener("change", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askOpen, blocked]);

  // focus the answer: when the arrival time arrives, bring it into view
  useEffect(() => {
    if (summary) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [summary]);

  if (!pos) return null;
  const z = Math.min(18, Math.max(3, Number(zoom) || 14));

  /** the button: skip our dialog when location is already allowed, otherwise explain first */
  async function start() {
    setError("");
    try {
      const state = (await navigator.permissions?.query({ name: "geolocation" as PermissionName }))?.state;
      if (state === "granted") return locate();
      setBlocked(state === "denied");
    } catch {
      setBlocked(false);
    }
    setRetryFailed(false);
    setAskOpen(true);
  }

  function locate() {
    if (!navigator.geolocation) {
      setAskOpen(false);
      return setError("Your browser can't share its location.");
    }
    setBusy(true);
    setError("");
    setSummary(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setFrom([p.coords.longitude, p.coords.latitude]);
        setAskOpen(false);
      },
      (e) => {
        setBusy(false);
        if (e.code === e.PERMISSION_DENIED) {
          setRetryFailed(blocked); // a second "no" in a row: say so, instead of looking like nothing happened
          setBlocked(true);
        }
        else {
          setAskOpen(false);
          setError("We couldn't find your location. Please try again.");
        }
      },
      { timeout: 12000, maximumAge: 60000 },
    );
  }

  return (
    <div className="grid w-full gap-4">
      <div className={`w-full ${interactive ? "" : "pointer-events-none"}`}>
        <MapInner
          {...pos}
          zoom={z}
          label={title}
          height={MAP_HEIGHT[size]}
          interactive={interactive}
          avatar={avatar}
          from={interactive ? from : null}
          profile="driving"
          onRoute={(r) => {
            // the arrival time is worked out once, when the route arrives (as if leaving right now)
            setSummary({ ...r, arrive: new Date(Date.now() + (r.duration ?? 0) * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) });
            setBusy(false);
          }}
          onRouteError={() => {
            setBusy(false);
            setError("We couldn't work out a route from where you are.");
          }}
        />
      </div>

      {interactive && (
        <div className="grid justify-items-center gap-3">
          {from ? (
            <Button variant="outline" size="md" shape="pill" icon="map-pin" loading={busy} onClick={start}>
              Update my location
            </Button>
          ) : (
            /* a call-to-action card: icon, headline, hint and an arrow — the whole row is the button */
            <button
              type="button"
              disabled={busy}
              onClick={start}
              className="group flex w-full max-w-md items-center gap-4 rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-accent-500 hover:shadow-lg disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white shadow-md transition-transform duration-200 group-hover:scale-105">
                {busy ? <Spinner size="sm" /> : <MapPin size={22} />}
              </span>
              <span className="grid min-w-0 gap-0.5">
                <span className="font-bold leading-tight">{busy ? "Finding you…" : "How long will it take me?"}</span>
                <span className="text-xs text-soft">
                  <b className="font-semibold text-accent-600"><span className="pointer-coarse:hidden">Click</span><span className="hidden pointer-coarse:inline">Tap</span> here</b> to get your route and arrival time
                </span>
              </span>
              <ArrowRight size={20} className="ml-auto shrink-0 text-soft transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent-600" />
            </button>
          )}


          {summary && summary.duration !== undefined && (
            <motion.div
              ref={resultRef}
              key={`${summary.distance}-${summary.duration}`}
              initial={{ opacity: 0, scale: 0.9, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="result-focus grid gap-1 rounded-2xl border-2 border-accent-500 bg-surface px-6 py-4 text-center"
            >
              <p className="font-display text-2xl font-bold">
                {duration(summary.duration)} <span className="text-base font-normal text-soft">· {(summary.distance / 1000).toFixed(1)} km</span>
              </p>
              <p className="text-sm text-soft">
                Leave now and you&apos;ll arrive around{" "}
                <b className="text-fg">{summary.arrive}</b>
              </p>
            </motion.div>
          )}
          {error && <Alert variant="error" closable onClose={() => setError("")}>{error}</Alert>}
        </div>
      )}

      {/* rendered on <body>: inside a section it would be trapped by the section's own layout box and drawn under the sections below */}
      {askOpen &&
        createPortal(
                <Modal open onClose={() => { setAskOpen(false); setBusy(false); }} title={blocked ? "Turn on your location" : "Share your location?"} className="max-w-md">
                  <div className="grid justify-items-center gap-5 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/10 text-accent-600">
                      {blocked ? <ShieldCheck size={30} /> : <Navigation size={30} />}
                    </span>
                    {blocked ? (
                      <div className="grid gap-2 text-sm text-fg-muted">
                        <p>Location is off for this page, so we can&apos;t work out the route.</p>
                        {retryFailed ? (
                          <p className="rounded-lg bg-surface-muted px-3 py-2 text-xs text-fg">
                            Your browser still says no. Tap the lock icon next to the address and allow Location — we&apos;ll carry on by ourselves.
                          </p>
                        ) : (
                          <p className="text-xs">Press the button to ask again.</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-fg-muted">
                        We&apos;ll use your location once to draw the way to <b className="text-fg">{title || "the event"}</b> and estimate when you&apos;d arrive.
                        It isn&apos;t saved, and it only goes to the route service to calculate the trip.
                      </p>
                    )}
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button shape="pill" loading={busy} onClick={locate}>{blocked ? "Turn on location" : "Allow location"}</Button>
                      <Button variant="ghost" shape="pill" onClick={() => { setAskOpen(false); setBusy(false); }}>Not now</Button>
                    </div>
                  </div>
                </Modal>
          ,
          document.body,
        )}
    </div>
  );
}
