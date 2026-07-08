import React from "react";
import { Link } from "react-router-dom";
import { usePlayer } from "../player/playerContext";
import { creditsFor } from "../lib/songCredits";

export default function SongCredits() {
  const { current } = usePlayer();
  const contributors = current ? creditsFor(current.artist) : null;

  if (!current) {
    return (
      <section className="py-10">
        <div className="mx-auto max-w-2xl card p-8 text-center">
          <h1 className="text-3xl font-bold">Song Credits</h1>
          <p className="mt-4 text-white/60">
            Play a song to see its credits here.
          </p>
          <Link to="/charts" className="mt-4 inline-block text-highlight hover:underline">
            Browse Top 100 →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      <div className="mx-auto max-w-2xl card p-8">
        <h1 className="text-3xl font-bold text-center">Song Credits</h1>

        <div className="mt-6 flex flex-col items-center text-center">
          {current.cover ? (
            <img
              src={current.cover}
              alt=""
              className="h-32 w-32 rounded-xl object-cover ring-2 ring-primary/40"
            />
          ) : null}
          <h2 className="mt-4 text-xl font-semibold">{current.title}</h2>
          <p className="text-sm muted">
            {current.artist ? (
              <Link
                to={`/artist/${encodeURIComponent(current.artist)}`}
                className="hover:underline hover:text-white"
              >
                {current.artist}
              </Link>
            ) : (
              "Unknown artist"
            )}
          </p>
        </div>

        {contributors ? (
          <ul className="mt-6 space-y-3">
            {contributors.map((c, i) => (
              <li key={i} className="rounded-lg bg-white/5 border border-white/10 p-3">
                <p className="text-sm">
                  <span className="muted">{c.role}:</span> {c.name}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-center text-sm text-white/50">
            Detailed songwriting and production credits aren't available from
            our music data source for this track yet.
          </p>
        )}
      </div>
    </section>
  );
}
