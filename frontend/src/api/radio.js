// src/api/radio.js
import api from "../api";

export async function fetchGenres() {
  try {
    const { data } = await api.get("/api/radio/genres");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Radio genres error:", err);
    return [];
  }
}

export async function fetchGenreTracks(genreId) {
  try {
    const { data } = await api.get(`/api/radio/genres/${genreId}/tracks`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Radio tracks error:", err);
    return [];
  }
}
