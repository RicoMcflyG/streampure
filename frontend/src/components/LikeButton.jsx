// src/components/LikeButton.jsx
import React from "react";
import { useAuth } from "../auth/authContext";
import { useLibrary } from "../library/libraryContext";

// Renders nothing when logged out — liking is a personal-library feature,
// same as Recently Played/Most Played on the Profile page.
export default function LikeButton({ track, size = 18, className = "" }) {
  const { isAuthenticated } = useAuth();
  const { isLiked, toggleLike } = useLibrary();

  if (!isAuthenticated || !track?.id) return null;
  const liked = isLiked(track.id);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleLike(track);
      }}
      aria-label={liked ? "Unlike" : "Like"}
      title={liked ? "Unlike" : "Like"}
      className={`grid shrink-0 place-items-center transition ${
        liked ? "text-highlight" : "text-white/50 hover:text-white"
      } ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
