// src/pages/Charts.jsx
import React, { useEffect, useRef, useState } from "react";
import { fetchAppleUSTop100, fetchPreviewFor, fetchPreviewsBatch } from "../api/charts";
import { usePlayer } from "../player/playerContext";
import SongRow from "../components/SongRow";

export default function Charts() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playlistReady, setPlaylistReady] = useState(false);
  const playlistRef = useRef(null); // full queue, previews resolved, once ready
  const { loadAndPlay } = usePlayer();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setPlaylistReady(false);
      playlistRef.current = null;

      const list = await fetchAppleUSTop100();
      if (cancelled) return;
      console.log("Normalized Top100 list in Charts.jsx:", list);
      setTracks(list);
      setLoading(false);

      // Resolve previews for the whole chart in the background so it plays
      // like a real playlist (Next/Prev across all 100 songs) instead of
      // only ever loading the single track you clicked.
      const previews = await fetchPreviewsBatch(
        list.map((t) => ({ id: t.id, title: t.title, artist: t.artist }))
      );
      if (cancelled) return;
      playlistRef.current = list.map((t) => {
        const p = previews[t.id];
        return {
          id: t.id,
          title: t.title,
          artist: t.artist,
          cover: p?.artwork || t.cover,
          preview: p?.previewUrl || null,
          durationHint: "0:30",
        };
      });
      setPlaylistReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildPlayable = async (i) => {
    const t = tracks[i];
    if (!t) return null;

    const { previewUrl, artwork } = await fetchPreviewFor(t.title, t.artist);
    if (!previewUrl) {
      alert("⚠️ No 30-second preview available for this song.");
      return null;
    }

    return {
      id: t.id,
      title: t.title,
      artist: t.artist,
      cover: artwork || t.cover,
      preview: previewUrl,
      durationHint: "0:30",
    };
  };

  const onRowClick = async (i) => {
    // Once the whole chart's previews have resolved, play it as one
    // continuous playlist so Next/Previous move through the whole list.
    if (playlistReady && playlistRef.current) {
      const q = playlistRef.current;
      if (!q[i]?.preview) {
        alert("⚠️ No 30-second preview available for this song.");
        return;
      }
      loadAndPlay(q, i);
      return;
    }
    // Previews are still resolving in the background — fall back to a
    // single on-demand lookup so the click isn't blocked meanwhile.
    const playable = await buildPlayable(i);
    if (!playable) return;
    loadAndPlay([playable], 0);
  };

  if (loading) {
    return <div className="p-8 text-white/70">Loading Top 100 USA…</div>;
  }

  if (!tracks.length) {
    return <div className="p-8 text-white/70">No Top 100 tracks found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Top 100 USA (Apple)</h1>
        {!playlistReady && (
          <span className="text-xs text-white/50">Preparing full playlist…</span>
        )}
      </div>

      <ul className="grid sm:grid-cols-2 gap-3">
        {tracks.map((t, i) => (
          <li key={t.id}>
            <SongRow
              track={{
                id: t.id,
                title: t.title,
                artist: t.artist,
                cover: t.cover,
                preview: playlistReady ? playlistRef.current?.[i]?.preview ?? null : null,
              }}
              index={i}
              onClickRow={() => onRowClick(i)}
              buildQueue={() => (playlistReady ? playlistRef.current : [])}
              disabled={!playlistReady}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
