import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { usePlayer } from "../player/playerContext";
import api from "../api";
import { fetchPreviewFor } from "../api/charts";

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "?";
}

function HistoryRow({ track, onPlay, meta }) {
  return (
    <li
      onClick={onPlay}
      className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
    >
      {track.cover ? (
        <img src={track.cover} alt="" className="h-12 w-12 rounded-md object-cover" />
      ) : (
        <div className="h-12 w-12 rounded-md bg-white/10" />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{track.title}</div>
        <div className="truncate text-sm muted">{track.artist}</div>
      </div>
      {meta && <span className="shrink-0 text-xs muted">{meta}</span>}
    </li>
  );
}

export default function Profile() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { loadAndPlay } = usePlayer();
  const navigate = useNavigate();

  const [recently, setRecently] = useState([]);
  const [mostPlayed, setMostPlayed] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setHistoryLoading(true);
      try {
        const { data } = await api.get("/api/profile/recently-played");
        setRecently(data.recently || []);
        setMostPlayed(data.mostPlayed || []);
      } catch {
        setRecently([]);
        setMostPlayed([]);
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, [isAuthenticated]);

  // History entries only store title/artist/cover, not a preview URL, so
  // look one up on demand — same approach as the Charts page.
  const playFromHistory = async (t) => {
    const { previewUrl, artwork } = await fetchPreviewFor(t.title, t.artist);
    if (!previewUrl) {
      alert("⚠️ No 30-second preview available for this song.");
      return;
    }
    loadAndPlay(
      [
        {
          id: t.trackId,
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

  if (loading) {
    return <div className="p-10 text-center text-white/70">Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <section className="grid place-items-center py-10">
        <div className="card w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold">You're not logged in</h1>
          <p className="mt-2 muted">Log in to see your profile, recently played, and top tracks.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => navigate("/login")} className="btn-primary">
              Log in
            </button>
            <button onClick={() => navigate("/signup")} className="btn bg-white/10 hover:bg-white/20">
              Sign up
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      <div className="mx-auto max-w-3xl card p-8">
        <div className="mb-6 flex items-center gap-6">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-highlight text-2xl font-bold text-white ring-2 ring-highlight/60">
            {initials(user?.displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-3xl font-bold">{user?.displayName}</h1>
            <p className="truncate muted">{user?.email}</p>
          </div>
          <button onClick={logout} className="btn shrink-0 bg-white/10 hover:bg-white/20">
            Log out
          </button>
        </div>

        <h2 className="mb-3 text-xl font-semibold text-highlight">Recently Played</h2>
        {historyLoading ? (
          <p className="text-sm muted">Loading…</p>
        ) : recently.length === 0 ? (
          <p className="text-sm muted">
            Nothing played yet — go start a playlist, a Radio station, or the Top 100.
          </p>
        ) : (
          <ul className="mb-8 space-y-2">
            {recently.slice(0, 10).map((t, i) => (
              <HistoryRow key={`${t.trackId}-${i}`} track={t} onPlay={() => playFromHistory(t)} />
            ))}
          </ul>
        )}

        <h2 className="mb-3 text-xl font-semibold text-highlight">Most Played</h2>
        {historyLoading ? (
          <p className="text-sm muted">Loading…</p>
        ) : mostPlayed.length === 0 ? (
          <p className="text-sm muted">No play counts yet.</p>
        ) : (
          <ul className="space-y-2">
            {mostPlayed.slice(0, 10).map((t, i) => (
              <HistoryRow
                key={`${t.trackId}-${i}`}
                track={t}
                onPlay={() => playFromHistory(t)}
                meta={`${t.count}×`}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
