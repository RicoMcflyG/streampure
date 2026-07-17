// src/pages/Catalog.jsx
//
// Browsable list of the admin-uploaded catalog (see AdminUpload.jsx /
// backend routes/tracks.js + routes/admin.js). Unlike Charts/Radio/Search,
// these tracks already come back from the backend with a real, immediately
// playable `preview` URL (a direct R2 link) — no background preview
// resolution needed.
import React, { useEffect, useState } from "react";
import { usePlayer } from "../player/playerContext";
import api from "../api";
import SongRow from "../components/SongRow";

export default function Catalog() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { loadAndPlay } = usePlayer();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/tracks");
        if (!cancelled) setTracks(data || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-10">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-bold">Catalog</h1>
        <p className="mt-2 text-white/60">Full tracks, streamable to everyone.</p>

        {loading ? (
          <p className="mt-8 text-center text-white/60">Loading…</p>
        ) : tracks.length === 0 ? (
          <p className="mt-8 text-center text-white/60">Nothing in the catalog yet.</p>
        ) : (
          <div className="mt-8 space-y-2">
            {tracks.map((t, i) => (
              <SongRow
                key={t.id}
                track={t}
                index={i}
                buildQueue={() => tracks}
                onClickRow={() => loadAndPlay(tracks, i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
