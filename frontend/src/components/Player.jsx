import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { usePlayer } from "../player/playerContext";
import LikeButton from "./LikeButton";

function QueueRow({ t, i, index, isPlaying, playAt, removeFromQueue }) {
  return (
    <li
      onClick={() => playAt(i)} // autoplay on click
      className={`group flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-white/10 ${
        i === index ? "bg-white/10 ring-1 ring-highlight/40" : ""
      }`}
    >
      <img src={t.cover} alt="" className="h-12 w-12 rounded-md object-cover" />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{t.title}</div>
        <div className="truncate text-xs text-white/60">{t.artist}</div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className="text-xs text-white/60">{t.durationHint ?? ""}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeFromQueue(i);
          }}
          aria-label="Remove from queue"
          title="Remove from queue"
          className="grid h-6 w-6 place-items-center rounded text-white/40 opacity-0 transition hover:bg-white/10 hover:text-red-300 group-hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </li>
  );
}

function formatTime(s) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const rem = Math.floor(s % 60);
  return `${m}:${String(rem).padStart(2, "0")}`;
}

export default function Player() {
  const {
    queue, index, current,
    isPlaying, next,
    progress, duration, seek,
    volume, setVol, isMuted, setMute,
    repeat, setRepeat, shuffle, setShuffle,
    // new helpers
    restartCurrent, playOrStart, playAt,
    prev, // still used for "real previous" on double-click
    removeFromQueue, clearQueue,
  } = usePlayer();

  // detect double-click for Prev behavior
  const prevClickAt = useRef(0);
  const handlePrevSmart = () => {
    const now = Date.now();
    if (now - prevClickAt.current < 400) {
      // double-click -> previous track
      prev();
    } else {
      // single-click -> restart song (always, regardless of position)
      restartCurrent();
    }
    prevClickAt.current = now;
  };

  return (
    <section className="py-6">
      <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-[1fr,360px]">
        {/* Player Card */}
        <div className="card p-6">
          <div className="flex items-start gap-5">
            <div className="h-40 w-40 rounded-xl bg-white/5 ring-2 ring-primary/60 overflow-hidden grid place-items-center">
              {current?.cover ? (
                <img
                  src={current.cover}
                  alt={current?.title || "cover"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-xs text-white/50 px-3 text-center">No track</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl font-bold">
                  {current?.title || "Nothing playing"}
                </h2>
                {current && <LikeButton track={current} size={22} className="mt-1" />}
              </div>
              <p className="text-sm text-white/70">
                {current?.artist ? (
                  <Link to={`/artist/${encodeURIComponent(current.artist)}`} className="hover:underline hover:text-white">
                    {current.artist}
                  </Link>
                ) : queue.length ? (
                  "Press Play to start the queue"
                ) : (
                  "Choose a track to begin"
                )}
              </p>
              {current && (
                <Link
                  to="/song-credits"
                  className="mt-1 inline-block text-xs text-white/50 hover:text-white hover:underline"
                >
                  View credits
                </Link>
              )}

              {/* Controls */}
              <div className="mt-4 flex items-center gap-2">
              <IconButton
  label="Shuffle"
  active={shuffle}
  onClick={() => setShuffle(!shuffle)}
  // Shuffle just arms/disarms shuffle mode here — it doesn't jump tracks.
  // The next random pick happens naturally when this song ends or Next is pressed.
>
  <ShuffleIcon />
</IconButton>

                <IconButton label="Prev (dbl = previous track)" onClick={handlePrevSmart}>
                  <PrevIcon />
                </IconButton>

                <button
                  onClick={playOrStart}
                  className="btn-primary h-12 w-12 rounded-full !px-0 !py-0 grid place-items-center disabled:opacity-50"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  disabled={queue.length === 0}
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
              </div>

              {/* Progress */}
              <div className="mt-4">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={progress}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full accent-highlight"
                  disabled={!current?.preview}
                />
                <div className="mt-1 flex justify-between text-xs text-white/60">
                  <span>{formatTime(progress)}</span>
                  <span>{duration ? formatTime(duration) : "0:00"}</span>
                </div>
              </div>

              {/* Volume */}
              <div className="mt-4 flex items-center gap-3">
                <IconButton onClick={() => setMute(!isMuted)} label="Mute / Unmute">
                  {isMuted ? <VolumeXIcon /> : <VolumeIcon />}
                </IconButton>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVol(Number(e.target.value))}
                  className="w-40 accent-highlight"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Queue */}
        <aside className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Queue</h3>
            <div className="flex items-center gap-3">
              {queue.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm("Clear the entire queue?")) clearQueue();
                  }}
                  className="text-xs text-white/50 hover:text-white"
                >
                  Clear
                </button>
              )}
              <Link to="/queue" className="text-xs text-highlight hover:underline">
                Full view
              </Link>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="mt-4 text-sm text-white/60">Queue is empty.</div>
          ) : (
            <ul className="mt-3 space-y-2">
              {queue.map((t, i) => (
                <QueueRow
                  key={`${t.id}-${i}`}
                  t={t}
                  i={i}
                  index={index}
                  isPlaying={isPlaying}
                  playAt={playAt}
                  removeFromQueue={removeFromQueue}
                />
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}

/* ---------- tiny inline icons (no deps) ---------- */
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
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 7h9V4l4 4-4 4V9H7v6h5v2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>
      {mode !== "off" && dot}
    </svg>
  );
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
function IconButton({ children, onClick, label, active }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`btn h-10 px-3 text-white flex items-center justify-center transition
        ${active ? "bg-highlight/20 ring-1 ring-highlight/40" : "bg-white/5 hover:bg-white/10"}`}
    >
      <span className="flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
        {children}
      </span>
    </button>
  );
}