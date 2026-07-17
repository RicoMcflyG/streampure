import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import api from "../api";

export default function AdminUpload() {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tracks, setTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  const loadTracks = async () => {
    setLoadingTracks(true);
    try {
      const { data } = await api.get("/api/tracks");
      setTracks(data || []);
    } finally {
      setLoadingTracks(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadTracks();
  }, [isAdmin]);

  if (authLoading) {
    return <div className="py-16 text-center text-sm text-white/60">Loading…</div>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!audioFile) {
      setError("Choose an audio file first.");
      return;
    }

    const form = new FormData();
    form.append("audio", audioFile);
    if (coverFile) form.append("cover", coverFile);
    if (title.trim()) form.append("title", title.trim());
    if (artist.trim()) form.append("artist", artist.trim());

    setSubmitting(true);
    try {
      await api.post("/api/admin/tracks", form);
      setSuccess("Track uploaded — it's now streamable to everyone.");
      setAudioFile(null);
      setCoverFile(null);
      setTitle("");
      setArtist("");
      e.target.reset();
      loadTracks();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Remove this track for everyone? This can't be undone.")) return;
    try {
      await api.delete(`/api/admin/tracks/${id}`);
      setTracks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section className="py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Upload to Catalog</h1>
        <p className="mt-2 text-white/60">
          Tracks uploaded here are streamable to every StreamPure user. Only upload music you
          have the rights to distribute.
        </p>

        <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium">Audio file *</label>
            <input
              type="file"
              accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/ogg,.mp3,.m4a,.wav,.ogg"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-white/80"
            />
            <p className="mt-1 text-xs text-white/50">MP3, M4A, WAV, or OGG — up to 25MB.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Cover image (optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-white/80"
            />
            <p className="mt-1 text-xs text-white/50">
              Falls back to the file's embedded artwork if present, otherwise a placeholder.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Auto-detected if left blank"
                className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-highlight/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Artist</label>
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Auto-detected if left blank"
                className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-highlight/50"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-highlight">{success}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
            {submitting ? "Uploading…" : "Upload"}
          </button>
        </form>

        <h2 className="mt-10 text-xl font-semibold">Catalog ({tracks.length})</h2>
        {loadingTracks ? (
          <p className="mt-3 text-sm text-white/60">Loading…</p>
        ) : tracks.length === 0 ? (
          <p className="mt-3 text-sm text-white/60">Nothing uploaded yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {tracks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                {t.cover ? (
                  <img src={t.cover} alt="" className="h-10 w-10 rounded object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded bg-white/10" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{t.title}</div>
                  <div className="truncate text-xs text-white/60">{t.artist}</div>
                </div>
                <button
                  onClick={() => onDelete(t.id)}
                  className="shrink-0 rounded-md bg-white/10 px-3 py-1.5 text-xs text-red-300 hover:bg-white/15"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
