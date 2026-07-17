import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import { useAuth } from "../auth/authContext";

const BASE_LINKS = [
  { to: "/", label: "Home" },
  { to: "/player", label: "Player" },
  { to: "/charts", label: "Top 100"},
  { to: "/radio", label: "Radio" },
  { to: "/catalog", label: "Catalog" },
  { to: "/playlist", label: "Playlist" },
  { to: "/queue", label: "Queue" },
  { to: "/profile", label: "Profile" }

  /*{ to: "/jam", label: "Jam" },
{ to: "/concerts", label: "Concerts" },*/

];

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-xl text-sm font-medium transition ${
    isActive ? "bg-primary text-white" : "text-text hover:bg-white/10"
  }`;

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const links = isAdmin ? [...BASE_LINKS, { to: "/admin/upload", label: "Upload" }] : BASE_LINKS;

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <nav className="glass rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="StreamPure" className="w-12 h-12 mx-auto " />
              <span className="text-lg font-semibold">StreamPure</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass}>
                  {l.label}
                </NavLink>
              ))}
            </div>

            {/* Search — desktop */}
            <form onSubmit={onSearchSubmit} className="hidden lg:flex">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                aria-label="Search songs or artists"
                className="w-36 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 transition-all focus:w-56 focus:ring-highlight/50"
              />
            </form>

            {/* Auth state — desktop */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" className="btn-ghost">
                    {user?.displayName || "Profile"}
                  </NavLink>
                  <button onClick={handleLogout} className="btn bg-white/10 hover:bg-white/20">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="btn-ghost hidden sm:inline-flex">
                    Log in
                  </NavLink>
                  <NavLink to="/signup" className="btn-primary">
                    Sign up
                  </NavLink>
                </>
              )}
            </div>

            {/* Search icon — visible whenever the inline search box isn't (mobile/tablet) */}
            <button
              onClick={() => navigate("/search")}
              className="lg:hidden rounded-xl bg-white/10 p-2 hover:bg-white/20"
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden rounded-xl bg-white/10 p-2 hover:bg-white/20"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>

          {/* Mobile panel */}
          {open && (
            <div className="md:hidden mt-3 border-t border-white/10 pt-3">
              <form onSubmit={onSearchSubmit} className="mb-3 flex gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search songs or artists…"
                  aria-label="Search songs or artists"
                  className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-highlight/50"
                />
                <button type="submit" className="btn-primary shrink-0 rounded-xl px-4 text-sm">
                  Go
                </button>
              </form>
              <div className="flex flex-col gap-1">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                    {l.label}
                  </NavLink>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                {isAuthenticated ? (
                  <>
                    <NavLink to="/profile" className="btn-ghost flex-1 justify-center" onClick={() => setOpen(false)}>
                      {user?.displayName || "Profile"}
                    </NavLink>
                    <button onClick={handleLogout} className="btn flex-1 bg-white/10 hover:bg-white/20">
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className="btn-ghost flex-1 justify-center" onClick={() => setOpen(false)}>
                      Log in
                    </NavLink>
                    <NavLink to="/signup" className="btn-primary flex-1 justify-center" onClick={() => setOpen(false)}>
                      Sign up
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
