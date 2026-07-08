// src/api/charts.js
import api from "../api";

export async function fetchAppleUSTop100() {
  try {
    const { data } = await api.get("/api/charts/apple/us-top100");
    console.log("Top100 from backend:", data);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Top100 frontend error:", err);
    return [];
  }
}

export async function fetchPreviewFor(title, artist) {
  try {
    const { data } = await api.get("/api/charts/preview", {
      params: { title, artist },
    });
    console.log("Preview lookup:", { title, artist, data });
    return data; // { previewUrl, artwork }
  } catch (err) {
    console.error("Preview frontend error:", err);
    return { previewUrl: null, artwork: null };
  }
}

// Resolves previews for a whole list of tracks in one request so a chart can
// be loaded as a real playlist (Next/Prev across every song) instead of only
// ever playing the single track that was clicked.
// tracks: [{ id, title, artist }, ...] -> { [id]: { previewUrl, artwork } }
export async function fetchPreviewsBatch(tracks) {
  if (!tracks?.length) return {};
  try {
    const { data } = await api.post("/api/charts/previews", { tracks });
    return data || {};
  } catch (err) {
    console.error("Batch preview error:", err);
    return {};
  }
}

// Real, already-playable top tracks for an artist page (previews included).
export async function fetchArtistTopTracks(name) {
  if (!name) return [];
  try {
    const { data } = await api.get(`/api/charts/artist/${encodeURIComponent(name)}/top`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Artist top-tracks error:", err);
    return [];
  }
}