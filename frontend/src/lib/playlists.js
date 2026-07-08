// Themed demo playlists (10 tracks each) with unique cover art per track.
// Swap `src` with your real MP3 URLs anytime (CDN, S3, /public/audio/*, etc.)
// Covers use picsum with seeds for consistency.

const img = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/300/300`;

export const PLAYLISTS = [
  {
    id: "gospel-flow",
    name: "🔥 Gospel Flow",
    description: "Uplifting, soulful praise with modern polish.",
    color: "from-primary to-accent",
    cover: img("playlist-gospel"),
    tracks: [
      { id: 1,  title: "Light Up My Way",   artist: "Kaleo Grace", album: "Morning Mercy",  cover: img("gospel-light-up-my-way"),   src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",  durationHint: "3:42" },
      { id: 2,  title: "Hallelujah Drive",  artist: "Kaleo Grace", album: "Morning Mercy",  cover: img("gospel-hallelujah-drive"),  src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",  durationHint: "3:58" },
      { id: 3,  title: "Grace Tide",        artist: "Kaleo Grace", album: "Morning Mercy",  cover: img("gospel-grace-tide"),        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",  durationHint: "3:55" },
      { id: 4,  title: "Sunday Skyline",    artist: "Kaleo Grace", album: "Morning Mercy",  cover: img("gospel-sunday-skyline"),    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",  durationHint: "4:01" },
      { id: 5,  title: "Open Hands",        artist: "Kaleo Grace", album: "Morning Mercy",  cover: img("gospel-open-hands"),        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",  durationHint: "3:49" },
      { id: 6,  title: "Shine Through",     artist: "Kaleo Grace", album: "Morning Mercy",  cover: img("gospel-shine-through"),     src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",  durationHint: "3:37" },
      { id: 7,  title: "Faith Electric",    artist: "Kaleo Grace", album: "Morning Mercy",  cover: img("gospel-faith-electric"),    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",  durationHint: "3:33" },
      { id: 8,  title: "Horizon Hymn",      artist: "Kaleo Grace", album: "Morning Mercy",  cover: img("gospel-horizon-hymn"),      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",  durationHint: "3:47" },
      { id: 9,  title: "Golden Choir",      artist: "Kaleo Grace", album: "Morning Mercy",  cover: img("gospel-golden-choir"),      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",  durationHint: "4:10" },
      { id: 10, title: "Amen Afterglow",    artist: "Kaleo Grace", album: "Morning Mercy",  cover: img("gospel-amen-afterglow"),    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", durationHint: "4:04" },
    ],
  },
  {
    id: "island-vibes",
    name: "🌊 Island Vibes",
    description: "Tropical, breezy rhythms for Pacific sunsets.",
    color: "from-highlight to-primary",
    cover: img("playlist-island"),
    tracks: [
      { id: 11, title: "Ocean Breeze",      artist: "Lani Kai", album: "Shorelines", cover: img("island-ocean-breeze"),     src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", durationHint: "3:48" },
      { id: 12, title: "Sunset Drift",      artist: "Lani Kai", album: "Shorelines", cover: img("island-sunset-drift"),     src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", durationHint: "3:59" },
      { id: 13, title: "Coconut Grove",     artist: "Lani Kai", album: "Shorelines", cover: img("island-coconut-grove"),    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", durationHint: "3:44" },
      { id: 14, title: "Hibiscus Air",      artist: "Lani Kai", album: "Shorelines", cover: img("island-hibiscus-air"),     src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", durationHint: "3:30" },
      { id: 15, title: "Tide Turner",       artist: "Lani Kai", album: "Shorelines", cover: img("island-tide-turner"),      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", durationHint: "3:52" },
      { id: 16, title: "Palm Lights",       artist: "Lani Kai", album: "Shorelines", cover: img("island-palm-lights"),      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3", durationHint: "3:39" },
      { id: 17, title: "Sandalwood Sky",    artist: "Lani Kai", album: "Shorelines", cover: img("island-sandalwood-sky"),   src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",  durationHint: "3:40" },
      { id: 18, title: "Lagoon Echo",       artist: "Lani Kai", album: "Shorelines", cover: img("island-lagoon-echo"),      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",  durationHint: "4:02" },
      { id: 19, title: "Trade Wind Trail",  artist: "Lani Kai", album: "Shorelines", cover: img("island-trade-wind-trail"), src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",  durationHint: "3:57" },
      { id: 20, title: "Shell Song",        artist: "Lani Kai", album: "Shorelines", cover: img("island-shell-song"),       src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",  durationHint: "4:06" },
    ],
  },
  {
    id: "soundtrack-sundays",
    name: "🎬 Soundtrack Sundays",
    description: "Cinematic themes for focus, reflection, and wonder.",
    color: "from-accent to-highlight",
    cover: img("playlist-soundtrack"),
    tracks: [
      { id: 21, title: "Echo Light",     artist: "Keoni Blaze", album: "Frames", cover: img("cinema-echo-light"),     src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",  durationHint: "3:42" },
      { id: 22, title: "Ocean Pulse",    artist: "Keoni Blaze", album: "Frames", cover: img("cinema-ocean-pulse"),    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",  durationHint: "3:58" },
      { id: 23, title: "Spirit Wave",    artist: "Keoni Blaze", album: "Frames", cover: img("cinema-spirit-wave"),    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",  durationHint: "3:37" },
      { id: 24, title: "Starlit Script", artist: "Keoni Blaze", album: "Frames", cover: img("cinema-starlit-script"), src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",  durationHint: "3:33" },
      { id: 25, title: "Velvet Scene",   artist: "Keoni Blaze", album: "Frames", cover: img("cinema-velvet-scene"),   src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",  durationHint: "3:55" },
      { id: 26, title: "Slow Fade",      artist: "Keoni Blaze", album: "Frames", cover: img("cinema-slow-fade"),      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", durationHint: "4:01" },
      { id: 27, title: "Montage Bloom",  artist: "Keoni Blaze", album: "Frames", cover: img("cinema-montage-bloom"),  src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", durationHint: "3:48" },
      { id: 28, title: "Lens Flare",     artist: "Keoni Blaze", album: "Frames", cover: img("cinema-lens-flare"),     src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", durationHint: "3:59" },
      { id: 29, title: "Title Card",     artist: "Keoni Blaze", album: "Frames", cover: img("cinema-title-card"),     src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", durationHint: "3:44" },
      { id: 30, title: "Credits Roll",   artist: "Keoni Blaze", album: "Frames", cover: img("cinema-credits-roll"),   src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", durationHint: "3:30" },
    ],
  },
];
