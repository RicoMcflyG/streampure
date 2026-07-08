import React from "react";
import { Link } from "react-router-dom";

const img = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/300/150`;

// Illustrative tour dates for StreamPure's own "house" artists — there's no
// real ticketing/tour-data API wired up, so this is demo content only.
const concerts = [
  {
    title: "Island Vibes Live",
    artist: "Lani Kai",
    date: "Oct 10, 2026",
    location: "Waikīkī Shell, Honolulu, HI",
    image: img("concert-island-vibes"),
  },
  {
    title: "Soul Shift Tour",
    artist: "Keoni Blaze",
    date: "Nov 14, 2026",
    location: "Blaisdell Arena, Honolulu, HI",
    image: img("concert-soul-shift"),
  },
  {
    title: "Mana Beats Showcase",
    artist: "Mana Beats",
    date: "Dec 6, 2026",
    location: "The Republik, Honolulu, HI",
    image: img("concert-mana-beats"),
  },
];

export default function Concerts() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-bold text-center">Upcoming Concerts</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-white/50">
        Illustrative tour dates for StreamPure's featured artists.
      </p>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {concerts.map((c, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow transition hover:shadow-lg"
          >
            <img src={c.image} alt={c.title} className="h-40 w-full object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{c.title}</h2>
              <Link
                to={`/artist/${encodeURIComponent(c.artist)}`}
                className="text-sm text-highlight hover:underline"
              >
                {c.artist}
              </Link>
              <p className="mt-1 text-sm muted">{c.date}</p>
              <p className="text-sm muted">{c.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
