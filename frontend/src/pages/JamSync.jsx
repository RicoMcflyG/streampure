import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JamSync() {
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState("");
  const [previewTrack] = useState("Soul Shift");

  const start = () => { if (sessionName) navigate("/jam-dashboard"); };

  return (
    <section className="py-10 grid place-items-center">
      <div className="card p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold">Sync Your Jam</h1>
        <p className="mt-2 muted">Name your session and preview the first track.</p>
        <input
          className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-highlight"
          placeholder="Session Name" value={sessionName} onChange={(e)=>setSessionName(e.target.value)}
        />
        <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-4">
          <p className="text-xs muted">Preview Track</p>
          <h2 className="text-xl font-semibold">{previewTrack}</h2>
        </div>
        <button onClick={start} className="btn-primary w-full mt-6">Start Jam</button>
      </div>
    </section>
  );
}
