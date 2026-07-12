import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAppleUSTop100, fetchPreviewFor, fetchPreviewsBatch } from "../api/charts";
import { fetchGenres, fetchGenreTracks } from "../api/radio";
import { usePlayer } from "../player/playerContext";
import SongRow from "../components/SongRow";

const FEATURED = "__featured__";

export default function Radio() {
  // Lets links like /radio?genre=pop (e.g. the Home page genre pills) land
  // directly on that station instead of always starting on Featured.
  const [searchParams] = useSearchParams();
  const [genres, setGenres] = useState([]);
  const [activeGenre, setActiveGenre] = useState(searchParams.get("genre") || FEATURED);
  const [tracks, setTracks] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [featuredReady, setFeaturedReady] = useState(false);
  const featuredPlaylistRef = useRef(null); // full Featured queue, previews resolved
  const { loadAndPlay } = usePlayer();

  useEffect(() => {
    (async () => {
      setLoadingGenres(true);
      try {
        const cats = await fetchGenres();
        setGenres(cats);
      } finally {
        setLoadingGenres(false);
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingTracks(true);
      setFeaturedReady(false);
      featuredPlaylistRef.current = null;

      if (activeGenre === FEATURED) {
        const list = await fetchAppleUSTop100();
        if (cancelled) return;
        setTracks(list);
        setLoadingTracks(false);

        // Resolve previews for the whole chart in the background so Featured
        // behaves like a real playlist (Next/Prev across every song) instead
        // of only ever playing the single track you clicked.
        const previews = await fetchPreviewsBatch(
          list.map((t) => ({ id: t.id, title: t.title, artist: t.artist }))
        );
        if (cancelled) return;
        featuredPlaylistRef.current = list.map((t) => {
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
        setFeaturedReady(true);
      } else {
        const list = await fetchGenreTracks(activeGenre);
        if (cancelled) return;
        setTracks(list);
        setLoadingTracks(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeGenre]);

  // Featured (Apple Top 100) doesn't carry a preview URL upfront. Once the
  // background batch resolves, play the whole chart as the queue; before
  // that, fall back to looking up just the one clicked track.
  const playFeaturedRow = async (i) => {
    if (featuredReady && featuredPlaylistRef.current) {
      const q = featuredPlaylistRef.current;
      if (!q[i]?.preview) {
        alert("⚠️ No 30-second preview available for this song.");
        return;
      }
      loadAndPlay(q, i);
      return;
    }
    const t = tracks[i];
    if (!t) return;
    const { previewUrl, artwork } = await fetchPreviewFor(t.title, t.artist);
    if (!previewUrl) {
      alert("⚠️ No 30-second preview available for this song.");
      return;
    }
    loadAndPlay(
      [
        {
          id: t.id,
          title: t.title,
          artist: t.artist,
          cover: artwork || t.cover,
          preview: previewUrl,
          durationHint: "0:30",
        },
      ],
      0
    );
  };

  // Genre stations come back from iTunes with a real preview already on
  // every track, so the whole list becomes the queue and next/prev/shuffle
  // work across the station right away.
  const playGenreTrack = (i) => {
    if (!tracks.length) return;
    loadAndPlay(tracks, i);
  };

  const onRowClick = (i) =>
    activeGenre === FEATURED ? playFeaturedRow(i) : playGenreTrack(i);

  return (
    <div className="min-h-screen px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">StreamPure Radio</h1>

      {/* Station buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveGenre(FEATURED)}
          className={`px-4 py-2 rounded-full text-sm transition ${
            activeGenre === FEATURED ? "bg-indigo-600 text-white" : "bg-white/10 text-white hover:bg-white/15"
          }`}
        >
          Featured
        </button>

        {loadingGenres ? (
          <div className="text-white/70 self-center">Loading genres…</div>
        ) : (
          genres.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGenre(g.id)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                g.id === activeGenre ? "bg-indigo-600 text-white" : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              {g.name}
            </button>
          ))
        )}
      </div>

      {/* Track list */}
      <div className="mx-auto max-w-4xl mb-3 flex items-center justify-between">
        {activeGenre === FEATURED && !featuredReady && !loadingTracks && (
          <span className="text-xs text-white/50">Preparing full playlist…</span>
        )}
      </div>

      {loadingTracks ? (
        <div className="text-center text-white/70">Loading tracks…</div>
      ) : tracks.length === 0 ? (
        <div className="text-center text-white/70">No tracks found. Try another station.</div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-3">
          {tracks.map((t, i) => {
            const isFeatured = activeGenre === FEATURED;
            return (
              <SongRow
                key={`${t.id}-${i}`}
                track={{
                  id: t.id,
                  title: t.title,
                  artist: t.artist,
                  cover: t.cover,
                  preview: isFeatured
                    ? featuredReady
                      ? featuredPlaylistRef.current?.[i]?.preview ?? null
                      : null
                    : t.preview ?? null,
                }}
                index={i}
                onClickRow={() => onRowClick(i)}
                buildQueue={() =>
                  isFeatured ? (featuredReady ? featuredPlaylistRef.current : []) : tracks
                }
                disabled={isFeatured && !featuredReady}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
