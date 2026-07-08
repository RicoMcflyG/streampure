// Illustrative "house" credits for StreamPure's own fictional artists (the
// ones behind the curated playlists / Radio genre demo data). There's no
// real personnel-credits data source wired up (iTunes' Search API doesn't
// expose songwriter/producer info), so tracks by any other artist — i.e.
// anything pulled live from Charts, Radio, Search, or an Artist page for a
// real-world musician — fall back to an honest "not available" message
// instead of inventing names for a real song.
const HOUSE_CREDITS = {
  "keoni blaze": [
    { role: "Writer", name: "Keoni Blaze" },
    { role: "Producer", name: "Mana Beats" },
    { role: "Mix Engineer", name: "DJ PureTone" },
  ],
  "lani kai": [
    { role: "Writer", name: "Lani Kai" },
    { role: "Vocalist", name: "Lani Kai" },
    { role: "Producer", name: "Mana Beats" },
    { role: "Mix Engineer", name: "DJ PureTone" },
  ],
  "kaleo grace": [
    { role: "Writer", name: "Kaleo Grace" },
    { role: "Vocalist", name: "Kaleo Grace" },
    { role: "Producer", name: "Mana Beats" },
    { role: "Mix Engineer", name: "DJ PureTone" },
  ],
  "mana beats": [
    { role: "Writer / Producer", name: "Mana Beats" },
    { role: "Mix Engineer", name: "DJ PureTone" },
  ],
  "dj puretone": [{ role: "Writer / Producer", name: "DJ PureTone" }],
};

export function creditsFor(artist) {
  if (!artist) return null;
  return HOUSE_CREDITS[artist.trim().toLowerCase()] || null;
}
