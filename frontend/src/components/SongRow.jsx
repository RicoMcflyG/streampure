// src/components/SongRow.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePlayer } from "../player/playerContext";
import { useAuth } from "../auth/authContext";
import { useLibrary } from "../library/libraryContext";
import LikeButton from "./LikeButton";

/**
 * props:
 *  track = { id, title, artist, cover, preview, durationHint }
 *  index? (optional)
 *  buildQueue? () => array (optional, if you want play-now to load a list)
 *  onClickRow: () => void  // called when user clicks the row (to play)
 *  disabled? boolean  // true while this track's preview isn't resolved yet
 *                      (e.g. Top 100 previews are still loading in the background)
 *  onRemove? () => void  // if provided, shows a "Remove from this playlist"
 *                         menu item (used on playlist-detail views)
 */
export default function SongRow({ track, index = 0, buildQueue, onClickRow, disabled = false, onRemove }) {
  const { loadAndPlay, playNext, addToQueue } = usePlayer();
  const { isAuthenticated } = useAuth();
  const { playlists, addToPlaylist, createPlaylist } = useLibrary();
  const [open, setOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const menuRef = useRef(null);

  // close menu on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
        setShowPlaylists(false);
      }
    };
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setShowPlaylists(false);
  };

  const onPlayNow = (e) => {
    e.stopPropagation(); // do NOT trigger row click
    if (typeof buildQueue === "function") {
      const q = buildQueue();
      loadAndPlay(q, index);
    } else {
      loadAndPlay([track], 0);
    }
    closeMenu();
  };

  const onPlayNext = (e) => {
    e.stopPropagation();
    playNext(track);
    closeMenu();
  };

  const onAddToQueue = (e) => {
    e.stopPropagation();
    addToQueue(track);
    closeMenu();
  };

  const onPickPlaylist = async (e, playlistId) => {
    e.stopPropagation();
    await addToPlaylist(playlistId, track);
    closeMenu();
  };

  const onNewPlaylist = async (e) => {
    e.stopPropagation();
    const name = window.prompt("Name your new playlist:");
    if (!name) return;
    const created = await createPlaylist(name);
    if (created) await addToPlaylist(created.id, track);
    closeMenu();
  };

  const onRemoveClick = (e) => {
    e.stopPropagation();
    onRemove?.();
    closeMenu();
  };

  return (
    <div
      className="flex items-center gap-3 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition cursor-pointer"
      onClick={onClickRow}
    >
      <img src={track.cover} alt="" className="w-12 h-12 rounded object-cover" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{track.title}</div>
        {track.artist ? (
          <Link
            to={`/artist/${encodeURIComponent(track.artist)}`}
            onClick={(e) => e.stopPropagation()}
            className="block truncate text-sm text-white/70 hover:underline hover:text-white"
          >
            {track.artist}
          </Link>
        ) : null}
      </div>

      <LikeButton track={track} />

      {/* ⋯ menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent row click
            if (disabled) return;
            setOpen((v) => !v);
            setShowPlaylists(false);
          }}
          disabled={disabled}
          title={disabled ? "Still preparing this playlist…" : undefined}
          className={`rounded-md px-2 py-1 text-sm bg-white/10 hover:bg-white/15 ${
            disabled ? "opacity-40 cursor-not-allowed" : ""
          }`}
          aria-label="More actions"
        >
          ⋯
        </button>
        {open && !disabled && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-black/80 backdrop-blur p-1 text-sm shadow-xl z-10">
            {!showPlaylists ? (
              <>
                <button onClick={onPlayNow} className="w-full text-left px-3 py-2 rounded hover:bg-white/10">
                  Play now
                </button>
                <button onClick={onPlayNext} className="w-full text-left px-3 py-2 rounded hover:bg-white/10">
                  Play next
                </button>
                <button onClick={onAddToQueue} className="w-full text-left px-3 py-2 rounded hover:bg-white/10">
                  Add to queue
                </button>
                {isAuthenticated && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlaylists(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10"
                  >
                    Add to playlist ›
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={onRemoveClick}
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-red-300"
                  >
                    Remove from this playlist
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylists(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-white/60"
                >
                  ‹ Back
                </button>
                {playlists.length === 0 && (
                  <div className="px-3 py-1 text-xs text-white/50">No playlists yet</div>
                )}
                {playlists.map((p) => (
                  <button
                    key={p.id}
                    onClick={(e) => onPickPlaylist(e, p.id)}
                    className="w-full truncate text-left px-3 py-2 rounded hover:bg-white/10"
                  >
                    {p.name}
                  </button>
                ))}
                <button
                  onClick={onNewPlaylist}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-highlight"
                >
                  + New playlist
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
