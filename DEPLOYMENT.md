# Deploying StreamPure

This gets you a live, public version of StreamPure that other people can sign up and use — free tier throughout:

- **Database:** MongoDB Atlas (free forever, 512MB)
- **File storage:** Cloudflare R2 (free, 10GB, no egress fees — for admin-uploaded tracks)
- **Backend:** Render (free web service — no credit card, but see the cold-start note below)
- **Frontend:** Vercel (free Hobby plan)

Total time: ~30 minutes.

---

## 0. Push the code to GitHub

The code is already committed locally to `main`, with `origin` pointing at `https://github.com/RicoMcflyG/StreamPureApp.git`. That repo currently only has a placeholder README, with no shared history with this commit, so the first push needs `--force`:

```bash
cd /path/to/StreamPure
git push -u origin main --force
```

After this, normal `git push` works for future changes.

---

## 1. MongoDB Atlas (database)

1. Create a free account at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register).
2. Create a new **free (M0)** cluster — any cloud/region is fine.
3. **Database Access** → add a database user (username + password — save the password, you'll need it below).
4. **Network Access** → add IP address → **Allow Access from Anywhere** (`0.0.0.0/0`). Render's free tier doesn't have a static IP, so this is the practical option; the database itself is still protected by the username/password from step 3.
5. **Database** → **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<username>`/`<password>` with the values from step 3, and add a database name before the `?`, e.g. `.../streampure?retryWrites=true...`. Save this full string — it's your `MONGO_URL`.

---

## 2. Cloudflare R2 (storage for admin-uploaded tracks)

The admin upload feature (a licensed-content catalog that's streamable to every user, separate from the iTunes previews on Charts/Radio/Search) needs somewhere to put audio files and cover art. Render's disk is ephemeral — anything saved to it disappears on every redeploy — so files go to Cloudflare R2 instead. R2's free tier is 10GB storage with **zero egress fees**, which matters here since every playback is a download off this bucket.

1. Create a free account at [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).
2. In the dashboard sidebar, go to **R2 Object Storage** → **Create bucket**. Name it something like `streampure-audio` (any region default is fine). Your **Account ID** is shown on this same R2 overview page — save it.
3. **Manage R2 API Tokens** → **Create API Token** → give it **Object Read & Write** permission, scoped to just this bucket. Save the **Access Key ID** and **Secret Access Key** it shows you — the secret is only shown once.
4. Open the bucket → **Settings** → **Public Access** → allow access via the **r2.dev** subdomain, and copy that public URL. This is fine to start with, but Cloudflare rate-limits `r2.dev` and marks it dev-only — before relying on this for real production traffic, connect a custom domain instead (same Settings tab, a few clicks once you own a domain).
5. You now have five values — these become env vars on Render in the next step:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME` (e.g. `streampure-audio`)
   - `R2_PUBLIC_BASE_URL` (the r2.dev URL from step 4, or your custom domain later)

If these are left unset, the app still runs fine — Charts/Radio/Search/playlists all work as before, the admin upload feature just stays disabled.

---

## 3. Backend on Render

**Option A — Blueprint (recommended):** In the Render dashboard, click **New +** → **Blueprint**, connect your GitHub account, and select the `StreamPureApp` repo. Render will read `render.yaml` from the repo root and propose a `streampure-backend` web service. When prompted, fill in the env vars:

- `MONGO_URL` → the connection string from step 1
- `JWT_SECRET` → any long random string (generate one with `openssl rand -hex 32`, or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `ALLOWED_ORIGINS` → leave blank for now, you'll fill this in after step 4
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL` → the five values from step 2

**Option B — Manual setup:** New + → Web Service → connect the repo → set **Root Directory** to `backend`, **Build Command** to `npm install`, **Start Command** to `npm start`, **Instance Type** to Free, then add the same env vars above.

Once deployed, Render gives you a URL like `https://streampure-backend.onrender.com`. Save it.

Visit `https://streampure-backend.onrender.com/healthz` — you should see `{"ok":true,"db":"connected"}`. If it says `disconnected`, double check `MONGO_URL` (a common issue is forgetting to URL-encode special characters in the password).

**Cold starts:** the free plan spins the service down after 15 minutes idle. The first request after a lull takes 30-60 seconds to wake up — normal, not a bug. If that's not acceptable, Render's paid Starter plan ($7/mo) keeps it always-on.

---

## 4. Frontend on Vercel

1. At [vercel.com](https://vercel.com), **Add New** → **Project** → import the same GitHub repo.
2. Set **Root Directory** to `frontend`. Vercel auto-detects the Vite framework preset (build command `vite build`, output `dist`) — you shouldn't need to change those.
3. Add an environment variable: `VITE_API_URL` = your Render backend URL from step 3 (e.g. `https://streampure-backend.onrender.com`, no trailing slash).
4. Deploy. Vercel gives you a URL like `https://streampure-app.vercel.app`.

`frontend/vercel.json` already handles the SPA routing fallback (so refreshing on e.g. `/playlist` doesn't 404).

---

## 5. Close the loop: CORS

Go back to the Render service → **Environment** → set `ALLOWED_ORIGINS` to your Vercel URL from step 4 (e.g. `https://streampure-app.vercel.app`). Save — Render will redeploy automatically. Without this step, the browser will block the frontend's requests to the backend with a CORS error.

If you later add a custom domain on either side, add it here too (comma-separated, e.g. `https://streampure-app.vercel.app,https://www.mystreampure.com`).

---

## 6. Make yourself an admin

Admin accounts are the only ones that can upload to the catalog (`/admin/upload`) — regular sign-up doesn't grant this. Once you've created your normal account on the live site, grant it admin from your own machine:

```bash
cd backend
MONGO_URL="<your Atlas connection string from step 1>" node server/scripts/makeAdmin.js you@example.com
```

Log out and back in on the site afterward (the admin flag is baked into your login token, so a stale token won't show the Upload link). To revoke later, rerun the script with `--revoke`.

Only upload content you actually hold the rights to stream — this catalog has no DMCA safe-harbor protection the way a third-party-upload platform would, since it's the admin account (i.e., you, the operator) doing the uploading directly.

---

## 7. Smoke test

Visit your Vercel URL and check:

- [ ] Home page loads, Top 100 / Radio show real songs with working previews
- [ ] Sign up for a new account, then refresh — you're still logged in
- [ ] Like a song, create a playlist, add a track to it — refresh the page, confirm it's still there (this is the real test that MongoDB persistence is wired up correctly, not just the JSON-file behavior from local dev)
- [ ] Search for a song and play it
- [ ] If R2 is configured: log in as your admin account, upload a track at `/admin/upload`, then confirm it plays back from `/catalog` in a normal (non-admin) session
- [ ] Open `/healthz` on the backend URL directly — confirms the API + DB connection independent of the frontend

---

## Notes

- **Rotating secrets:** if `JWT_SECRET` is ever regenerated, all existing logged-in users get signed out (their tokens stop verifying) — that's expected, not a bug.
- **Custom domain:** both Render and Vercel support adding your own domain for free under their existing plans — it's a few clicks in each dashboard once you own the domain.
- **Atlas free tier limit:** 512MB storage, shared CPU. Plenty for a small user base — this only holds accounts/likes/playlists/track metadata, not the audio files themselves (those live in R2).
- **R2 free tier limit:** 10GB storage, no egress fees. Fine for a modest licensed catalog; keep an eye on it as the catalog grows.
- **Local dev vs. production:** both `.env` files are gitignored on purpose — the committed `.env.example` files document what's needed without leaking real secrets. Local dev still points at `localhost` by default; only the hosts' dashboard env vars need the production values above.
