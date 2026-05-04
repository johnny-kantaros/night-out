"use client";

import { useAuth } from "@/lib/auth-context";
import { api, APIError } from "@/lib/api";
import type { UserPlace } from "@/lib/types";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAuth();
  const [userPlace, setUserPlace] = useState<UserPlace | null>(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api.places.list(token).then(list => {
      const found = list.find(up => up.id === id);
      if (found) {
        setUserPlace(found);
        setRating(found.rating ?? 0);
        setNotes(found.notes ?? "");
      }
    });
  }, [id, token]);

  const saveRating = async () => {
    if (!token || !userPlace) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updated = await api.places.rate(userPlace.id, { rating, notes: notes || undefined, visited: true }, token);
      setUserPlace(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof APIError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!userPlace) {
    return <div className="text-gray-400">Loading…</div>;
  }

  const { place } = userPlace;

  return (
    <div className="max-w-xl">
      <Link href="/places" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        ← Back
      </Link>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h1 className="text-2xl font-bold">{place.name}</h1>
        <p className="mt-1 text-sm capitalize text-gray-400">{place.category}</p>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-gray-400">Address</dt>
            <dd>{place.address}</dd>
          </div>
          {place.phone && (
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-gray-400">Phone</dt>
              <dd><a href={`tel:${place.phone}`} className="text-blue-600 hover:underline">{place.phone}</a></dd>
            </div>
          )}
          {place.website && (
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-gray-400">Website</dt>
              <dd className="truncate">
                <a href={place.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {place.website}
                </a>
              </dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-gray-400">Source</dt>
            <dd className="capitalize">{place.source}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 font-semibold">Your Rating</h2>

        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-gray-500">Rating</span>
            <span className="font-semibold text-orange-500">{rating.toFixed(1)} / 10</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={rating}
            onChange={e => setRating(parseFloat(e.target.value))}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0</span><span>5</span><span>10</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-500">Notes</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Great vibes, try the negroni…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        {saved && <p className="mb-3 text-sm text-green-600">Saved!</p>}

        <button
          onClick={saveRating}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Rating"}
        </button>
      </div>
    </div>
  );
}
