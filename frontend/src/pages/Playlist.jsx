import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePlayer } from "../player/playerContext";
import { useAuth } from "../auth/authContext";
import { useLibrary } from "../library/libraryContext";
import { PLAYLISTS } from "../lib/playlists";
import SongRow from "../components/SongRow";

export default function Playlist() {
  const navigate = useNavigate();
  const { loadAndPlay } = usePlayer();
  const { isAuthenticated } = useAuth();
  const { likedSongs, playlists, createPlaylist, deletePlaylist, removeFromPlaylist } = useLibrary();

  // null = grid view. { type: "liked" } or { type: "user", id } = detail view.
  const [view, setView] = useState(null);
  const [creating, setCreating] = useState(false);

  // Loads a whole collection and jumps to the full player — used for "play
  // this entire playlist" actions (grid cards, "Play all").
  const playCollection = (tracks, name, startIndex = 0) => {
    if (!tracks.length) return;
    loadAndPlay(tracks, startIndex);
    navigate("/player", { state: { from: "playlist", playlist: name } });
  };

  const onNewPlaylist = async () => {
    const name = window.prompt("Name your new playlist:");
    if (!name) return;
    setCreating(true);
    await createPlaylist(name);
    setCreating(false);
  };

  const onDeletePlaylist = async (pl) => {
    if (!window.confirm(`Delete "${pl.name}"? This can't be undone.`)) return;
    await deletePlaylist(pl.id);
    setView(null);
  };

  // ---------------- Detail view (Liked Songs or a user playlist) ----------------
  if (view) {
    const isLiked = view.type === "liked";
    const userPl = !isLiked ? playlists.find((p) => p.id === view.id) : null;
    const title = isLiked ? "Liked Songs" : userPl?.name || "Playlist";
    const tracks = isLiked ? likedSongs : userPl?.tracks || [];

    return (
      <section className="py-10">
        <div className="mx-auto max-w-4xl">
          <button onClick={() => setView(null)} className="text-sm text-white/60 hover:text-white">
            ‹ Back to playlists
          </button>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                {isLiked ? "💙 " : ""}
                {title}
              </h1>
              <p className="mt-1 text-white/60">
                {tracks.length} track{tracks.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => playCollection(tracks, title)}
                disabled={!tracks.length}
                className="btn-primary rounded-full px-5 py-2 disabled:opacity-40"
              >
                ▶ Play all
              </button>
              {!isLiked && userPl && (
                <button
                  onClick={() => onDeletePlaylist(userPl)}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm text-red-300 hover:bg-white/15"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {tracks.length === 0 && (
              <p className="text-white/60">
                {isLiked
                  ? "Tap the heart on any song to add it here."
                  : "This playlist is empty. Use a song's ⋯ menu → “Add to playlist” to add tracks."}
              </p>
            )}
            {tracks.map((t, i) => (
              <SongRow
                key={`${t.id}-${i}`}
                track={t}
                index={i}
                buildQueue={() => tracks}
                onClickRow={() => loadAndPlay(tracks, i)}
                onRemove={!isLiked ? () => removeFromPlaylist(userPl.id, t.id) : undefined}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ---------------- Grid view ----------------
  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Your Playlists</h1>
        <p className="mt-2 text-white/70">
          Tap a playlist to start playing, or build your own.
        </p>

        {isAuthenticated ? (
          <>
            <h2 className="mt-8 text-xl font-semibold text-white/90">Your Library</h2>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => setView({ type: "liked" })}
                className="text-left rounded-2xl bg-gradient-to-r from-highlight/80 to-primary/80 p-4 shadow-lg transition hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-20 w-20 place-items-center rounded-xl bg-black/30 text-4xl ring-2 ring-white/40">
                    💙
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-semibold text-text drop-shadow">Liked Songs</h3>
                    <p className="mt-1 text-xs text-text/80 drop-shadow">{likedSongs.length} tracks</p>
                  </div>
                </div>
              </button>

              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => setView({ type: "user", id: pl.id })}
                  className="text-left rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg transition hover:scale-[1.02] hover:bg-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-20 w-20 place-items-center rounded-xl bg-white/10 text-3xl ring-2 ring-white/20">
                      🎵
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-semibold">{pl.name}</h3>
                      <p className="mt-1 text-xs text-white/60">{pl.tracks.length} tracks</p>
                    </div>
                  </div>
                </button>
              ))}

              <button
                onClick={onNewPlaylist}
                disabled={creating}
                className="text-left rounded-2xl border-2 border-dashed border-white/20 p-4 transition hover:border-white/40 hover:bg-white/5 disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-20 w-20 place-items-center rounded-xl text-3xl text-white/50">+</div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-white/80">
                      {creating ? "Creating…" : "New Playlist"}
                    </h3>
                    <p className="mt-1 text-xs text-white/50">Create your own</p>
                  </div>
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-white/70">
            <Link to="/login" className="text-highlight hover:underline">
              Log in
            </Link>{" "}
            to like songs and build your own playlists.
          </div>
        )}

        <h2 className="mt-10 text-xl font-semibold text-white/90">Featured Playlists</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLAYLISTS.map((pl) => (
            <button
              key={pl.id}
              onClick={() => playCollection(pl.tracks, pl.name)}
              className={`text-left rounded-2xl p-4 bg-gradient-to-r ${pl.color} shadow-lg transition hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={pl.cover}
                  alt={pl.name}
                  className="h-20 w-20 rounded-xl object-cover ring-2 ring-white/40"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-text drop-shadow">
                    {pl.name}
                  </h2>
                  <p className="truncate text-sm text-text/90 drop-shadow">
                    {pl.description}
                  </p>
                  <p className="mt-1 text-xs text-text/80 drop-shadow">
                    {pl.tracks.length} tracks
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
