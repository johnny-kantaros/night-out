"use client";

import { useAuth } from "@/lib/auth-context";
import { api, APIError } from "@/lib/api";
import PlaceSearchModal from "@/components/PlaceSearchModal";
import type { UserPlace } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const CATEGORY_ICON: Record<string, string> = { bar: "🍺", restaurant: "🍽", cafe: "☕" };

export default function PlacesPage() {
  const { token } = useAuth();
  const [userPlaces, setUserPlaces] = useState<UserPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const load = async () => {
    if (!token) return;
    try {
      setUserPlaces(await api.places.list(token));
    } catch (err) {
      setError(err instanceof APIError ? err.message : "Failed to load places");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Places</h1>
          <p className="text-sm text-gray-500">{userPlaces.length} saved</p>
        </div>
        <button
          onClick={() => setShowSearch(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add Place
        </button>
      </div>

      {loading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && userPlaces.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">
          <p className="text-4xl mb-2">🍽</p>
          <p className="font-medium">No places yet</p>
          <p className="text-sm">Hit "Add Place" to find your first spot</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {userPlaces.map(up => (
          <Link
            key={up.id}
            href={`/places/${up.id}`}
            className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:ring-blue-400"
          >
            <div className="mb-2 flex items-start justify-between">
              <span className="text-2xl">{CATEGORY_ICON[up.place.category] ?? "📍"}</span>
              {up.rating !== undefined && up.rating !== null && (
                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600">
                  {up.rating.toFixed(1)} ★
                </span>
              )}
            </div>
            <p className="font-semibold leading-snug group-hover:text-blue-600">{up.place.name}</p>
            <p className="mt-1 text-xs text-gray-500 line-clamp-1">{up.place.address}</p>
            <p className="mt-2 text-xs capitalize text-gray-400">{up.place.category}</p>
          </Link>
        ))}
      </div>

      {showSearch && (
        <PlaceSearchModal
          onClose={() => setShowSearch(false)}
          onAdded={() => { setShowSearch(false); load(); }}
        />
      )}
    </>
  );
}
