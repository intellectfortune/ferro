"use client";

import { useEffect, useRef, useState } from "react";

export type MapMarker = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  running: boolean;
  photoUrl?: string | null;
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load."));
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx: number, sy: number, sw: number, sh: number;
  if (imgRatio > boxRatio) {
    sh = img.height;
    sw = sh * boxRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / boxRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/** Circular vehicle-photo pin with a colored ring — falls back to null on any load/CORS failure. */
async function circularPhotoIcon(photoUrl: string, ringColor: string): Promise<string | null> {
  try {
    const img = await loadImage(photoUrl);
    const size = 64;
    const ringWidth = 4;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const radius = size / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(radius, radius, radius - ringWidth, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    drawCover(ctx, img, ringWidth, ringWidth, size - ringWidth * 2, size - ringWidth * 2);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(radius, radius, radius - ringWidth / 2, 0, Math.PI * 2);
    ctx.lineWidth = ringWidth;
    ctx.strokeStyle = ringColor;
    ctx.stroke();

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function pinIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40"><path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0z" fill="${color}"/><circle cx="15" cy="15" r="6" fill="#0b0b0d" fill-opacity="0.25"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
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

  async function renderMarkers() {
    const map = mapRef.current;
    if (!map) return;

    const ownMarkers = markers;
    const icons = await Promise.all(
      ownMarkers.map((m) => {
        const ringColor = m.running ? "#f5821f" : "#8a8a92";
        return m.photoUrl
          ? circularPhotoIcon(m.photoUrl, ringColor)
          : Promise.resolve<string | null>(null);
      })
    );

    // Bail if markers changed while icons were loading.
    if (markers !== ownMarkers) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = ownMarkers.map((m, i) => {
      const photoIconUrl = icons[i];
      const ringColor = m.running ? "#f5821f" : "#8a8a92";
      return new google.maps.Marker({
        map,
        position: { lat: m.lat, lng: m.lon },
        title: m.label,
        icon: photoIconUrl
          ? {
              url: photoIconUrl,
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20),
            }
          : {
              url: pinIcon(ringColor),
              scaledSize: new google.maps.Size(30, 40),
              anchor: new google.maps.Point(15, 40),
            },
      });
    });

    if (ownMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      ownMarkers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lon }));
      map.fitBounds(bounds, 60);
    }
  }

  if (error) {
    return (
      <div className="flex h-[210px] lg:h-[640px] items-center justify-center rounded-[9px] border border-dashed border-line bg-surface-2 text-center">
        <p className="max-w-xs px-4 text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-[210px] lg:h-[640px] w-full overflow-hidden rounded-[9px] border border-line bg-surface-2">
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
