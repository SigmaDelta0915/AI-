import React, { useState } from "react";
import { AnimeMedia } from "../types";
import { Film, Sparkles } from "lucide-react";

interface AnimeCardImageProps {
  anime: AnimeMedia;
  className?: string;
  aspectRatio?: string;
}

export const AnimeCardImage: React.FC<AnimeCardImageProps> = ({
  anime,
  className = "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
  aspectRatio = "aspect-[2/3]",
}) => {
  const cover = anime.coverImage;
  const primaryTitle =
    anime.title?.native ||
    anime.title?.userPreferred ||
    anime.title?.romaji ||
    anime.title?.english ||
    "アニメ作品";

  // Build priority image candidate list
  const candidates: string[] = [];
  if (cover?.extraLarge) candidates.push(cover.extraLarge);
  if (cover?.large) candidates.push(cover.large);
  if (cover?.medium) candidates.push(cover.medium);

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const currentSrc = candidates[candidateIndex];

  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const brandColor = cover?.color || "#6366f1";

  if (!currentSrc || hasError) {
    return (
      <div
        className={`relative flex flex-col justify-between p-4 overflow-hidden select-none bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 ${aspectRatio}`}
        style={{
          borderTop: `4px solid ${brandColor}`,
        }}
      >
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-xl" style={{ backgroundColor: brandColor }} />
        <div className="flex items-center justify-between text-white/50 text-xs z-10">
          <Film className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/10">
            {anime.genres?.[0] || "Anime"}
          </span>
        </div>
        <div className="my-auto text-center z-10 py-2">
          <p className="text-sm font-bold text-white line-clamp-3 leading-snug drop-shadow-sm">
            {primaryTitle}
          </p>
          {anime.startDate?.year && (
            <p className="text-[11px] text-indigo-300 font-medium mt-1">
              {anime.startDate.year}年作品
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-1 text-[10px] text-indigo-300/70 z-10">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>スコア: {anime.averageScore ? `${anime.averageScore}%` : "評価好評"}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={primaryTitle}
      referrerPolicy="no-referrer"
      onError={handleImageError}
      className={className}
      loading="lazy"
    />
  );
};
