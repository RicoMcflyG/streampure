import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePlayer } from "../player/playerContext";

export default function Queue() {
  const navigate = useNavigate();
  const { queue, index, isPlaying, playAt, removeFromQueue, moveInQueue, clearQueue } = usePlayer();

  if (!queue.length) {
    return (
      <section className="py-10">
        <h1 className="text-3xl font-bold text-center">Upcoming Tracks</h1>
        <div className="mx-auto mt-8 max-w-3xl text-center text-white/60">
          Your queue is empty. Head to{" "}
          <button onClick={() => navigate("/playlist")} className="text-highlight hover:underline">
            Playlists
          </button>{" "}
          or{" "}
          <button onClick={() => navigate("/radio")} className="text-highlight hover:underline">
            Radio
          </button>{" "}
          to start playing something.
        </div>
      </section>
    );
  }

  const onClear = () => {
    if (!window.confirm("Clear the entire queue?")) return;
    clearQueue();
  };

  return (
    <section className="py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4 px-1">
          <h1 className="text-3xl font-bold">Upcoming Tracks</h1>
          <button
            onClick={onClear}
            className="shrink-0 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/70 hover:bg-white/15 hover:text-white"
          >
            Clear queue
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {queue.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              onClick={() => playAt(i)}
              className={`card p-4 flex items-center justify-between gap-3 cursor-pointer transition hover:bg-white/10 ${
                i === index ? "ring-1 ring-highlight/40 bg-white/10" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                {t.cover ? (
                  <img src={t.cover} alt="" className="h-12 w-12 rounded-md object-cover" />
                ) : null}
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    {t.title}
                    {i === index && (
                      <span className="ml-2 text-xs font-normal text-highlight">
                        {isPlaying ? "Now playing" : "Paused"}
                      </span>
                    )}
                  </div>
                  {t.artist ? (
                    <Link
                      to={`/artist/${encodeURIComponent(t.artist)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="block truncate text-sm muted hover:underline hover:text-white"
                    >
                      {t.artist}
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="ml-3 flex shrink-0 items-center gap-1">
                <span className="mr-2 hidden text-sm muted sm:inline">{t.durationHint || ""}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveInQueue(i, i - 1);
                  }}
                  disabled={i === 0}
                  aria-label="Move up"
                  title="Move up"
                  className="grid h-7 w-7 place-items-center rounded hover:bg-white/10 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveInQueue(i, i + 1);
                  }}
                  disabled={i === queue.length - 1}
                  aria-label="Move down"
                  title="Move down"
                  className="grid h-7 w-7 place-items-center rounded hover:bg-white/10 disabled:opacity-30"
                >
                  ▼
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(i);
                  }}
                  aria-label="Remove from queue"
                  title="Remove from queue"
                  className="grid h-7 w-7 place-items-center rounded text-white/60 hover:bg-white/10 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
