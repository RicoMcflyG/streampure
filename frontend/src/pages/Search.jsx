import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchTracks } from "../api/search";
import { usePlayer } from "../player/playerContext";
import SongRow from "../components/SongRow";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";

  const [inputValue, setInputValue] = useState(q);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { loadAndPlay } = usePlayer();

  useEffect(() => {
    setInputValue(q);
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const items = await searchTracks(q);
      if (!cancelled) {
        setResults(items);
        setSearched(true);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q]);

  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setParams(trimmed ? { q: trimmed } : {});
  };

  return (
    <section className="py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Search</h1>

        <form onSubmit={onSubmit} className="mt-6 flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search songs or artists…"
            autoFocus
            className="w-full rounded-xl bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-highlight/50"
          />
          <button type="submit" className="btn-primary shrink-0 rounded-xl px-5">
            Search
          </button>
        </form>

        <div className="mt-8">
          {loading && <p className="text-white/60">Searching…</p>}

          {!loading && searched && results.length === 0 && (
            <p className="text-white/60">No results for “{q}”.</p>
          )}

          {!loading && !searched && (
            <p className="text-white/50">Search for a song or artist to get started.</p>
          )}

          {!loading && results.length > 0 && (
            <ul className="space-y-2">
              {results.map((t, i) => (
                <li key={t.id}>
                  <SongRow
                    track={t}
                    index={i}
                    onClickRow={() => t.preview && loadAndPlay(results, i)}
                    buildQueue={() => results}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
