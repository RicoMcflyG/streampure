# StreamPure — Functionality Roadmap Toward Spotify/iTunes Parity

This is a page-by-page audit of what's real, what's a mock/placeholder, and what it would take to close the gap with a real streaming app. It's based on reading every page and every backend route currently in the repo, not just the pages you named — the login/profile gap turned out to be the single biggest opportunity, for a reason worth flagging up front:

> **The backend already has a fully working JWT login/signup/play-history system (`routes/auth.js`, `routes/profile.js`, `data/userStore.js`), already mounted in `server.js` — and the frontend never calls any of it.** Login/Signup/Profile are 100% disconnected mocks sitting on top of a backend that already does the real thing. Wiring the frontend to what's already there is the highest-value, lowest-effort change available.

---

## TL;DR — do these first

1. **Wire up Login/Signup/Profile** to the existing `/api/auth/*` and `/api/profile/*` endpoints. This alone gets you real accounts, real sessions, and real listening history.
2. **Add an auth-aware Nav** (name/Log out instead of always showing Log in/Sign up) + a **mobile menu** (right now nav links vanish below the `md` breakpoint with nothing replacing them — phones currently can't navigate to Charts/Radio/Playlist/Queue/Profile at all).
3. **Make Artist dynamic** (`/artist/:name`) so artist links across the app go somewhere real instead of all landing on the same hardcoded "Keoni Blaze" page.
4. **Fix the hardcoded `http://localhost:5005` API base URL** — this will break the app the moment it's deployed anywhere but your own machine.
5. **Decide on one backend data strategy.** There are two competing ones in the repo right now (see below) — carrying both is confusing and one of them doesn't even run.

---

## The architectural fork you should resolve first

The backend has **two separate, incompatible systems** for users/data:

- **A: JSON-file + JWT** (`backend/server/data/userStore.js`, `routes/auth.js`, `routes/profile.js`) — simple, no external dependencies, **actually mounted and working**. Handles signup/login/`/me`, plus per-user `recentlyPlayed` and `playCounts`.
- **B: MongoDB + Mongoose** (`models/User.js`, `models/Jam.js`, `models/Queue.js`, `models/JamSession.js`, `models/JamMember.js`, `models/JamHistory.js`, `models/Track.js`, `models/Song.js`, `models/Station.js`, `models/Artist.js`, `models/Concert.js`, `models/Playback.js`, plus `routes/user.js`, `routes/queue.js`, `routes/jam.js`, `routes/song.js`, `routes/station.js`, `routes/artist.js`, `routes/concert.js`, `routes/playlist.js`) — **none of these routes are mounted in `server.js`, and nothing in the app ever calls `mongoose.connect()`**, even though `.env` has a `MONGO_URL`. This entire layer is dead code today.

Recommendation: keep **A** for auth/profile (it already works, ship it), and treat **B** as a deliberate future migration if/when you need real multi-user features — Jam sessions in particular really do need a real database and can't stay on a JSON file once more than one person is involved. Don't build on both at once.

---

## Page by page

### Login / Signup
**Now:** typing anything non-empty and submitting just calls `navigate("/profile")`. No request is ever sent, nothing is persisted, refreshing the page "logs you out" because there was never a session to begin with.
**What's already there for you:** `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me` — bcrypt password hashing, JWT issuance, all functional.
**Suggested next steps:**
- Add a small `AuthProvider` (same pattern as the existing `PlayerProvider`) exposing `user`, `token`, `login()`, `signup()`, `logout()`, wrapped around the app in `main.jsx`.
- Point the two forms at the real endpoints; store the returned JWT (localStorage is fine to start); show the real error message on failure (`"Invalid credentials"`, `"Email already in use"`) instead of silently doing nothing.
- Attach the token to `api.js` requests (an axios request interceptor adding `Authorization: Bearer <token>`).
- Nice-to-haves once the basics work: loading spinner on submit, password-length validation, "Forgot password," social login.

### Profile
**Now:** fully hardcoded — a fake name/email, a `placeholder.com` avatar (that service has been unreliable — worth avoiding regardless), and two invented "jam session" entries. It doesn't reflect anyone actually logged in, because no one can be.
**What's already there for you:** `GET /api/profile/recently-played` returns real `{ recently, mostPlayed }` per user, and `POST /api/profile/log-play` already builds that history — but nothing in the frontend calls `log-play` today, so it'd come back empty even if you wired up the page right now.
**Suggested next steps:**
- Fetch `/api/auth/me` for the header (name/email) once auth exists; add a real Log out button.
- Call `POST /api/profile/log-play` from `playerContext.jsx` whenever `current` changes to a track with a preview (fire-and-forget) — this is what makes "recently played" real.
- Replace the fake jam-history block with a real "Recently Played" / "Most Played" section — much closer to what Spotify/Apple Music actually show on a profile, and the data already fits.
- Swap the placeholder avatar for an initials-based fallback.

### Nav (site-wide)
**Now:** always shows "Log in"/"Sign up" regardless of session state (there's no session state to check). Nav links are `hidden md:flex` with **no mobile fallback at all** — on a phone, the only reachable pages are Home and Login/Signup. There's also no search anywhere in the app.
**Suggested next steps:**
- Swap Log in/Sign up for name + Log out once auth exists.
- Add a hamburger/mobile menu — this isn't cosmetic, it's a real navigation dead-end on small screens today.
- Add global search (tracks/artists) — arguably the single most-used affordance in both Spotify and Apple Music, and StreamPure has none. Could reuse the iTunes search plumbing already built for Charts/Radio previews.

### Home
**Now:** static marketing hero + three feature tiles (Artist, Playlist, Jam), identical for every visitor.
**Suggested next steps:**
- Once auth + recently-played exist, show a personalized "Jump back in" strip for logged-in users, keep the current hero for logged-out visitors.
- The tiles currently point to a single hardcoded artist and to the fully-mocked Jam flow — until those are built out, consider pointing tiles at Top 100 / Radio instead, since those are the two genuinely functional discovery surfaces right now.

### Artist
**Now:** the route is `/artist` with no dynamic segment — the component just defaults to a hardcoded "Keoni Blaze" bio. Nothing anywhere in the app ever passes a different artist in, so every artist reference in the whole app leads to the same static page. (Interesting detail: a `/artist/:name` route already exists — in the dead, unused `App.jsx` file — suggesting this was the original intent and just never got finished in the real router.)
**Suggested next steps:**
- Make it `/artist/:name`, read the name via `useParams()`.
- Make artist names clickable throughout the app (SongRow, Player, MiniPlayer, Charts, Queue) linking there.
- Pull a real bio/top-tracks per name — the iTunes Search API you're already using for previews can fetch an artist's top songs; the dead `models/Artist.js` + `routes/artist.js` is also there if you migrate to Mongo.

### Playlists (curated, `/playlist`)
**Now:** three fixed editorial playlists, fully playable end-to-end (fixed this session). No "Liked Songs," no user-created playlists, no way to save a track you're hearing elsewhere into a playlist.
**Suggested next steps:**
- Add "Liked Songs" as an always-present playlist — heart icon on SongRow/Player/MiniPlayer, backed by a new field in the same user-store pattern as `recentlyPlayed`.
- Let users create/name their own playlists and add tracks via an "Add to playlist" item in the existing SongRow "⋯" menu.
- Persist playlists server-side using the same store.

### Queue
**Now:** fixed this session to show the real live queue with click-to-play. Still no way to remove a track or reorder the queue — `playerContext` only supports appending.
**Suggested next steps:** add `removeFromQueue(index)` and drag-to-reorder to `playerContext.jsx`, plus a "✕" per row and a "Clear queue" button on both `Queue.jsx` and the Player page's queue panel.

### Charts (Top 100) / Radio
**Now:** both were the focus of this session's fixes — real playlist behavior, background-resolved previews, working queue navigation.
**Suggested next steps (minor):** hook both into the same `log-play` call so they count toward Profile's history; a small search/filter box would help once the list is a real playlist.

### Jam family (Jam / JamSync / JamDashboard / JamHistory)
**Now:** all four pages are 100% static mock data. No session is ever actually created or joined, and there's no real-time layer at all (no WebSocket library anywhere in `package.json`), so true "listen together" isn't possible yet. The backend has a REST-shaped sketch of exactly this feature (`JamSession`/`JamMember`/`JamHistory` models + `routes/jam.js` with create/join/dashboard/history endpoints) but it's on the dead Mongoose path described above.
**Honest assessment:** this is the biggest lift in the app by a wide margin, and probably deserves its own phase rather than a quick pass:
1. Get MongoDB actually connected and `routes/jam.js` mounted, so sessions at least persist over REST.
2. Layer real-time sync on top (Socket.IO or similar) for shared playback position between members.
3. Wire `JamSync`/`JamDashboard` to the real endpoints instead of the hardcoded session object.

### Song Credits
**Now:** static credits for one fictional song, not linked from anywhere (not in Nav, not from the Player page), and unrelated to whatever's actually playing.
**Suggested next steps:** link it from the Player page ("View credits" for the current track, the way Spotify does it), and have it read the currently-playing track from `playerContext` instead of a fixed object.

### Concerts
**Now:** static list of 3 concerts, also not linked from anywhere.
**Suggested next steps:** at minimum link it from Nav/Artist; real listings would need a live events API (Bandsintown/Songkick-style) keyed off artists the user actually listens to — a bigger lift, reasonable to leave curated/static short-term but it should at least be reachable.

### Player / Mini Player
**Now:** fully functional after this session's fixes (play/pause, next/prev, shuffle, repeat, seek, volume, queue).
**Suggested next steps:** a "like" button on the current track (ties into Liked Songs above), and hooking up the browser's Media Session API so OS media keys / lock-screen / earbud controls work — a small addition that goes a long way toward feeling like a real player.

---

## Cross-cutting technical items

- **Hardcoded API URL:** `frontend/src/api.js` points at `http://localhost:5005` unconditionally. This will silently break the instant the frontend is deployed anywhere else, since the deployed frontend would still try to reach the visitor's own machine. Switch to an env var (`import.meta.env.VITE_API_URL`) with localhost only as the dev default.
- **CORS placeholder:** `server.js`'s allowlist includes a guessed `https://streampure.vercel.app` — update it to the real deployed URL once you have one, or the deployed frontend will be blocked by CORS.
- **Dead code worth removing** (all confirmed unused): `frontend/src/App.jsx`, `frontend/src/pages/PlayerPage.jsx`, `frontend/src/api/spotify.js`, `backend/server/models/Playback.js`, and the unmounted Mongoose routes/models listed above (unless/until you migrate to Mongo). Also `bcrypt` is in `backend/package.json` but only `bcryptjs` is actually used anywhere.
- **No error boundary** around the app — a thrown error on any one page can currently blank the whole screen instead of failing gracefully.
- **No automated tests** in either package.
- **`backend/.env`** still has leftover scratch notes/curl commands with old Spotify bearer tokens from earlier debugging — safe to delete now that Radio runs on iTunes instead.

---

## Suggested sequencing

**Phase 1 — wiring (fast, mostly connecting frontend to backend that already exists):** Auth (Login/Signup/Nav/Profile), mobile nav menu, dynamic Artist route, env-based API URL.

**Phase 2 — real features (moderate new work):** Liked Songs, user-created playlists, queue remove/reorder, link up Song Credits/Concerts, global search.

**Phase 3 — infrastructure (larger, needs a real database):** Mongo migration, real-time Jam sessions, deployment hardening.

Happy to start on any of these — Phase 1 in particular is mostly plumbing work against endpoints that already exist and would make the biggest visible difference.
