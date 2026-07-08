import api from "../api";

export async function fetchCategories() {
  const res = await api.get("/api/spotify/categories");
  return res.data || [];
}

export async function fetchFeaturedPlaylists(limit = 20) {
  // Use whichever you implemented on the backend:
  const res = await api.get("/api/spotify/featured", { params: { limit } });
  return res.data || [];
}

export async function fetchCategoryPlaylistsSafe(id) {
  const res = await api.get(`/api/spotify/categories/${id}/playlists`);
  return { items: res.data || [], usedFallback: false };
}

export async function fetchPlaylistTracks(playlistId) {
  const res = await api.get(`/api/spotify/playlist/${playlistId}/tracks`);
  return res.data || [];
}
