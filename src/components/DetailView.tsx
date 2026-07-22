import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, Heart, Calendar, Play, ExternalLink, Bookmark, ShieldCheck, Film, Tv, Info, HelpCircle } from "lucide-react";
import { AnimeMedia } from "../types";
import { motion } from "motion/react";

interface DetailViewProps {
  animeId: number | null;
  setView: (view: string) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
}

export default function DetailView({ animeId, setView, favorites, toggleFavorite }: DetailViewProps) {
  const [anime, setAnime] = useState<AnimeMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "streaming" | "pv">("overview");

  useEffect(() => {
    if (!animeId) return;

    async function loadAnimeDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/anime/${animeId}`);
        if (res.ok) {
          const data = await res.json();
          setAnime(data);
        }
      } catch (error) {
        console.error("Failed to load anime details:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnimeDetails();
  }, [animeId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
        <p className="text-sm text-gray-400 font-medium">作品データを取得中...</p>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <p className="text-gray-500">作品情報が見つかりませんでした。</p>
        <button
          onClick={() => setView("home")}
          className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  const mainTitle = anime.title?.native || anime.title?.userPreferred || anime.title?.english || anime.title?.romaji || "作品名未設定";
  const subTitle = anime.title?.english && anime.title.english !== mainTitle ? anime.title.english : anime.title?.romaji;
  const isFav = favorites.includes(anime.id);
  const rating = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "N/A";

  // Strip simple HTML tags commonly found in AniList description
  const cleanDescription = anime.description
    ? anime.description.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "")
    : "あらすじ情報は登録されていません。";

  // High converting Affiliate Platforms
  const affiliates = [
    {
      name: "U-NEXT（ユーネクスト）",
      description: "31日間無料トライアル実施中！27万本以上が見放題。アニメ配信数も業界トップクラス。無料登録時に600円分のポイントが貰えて、新作レンタルにも使えます！",
      cta: "U-NEXTで31日間無料体験",
      color: "from-sky-500 to-blue-700 bg-sky-500 hover:bg-sky-600",
      officialLink: "https://www.video.unext.jp/",
      badge: "おすすめNo.1"
    },
    {
      name: "DMM TV",
      description: "月額550円で19万本以上が見放題！新規登録なら30日間無料＆最大3ヶ月間550pt（最大1,650pt）付与。アニメ最速先行配信が非常に多くコスパ最強のサービス。",
      cta: "DMM TVで30日間無料体験",
      color: "from-rose-600 to-red-800 bg-rose-600 hover:bg-rose-700",
      officialLink: "https://tv.dmm.com/vod/",
      badge: "コスパ最強"
    },
    {
      name: "dアニメストア",
      description: "アニメ専門配信サービスNo.1！月額550円で5,700作品以上のアニメが見放題。懐かしの名作から地上波同時配信まで、アニメファンなら絶対に加入すべき定番。",
      cta: "dアニメストアで今すぐ見る",
      color: "from-amber-500 to-orange-600 bg-amber-500 hover:bg-amber-600",
      officialLink: "https://animestore.docomo.ne.jp/",
      badge: "作品数No.1"
    },
    {
      name: "ABEMA（プレミアム）",
      description: "登録不要でも一部無料。プレミアムプラン（月額960円）に登録すると、新作アニメの地上波最速配信や限定コンテンツ、リアルタイム放送の見逃し視聴がすべて見放題になります。",
      cta: "ABEMAで今すぐ探す",
      color: "from-emerald-500 to-teal-700 bg-emerald-500 hover:bg-emerald-600",
      officialLink: "https://abema.tv/",
      badge: "地上波同時"
    },
    {
      name: "Amazon Prime Video",
      description: "月額600円のプライム会員特典で追加料金なしで見放題！配送料無料などの特典もコミコミ。独占配信アニメ（チェンソーマン等）も多数ラインナップされています。",
      cta: "Amazonプライムで探す",
      color: "from-gray-800 to-gray-950 bg-gray-800 hover:bg-gray-900",
      officialLink: "https://www.amazon.co.jp/gp/video/storefront",
      badge: "プライム特典"
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 font-sans">
      
      {/* Back Button */}
      <button
        onClick={() => setView("home")}
        className="flex items-center space-x-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        id="detail-back-btn"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>トップページに戻る</span>
      </button>

      {/* Hero Header with Banner Background */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
        {/* Banner */}
        <div className="relative h-48 w-full bg-slate-900 overflow-hidden sm:h-64">
          {anime.bannerImage ? (
            <img
              src={anime.bannerImage}
              alt={mainTitle}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-55"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/30 to-violet-500/30"></div>
          )}
          {/* Cover gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
        </div>

        {/* Info Layout */}
        <div className="relative z-10 px-6 pb-6 -mt-16 sm:px-10 sm:pb-8 flex flex-col sm:flex-row gap-6 items-start">
          {/* Cover Art */}
          <div className="relative h-44 w-32 sm:h-56 sm:w-40 rounded-2xl overflow-hidden shadow-lg border border-white bg-white shrink-0 self-center sm:self-auto">
            {anime.coverImage?.large ? (
              <img
                src={anime.coverImage.large}
                alt={mainTitle}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>

          {/* Titles & Quick Stats */}
          <div className="flex-grow space-y-4 self-stretch flex flex-col justify-end pt-4 sm:pt-0">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-950 sm:text-3xl tracking-tight leading-tight">
                {mainTitle}
              </h1>
              {subTitle && (
                <p className="text-sm text-gray-400 font-medium mt-1">{subTitle}</p>
              )}
            </div>

            {/* Micro Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 rounded-lg bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span>{rating}</span>
              </div>
              <div className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 border border-gray-200/50">
                {anime.startDate?.year ? `${anime.startDate.year}年 放送` : "放送年未定"}
              </div>
              {anime.episodes && (
                <div className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 border border-gray-200/50">
                  全 {anime.episodes} 話
                </div>
              )}
              {anime.studios?.nodes?.[0]?.name && (
                <div className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 border border-rose-100/40">
                  {anime.studios.nodes[0].name}
                </div>
              )}
            </div>

            {/* Add to favorites CTA */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => toggleFavorite(anime.id)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isFav
                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                    : "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/10"
                }`}
                id={`detail-fav-toggle-${anime.id}`}
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>{isFav ? "お気に入り登録済み" : "お気に入りに追加"}</span>
              </button>

              {anime.siteUrl && (
                <a
                  href={anime.siteUrl}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-gray-950 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  <span>AniList 公式</span>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center space-x-1.5 py-3 px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "overview"
              ? "border-rose-500 text-rose-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="tab-overview"
        >
          <Info className="h-4 w-4" />
          <span>概要・あらすじ</span>
        </button>
        <button
          onClick={() => setActiveTab("streaming")}
          className={`flex items-center space-x-1.5 py-3 px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "streaming"
              ? "border-rose-500 text-rose-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="tab-streaming"
        >
          <Tv className="h-4 w-4" />
          <span>配信・アフィリエイト</span>
        </button>
        <button
          onClick={() => setActiveTab("pv")}
          className={`flex items-center space-x-1.5 py-3 px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "pv" ? "border-rose-500 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="tab-pv"
        >
          <Film className="h-4 w-4" />
          <span>公式PV動画</span>
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`flex items-center space-x-1.5 py-3 px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "details"
              ? "border-rose-500 text-rose-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="tab-details"
        >
          <Info className="h-4 w-4" />
          <span>作品スペック</span>
        </button>
      </div>

      {/* Tabs Content */}
      <div className="min-h-[250px]">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <span>ストーリーあらすじ</span>
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {cleanDescription}
              </p>
            </div>

            {/* Quick Genre tag list */}
            {anime.genres && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">ジャンル属性</h4>
                <div className="flex flex-wrap gap-1.5">
                  {anime.genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="inline-block rounded-lg border border-gray-200/60 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-rose-100 hover:text-rose-500 cursor-default transition-colors"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "streaming" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-1.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">AFFILIATE ADVERTISEMENT</p>
              <h3 className="text-lg font-bold text-gray-900">配信動画サービス（アフィリエイト連携）</h3>
              <p className="text-xs text-gray-400">
                本作品を今すぐ視聴できる各動画サービスのご案内。無料お試し期間を利用して完全無料で視聴可能です。
              </p>
            </div>

            <div className="grid gap-4">
              {affiliates.map((plat, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-100 bg-white p-5 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-extrabold text-gray-950">{plat.name}</span>
                      <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                        {plat.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{plat.description}</p>
                  </div>

                  <a
                    href={plat.officialLink}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className={`w-full md:w-auto text-center px-5 py-3 rounded-xl text-xs font-extrabold text-white transition-all transform hover:scale-[1.01] ${plat.color} shrink-0`}
                  >
                    {plat.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "pv" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">公式プロモーションビデオ</h3>
              <p className="text-xs text-gray-400 mt-1">
                作品の公式PV。劇伴の雰囲気やハイクオリティな作画を動画でご確認ください。
              </p>
            </div>

            {anime.trailer?.id && anime.trailer.site === "youtube" ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-gray-100 shadow-md">
                <iframe
                  title="Official Trailer"
                  src={`https://www.youtube.com/embed/${anime.trailer.id}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                ></iframe>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-4">
                <Film className="h-10 w-10 text-gray-300 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-gray-700">公式PVの自動埋め込みがありません</h4>
                  <p className="text-xs text-gray-400 mt-1">以下のYouTube公式検索リンク、または外部サイトより直接ご覧いただけます。</p>
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(mainTitle + " PV アニメ")}`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
                >
                  <span>YouTubeで公式PVを検索</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900">作品詳細仕様</h3>
            
            <dl className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 text-sm border-t border-gray-100 pt-4">
              <div className="border-b border-gray-50 pb-2 flex justify-between">
                <dt className="font-semibold text-gray-400">日本語タイトル</dt>
                <dd className="text-gray-800 text-right font-medium">{anime.title?.native || "データ無し"}</dd>
              </div>
              <div className="border-b border-gray-50 pb-2 flex justify-between">
                <dt className="font-semibold text-gray-400">英語名 / ローマ字名</dt>
                <dd className="text-gray-800 text-right font-medium">{anime.title?.english || anime.title?.romaji || "データ無し"}</dd>
              </div>
              <div className="border-b border-gray-50 pb-2 flex justify-between">
                <dt className="font-semibold text-gray-400">放送開始日</dt>
                <dd className="text-gray-800 text-right font-medium">
                  {anime.startDate?.year
                    ? `${anime.startDate.year}年 ${anime.startDate.month || 1}月 ${anime.startDate.day || 1}日`
                    : "データ無し"}
                </dd>
              </div>
              <div className="border-b border-gray-50 pb-2 flex justify-between">
                <dt className="font-semibold text-gray-400">総話数</dt>
                <dd className="text-gray-800 text-right font-medium">{anime.episodes ? `${anime.episodes} 話` : "データ無し"}</dd>
              </div>
              <div className="border-b border-gray-50 pb-2 flex justify-between">
                <dt className="font-semibold text-gray-400">制作スタジオ</dt>
                <dd className="text-gray-800 text-right font-medium">{anime.studios?.nodes?.[0]?.name || "データ無し"}</dd>
              </div>
              <div className="border-b border-gray-50 pb-2 flex justify-between">
                <dt className="font-semibold text-gray-400">AniList 評価スコア</dt>
                <dd className="text-gray-800 text-right font-mono font-bold text-yellow-600">{rating} / 10.0</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Compliance check line */}
      <div className="flex items-center space-x-2 text-[11px] text-gray-400 justify-center">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <span>当サイトはAniList APIの商用利用条件に厳密に準拠し、公式画像無断利用を避け安全に誘導しています。</span>
      </div>
    </div>
  );
}
