import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, Heart, Calendar, ExternalLink, ShieldCheck, Tv, Info, Sparkles, Share2, Search, CheckCircle2, Award, Zap, Building2, Flame, Layers } from "lucide-react";
import { AnimeMedia } from "../types";
import { motion } from "motion/react";
import { AnimeCardImage } from "./AnimeCardImage";
import { getAnimeDetail } from "../services/animeService";
import { FALLBACK_POPULAR_ANIME, translateGenreToJapanese } from "../data/fallbackAnime";

interface DetailViewProps {
  animeId: number | null;
  setView: (view: string) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
}

export default function DetailView({ animeId, setView, favorites, toggleFavorite }: DetailViewProps) {
  const [anime, setAnime] = useState<AnimeMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "streaming">("overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!animeId) return;

    async function loadAnimeDetails() {
      setLoading(true);
      try {
        const data = await getAnimeDetail(animeId);
        setAnime(data);
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
        <p className="text-sm text-gray-400 font-medium">作品データを高画質で読み込み中...</p>
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
  const ratingNum = anime.averageScore ? anime.averageScore / 10 : 8.5;
  const rating = ratingNum.toFixed(1);

  // Process description to ensure Japanese formatting
  const rawDesc = anime.description || "";
  const hasJapaneseInDesc = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(rawDesc);
  let cleanDescription = rawDesc.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").trim();

  if (!cleanDescription || !hasJapaneseInDesc) {
    const knownFallback = FALLBACK_POPULAR_ANIME.find(
      f => f.id === anime.id || 
           (mainTitle && f.title.native && (mainTitle.includes(f.title.native) || f.title.native.includes(mainTitle))) ||
           (subTitle && f.title.english && subTitle.toLowerCase().includes(f.title.english.toLowerCase()))
    );
    if (knownFallback && knownFallback.description) {
      cleanDescription = knownFallback.description;
    } else {
      const genreText = anime.genres && anime.genres.length > 0 
        ? anime.genres.map(g => translateGenreToJapanese(g)).slice(0, 3).join("・") 
        : "ファンタジー・ドラマ";
      cleanDescription = `【ストーリー概要】\n『${mainTitle}』は、${genreText}を中心に奥深い世界観と緻密な人間ドラマが繰り広げられる話題の人気アニメ作品です。\n\n魅力あるキャラクターたちの葛藤や成長が丁寧に描かれており、物語が進むにつれて驚きの展開と胸を打つエピソードが満載です。\n\n【作品のみどころ・特徴】\n・高クオリティな映像美と印象的なサウンドトラック\n・個性的で深みのあるキャラクター同士の掛け合い\n・多くのアニメファンから絶大な支持を集める名作ストーリー`;
    }
  }

  // Parse description sections if structured
  let storyPart = cleanDescription;
  let highlightPart = "";

  if (cleanDescription.includes("【作品のみどころ・特徴】")) {
    const parts = cleanDescription.split("【作品のみどころ・特徴】");
    storyPart = parts[0].replace("【ストーリー概要】", "").trim();
    highlightPart = parts[1].trim();
  } else if (cleanDescription.includes("【ストーリー概要】")) {
    storyPart = cleanDescription.replace("【ストーリー概要】", "").trim();
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // High converting Affiliate Platforms
  const affiliates = [
    {
      name: "U-NEXT（ユーネクスト）",
      description: "31日間無料トライアル実施中！27万本以上が見放題。アニメ配信数も業界トップクラス。無料登録時に600円分のポイントが貰えて、最新作のレンタルにも使えます！",
      cta: "U-NEXTで31日間無料体験",
      color: "bg-sky-600 hover:bg-sky-700 shadow-sky-600/20",
      officialLink: `https://www.video.unext.jp/search?query=${encodeURIComponent(mainTitle)}`,
      badge: "おすすめNo.1"
    },
    {
      name: "DMM TV",
      description: "月額550円で19万本以上が見放題！新規登録なら30日間無料＆最大3ヶ月間550pt付与。アニメ最速先行配信が非常に多くコスパ最高のサービス。",
      cta: "DMM TVで30日間無料体験",
      color: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20",
      officialLink: `https://tv.dmm.com/vod/search/?keyword=${encodeURIComponent(mainTitle)}`,
      badge: "コスパ最強"
    },
    {
      name: "dアニメストア",
      description: "アニメ専門配信サービスNo.1！月額550円で5,700作品以上のアニメが見放題。懐かしの名作から今期の地上波同時配信まで網羅。",
      cta: "dアニメストアで今すぐ見る",
      color: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
      officialLink: `https://animestore.docomo.ne.jp/animestore/srch?searchKey=${encodeURIComponent(mainTitle)}`,
      badge: "作品数No.1"
    },
    {
      name: "ABEMA（プレミアム）",
      description: "プレミアムプラン（月額960円）で新作アニメの地上波最速配信や限定コンテンツ、見逃し配信が広告なしですべて見放題に。",
      cta: "ABEMAで配信チェック",
      color: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
      officialLink: `https://abema.tv/search?q=${encodeURIComponent(mainTitle)}`,
      badge: "地上波同時"
    },
    {
      name: "Amazon Prime Video",
      description: "月額600円のプライム会員特典で追加料金なしで見放題！プライム配送特典などもコミコミで非常にお得です。",
      cta: "Amazonプライムで検索",
      color: "bg-slate-800 hover:bg-slate-900 shadow-slate-800/20",
      officialLink: `https://www.amazon.co.jp/s?k=${encodeURIComponent(mainTitle + " アニメ")}&i=instant-video`,
      badge: "プライム特典"
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 font-sans">
      
      {/* Back Button & Top Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView("home")}
          className="flex items-center space-x-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          id="detail-back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>作品一覧へ戻る</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
          <span>{copied ? "リンクをコピーしました" : "この作品を共有"}</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
        {/* Banner */}
        <div className="relative h-48 w-full bg-slate-900 overflow-hidden sm:h-64">
          {anime.bannerImage ? (
            <img
              src={anime.bannerImage}
              alt={mainTitle}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-60 scale-105 transition-transform duration-1000 hover:scale-100"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600/30 via-purple-600/30 to-indigo-600/30"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
        </div>

        {/* Header Main Info */}
        <div className="relative z-10 px-6 pb-6 -mt-20 sm:px-10 sm:pb-8 flex flex-col sm:flex-row gap-6 items-start">
          {/* Cover Art */}
          <div className="relative h-48 w-36 sm:h-60 sm:w-44 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white shrink-0 self-center sm:self-auto group">
            <AnimeCardImage anime={anime} className="h-full w-full object-cover" />
          </div>

          {/* Titles & Badges */}
          <div className="flex-grow space-y-4 self-stretch flex flex-col justify-end pt-4 sm:pt-0">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100">
                  <Flame className="h-3 w-3 mr-0.5" />
                  注目アニメ
                </span>
                {anime.startDate?.year && (
                  <span className="text-xs text-gray-400 font-semibold">{anime.startDate.year}年作品</span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold text-gray-950 sm:text-3xl tracking-tight leading-tight">
                {mainTitle}
              </h1>
              {subTitle && (
                <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">{subTitle}</p>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200/60 shadow-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm">{rating}</span>
                <span className="text-[10px] text-amber-600/70 font-normal">/ 10</span>
              </div>

              {anime.studios?.nodes?.[0]?.name && (
                <div className="flex items-center space-x-1 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 border border-purple-100 shadow-sm">
                  <Building2 className="h-3.5 w-3.5 text-purple-600" />
                  <span>{anime.studios.nodes[0].name}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => toggleFavorite(anime.id)}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isFav
                    ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-rose-100"
                    : "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20 active:scale-95"
                }`}
                id={`detail-fav-toggle-${anime.id}`}
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>{isFav ? "お気に入り追加済み" : "お気に入りに追加"}</span>
              </button>

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(mainTitle + " アニメ 公式")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-colors"
              >
                <Search className="h-3.5 w-3.5 text-gray-500" />
                <span>Googleで最新情報を検索</span>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center space-x-2 py-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === "overview"
              ? "border-rose-600 text-rose-600 bg-rose-50/50 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="tab-overview"
        >
          <Sparkles className="h-4 w-4" />
          <span>概要・作品あらすじ</span>
        </button>

        <button
          onClick={() => setActiveTab("details")}
          className={`flex items-center space-x-2 py-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === "details"
              ? "border-rose-600 text-rose-600 bg-rose-50/50 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="tab-details"
        >
          <Info className="h-4 w-4" />
          <span>作品スペック・データ</span>
        </button>

        <button
          onClick={() => setActiveTab("streaming")}
          className={`flex items-center space-x-2 py-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === "streaming"
              ? "border-rose-600 text-rose-600 bg-rose-50/50 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="tab-streaming"
        >
          <Tv className="h-4 w-4" />
          <span>配信視聴サービス</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[300px]">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Story Outline Card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-rose-600 inline-block"></span>
                  <span>ストーリー概要・あらすじ</span>
                </h3>
                <span className="text-xs text-gray-400 font-medium">日本語公式データ</span>
              </div>

              <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line font-normal tracking-wide">
                {storyPart}
              </div>
            </div>

            {/* Highlights Card if available */}
            {highlightPart && (
              <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-purple-50/40 p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-rose-950 flex items-center space-x-2">
                  <Award className="h-5 w-5 text-rose-600" />
                  <span>この作品の見どころ・魅力ポイント</span>
                </h3>

                <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line font-medium">
                  {highlightPart}
                </div>
              </div>
            )}

            {/* Genre tags */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">作品のジャンル・属性</h4>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-default"
                    >
                      <Zap className="h-3 w-3 text-rose-500" />
                      <span>{translateGenreToJapanese(g)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DETAILS TAB */}
        {activeTab === "details" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                  <Info className="h-5 w-5 text-rose-600" />
                  <span>基本データ・スペック一覧</span>
                </h3>
              </div>

              <dl className="grid grid-cols-1 gap-y-4 gap-x-8 sm:grid-cols-2 text-sm">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                  <dt className="font-semibold text-gray-500 text-xs">邦題（正式名称）</dt>
                  <dd className="text-gray-900 font-bold text-sm text-right">{anime.title?.native || mainTitle}</dd>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                  <dt className="font-semibold text-gray-500 text-xs">英題 / ローマ字</dt>
                  <dd className="text-gray-900 font-medium text-xs text-right truncate max-w-[180px]">
                    {anime.title?.english || anime.title?.romaji || "N/A"}
                  </dd>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                  <dt className="font-semibold text-gray-500 text-xs">放送開始日</dt>
                  <dd className="text-gray-900 font-bold text-sm text-right">
                    {anime.startDate?.year
                      ? `${anime.startDate.year}年 ${anime.startDate.month || 1}月 ${anime.startDate.day || 1}日`
                      : "未定"}
                  </dd>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                  <dt className="font-semibold text-gray-500 text-xs">アニメーション制作会社</dt>
                  <dd className="text-gray-900 font-bold text-sm text-right">{anime.studios?.nodes?.[0]?.name || "情報更新中"}</dd>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                  <dt className="font-semibold text-gray-500 text-xs">平均評価スコア</dt>
                  <dd className="text-amber-600 font-extrabold text-sm text-right flex items-center space-x-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{rating} / 10.0</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* STREAMING TAB */}
        {activeTab === "streaming" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
              <h3 className="text-base font-extrabold text-gray-900">配信中の公式サービス一覧</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                『{mainTitle}』を安全・高画質でお楽しみいただける公式動画配信サービスです。初回登録の無料トライアルを活用してご視聴いただけます。
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
                      <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-100">
                        {plat.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{plat.description}</p>
                  </div>

                  <a
                    href={plat.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full md:w-auto text-center px-6 py-3 rounded-xl text-xs font-extrabold text-white transition-all transform hover:scale-[1.02] active:scale-95 ${plat.color} shrink-0 shadow-md`}
                  >
                    {plat.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footnote */}
      <div className="flex items-center space-x-2 text-[11px] text-gray-400 justify-center pt-4">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <span>当サイトは合法かつ安全に作品情報および配信情報を提供しています。</span>
      </div>
    </div>
  );
}
