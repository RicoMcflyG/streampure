// File: src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import AppShell from "./components/AppShell";
import MiniPlayer from "./components/MiniPlayer.jsx";
import { PlayerProvider } from "./player/playerContext";
import { AuthProvider } from "./auth/authContext";
import { LibraryProvider } from "./library/libraryContext";

// Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import Playlist from "./pages/Playlist.jsx";
import Artist from "./pages/Artist.jsx";
import Queue from "./pages/Queue.jsx";
import Radio from "./pages/Radio.jsx";
import Jam from "./pages/Jam.jsx";
import JamSync from "./pages/JamSync.jsx";
import JamDashboard from "./pages/JamDashboard.jsx";
import JamHistory from "./pages/JamHistory.jsx";
import SongCredits from "./pages/SongCredits.jsx";
import Concerts from "./pages/Concerts.jsx";
import Player from "./components/Player.jsx";
import Charts from "./pages/Charts.jsx"
import Search from "./pages/Search.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LibraryProvider>
          <PlayerProvider>
            <AppShell>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/charts" element={<Charts />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/playlist" element={<Playlist />} />
                <Route path="/artist/:name" element={<Artist />} />
                <Route path="/queue" element={<Queue />} />
                <Route path="/search" element={<Search />} />
                <Route path="/radio" element={<Radio />} />
                <Route path="/jam" element={<Jam />} />
                <Route path="/jam-sync" element={<JamSync />} />
                <Route path="/jam-dashboard" element={<JamDashboard />} />
                <Route path="/jam-history" element={<JamHistory />} />
                <Route path="/song-credits" element={<SongCredits />} />
                <Route path="/concerts" element={<Concerts />} />
                <Route path="/player" element={<Player />} />
              </Routes>

              {/* Sticky mini player shows on every page (except we hide it on /player) */}
              <MiniPlayer />
            </AppShell>
          </PlayerProvider>
        </LibraryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
