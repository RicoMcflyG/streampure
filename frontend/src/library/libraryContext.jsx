// src/library/libraryContext.jsx
//
// Liked Songs + user-created playlists. Kept separate from AuthContext (auth
// is just session/identity) but depends on it — must be rendered inside
// <AuthProvider> so it knows when to load/clear a user's library.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";
import { useAuth } from "../auth/authContext";

const LibraryCtx = createContext(null);
export const useLibrary = () => useContext(LibraryCtx);

export function LibraryProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setLikedSongs([]);
      setPlaylists([]);
      setLoaded(true);
      return;
    }
    try {
      const [likedRes, playlistsRes] = await Promise.all([
        api.get("/api/profile/liked"),
        api.get("/api/profile/playlists"),
      ]);
      setLikedSongs(likedRes.data || []);
      setPlaylists(playlistsRes.data || []);
    } catch {
      setLikedSongs([]);
      setPlaylists([]);
    } finally {
      setLoaded(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const likedIds = useMemo(
    () => new Set(likedSongs.map((t) => String(t.id))),
    [likedSongs]
  );
  const isLiked = (id) => likedIds.has(String(id));

  const toggleLike = async (track) => {
    if (!isAuthenticated || !track?.id) return;
    if (isLiked(track.id)) {
      setLikedSongs((prev) => prev.filter((t) => String(t.id) !== String(track.id)));
      try {
        const { data } = await api.delete(`/api/profile/liked/${encodeURIComponent(track.id)}`);
        setLikedSongs(data || []);
      } catch {
        refresh();
      }
    } else {
      setLikedSongs((prev) => [{ ...track, likedAt: new Date().toISOString() }, ...prev]);
      try {
        const { data } = await api.post("/api/profile/liked", {
          id: track.id,
          title: track.title,
          artist: track.artist,
          cover: track.cover,
          preview: track.preview,
        });
        setLikedSongs(data || []);
      } catch {
        refresh();
      }
    }
  };

  const createPlaylist = async (name) => {
    if (!name?.trim()) return null;
    try {
      const { data } = await api.post("/api/profile/playlists", { name: name.trim() });
      setPlaylists((prev) => [...prev, data]);
      return data;
    } catch {
      return null;
    }
  };

  const addToPlaylist = async (playlistId, track) => {
    try {
      const { data } = await api.post(`/api/profile/playlists/${playlistId}/tracks`, {
        id: track.id,
        title: track.title,
        artist: track.artist,
        cover: track.cover,
        preview: track.preview,
        durationHint: track.durationHint,
      });
      setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? data : p)));
    } catch {
      refresh();
    }
  };

  const removeFromPlaylist = async (playlistId, trackId) => {
    try {
      const { data } = await api.delete(
        `/api/profile/playlists/${playlistId}/tracks/${encodeURIComponent(trackId)}`
      );
      setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? data : p)));
    } catch {
      refresh();
    }
  };

  const deletePlaylist = async (playlistId) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    try {
      await api.delete(`/api/profile/playlists/${playlistId}`);
    } catch {
      refresh();
    }
  };

  const value = useMemo(
    () => ({
      likedSongs,
      isLiked,
      toggleLike,
      playlists,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      deletePlaylist,
      loaded,
    }),
    [likedSongs, playlists, loaded]
  );

  return <LibraryCtx.Provider value={value}>{children}</LibraryCtx.Provider>;
}
