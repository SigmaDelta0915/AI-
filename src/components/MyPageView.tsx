import React, { useState, useEffect } from "react";
import { User, Heart, History, Trash2, ArrowRight, Play, Star, Sparkles, Compass, ShieldCheck } from "lucide-react";
import { AnimeMedia, DiagnosticHistory } from "../types";
import { motion } from "motion/react";

interface MyPageViewProps {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  historyList: DiagnosticHistory[];
  clearHistory: () => void;
  setView: (view: string) => void;
  setSelectedAnimeId: (id: number) => void;
  setDiagnosisResult: (result: any) => void;
}

export default function MyPageView({
  favorites,
  toggleFavorite,
  historyList,
  clearHistory,
  setView,
  setSelectedAnimeId,
  setDiagnosisResult,
}: MyPageViewProps) {
  const [favoriteMedia, setFavoriteMedia] = useState<AnimeMedia[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [activeTab, setActiveTab] = useState<"favorites" | "history" | "stats">("favorites");

  // Load detailed media for all favorites in parallel
  useEffect(() => {
    if (favorites.length === 0) {
      setFavoriteMedia([]);
      return;
    }

    async function loadFavoriteDetails() {
      setLoadingFavs(true);
      try {
        const promises = favorites.map(async (id) => {
          const res = await fetch(`/api/anime/${id}`);
          if (res.ok) {
            return await res.json();
          }
          return null;
        });
        const results = await Promise.all(promises);
        setFavoriteMedia(results.filter((item) => item && item.id) as AnimeMedia[]);
      } catch (error) {
        console.error("Failed to load favorite media details:", error);
      } finally {
        setLoadingFavs(false);
      }
    }

    loadFavoriteDetails();
  }, [favorites]);

  const selectAnime = (id: number) => {
    setSelectedAnimeId(id);
    setView("detail");
  };

  const handleReplayDiagnosisResult = (historyItem: DiagnosticHistory) => {
    setDiagnosisResult(historyItem.result);
    setView("result");
  };

  // Compute stats: count genre occurrences from favorites
  const computeGenreStats = () => {
    const counts: { [key: string]: number } = {};
    let total = 0;

    favoriteMedia.forEach((media) => {
      media.genres?.forEach((genre) => {
        counts[genre] = (counts[genre] || 0) + 1;
        total++;
      });
    });

    const sortedStats = Object.entries(counts)
      .map(([genre, count]) => ({
        genre,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return { sortedStats, total };
  };

  const { sortedStats, total: totalGenreCount } = computeGenreStats();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-10 font-sans">
      
      {/* Profile Overview Card */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center gap-6">
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-rose-500/5 blur-3xl"></div>
        
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-rose-500/10">
          <User className="h-8 w-8" />
        </div>

        <div className="space-y-1 text-center sm:text-left flex-grow">
          <h1 className="text-xl font-extrabold text-gray-950">マイ・ダッシュボード</h1>
          <p className="text-xs text-gray-400">お気に入り作品のストック、これまでの精密診断の記録を一元管理しています。</p>
          
          <div className="flex items-center justify-center sm:justify-start space-x-6 pt-3 text-xs text-gray-500">
            <div>
              お気に入り: <span className="font-bold text-rose-500">{favorites.length} 件</span>
            </div>
            <div className="h-3 w-px bg-gray-200"></div>
            <div>
              診断履歴: <span className="font-bold text-violet-500">{historyList.length} 件</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center space-x-1.5 py-3 px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "favorites" ? "border-rose-500 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="mytab-favs"
        >
          <Heart className="h-4 w-4" />
          <span>お気に入り ({favorites.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center space-x-1.5 py-3 px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "history" ? "border-rose-500 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="mytab-history"
        >
          <History className="h-4 w-4" />
          <span>診断履歴 ({historyList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center space-x-1.5 py-3 px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "stats" ? "border-rose-500 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="mytab-stats"
        >
          <Compass className="h-4 w-4" />
          <span>お好み分析グラフ</span>
        </button>
      </div>

      {/* Tab Panel Contents */}
      <div className="min-h-[300px]">
        {activeTab === "favorites" && (
          <div className="space-y-6">
            {favorites.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-16 text-center space-y-4">
                <Heart className="h-10 w-10 text-gray-300 mx-auto" />
                <div>
                  <h3 className="font-bold text-gray-700">お気に入り作品はありません</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    診断結果や作品検索から、気になる作品のハートをタップして登録してください。
                  </p>
                </div>
                <button
                  onClick={() => setView("search")}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors"
                >
                  作品を探す
                </button>
              </div>
            ) : loadingFavs ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[...Array(favorites.length)].map((_, idx) => (
                  <div key={idx} className="space-y-3 animate-pulse">
                    <div className="aspect-[2/3] w-full rounded-2xl bg-gray-200"></div>
                    <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {(favoriteMedia || []).filter((anime) => anime && anime.id).map((anime) => {
                  const mainTitle = anime.title?.native || anime.title?.userPreferred || anime.title?.english || anime.title?.romaji || "作品名未設定";
                  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;

                  return (
                    <div
                      key={anime.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm transition-all hover:shadow-md"
                    >
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

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(anime.id);
                          }}
                          className="absolute top-2.5 right-2.5 z-10 rounded-full bg-white/85 p-2 text-rose-500 hover:bg-white backdrop-blur-md transition-colors"
                          id={`mypage-anime-fav-${anime.id}`}
                        >
                          <Heart className="h-4 w-4 fill-rose-500" />
                        </button>

                        {score && (
                          <div className="absolute bottom-2 left-2 flex items-center space-x-1 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{score}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-2 flex-grow flex flex-col justify-between">
                        <div>
                          <h3
                            onClick={() => selectAnime(anime.id)}
                            className="font-bold text-gray-900 text-xs line-clamp-1 hover:text-rose-500 cursor-pointer transition-colors"
                          >
                            {mainTitle}
                          </h3>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            {historyList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-16 text-center space-y-4">
                <History className="h-10 w-10 text-gray-300 mx-auto" />
                <div>
                  <h3 className="font-bold text-gray-700">診断履歴はありません</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    精密診断を一度体験すると、その結果がこちらに記録され、いつでも再確認できます。
                  </p>
                </div>
                <button
                  onClick={() => setView("diagnose")}
                  className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors"
                >
                  診断を試す
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">履歴保存件数: {historyList.length} 件</span>
                  <button
                    onClick={clearHistory}
                    className="text-gray-400 hover:text-red-500 font-bold transition-colors flex items-center space-x-1"
                    id="clear-history-btn"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>履歴をすべて消去</span>
                  </button>
                </div>

                <div className="grid gap-4">
                  {(historyList || []).filter((item) => item && item.result).map((item, idx) => {
                    const formattedDate = item.result.createdAt ? new Date(item.result.createdAt).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "";

                    return (
                      <div
                        key={item.id || idx}
                        className="rounded-2xl border border-gray-100 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-violet-200 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                            診断結果
                          </span>
                          <h3 className="text-base font-bold text-gray-950">
                            『{item.result.typeName}』
                          </h3>
                          <p className="text-[11px] text-gray-400">診断日時: {formattedDate}</p>
                        </div>

                        <button
                          onClick={() => handleReplayDiagnosisResult(item)}
                          className="inline-flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 hover:text-rose-500 transition-colors shrink-0"
                          id={`replay-history-btn-${item.id}`}
                        >
                          <span>診断詳細を見る</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-rose-500 animate-pulse" />
                <span>お気に入りジャンルの自動可視化</span>
              </h3>
              <p className="text-xs text-gray-400">お気に入りした作品のジャンル配分をリアルタイムに集計したグラフです。</p>
            </div>

            {favoriteMedia.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-8 text-center text-xs text-gray-400">
                お気に入り作品を登録すると、あなたの好きなジャンルの配分が自動でグラフ化されます。
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
                
                {/* Custom animated SVG donut chart */}
                <div className="flex justify-center relative">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
                    
                    {/* Segments calculation */}
                    {(() => {
                      let accumulatedPercent = 0;
                      // Colors list for segments
                      const colors = ["#f43f5e", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#ec4899", "#3b82f6", "#64748b"];
                      
                      return sortedStats.slice(0, 5).map((stat, sIdx) => {
                        const dashArray = (stat.percent / 100) * 251.2;
                        const dashOffset = 251.2 - dashArray + (accumulatedPercent / 100) * 251.2;
                        accumulatedPercent += stat.percent;

                        return (
                          <circle
                            key={sIdx}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={colors[sIdx % colors.length]}
                            strokeWidth="12"
                            strokeDasharray="251.2"
                            strokeDashoffset={-dashOffset}
                            className="transition-all duration-1000 ease-out"
                          />
                        );
                      });
                    })()}
                  </svg>

                  {/* Centered Stats */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-gray-900">{favorites.length}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">ANIMES</span>
                  </div>
                </div>

                {/* Genre breakdown legend list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top 5 ジャンル配分</h4>
                  <div className="space-y-2">
                    {sortedStats.slice(0, 5).map((stat, sIdx) => {
                      const colors = ["bg-rose-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-cyan-500"];
                      return (
                        <div key={sIdx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center space-x-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${colors[sIdx % colors.length]}`}></span>
                              <span className="text-gray-700">{stat.genre}</span>
                            </div>
                            <span className="text-gray-500">{stat.count}件 ({stat.percent}%)</span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[sIdx % colors.length]} rounded-full`} style={{ width: `${stat.percent}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* Trust Compliance footer line */}
      <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-400">
        <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
        <span>お客様の診断履歴やお気に入りデータはブラウザのLocalStorageに保存されます。</span>
      </div>
    </div>
  );
}
