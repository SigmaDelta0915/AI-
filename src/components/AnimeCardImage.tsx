import React, { useState } from "react";
import { AnimeMedia } from "../types";
import { Film, Sparkles, Star } from "lucide-react";

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

  // Collect candidate original URLs
  const rawUrls: string[] = [];
  if (cover?.extraLarge) rawUrls.push(cover.extraLarge);
  if (cover?.large) rawUrls.push(cover.large);
  if (cover?.medium) rawUrls.push(cover.medium);

  // Generate fallback sources: Proxied first for stability, then direct URLs
  const sources: string[] = [];
  rawUrls.forEach((url) => {
    sources.push(`/api/image-proxy?url=${encodeURIComponent(url)}`);
    sources.push(url);
  });

  const [sourceIndex, setSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const currentSrc = sources[sourceIndex];
  const brandColor = cover?.color || "#e11d48"; // Default rose accent

  if (!currentSrc || hasError) {
    return (
      <div
        className={`relative flex flex-col justify-between p-4 overflow-hidden select-none bg-gradient-to-br from-slate-900 via-zinc-900 to-rose-950 ${aspectRatio}`}
        style={{
          borderTop: `4px solid ${brandColor}`,
        }}
      >
        <div
          className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-25 blur-2xl pointer-events-none"
          style={{ backgroundColor: brandColor }}
        />
        <div className="flex items-center justify-between text-white/60 text-xs z-10">
          <div className="flex items-center space-x-1 bg-black/40 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-sm">
            <Film className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[10px] font-bold text-gray-200">ANIME</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {anime.genres?.[0] || "人気作品"}
          </span>
        </div>

        <div className="my-auto text-center z-10 py-3 px-1">
          <div className="inline-block px-2 py-0.5 mb-2 rounded bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-gray-300 font-semibold">
            {anime.startDate?.year ? `${anime.startDate.year}年作品` : "名作アニメ"}
          </div>
          <h3 className="text-sm font-black text-white line-clamp-3 leading-snug drop-shadow-md tracking-tight">
            {primaryTitle}
          </h3>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-300 z-10 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center space-x-1 text-amber-400 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "8.5"}</span>
          </div>
          <span className="text-[10px] text-gray-400">
            {anime.episodes ? `全${anime.episodes}話` : "公式配信"}
          </span>
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

