import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePlayer } from "../player/playerContext";
import { fetchAppleUSTop100, fetchPreviewFor, fetchPreviewsBatch } from "../api/charts";
import { fetchGenres } from "../api/radio";
import { artistBio } from "../lib/artistBios";
import { artistStockImage } from "../lib/artistStockImages";

// House artists used for the rotating Artist Spotlight tile below.
const SPOTLIGHT_ARTISTS = ["Keoni Blaze", "Lani Kai", "Kaleo Grace", "Mana Beats", "DJ PureTone"];
const STRIP_SIZE = 12;

function formatTime(s) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function Home() {
  const navigate = useNavigate();
  const { current, isPlaying, progress, duration, playOrStart, loadAndPlay } = usePlayer();

  // Rotates on every fresh page load, stable across re-renders of this mount.
  const [spotlightName] = useState(
    () => SPOTLIGHT_ARTISTS[Math.floor(Math.random() * SPOTLIGHT_ARTISTS.length)]
  );

  const [chart, setChart] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const chartRef = useRef(null); // full strip, previews resolved, once ready

  const [genres, setGenres] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setChartLoading(true);
      setChartReady(false);
      chartRef.current = null;

      const full = await fetchAppleUSTop100();
      if (cancelled) return;
      const top = full.slice(0, STRIP_SIZE);
      setChart(top);
      setChartLoading(false);

      // Resolve previews in the background so the strip (and the Now
      // Playing teaser below) can start a real, multi-track queue instead
      // of only ever playing the one track you clicked.
      const previews = await fetchPreviewsBatch(
        top.map((t) => ({ id: t.id, title: t.title, artist: t.artist }))
      );
      if (cancelled) return;
      chartRef.current = top.map((t) => {
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
      setChartReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetchGenres().then(setGenres);
  }, []);

  const playChartAt = async (i) => {
    if (chartReady && chartRef.current) {
      const q = chartRef.current;
      if (!q[i]?.preview) {
        alert("⚠️ No 30-second preview available for this song.");
        return;
      }
      loadAndPlay(q, i);
      return;
    }
    // Previews still resolving in the background — on-demand lookup so the
    // click isn't blocked meanwhile.
    const t = chart[i];
    if (!t) return;
    const { previewUrl, artwork } = await fetchPreviewFor(t.title, t.artist);
    if (!previewUrl) {
      alert("⚠️ No 30-second preview available for this song.");
      return;
    }
    loadAndPlay(
      [{ id: t.id, title: t.title, artist: t.artist, cover: artwork || t.cover, preview: previewUrl, durationHint: "0:30" }],
      0
    );
  };

  const top1 = chart[0];

  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-highlight">
              <span className="h-2 w-2 rounded-full bg-highlight" />
              Electric Pulse • Clean Music
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span className="text-text">StreamPure</span>
              <span className="block bg-gradient-to-r from-primary to-highlight bg-clip-text text-transparent">
                Clean music. Pure vibes.
              </span>
            </h1>
            <p className="mt-4 muted leading-relaxed">
              Uplifting tracks, collaborative jams, and artist spotlights — modern
              streaming for global tastes and island roots.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => navigate("/signup")} className="btn-primary">
                Get Started
              </button>
              <button onClick={() => navigate("/radio")} className="btn-ghost">
                Explore Radio
              </button>
            </div>
            <div className="mt-6 flex items-center gap-3 text-xs">
              <span className="chip">No explicit lyrics</span>
              <span className="chip">Jam with friends</span>
              <span className="chip">Artist credits</span>
            </div>
          </div>

          {/* Now Playing — real player state, falls back to today's #1 track */}
          <div className="relative">
            <div className="card p-6">
              {current ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent">
                      {current.cover ? (
                        <img src={current.cover} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs muted">Now playing</p>
                      <h3 className="truncate text-lg font-semibold">{current.title}</h3>
                      <p className="truncate text-sm muted">{current.artist}</p>
                    </div>
                    <button
                      onClick={playOrStart}
                      aria-label={isPlaying ? "Pause" : "Play"}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full btn-primary !px-0 !py-0"
                    >
                      {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                  </div>
                  <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-highlight"
                      style={{ width: duration ? `${Math.min(100, (progress / duration) * 100)}%` : "0%" }}
                    />
                  </div>
                  <div className="mt-5 flex items-center justify-between text-sm muted">
                    <span>{formatTime(progress)}</span>
                    <span>{duration ? formatTime(duration) : "0:30"}</span>
                  </div>
                </>
              ) : top1 ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent">
                      {top1.cover ? (
                        <img src={top1.cover} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs muted">#1 on Top 100 right now</p>
                      <h3 className="truncate text-lg font-semibold">{top1.title}</h3>
                      <p className="truncate text-sm muted">{top1.artist}</p>
                    </div>
                  </div>
                  <button onClick={() => playChartAt(0)} className="btn-primary mt-5 w-full">
                    ▶ Play it now
                  </button>
                </>
              ) : (
                <div className="py-6 text-center text-sm muted">
                  {chartLoading ? "Loading today's #1 track…" : "Nothing playing yet — hit Explore Radio to start."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Top 100 strip */}
        <div className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Trending right now</h2>
            <Link to="/charts" className="text-sm font-semibold text-highlight hover:underline">
              See full chart →
            </Link>
          </div>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {chartLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 w-32 shrink-0 animate-pulse rounded-xl bg-white/5" />
                ))
              : chart.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => playChartAt(i)}
                    className="group w-32 shrink-0 text-left"
                  >
                    <div className="relative h-32 w-32 overflow-hidden rounded-xl bg-white/5">
                      {t.cover ? (
                        <img
                          src={t.cover}
                          alt=""
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : null}
                      <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        #{i + 1}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-sm font-medium">{t.title}</p>
                    <p className="truncate text-xs muted">{t.artist}</p>
                  </button>
                ))}
          </div>
        </div>

        {/* Radio genre pills */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tune into Radio</h2>
            <Link to="/radio" className="text-sm font-semibold text-highlight hover:underline">
              Open Radio →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {genres.length === 0 ? (
              <span className="text-sm muted">Loading stations…</span>
            ) : (
              genres.map((g) => (
                <Link
                  key={g.id}
                  to={`/radio?genre=${g.id}`}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15"
                >
                  {g.name}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Featured tiles */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to={`/artist/${encodeURIComponent(spotlightName)}`}
            className="card p-6 transition hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <img
                src={artistStockImage(spotlightName)}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/20"
              />
              <h3 className="truncate text-lg font-semibold">Spotlight: {spotlightName}</h3>
            </div>
            <p className="mt-2 line-clamp-2 text-sm muted">{artistBio(spotlightName)}</p>
            <div className="mt-4 text-sm font-semibold text-highlight">Explore artist →</div>
          </Link>

          <Link to="/playlist" className="card p-6 transition hover:scale-[1.01]">
            <h3 className="text-lg font-semibold">Your Playlist</h3>
            <p className="mt-1 text-sm muted">Curate, share, repeat.</p>
            <div className="mt-4 text-sm font-semibold text-highlight">Open →</div>
          </Link>

          <Link to="/search" className="card p-6 transition hover:scale-[1.01]">
            <h3 className="text-lg font-semibold">Search</h3>
            <p className="mt-1 text-sm muted">Find any song or artist, instantly.</p>
            <div className="mt-4 text-sm font-semibold text-highlight">Search now →</div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
