import React, { useState, useEffect } from "react";
import { Search, Filter, Star, Heart, Play, RefreshCw, Calendar, ArrowRight } from "lucide-react";
import { AnimeMedia } from "../types";
import { motion } from "motion/react";
import { AnimeCardImage } from "./AnimeCardImage";
import { searchAnime } from "../services/animeService";
import { translateGenreToJapanese } from "../data/fallbackAnime";

interface SearchViewProps {
  initialSearch: string;
  initialGenre: string;
  setView: (view: string) => void;
  setSelectedAnimeId: (id: number) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
}

const GENRE_LIST = [
  { value: "", label: "すべてのジャンル" },
  { value: "Action", label: "バトル・アクション" },
  { value: "Romance", label: "恋愛・ラブコメ" },
  { value: "Drama", label: "感動・ドラマ" },
  { value: "Comedy", label: "コメディ・ギャグ" },
  { value: "Slice of Life", label: "日常・ほのぼの" },
  { value: "Fantasy", label: "ファンタジー・異世界" },
  { value: "Sci-Fi", label: "SF・サイバーパンク" },
  { value: "Mystery", label: "推理・ミステリー" },
  { value: "Sports", label: "スポーツ・熱血" },
  { value: "Thriller", label: "サスペンス・スリラー" },
  { value: "Music", label: "音楽・バンド" },
  { value: "Adventure", label: "冒険・アドベンチャー" },
  { value: "Supernatural", label: "オカルト・超能力" },
];

export default function SearchView({
  initialSearch,
  initialGenre,
  setView,
  setSelectedAnimeId,
  favorites,
  toggleFavorite,
}: SearchViewProps) {
  const [search, setSearch] = useState(initialSearch);
  const [genre, setGenre] = useState(initialGenre);
  const [year, setYear] = useState("");
  const [sort, setSort] = useState("popularity");
  const [results, setResults] = useState<AnimeMedia[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If initial values change (e.g. clicked genre from Home), synchronize
    setSearch(initialSearch);
    setGenre(initialGenre);
  }, [initialSearch, initialGenre]);

  useEffect(() => {
    // Automatic loading when filters are updated!
    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, genre, year, sort]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await searchAnime({
        search: search || undefined,
        genre: genre || undefined,
        year: year || undefined,
        sort,
      });
      setResults(data);
    } catch (error) {
      console.error("Failed to load search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectAnime = (id: number) => {
    setSelectedAnimeId(id);
    setView("detail");
  };

  const handleClearFilters = () => {
    setSearch("");
    setGenre("");
    setYear("");
    setSort("popularity");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 font-sans">
      
      {/* Title Header */}
      <div className="text-center md:text-left space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight flex items-center justify-center md:justify-start space-x-2">
          <Search className="h-7 w-7 text-rose-500" />
          <span>詳細アニメ検索</span>
        </h1>
        <p className="text-sm text-gray-400">AniListデータベースから、タイトルやジャンルで今すぐお気に入りを発掘。</p>
      </div>

      {/* Advanced Filter Panel */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
          
          {/* Keyword Search */}
          <div className="space-y-1 sm:col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">キーワード</label>
            <div className="relative">
              <input
                type="text"
                placeholder="作品名・スタジオ名..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 py-2.5 pr-4 pl-9 text-xs text-gray-900 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-500/10 placeholder:text-gray-400"
                id="search-input-field"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Genre selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ジャンル</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 py-2.5 px-3 text-xs text-gray-700 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-500/10"
              id="genre-select-field"
            >
              {GENRE_LIST.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year filtering */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">放送年代（西暦）</label>
            <input
              type="number"
              placeholder="例：2024"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 py-2.5 px-3 text-xs text-gray-900 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-500/10 placeholder:text-gray-400"
              id="year-input-field"
            />
          </div>

          {/* Sorting */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">並び替え基準</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 py-2.5 px-3 text-xs text-gray-700 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-500/10"
              id="sort-select-field"
            >
              <option value="popularity">人気順（定番）</option>
              <option value="score">診断満足度順</option>
              <option value="newest">新着・放送年順</option>
            </select>
          </div>

        </div>

        {/* Action Panel */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          <span className="text-gray-400 font-medium">
            該当件数: <span className="font-bold text-gray-700">{results.length}</span> 件
          </span>
          <button
            onClick={handleClearFilters}
            className="flex items-center space-x-1 font-bold text-rose-500 hover:text-rose-600 hover:underline transition-all"
            id="clear-filters-btn"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>フィルターをリセット</span>
          </button>
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[...Array(12)].map((_, idx) => (
            <div key={idx} className="space-y-3 animate-pulse">
              <div className="aspect-[2/3] w-full rounded-2xl bg-gray-200"></div>
              <div className="h-4 w-2/3 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 p-16 text-center space-y-4 bg-gray-50/20">
          <Filter className="h-10 w-10 text-gray-300 mx-auto" />
          <div>
            <h3 className="font-bold text-gray-700">条件に合致するアニメが見つかりません</h3>
            <p className="text-xs text-gray-400 mt-1">
              キーワードを短くしたり、ジャンル・放送年代を「すべて」に戻してお試しください。
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors"
          >
            条件をリセットする
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {(results || []).filter((anime) => anime && anime.id).map((anime) => {
            const mainTitle = anime.title?.native || anime.title?.userPreferred || anime.title?.english || anime.title?.romaji || "作品名未設定";
            const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
            const isFav = favorites.includes(anime.id);

            return (
              <motion.div
                key={anime.id}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm transition-all hover:shadow-lg"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => selectAnime(anime.id)}
                  className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-50 cursor-pointer"
                >
                  <AnimeCardImage anime={anime} />

                  {/* Dark gradient overlap */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-rose-500 rounded-lg px-2 py-1">
                      <Play className="h-3 w-3 fill-current" />
                      <span>詳細を見る</span>
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(anime.id);
                    }}
                    className="absolute top-2.5 right-2.5 z-10 rounded-full bg-white/85 p-2 text-gray-500 hover:bg-white hover:text-rose-500 backdrop-blur-md transition-colors animate-fade-in"
                    id={`search-anime-fav-${anime.id}`}
                  >
                    <Heart className={`h-4.5 w-4.5 ${isFav ? "fill-rose-500 text-rose-500" : "text-gray-600"}`} />
                  </button>

                  {/* Quality Score Badge */}
                  {score && (
                    <div className="absolute bottom-2 left-2 flex items-center space-x-1 rounded-lg bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm" title="診断ユーザー満足度">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>満足度 {score}</span>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="p-2 flex-grow flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => selectAnime(anime.id)}
                      className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 hover:text-rose-500 cursor-pointer transition-colors"
                      title={mainTitle}
                    >
                      {mainTitle}
                    </h3>
                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                      {anime.studios?.nodes?.[0]?.name || "情報未登録"} {anime.startDate?.year ? `・ ${anime.startDate.year}年` : ""}
                    </p>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {anime.genres?.slice(0, 2).map((g, idx) => (
                      <span
                        key={idx}
                        className="inline-block rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-semibold text-rose-600"
                      >
                        {translateGenreToJapanese(g)}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
