// src/components/MiniPlayer.jsx
import React, { useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { usePlayer } from "../player/playerContext";
import LikeButton from "./LikeButton";

function formatTime(s) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function MiniPlayer() {
  const nav = useNavigate();
  const loc = useLocation();
  const {
    current, isPlaying, next, prev,
    progress, duration, seek,
    volume, setVol, isMuted, setMute,
    repeat, setRepeat, shuffle, setShuffle,
    restartCurrent, playOrStart,
  } = usePlayer();

  // ❗️MUST be above any early return
  const prevClickAt = useRef(0);

  const isOnFullPlayer = loc.pathname === "/player";
  if (!current || isOnFullPlayer) return null;

  const handlePrevSmart = () => {
    const now = Date.now();
    if (now - prevClickAt.current < 400) prev();
    else restartCurrent();
    prevClickAt.current = now;
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(96%,1000px)] -translate-x-1/2">
      <div className="rounded-2xl p-3 shadow-2xl border border-white/10 bg-black/70 backdrop-blur-xl">
        {/* 3-column grid: left meta, center controls, right button */}
        <div className="grid grid-cols-[1fr,auto,auto] items-center gap-3">
          {/* Left: cover + meta + seek */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={current.cover}
              alt={current.title}
              className="h-12 w-12 rounded-lg object-cover ring-1 ring-white/20"
            />
            <div className="min-w-0 w-full">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-semibold text-white">{current.title}</div>
                <LikeButton track={current} size={14} />
              </div>
              {current.artist ? (
                <Link
                  to={`/artist/${encodeURIComponent(current.artist)}`}
                  className="block truncate text-xs text-white/70 hover:underline hover:text-white"
                >
                  {current.artist}
                </Link>
              ) : null}

              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-white/60 w-8">{formatTime(progress)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={progress}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full accent-highlight"
                  aria-label="Seek"
                />
                <span className="text-[10px] text-white/60 w-8 text-right">
                  {duration ? formatTime(duration) : "0:00"}
                </span>
              </div>
            </div>
          </div>

          {/* Center: controls (explicitly centered) */}
          <div className="flex justify-center items-center gap-1">
          <IconButton
  label="Shuffle"
  active={shuffle}
  onClick={() => setShuffle(!shuffle)}
  // Shuffle just arms/disarms shuffle mode here — it doesn't jump tracks.
  // The next random pick happens naturally when this song ends or Next is pressed.
>
  <ShuffleIcon />
</IconButton>

            <IconButton label="Previous (dbl = previous track)" onClick={handlePrevSmart}>
              <PrevIcon />
            </IconButton>

            <button
              onClick={playOrStart}
              className="btn-primary h-10 w-10 rounded-full !px-0 !py-0 grid place-items-center"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <IconButton label="Next" onClick={next}>
              <NextIcon />
            </IconButton>

            <IconButton
              label={`Repeat: ${repeat}`}
              active={repeat !== "off"}
              onClick={() =>
                setRepeat((r) => (r === "off" ? "one" : r === "one" ? "all" : "off"))
              }
            >
              <RepeatIcon mode={repeat} />
            </IconButton>

            <IconButton
              label={isMuted ? "Unmute" : "Mute"}
              onClick={() => setMute(!isMuted)}
            >
              {isMuted ? <VolumeXIcon /> : <VolumeIcon />}
            </IconButton>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVol(Number(e.target.value))}
              className="w-24 accent-highlight hidden sm:block"
              aria-label="Volume"
            />
          </div>

          {/* Right: Open Player */}
          <div className="flex justify-end">
            <button
              onClick={() => nav("/player")}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
            >
              Open Player
            </button>
          </div>
        </div>

        {/* Volume for very small screens */}
        <div className="mt-2 sm:hidden">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVol(Number(e.target.value))}
            className="w-full accent-highlight"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

function IconButton({ children, onClick, label, active }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`btn h-10 w-10 !px-0 !py-0 grid place-items-center text-white transition
        ${active ? "bg-highlight/20 ring-1 ring-highlight/40" : "bg-white/5 hover:bg-white/10"}`}
    >
      <span className="flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
        {children}
      </span>
    </button>
  );
}

/* icons */
function PlayIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>); }
function PauseIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>); }
function NextIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 6v12l8.5-6L7 6zM19 6h-2v12h2z"/></svg>); }
function PrevIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6v12L8.5 12 17 6zM5 6h2v12H5z"/></svg>); }
function ShuffleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: "12px", height: "12px", stroke: "currentColor" }}
      fill="none" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}
function RepeatIcon({ mode }) {
  const dot = mode === "one" ? <text x="10" y="15" fontSize="8" fill="currentColor">1</text> : null;
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h9V4l4 4-4 4V9H7v6h5v2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>{mode !== "off" && dot}</svg>);
}
function VolumeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 010 14.14" />
      <path d="M15.54 8.46a5 5 0 010 7.07" />
    </svg>
  );
}
function VolumeXIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}