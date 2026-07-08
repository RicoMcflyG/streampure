import React from "react";

const history = [
  { session: "Soul Shift Session", date: "Sept 22, 2025", tracks: ["Echo Light", "Ocean Pulse", "Mana Rising"] },
  { session: "Island Vibe Jam", date: "Sept 25, 2025", tracks: ["Spirit Wave", "Clean Vibes", "Pacific Soul"] },
];

export default function JamHistory() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-bold text-center">Jam Session History</h1>
      <div className="mx-auto mt-8 max-w-3xl space-y-6">
        {history.map((jam, i) => (
          <div key={i} className="card p-6">
            <h2 className="text-2xl font-semibold">{jam.session}</h2>
            <p className="text-sm muted mt-1">Date: {jam.date}</p>
            <ul className="mt-2 list-disc list-inside muted">
              {jam.tracks.map((t, idx) => <li key={idx}>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
