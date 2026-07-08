// Small curated bios for the "house" artists that show up throughout
// StreamPure's demo data (playlists, charts, etc). Anything not listed here
// still gets a real page — just with a generic fallback bio — so every
// artist name in the app resolves to something sensible.
export const ARTIST_BIOS = {
  "keoni blaze": "Pacific hip-hop / R&B artist known for warm, cinematic production and reflective songwriting.",
  "lani kai": "Island-soul vocalist blending breezy tropical rhythms with clean, modern pop hooks.",
  "kaleo grace": "Uplifting gospel artist behind Morning Mercy — soulful praise with a modern polish.",
  "mana beats": "Producer and artist known for energetic, bass-driven island and hip-hop crossovers.",
  "dj puretone": "Mix engineer and producer credited across several StreamPure playlist tracks.",
};

export function artistBio(name) {
  if (!name) return "No bio available yet for this artist.";
  const bio = ARTIST_BIOS[name.trim().toLowerCase()];
  return bio || `No bio available yet for ${name} — check back soon.`;
}
