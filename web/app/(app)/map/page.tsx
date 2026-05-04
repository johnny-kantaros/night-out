"use client";

import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { UserPlace } from "@/lib/types";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

export default function MapPage() {
  const { token } = useAuth();
  const [userPlaces, setUserPlaces] = useState<UserPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.places.list(token).then(places => {
      setUserPlaces(places);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <div className="text-gray-400">Loading map…</div>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Map</h1>
      <div className="h-[600px] overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-200">
        <MapComponent userPlaces={userPlaces} />
      </div>
    </div>
  );
}
