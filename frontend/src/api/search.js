// src/api/search.js
import api from "../api";

// Powers the global search bar (Nav.jsx) and the /search page. Backed by
// GET /api/charts/search, which itself queries iTunes Search and caches
// results for a few minutes (see backend/server/routes/charts.js).
export async function searchTracks(q) {
  const query = (q || "").trim();
  if (!query) return [];
  try {
    const { data } = await api.get("/api/charts/search", { params: { q: query } });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
