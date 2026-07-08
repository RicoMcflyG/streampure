// src/pages/Artist.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { artistStockImage } from "../lib/artistStockImages";
import { artistBio } from "../lib/artistBios";
import { fetchArtistTopTracks } from "../api/charts";
import { usePlayer } from "../player/playerContext";
import SongRow from "../components/SongRow";

export default function Artist() {
  const { name: rawName } = useParams();
  const name = rawName ? decodeURIComponent(rawName) : "Keoni Blaze";
  const photo = artistStockImage(name);
  const bio = artistBio(name);

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { loadAndPlay } = usePlayer();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const list = await fetchArtistTopTracks(name);
      if (!cancelled) {
        setTracks(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [name]);

  // Top tracks come back from iTunes with a real preview already attached,
  // so the whole list becomes the queue right away — Next/Prev/Shuffle work
  // across this artist's songs immediately, no extra lookups needed.
  const onRowClick = (i) => {
    if (!tracks[i]?.preview) return;
    loadAndPlay(tracks, i);
  };

  return (
    <div className="min-h-screen bg-background p-8 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white/5 p-8">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <img
            src={photo}
            alt={name}
            className="h-40 w-40 rounded-full object-cover shadow-lg ring-2 ring-highlight/40"
          />
          <div>
            <h1 className="text-3xl font-bold text-text">{name}</h1>
            <p className="mt-2 leading-relaxed text-white/70">{bio}</p>
            <Link
              to="/concerts"
              className="mt-3 inline-block text-sm text-highlight hover:underline"
            >
              Upcoming concerts →
            </Link>
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-xl font-semibold text-highlight">Top Tracks</h2>
        {loading ? (
          <p className="text-sm text-white/60">Loading…</p>
        ) : tracks.length === 0 ? (
          <p className="text-sm text-white/60">No tracks found for this artist yet.</p>
        ) : (
          <ul className="space-y-2">
            {tracks.map((t, i) => (
              <li key={t.id}>
                <SongRow
                  track={t}
                  index={i}
                  onClickRow={() => onRowClick(i)}
                  buildQueue={() => tracks}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
