"use client";

import { useAuth } from "@/lib/auth-context";
import { api, APIError } from "@/lib/api";
import type { PlaceSearchResult } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const SF = { lat: 37.7749, lng: -122.4194 };

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export default function PlaceSearchModal({ onClose, onAdded }: Props) {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  // Rating step state
  const [pending, setPending] = useState<PlaceSearchResult | null>(null);
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !query.trim()) return;
    setSearching(true);
    setError("");
    setResults([]);
    try {
      const res = await api.places.search(query, SF.lat, SF.lng, token);
      setResults(res);
      if (res.length === 0) setError("No results found — try a different search.");
    } catch (err) {
      setError(err instanceof APIError ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const saveWithRating = async () => {
    if (!token || !pending) return;
    setSaving(true);
    setError("");
    try {
      const userPlace = await api.places.add(pending.source, pending.external_id, token);
      await api.places.rate(userPlace.id, { rating, notes: notes || undefined, visited: true }, token);
      onAdded();
    } catch (err) {
      setError(err instanceof APIError ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  const addForLater = async () => {
    if (!token || !pending) return;
    setSaving(true);
    setError("");
    try {
      await api.places.add(pending.source, pending.external_id, token);
      onAdded();
    } catch (err) {
      setError(err instanceof APIError ? err.message : "Failed to add");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl" style={{ maxHeight: "85vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            {pending && (
              <button
                onClick={() => { setPending(null); setError(""); setSaving(false); }}
                className="text-gray-400 hover:text-gray-700 text-sm"
              >
                ←
              </button>
            )}
            <h2 className="font-semibold text-lg">
              {pending ? "Rate this place" : "Find a Place"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {pending ? (
          /* ── Rating step ── */
          <div className="flex flex-col gap-5 p-6">
            <div>
              <p className="font-semibold text-base">{pending.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{pending.address}</p>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
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
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-500">Notes (optional)</label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Great vibes, try the negroni…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={saveWithRating}
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save with Rating"}
              </button>
              <button
                onClick={addForLater}
                disabled={saving}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Do Later
              </button>
            </div>
          </div>
        ) : (
          /* ── Search step ── */
          <>
            <form onSubmit={search} className="border-b border-gray-100 p-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Search restaurants, bars, cafes…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {searching ? "…" : "Search"}
                </button>
              </div>
            </form>

            <div className="flex-1 overflow-y-auto p-2">
              {error && <p className="px-4 py-3 text-sm text-red-500">{error}</p>}
              {results.length === 0 && !error && !searching && (
                <p className="px-4 py-6 text-center text-sm text-gray-400">
                  Search for a place above to see results
                </p>
              )}
              {results.map(r => {
                const key = `${r.source}:${r.external_id}`;
                return (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-3 rounded-xl px-4 py-3 hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{r.name}</p>
                      <p className="text-xs text-gray-500 truncate">{r.address}</p>
                      <div className="mt-1 flex gap-2 text-xs text-gray-400">
                        <span className="capitalize">{r.category}</span>
                        {r.rating && <><span>·</span><span>{r.rating.toFixed(1)} ★</span></>}
                      </div>
                    </div>
                    <button
                      onClick={() => { setPending(r); setRating(5); setNotes(""); setError(""); }}
                      className="shrink-0 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
