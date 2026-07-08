import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
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

          <div className="relative">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent" />
                <div>
                  <p className="text-xs muted">Now playing</p>
                  <h3 className="text-lg font-semibold">Echo Light</h3>
                  <p className="text-sm muted">Keoni Blaze • Pacific Soul</p>
                </div>
              </div>
              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 bg-gradient-to-r from-primary to-highlight" />
              </div>
              <div className="mt-5 flex items-center justify-between text-sm muted">
                <span>1:08</span><span>3:42</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured tiles */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Artist Spotlight", desc: "Island soul & clean hip-hop.", link: "/artist/Keoni%20Blaze" },
            { title: "Your Playlist", desc: "Curate, share, repeat.", link: "/playlist" },
            { title: "Jam Sessions", desc: "Sync and vibe together.", link: "/jam" },
          ].map((t) => (
            <Link to={t.link} key={t.title} className="card p-6 hover:scale-[1.01] transition">
              <h3 className="text-lg font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm muted">{t.desc}</p>
              <div className="mt-4 text-sm font-semibold text-highlight">Open →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
