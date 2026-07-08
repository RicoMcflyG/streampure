// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Player from "./components/Player";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Playlist from "./pages/Playlist";
import Artist from "./pages/Artist";
import MiniPlayer from "./components/MiniPlayer"; // ✅ add this

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur">
        <Link to="/" className="text-xl font-bold">StreamPure</Link>
        <nav className="flex gap-3 text-sm">
          <Link className="px-3 py-1.5 rounded hover:bg-white/10" to="/">Home</Link>
          <Link className="px-3 py-1.5 rounded hover:bg-white/10" to="/player">Player</Link>
          <Link className="px-3 py-1.5 rounded hover:bg-white/10" to="/playlist">Playlists</Link>
          <Link className="px-3 py-1.5 rounded hover:bg-white/10" to="/artist">Artist</Link>
          <Link className="px-3 py-1.5 rounded hover:bg-white/10" to="/login">Login</Link>
          <Link className="px-3 py-1.5 rounded hover:bg-white/10" to="/signup">Sign Up</Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/player" element={<Player />} />
          <Route path="/artist/:name" element={<Artist />} />
          <Route path="/playlist" element={<Playlist />} />
          <Route path="/artist" element={<Artist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>

      {/* ✅ Always mounted so it pops up when there’s a current track */}
      <MiniPlayer />
    </div>
  );
}