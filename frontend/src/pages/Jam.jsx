import React from "react";
import { useNavigate } from "react-router-dom";

export default function Jam() {
  const navigate = useNavigate();
  return (
    <section className="py-10 grid place-items-center">
      <div className="card p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold">Start a Jam Session</h1>
        <p className="mt-2 muted">Collaborate in real time. Share tracks, sync playback, and vibe together.</p>
        <div className="mt-6 space-y-3">
          <button onClick={() => navigate("/jam-sync")} className="btn-primary w-full">Create New Jam</button>
          <button onClick={() => navigate("/jam-dashboard")} className="btn w-full bg-white/10 hover:bg-white/20">Join Existing Jam</button>
        </div>
      </div>
    </section>
  );
}
