"use client";

import { useEffect, useRef, useState } from "react";

export type MapMarker = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  running: boolean;
};

declare global {
  interface Window {
    google?: typeof google;
    __ferroMapsCallback?: () => void;
  }
}

let loadPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    window.__ferroMapsCallback = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__ferroMapsCallback`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps."));
    document.head.appendChild(script);
  });

  return loadPromise;
}

type MapType = "roadmap" | "satellite";

export function LiveMap({ apiKey, markers }: { apiKey: string; markers: MapMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<MapType>("satellite");

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: { lat: markers[0]?.lat ?? 25.7617, lng: markers[0]?.lon ?? -80.1918 },
          zoom: markers.length > 0 ? 11 : 4,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeId: mapType,
        });
        renderMarkers();
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Map failed to load.");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    if (mapRef.current) renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  useEffect(() => {
    mapRef.current?.setMapTypeId(mapType);
  }, [mapType]);

  function renderMarkers() {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = markers.map(
      (m) =>
        new google.maps.Marker({
          map: mapRef.current!,
          position: { lat: m.lat, lng: m.lon },
          title: m.label,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: m.running ? "#f5821f" : "#8a8a92",
            fillOpacity: 1,
            strokeColor: "#0b0b0d",
            strokeWeight: 2,
          },
        })
    );

    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lon }));
      mapRef.current.fitBounds(bounds, 60);
    }
  }

  if (error) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-[9px] border border-dashed border-line bg-surface-2 text-center">
        <p className="max-w-xs px-4 text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[9px] border border-line bg-surface-2">
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute right-2.5 top-2.5 flex overflow-hidden rounded-[8px] border border-line bg-surface shadow-sm">
        {(["roadmap", "satellite"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setMapType(type)}
            className={`px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wide transition ${
              mapType === type
                ? "bg-amber text-on-amber"
                : "text-paper/70 hover:bg-surface-2"
            }`}
          >
            {type === "roadmap" ? "Map" : "Satellite"}
          </button>
        ))}
      </div>
    </div>
  );
}
