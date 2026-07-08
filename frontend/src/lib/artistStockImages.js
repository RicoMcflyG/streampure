// src/lib/artistStockImages.js
export const ARTIST_STOCK = [
  "https://picsum.photos/id/1005/512/512",
  "https://picsum.photos/id/1011/512/512",
  "https://picsum.photos/id/1012/512/512",
  "https://picsum.photos/id/1015/512/512",
  "https://picsum.photos/id/1021/512/512",
  "https://picsum.photos/id/1025/512/512",
  "https://picsum.photos/id/1035/512/512",
  "https://picsum.photos/id/1038/512/512",
  "https://picsum.photos/id/1043/512/512",
  "https://picsum.photos/id/1050/512/512",
];

// Picks an image based on artist name (so same artist always gets same picture)
export function artistStockImage(name) {
  if (!name) return ARTIST_STOCK[0];
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ARTIST_STOCK[sum % ARTIST_STOCK.length];
}
