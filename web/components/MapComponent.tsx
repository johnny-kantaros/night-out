"use client";

import { useState } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { UserPlace } from "@/lib/types";

const CATEGORY_ICON: Record<string, string> = { bar: "🍺", restaurant: "🍽️", cafe: "☕" };

interface Props {
  userPlaces: UserPlace[];
}

export default function MapComponent({ userPlaces }: Props) {
  const [selected, setSelected] = useState<UserPlace | null>(null);

  const SF = { longitude: -122.4194, latitude: 37.7749 };
  const initialView = userPlaces.length > 0
    ? { longitude: userPlaces[0].place.lng, latitude: userPlaces[0].place.lat, zoom: 14 }
    : { ...SF, zoom: 13 };

  // Tight Bay Area bounds: coast → Tri-Valley, San Jose → San Rafael
  const BAY_AREA_BOUNDS: [[number, number], [number, number]] = [
    [-122.9, 37.2],
    [-121.7, 38.05],
  ];

  return (
    <Map
      initialViewState={initialView}
      maxBounds={BAY_AREA_BOUNDS}
      minZoom={10}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    >
      <NavigationControl position="top-right" />

      {userPlaces.map(up => (
        <Marker
          key={up.id}
          longitude={up.place.lng}
          latitude={up.place.lat}
          anchor="bottom"
          onClick={e => { e.originalEvent.stopPropagation(); setSelected(up); }}
        >
          <button
            title={up.place.name}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white text-sm shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-transform hover:scale-110 active:scale-95"
          >
            {CATEGORY_ICON[up.place.category] ?? "📍"}
          </button>
        </Marker>
      ))}

      {selected && (
        <Popup
          longitude={selected.place.lng}
          latitude={selected.place.lat}
          anchor="top"
          onClose={() => setSelected(null)}
          closeOnClick={false}
        >
          <div className="min-w-[160px] p-1">
            <p className="font-semibold text-sm">{selected.place.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{selected.place.address}</p>
            {selected.rating != null && (
              <p className="text-xs text-orange-500 mt-1 font-medium">{selected.rating.toFixed(1)} ★</p>
            )}
            {selected.notes && (
              <p className="text-xs text-gray-600 mt-1 italic">"{selected.notes}"</p>
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
}
