import React, { useState, useEffect } from "react";
import { Sparkles, Search, Play, ArrowRight, Star, Heart, Flame, Shield, TrendingUp, Compass } from "lucide-react";
import { AnimeMedia } from "../types";
import { motion } from "motion/react";

interface HomeViewProps {
  setView: (view: string) => void;
  setSelectedAnimeId: (id: number) => void;
  setSearchState: (state: { search: string; genre: string }) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
}

export default function HomeView({
  setView,
  setSelectedAnimeId,
  setSearchState,
  favorites,
  toggleFavorite
}: HomeViewProps) {
  const [popularAnime, setPopularAnime] = useState<AnimeMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    async function loadPopular() {
      try {
        const res = await fetch("/api/anime/popular?perPage=12");
        if (res.ok) {
          const data = await res.json();
          setPopularAnime(data);
        }
      } catch (error) {
        console.error("Failed to load popular anime list:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPopular();
  }, []);

  const genres = [
    { name: "バトル・アクション", queryName: "Action", icon: "⚔️", color: "from-amber-400 to-orange-500" },
    { name: "恋愛・ラブコメ", queryName: "Romance", icon: "❤️", color: "from-pink-400 to-rose-500" },
    { name: "感動・ドラマ", queryName: "Drama", icon: "😭", color: "from-indigo-400 to-purple-500" },
    { name: "日常・コメディ", queryName: "Comedy", icon: "🍀", color: "from-emerald-400 to-teal-500" },
    { name: "推理・ミステリー", queryName: "Mystery", icon: "🔍", color: "from-violet-400 to-indigo-500" },
    { name: "SF・サイバーパンク", queryName: "Sci-Fi", icon: "🚀", color: "from-cyan-400 to-blue-500" },
    { name: "ファンタジー・異世界", queryName: "Fantasy", icon: "🪄", color: "from-yellow-400 to-amber-600" },
    { name: "スポーツ・熱血", queryName: "Sports", icon: "⚽", color: "from-red-400 to-rose-600" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchState({ search: searchInput, genre: "" });
    setView("search");
  };

  const handleGenreClick = (genreQuery: string) => {
    setSearchState({ search: "", genre: genreQuery });
    setView("search");
  };

  const selectAnime = (id: number) => {
    setSelectedAnimeId(id);
    setView("detail");
  };

  return (
    <div className="space-y-16 pb-16 font-sans">
      
      {/* Premium Apple-Style Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50/50 pt-20 pb-16 px-4 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-500/5 via-transparent to-transparent"></div>
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-rose-300/10 blur-3xl"></div>

        <div className="relative z-10 mx-auto max-w-4xl space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 rounded-full border border-rose-100 bg-rose-50/60 px-4 py-1.5 text-xs font-semibold text-rose-600 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI（Gemini）搭載・超精度アプローチ</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
          >
            あなたに本当に合うアニメを、
            <span className="block mt-2 bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
              AI診断。
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto max-w-2xl text-lg text-gray-500 leading-relaxed sm:text-xl"
          >
            15個の直感的な質問から、あなたの深層性格・価値観を徹底分析。
            厳選された名作と「心に刺さる推薦理由」を今すぐ発見しよう。
          </motion.p>

          {/* Quick CTA & Search Button Container */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mx-auto max-w-md space-y-4 pt-4"
          >
            <button
              onClick={() => setView("diagnose")}
              className="group relative flex w-full items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 py-4 px-6 text-base font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-500/35"
              id="hero-start-diagnosis"
            >
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>無料アニメ診断を始める</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center mt-2">
              <input
                type="text"
                placeholder="作品名・制作会社などで検索..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-white/70 py-3 pr-12 pl-4 text-sm text-gray-900 shadow-sm backdrop-blur-md outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-500/10 placeholder:text-gray-400"
                id="hero-search-input"
              />
              <button
                type="submit"
                className="absolute right-2.5 rounded-lg bg-gray-50 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                id="hero-search-btn"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Popular Genres Bento-style section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-2 text-center md:items-start md:text-left mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl flex items-center space-x-2">
            <Compass className="h-6 w-6 text-rose-500" />
            <span>人気ジャンルから探す</span>
          </h2>
          <p className="text-sm text-gray-400">気分やトレンドに合わせて、気になるジャンルから作品を発見。</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {genres.map((genre, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => handleGenreClick(genre.queryName)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-rose-100"
              id={`genre-card-${genre.queryName}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{genre.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base group-hover:text-rose-500 transition-colors">
                    {genre.name}
                  </h3>
                  <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">
                    {genre.queryName}
                  </span>
                </div>
              </div>
              <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-rose-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Google AdSense Mock Frame (Integrated visual placeholder) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-center">
          <div className="absolute top-2 right-2 text-[10px] text-gray-400 font-mono tracking-wider uppercase">ADVERTISEMENT</div>
          <p className="text-xs text-gray-400 font-medium">スポンサー広告</p>
          <div className="mt-2 flex flex-col md:flex-row items-center justify-between gap-4 py-2 px-4 bg-white/70 rounded-xl border border-gray-100 backdrop-blur-sm">
            <div className="flex items-center space-x-3 text-left">
              <div className="h-10 w-10 shrink-0 bg-rose-100 rounded-lg flex items-center justify-center">
                <Flame className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">最新のアニメが月額550円で見放題！【DMM TV】</p>
                <p className="text-[11px] text-gray-400">新規登録なら30日間無料体験実施中。新作アニメも最速配信！</p>
              </div>
            </div>
            <a
              href="https://tv.dmm.com/vod/"
              target="_blank"
              referrerPolicy="no-referrer"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors shrink-0"
            >
              無料体験を試す
            </a>
          </div>
        </div>
      </section>

      {/* Trending Anime section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl flex items-center justify-center sm:justify-start space-x-2">
              <TrendingUp className="h-6 w-6 text-rose-500" />
              <span>今、人気の話題作</span>
            </h2>
            <p className="text-sm text-gray-400">診断によく登場する、ユーザーから高評価を得ている最新トレンドアニメ。</p>
          </div>
          <button
            onClick={() => {
              setSearchState({ search: "", genre: "" });
              setView("search");
            }}
            className="inline-flex items-center space-x-1 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            id="home-view-all-anime"
          >
            <span>すべての作品を見る</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="space-y-3 animate-pulse">
                <div className="aspect-[2/3] w-full rounded-2xl bg-gray-200"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {(popularAnime || []).filter((anime) => anime && anime.id).map((anime) => {
              const mainTitle = anime.title?.native || anime.title?.userPreferred || anime.title?.english || anime.title?.romaji || "作品名未設定";
              const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
              const isFav = favorites.includes(anime.id);

              return (
                <motion.div
                  key={anime.id}
                  whileHover={{ y: -6 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm transition-all hover:shadow-lg"
                >
                  {/* Card Thumbnail Container */}
                  <div 
                    onClick={() => selectAnime(anime.id)}
                    className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-50 cursor-pointer"
                  >
                    {anime.coverImage?.large ? (
                      <img
                        src={anime.coverImage.large}
                        alt={mainTitle}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 text-xs">
                        No Image
                      </div>
                    )}

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
                      className="absolute top-2.5 right-2.5 z-10 rounded-full bg-white/80 p-2 text-gray-500 hover:bg-white hover:text-rose-500 backdrop-blur-md transition-colors"
                      id={`home-anime-fav-${anime.id}`}
                    >
                      <Heart className={`h-4.5 w-4.5 ${isFav ? "fill-rose-500 text-rose-500" : "text-gray-600"}`} />
                    </button>

                    {/* Quality Badge */}
                    {score && (
                      <div className="absolute bottom-2 left-2 flex items-center space-x-1 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{score}</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata Description */}
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

                    {/* Genres pill */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {anime.genres?.slice(0, 2).map((genre, idx) => (
                        <span
                          key={idx}
                          className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Call To Action Feature Box */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 p-8 text-white shadow-xl sm:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-400">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>AI Personality Assessment</span>
              </span>
              <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
                15問、約2分であなたの「隠れたアニメ嗜好」を可視化。
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                休日の過ごし方、もしもの選択、好きな結末の傾向を分析し、Geminiがあなたを深く理解。ネットのクチコミだけでは出会えなかった、あなたのための生涯の名作をマッチングします。
              </p>
            </div>
            
            <button
              onClick={() => setView("diagnose")}
              className="flex items-center space-x-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-gray-950 shadow-md hover:bg-gray-50 transition-transform hover:scale-[1.03] shrink-0"
              id="cta-bottom-start"
            >
              <span>診断をスタートする</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
