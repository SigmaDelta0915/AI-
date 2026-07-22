import React from "react";
import { Sparkles, Heart, FileText, ShieldAlert, Check } from "lucide-react";

interface FooterProps {
  setView: (view: string) => void;
}

export default function Footer({ setView }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-100 bg-gray-50/50 py-12 text-gray-500 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Brand and Policy */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-900 font-bold tracking-tight text-base">
                アニメ診断 <span className="text-rose-500 text-xs">Anime Diagnose</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              AI（Gemini）の高度な分析とAniListの作品データを組み合わせ、あなたの深層心理や好みに本当に合うアニメを導き出す診断プラットフォーム。
            </p>
            <div className="flex items-start space-x-2 text-xs bg-white border border-gray-100 rounded-xl p-3 shadow-sm max-w-md">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-gray-700">著作権・免責事項</p>
                <p className="leading-normal text-gray-500">
                  当サイトはAniList APIから取得した作品メタデータを使用しています。著作権保護のため、アニメ公式画像・場面写真・スクリーンショット等の無断掲載は一切行っておりません。すべてのリンクは公式サイトや公式配信サービス（U-NEXT、DMM TV等）へ安全に誘導しています。
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-gray-900 tracking-wide">サイトマップ</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setView("home")} className="hover:text-gray-900 transition-colors">
                  ホーム
                </button>
              </li>
              <li>
                <button onClick={() => setView("diagnose")} className="hover:text-gray-900 transition-colors">
                  アニメ診断を始める
                </button>
              </li>
              <li>
                <button onClick={() => setView("search")} className="hover:text-gray-900 transition-colors">
                  詳細検索
                </button>
              </li>
              <li>
                <button onClick={() => setView("mypage")} className="hover:text-gray-900 transition-colors text-left">
                  マイお気に入り & 診断履歴
                </button>
              </li>
            </ul>
          </div>

          {/* Affiliate Disclosure */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-gray-900 text-sm tracking-wide">商用プログラム提携</h4>
            <p className="leading-relaxed">
              本サイトはGoogle AdSense広告を配信し、U-NEXT、DMM TV、dアニメストア、ABEMA、Amazonアソシエイトを含む各種アフィリエイトプログラムに参加しています。紹介リンクを経由してご登録いただくと、当プラットフォームに一部コミッションが発生する場合があります。
            </p>
            <div className="flex items-center space-x-1.5 text-[11px] text-emerald-600 font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>広告掲載枠 & セキュリティ検証済</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p className="flex items-center">
            <span>© {currentYear} アニメ診断 (Anime Diagnose). All rights reserved.</span>
          </p>
          <p className="flex items-center mt-2 sm:mt-0">
            Made with <Heart className="h-3 w-3 text-rose-500 mx-1 animate-pulse" /> using Gemini AI & AniList
          </p>
        </div>
      </div>
    </footer>
  );
}
