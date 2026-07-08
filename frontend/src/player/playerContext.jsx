import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../api";

const PlayerCtx = createContext(null);

// Fire-and-forget: records a play for the logged-in user's Recently
// Played / Most Played (Profile page). No-ops quietly if nobody's logged
// in — the backend just returns 401 and we ignore it.
function logPlay(track) {
  if (!track?.id || !track?.title) return;
  api
    .post("/api/profile/log-play", {
      id: track.id,
      title: track.title,
      artist: track.artist,
      cover: track.cover,
    })
    .catch(() => {});
}
export const usePlayer = () => useContext(PlayerCtx);

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());

  const [queue, setQueue] = useState([]); // [{ id, title, artist, cover, preview, durationHint }]
  const [index, setIndex] = useState(0);
  const current = queue[index] || null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState("off"); // off | one | all
  const [shuffle, setShuffle] = useState(false);

  // When a user action should auto-start after src switches
  const pendingAutoplay = useRef(false);

  // ---- helpers to find next/prev playable (has preview) ----
  const pickNextIndex = (from) => {
    if (!queue.length) return -1;

    if (shuffle && queue.length > 1) {
      // try random different index with preview
      const candidates = queue
        .map((t, i) => (t?.preview ? i : -1))
        .filter((i) => i >= 0 && i !== from);
      if (candidates.length) {
        const r = Math.floor(Math.random() * candidates.length);
        return candidates[r];
      }
    }

    let i = from;
    for (let step = 0; step < queue.length; step++) {
      i = i + 1;
      if (i >= queue.length) {
        if (repeat === "all") i = 0;
        else return -1;
      }
      if (queue[i]?.preview) return i;
      if (i === from) break;
    }
    return -1;
  };

  const pickPrevIndex = (from) => {
    if (!queue.length) return -1;

    let i = from;
    for (let step = 0; step < queue.length; step++) {
      i = i - 1;
      if (i < 0) {
        if (repeat === "all") i = queue.length - 1;
        else return -1;
      }
      if (queue[i]?.preview) return i;
      if (i === from) break;
    }
    return -1;
  };

  // ---- audio element events ----
  useEffect(() => {
    const el = audioRef.current;
    el.volume = isMuted ? 0 : volume;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setProgress(el.currentTime);
    const onLoaded = () => setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    const onEnded = () => {
      if (repeat === "one") {
        el.currentTime = 0;
        el.play().catch(() => {});
        return;
      }
      const nxt = pickNextIndex(index);
      if (nxt >= 0) {
        setIndex(nxt);
        pendingAutoplay.current = true;
      } else {
        setIsPlaying(false);
      }
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, queue.length, repeat, shuffle, volume, isMuted]);

  // ---- react when current track changes ----
  useEffect(() => {
    const el = audioRef.current;

    if (!current) {
      el.removeAttribute("src");
      setDuration(0);
      setProgress(0);
      setIsPlaying(false);
      return;
    }

    // if we were told to autoplay but this item has no preview, auto-skip
    if (!current.preview && pendingAutoplay.current) {
      const nxt = pickNextIndex(index);
      if (nxt >= 0) {
        setIndex(nxt);
        return; // keep pendingAutoplay=true so next plays
      }
      pendingAutoplay.current = false;
      setIsPlaying(false);
      el.removeAttribute("src");
      return;
    }

    if (current.preview) {
      el.src = current.preview;
      el.load();
      logPlay(current);
      if (pendingAutoplay.current) {
        pendingAutoplay.current = false;
        el.play().catch(() => {});
      }
    } else {
      el.removeAttribute("src");
      setDuration(0);
      setProgress(0);
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, current?.preview]);

  // ---- controls ----
  const toggle = () => {
    const el = audioRef.current;
    if (!current?.preview) {
      // If nothing is loaded but the queue exists, start from top
      if (queue.length > 0) {
        setIndex(0);
        pendingAutoplay.current = true;
      }
      return;
    }
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  // Jump to a specific queue index. React skips re-rendering when a state
  // setter is given the value it already holds, so switching to the index
  // that's already playing must be handled directly (restart the audio
  // element) instead of relying on setIndex to retrigger the "track changed"
  // effect below — otherwise the button silently does nothing.
  const goToIndex = (i) => {
    if (i < 0 || i >= queue.length) return;
    if (i === index) {
      const el = audioRef.current;
      el.currentTime = 0;
      if (queue[i]?.preview) el.play().catch(() => {});
      return;
    }
    setIndex(i);
    pendingAutoplay.current = true;
  };

  const next = () => {
    const nxt = pickNextIndex(index);
    if (nxt >= 0) goToIndex(nxt);
  };

  const prev = () => {
    // default previous (called by UI when user wants previous track)
    const prv = pickPrevIndex(index);
    if (prv >= 0) goToIndex(prv);
    else restartCurrent(); // if none, just restart current
  };

  const seek = (sec) => {
    audioRef.current.currentTime = Math.max(0, Math.min(sec, duration || 0));
  };

  const setVol = (v) => {
    setVolume(v);
    audioRef.current.volume = isMuted ? 0 : v;
  };

  const setMute = (m) => {
    setMuted(m);
    audioRef.current.volume = m ? 0 : volume;
  };

  // ---- user-intent helpers ----
  const playAt = (i) => goToIndex(i);

  const loadAndPlay = (newQueue, startIndex = 0) => {
    setQueue(newQueue.map(normalize));
    setIndex(startIndex);
    pendingAutoplay.current = true;
  };

  const restartCurrent = () => {
    const el = audioRef.current;
    el.currentTime = 0;
    if (current?.preview) el.play().catch(() => {});
  };

  // Play button behavior: if nothing loaded but queue exists -> start from top
  // if loaded -> toggle pause/play
  const playOrStart = () => {
    if (!current && queue.length > 0) {
      setIndex(0);
      pendingAutoplay.current = true;
      return;
    }
    toggle();
  };

  // Queue ops for your 3-dot menus
  const normalize = (t) => ({
    id: t.id, title: t.title, artist: t.artist,
    cover: t.cover || "", preview: t.preview || t.src || null,
    durationHint: t.durationHint || (t.durationMs
      ? `${Math.floor(t.durationMs / 60000)}:${String(Math.floor((t.durationMs % 60000) / 1000)).padStart(2, "0")}`
      : ""),
  });

  const addToQueue = (itemOrItems) => {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    const normalized = items.map(normalize);
    if (!current && queue.length === 0) {
      loadAndPlay(normalized, 0);
      return;
    }
    setQueue((q) => [...q, ...normalized]);
  };

  const playNext = (item) => {
    const t = normalize(item);
    if (!current && queue.length === 0) {
      loadAndPlay([t], 0);
      return;
    }
    setQueue((q) => {
      const before = q.slice(0, index + 1);
      const after = q.slice(index + 1);
      return [...before, t, ...after];
    });
  };

  // Remove a single item from the queue. If it was the currently-playing
  // item, the track that shifts into its slot should pick up playback
  // automatically (handled by the "current track changed" effect, since
  // current?.preview will differ even though the numeric index may not).
  const removeFromQueue = (i) => {
    if (i < 0 || i >= queue.length) return;
    const wasCurrent = i === index;
    if (wasCurrent) pendingAutoplay.current = true;
    setQueue((q) => q.filter((_, idx) => idx !== i));
    setIndex((cur) => (i < cur ? cur - 1 : cur));
  };

  // Reorder the queue (e.g. drag-and-drop in the Queue page). Keeps the
  // "currently playing" pointer glued to the same track as it moves.
  const moveInQueue = (from, to) => {
    if (from === to) return;
    setQueue((q) => {
      if (from < 0 || from >= q.length || to < 0 || to >= q.length) return q;
      const copy = [...q];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
    setIndex((cur) => {
      if (cur === from) return to;
      if (from < cur && to >= cur) return cur - 1;
      if (from > cur && to <= cur) return cur + 1;
      return cur;
    });
  };

  // Clear the whole queue and stop playback.
  const clearQueue = () => {
    setQueue([]);
    setIndex(0);
  };

  const value = useMemo(
    () => ({
      // state
      queue, setQueue, index, setIndex, current,
      isPlaying, progress, duration, volume, isMuted, repeat, shuffle,
      // controls
      toggle, next, prev, seek, setVol, setMute, setRepeat, setShuffle,
      // helpers
      loadAndPlay, playAt, restartCurrent, playOrStart,
      // queue ops
      addToQueue, playNext, removeFromQueue, moveInQueue, clearQueue,
    }),
    [
      queue, index, current, isPlaying, progress, duration,
      volume, isMuted, repeat, shuffle
    ]
  );

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}