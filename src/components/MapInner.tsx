"use client";

import { Map, MapMarker, MapRoute } from "@/components/ui";

export type RouteSummary = { distance: number; duration?: number };
export type Profile = "driving" | "walking" | "cycling";

export default function MapInner({
  lat,
  lng,
  zoom,
  label,
  height,
  interactive,
  avatar,
  from,
  profile,
  onRoute,
  onRouteError,
}: {
  lat: number;
  lng: number;
  zoom: number;
  label: string;
  height: number;
  interactive: boolean;
  /** optional picture used as the pin for the event */
  avatar: string;
  /** the visitor's position [lng, lat] once they asked for directions */
  from: [number, number] | null;
  profile: Profile;
  onRoute: (summary: RouteSummary) => void;
  onRouteError: (error: Error) => void;
}) {
  return (
    <Map
      width="100%"
      height={height}
      center={[lng, lat]}
      zoom={zoom}
      markers={[
        ...(avatar ? [] : [{ id: "event", lng, lat, label: label || undefined, tooltip: label || undefined }]),
        ...(from ? [{ id: "me", lng: from[0], lat: from[1], label: "You", color: "blue" }] : []),
      ]}
      interactive={interactive}
      controls={interactive}
      fitBounds={!!from}
      // no mouse-wheel / shift-drag / double-click zoom, so scrolling the page never gets caught by the map (the +/- buttons still zoom)
      onLoad={(map) => {
        map.scrollZoom.disable();
        map.boxZoom.disable();
        map.doubleClickZoom.disable();
      }}
      className="overflow-hidden rounded-3xl border border-border"
    >
      {avatar && (
        <MapMarker lng={lng} lat={lat} tooltip={label || undefined}>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt={label || "Event"} className="h-14 w-14 rounded-full border-4 border-white object-cover shadow-lg ring-2 ring-accent-500" />
            {label && (
              <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-surface px-1.5 py-0.5 text-xs font-medium text-fg shadow-md ring-1 ring-black/5">
                {label}
              </span>
            )}
          </div>
        </MapMarker>
      )}
      {from && (
        <MapRoute
          id="trip"
          waypoints={[from, [lng, lat]]}
          profile={profile}
          prefer="fastest"
          animated="flow"
          fit
          width={5}
          onLoad={onRoute}
          onRouteError={onRouteError}
        />
      )}
    </Map>
  );
}
