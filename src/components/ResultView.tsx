import React, { useState } from "react";
import { Sparkles, RefreshCw, Star, Heart, ArrowRight, Share2, Play, ExternalLink, Bookmark, Award, Copy, Check, Camera, QrCode } from "lucide-react";
import { DiagnosisResult, RecommendedAnime } from "../types";
import { motion } from "motion/react";
import { translateGenreToJapanese } from "../data/fallbackAnime";

interface ResultViewProps {
  result: DiagnosisResult | null;
  setView: (view: string) => void;
  setSelectedAnimeId: (id: number) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
}

export default function ResultView({
  result,
  setView,
  setSelectedAnimeId,
  favorites,
  toggleFavorite,
}: ResultViewProps) {
  const [nickname, setNickname] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showShareCardMode, setShowShareCardMode] = useState<boolean>(false);

  if (!result) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="text-gray-500">診断結果が見つかりません。診断を最初から開始してください。</p>
        <button
          onClick={() => setView("diagnose")}
          className="mt-4 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
        >
          診断を始める
        </button>
      </div>
    );
  }

  const selectAnime = (id: number) => {
    setSelectedAnimeId(id);
    setView("detail");
  };

  const handleShareTwitter = () => {
    const text = `【アニメ診断 結果】私の診断タイプは『${result.typeName}』でした！\nあなたに本当に合うおすすめアニメをAIが無料診断してくれます！ #アニメ診断 #AI診断 #おすすめアニメ`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleShareLine = () => {
    const text = `私の診断タイプは『${result.typeName}』でした！【アニメ診断】`;
    const url = window.location.href;
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-12 font-sans">
      
      {/* Upper Congrats Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-violet-100/70 px-4 py-1.5 text-xs font-bold text-violet-600">
          <Award className="h-4 w-4" />
          <span>AI性格分析 完了</span>
        </span>
        <h1 className="text-3xl font-black text-gray-900 sm:text-4xl tracking-tight">あなたの診断結果</h1>
        <p className="text-sm text-gray-400">Gemini AIが回答パターンのシンクロニシティを紐解き、タイプを特定しました。</p>
      </motion.div>

      {/* Profile Premium Glassmorphism Block */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-6 sm:p-10 shadow-xl"
      >
        {/* Glow circles */}
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-rose-400/10 blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-violet-400/10 blur-3xl"></div>

        <div className="relative z-10 text-center space-y-6">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-widest font-mono">YOUR ANIME PERSONALITY</p>
          
          <div className="inline-block relative">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 bg-clip-text text-transparent px-4">
              『 {result.typeName} 』
            </h2>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-400 to-violet-400 opacity-10 blur"></div>
          </div>

          <p className="text-base text-gray-700 leading-relaxed max-w-2xl mx-auto text-left sm:text-center">
            {result.typeDescription}
          </p>

          {/* Tag cloud */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {result.keyTraits.map((trait, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200/60"
              >
                #{trait}
              </span>
            ))}
          </div>

          {/* Virality sharing buttons & Custom Share Mode */}
          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-col items-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setShowShareCardMode(!showShareCardMode)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  showShareCardMode
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                }`}
                id="toggle-share-mode-btn"
              >
                <Camera className="h-4 w-4" />
                <span>{showShareCardMode ? "シェアモードを閉じる" : "カスタム・シェアカードを作る"}</span>
              </button>

              <button
                onClick={() => {
                  const prefix = nickname ? `${nickname}さんのアニメ診断結果は『${result.typeName}』でした！\n` : "";
                  const text = `${prefix}【アニメ診断 結果】私の診断タイプは『${result.typeName}』でした！\nあなたに本当に合うおすすめアニメをAIが無料診断してくれます！ #アニメ診断 #AI診断 #おすすめアニメ`;
                  const url = window.location.href;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
                }}
                className="px-4 py-2.5 bg-black hover:bg-gray-900 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow"
                id="share-twitter-btn"
              >
                <span>X (Twitter)</span>
              </button>

              <button
                onClick={() => {
                  const prefix = nickname ? `${nickname}さんの診断結果は『${result.typeName}』！\n` : "";
                  const text = `${prefix}私の診断タイプは『${result.typeName}』でした！【アニメ診断】`;
                  const url = window.location.href;
                  window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
                }}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow"
                id="share-line-btn"
              >
                <span>LINE</span>
              </button>
            </div>

            {/* Custom Share Mode Generator */}
            {showShareCardMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="w-full max-w-lg mx-auto bg-gray-50/50 dark:bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-slate-800 space-y-4 text-left overflow-hidden"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-rose-500" />
                    <span>シェアモード：診断結果カードをカスタマイズ</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    ニックネームを入力して、SNSへの投稿やスクショに最適なオリジナルカードを作成できます。
                  </p>
                </div>

                {/* Nickname input */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">
                    あなたのニックネーム (最大12文字)
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setCopied(false);
                    }}
                    placeholder="ニックネームを入力..."
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300 transition-all font-medium"
                  />
                </div>

                {/* Live Card Preview styled like Instax/Polaroid */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-violet-600 p-1 shadow-lg max-w-sm mx-auto">
                  <div className="bg-white dark:bg-slate-950 p-4 sm:p-5 rounded-xl space-y-4">
                    {/* Top line */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2.5 text-[10px] font-bold text-rose-500 font-mono tracking-wider">
                      <span>ANIME DIAGNOSIS</span>
                      <span>#{Date.now().toString().slice(-4)}</span>
                    </div>

                    {/* Result type and nickname */}
                    <div className="text-center space-y-3 py-3">
                      <p className="text-xs font-bold text-gray-400">
                        {nickname ? `${nickname} さん` : "GUEST"} の性格タイプ
                      </p>
                      <h4 className="text-2xl font-black tracking-tight text-transparent bg-gradient-to-r from-rose-500 to-violet-600 bg-clip-text">
                        『 {result.typeName} 』
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed px-2 font-medium">
                        {result.typeDescription.slice(0, 80)}...
                      </p>
                    </div>

                    {/* Tags and QR-code section */}
                    <div className="flex items-end justify-between border-t border-gray-100 dark:border-slate-800 pt-3">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono">Key Traits</span>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {result.keyTraits.map((t, i) => (
                            <span key={i} className="text-[9px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 px-1.5 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mock QR design */}
                      <div className="flex flex-col items-center justify-center shrink-0">
                        <div className="p-1 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                          <QrCode className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="text-[7px] text-gray-400 font-bold mt-1 tracking-tighter scale-90">ANIME DIAG</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text summary block copy CTA */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const shareText = `【アニメ性格診断結果】\n✨ ${nickname ? `${nickname}さん` : "私"}の診断タイプは『${result.typeName}』でした！\n\n💎 性格の特徴：\n${result.keyTraits.map(t => `・#${t}`).join("\n")}\n\n🎬 おすすめアニメ第一候補：\n『${result.recommendations[0]?.media?.title?.native || result.recommendations[0]?.title || "作品"}』\nAI推奨理由: ${result.recommendations[0]?.reason.slice(0, 45)}...\n\n#アニメ診断 #AI性格診断 #おすすめアニメ\n${window.location.origin}`;
                      navigator.clipboard.writeText(shareText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-slate-850 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow"
                    id="copy-share-text-btn"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400 font-extrabold">クリップボードにコピーしました！</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>結果をクリップボードにコピー</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">
                    コピーしたテキストはそのままSNS、ブログ、LINE等にペーストして共有できます。
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Dynamic Recommended Anime List */}
      <section className="space-y-8">
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center justify-center sm:justify-start space-x-2">
            <Sparkles className="h-6 w-6 text-rose-500" />
            <span>AI推薦の厳選アニメ作品</span>
          </h2>
          <p className="text-sm text-gray-400">あなたに刺さる明確な推薦コメント付きでお届けします。</p>
        </div>

        <div className="space-y-6">
          {(result?.recommendations || []).filter(Boolean).map((rec: RecommendedAnime, idx: number) => {
            const hasMedia = !!rec.media;
            const animeId = rec.media?.id;
            const mainTitle = rec.media?.title?.native || rec.media?.title?.userPreferred || rec.media?.title?.english || rec.title;
            const isFav = animeId ? favorites.includes(animeId) : false;
            const score = rec.media?.averageScore ? (rec.media.averageScore / 10).toFixed(1) : null;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-rose-100 transition-all p-5 gap-6"
              >
                {/* Visual Thumbnail or Placeholder */}
                <div className="w-full md:w-44 shrink-0">
                  <div 
                    onClick={() => animeId && selectAnime(animeId)}
                    className={`relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gray-50 ${animeId ? "cursor-pointer" : ""}`}
                  >
                    {rec.media?.coverImage?.large ? (
                      <img
                        src={rec.media.coverImage.large}
                        alt={mainTitle}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
                        <Play className="h-8 w-8 text-gray-300 mb-2" />
                        <span className="text-[10px] font-semibold">イメージ取得中</span>
                      </div>
                    )}

                    {/* Quality Badge */}
                    {score && (
                      <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{score}</span>
                      </div>
                    )}

                    {/* Index Badge */}
                    <div className="absolute top-2.5 left-2.5 flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500 text-xs font-bold text-white shadow">
                      {idx + 1}
                    </div>
                  </div>
                </div>

                {/* Info and AI Recommendation Reason */}
                <div className="flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 
                          onClick={() => animeId && selectAnime(animeId)}
                          className={`text-lg font-bold text-gray-950 ${animeId ? "hover:text-rose-500 cursor-pointer" : ""} transition-colors`}
                        >
                          {mainTitle}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {rec.media?.studios?.nodes?.[0]?.name || "情報未登録"} {rec.media?.startDate?.year ? `・ ${rec.media.startDate.year}年` : ""}
                        </p>
                      </div>

                      {/* Favorite Button */}
                      {animeId && (
                        <button
                          onClick={() => toggleFavorite(animeId)}
                          className="rounded-xl border border-gray-100 bg-gray-50/50 p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                          id={`result-fav-${animeId}`}
                        >
                          <Heart className={`h-4.5 w-4.5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>
                      )}
                    </div>

                    {/* Genres Tag */}
                    {rec.media?.genres && (
                      <div className="flex flex-wrap gap-1">
                        {rec.media.genres.map((g, gIdx) => (
                          <span key={gIdx} className="inline-block rounded bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600">
                            {translateGenreToJapanese(g)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Recommendation reason */}
                    <div className="bg-gradient-to-r from-gray-50 to-white/30 rounded-xl p-3 border border-gray-100/60 mt-3">
                      <p className="text-xs font-bold text-rose-600 flex items-center space-x-1 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                        <span>AIによる推薦理由</span>
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>
                  </div>

                  {/* Affiliate Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100/50">
                    {animeId && (
                      <button
                        onClick={() => selectAnime(animeId)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
                        id={`result-detail-btn-${animeId}`}
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>作品詳細を見る</span>
                      </button>
                    )}
                    
                    {/* High conversion affiliate buttons */}
                    <a
                      href="https://www.video.unext.jp/"
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 hover:text-rose-500 transition-colors"
                    >
                      <span>U-NEXT で探す</span>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </a>
                    <a
                      href="https://tv.dmm.com/vod/"
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 hover:text-rose-500 transition-colors"
                    >
                      <span>DMM TV で探す</span>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Retake section */}
      <section className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-3xl border border-gray-100 bg-gray-50/50 gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">回答をやり直しますか？</h3>
          <p className="text-xs text-gray-400 mt-0.5">別の価値観や気分で回答すると、異なる診断タイプや新しいアニメとの出会いがあります。</p>
        </div>
        <button
          onClick={() => setView("diagnose")}
          className="flex items-center space-x-1.5 px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-transform hover:scale-[1.02]"
          id="retake-diagnosis-btn"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>もう一度診断する</span>
        </button>
      </section>
    </div>
  );
}
