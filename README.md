# StreamPure

A music streaming app (Spotify/iTunes-style) with a React/Vite frontend and an Express backend. Charts, Radio, and Search are backed live by the iTunes Search API; accounts, liked songs, and playlists are backed by MongoDB.

## Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS
- **Backend:** Node/Express, JWT auth (jsonwebtoken + bcryptjs), MongoDB via Mongoose
- **Data sources:** iTunes Search API (previews/search/artist top tracks), Apple Marketing Tools RSS (Top 100 chart)

## Features

Home, Top 100 charts, Radio (genre stations + featured), global search, full player with queue (add/remove/reorder/shuffle/repeat), liked songs, user-created playlists, auth (signup/login), profile with recently-played/most-played, artist pages, song credits, and a concerts page.

## Local development

Requires Node 18+ and a MongoDB instance (local `mongod`, Docker, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster).

```bash
# Backend
cd backend
cp .env.example .env   # then edit MONGO_URL / JWT_SECRET
npm install
npm run dev             # http://localhost:5005

# Frontend (separate terminal)
cd frontend
cp .env.example .env    # defaults already point at localhost:5005
npm install
npm run dev              # http://localhost:5173
```

Sign up for a new account from the app itself — there's no seed data.

## Deploying so other people can use it

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full walkthrough (MongoDB Atlas, Render, Vercel — all free-tier friendly).

## Project structure

```
backend/server/
  routes/        API endpoints (auth, profile, charts, radio)
  models/        Mongoose schemas (User.js is the one actually in use)
  middleware/    JWT auth guard, async error wrapper
  data/          userStore.js — thin data-access layer over the User model

frontend/src/
  pages/         One component per route
  components/    Nav, Player, MiniPlayer, SongRow, etc.
  player/        Global audio-player state (React Context)
  auth/           Auth state (React Context)
  library/        Liked songs + playlists state (React Context)
  api/            Fetch helpers for chart/radio/search endpoints
```

`FUNCTIONALITY-ROADMAP.md` has a deeper page-by-page audit and the phased feature plan this app was built against, including a list of legacy/unused files (leftover Mongoose models and routes from an earlier scaffold that were never wired up).
