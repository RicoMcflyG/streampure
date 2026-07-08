import React from "react";
import { useNavigate } from "react-router-dom";

const session = {
  name: "Soul Shift Session",
  track: "Echo Light",
  members: ["Dean", "Lani", "Keoni", "Mana"],
};

export default function JamDashboard() {
  const navigate = useNavigate();
  return (
    <section className="py-10">
      <div className="mx-auto max-w-3xl card p-8">
        <h1 className="text-3xl font-bold text-center">{session.name}</h1>

        <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-xs muted">Now Playing</p>
          <h2 className="text-xl font-semibold">{session.track}</h2>
        </div>

        <h2 className="mt-6 text-xl font-semibold text-highlight">Members</h2>
        <ul className="mt-2 flex flex-wrap gap-3">
          {session.members.map((m, i) => (
            <li key={i} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 shadow">{m}</li>
          ))}
        </ul>

        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => navigate("/jam-history")} className="btn bg-white/10 hover:bg-white/20">View Jam History</button>
          <button onClick={() => navigate("/")} className="btn-primary">End Session</button>
        </div>
      </div>
    </section>
  );
}
