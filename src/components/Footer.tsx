import React from "react";
import { Sparkles, Heart, ShieldAlert } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface FooterProps {
  setView: (view: string) => void;
}

export default function Footer({ setView }: FooterProps) {
  const { lang, ui } = useLanguage();
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
                {ui.nav.brand} <span className="text-rose-500 text-xs">Anime Diagnose</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              {ui.footer.brandDesc}
            </p>
            <div className="flex items-start space-x-2 text-xs bg-white border border-gray-100 rounded-xl p-3 shadow-sm max-w-md">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-gray-700">{ui.footer.copyrightTitle}</p>
                <p className="leading-normal text-gray-500">
                  {ui.footer.copyrightText}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-gray-900 tracking-wide">{ui.footer.sitemapTitle}</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setView("home")} className="hover:text-gray-900 transition-colors">
                  {ui.nav.home}
                </button>
              </li>
              <li>
                <button onClick={() => setView("diagnose")} className="hover:text-gray-900 transition-colors">
                  {ui.nav.diagnose}
                </button>
              </li>
              <li>
                <button onClick={() => setView("search")} className="hover:text-gray-900 transition-colors">
                  {ui.nav.search}
                </button>
              </li>
              <li>
                <button onClick={() => setView("mypage")} className="hover:text-gray-900 transition-colors text-left">
                  {ui.nav.mypage}
                </button>
              </li>
            </ul>
          </div>

          {/* Affiliate Disclosure */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-gray-900 text-sm tracking-wide">{ui.footer.affiliateTitle}</h4>
            <p className="leading-relaxed">
              {ui.footer.affiliateText}
            </p>
            <div className="flex items-center space-x-1.5 text-[11px] text-emerald-600 font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>{ui.footer.verifiedBadge}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p className="flex items-center">
            <span>© {currentYear} Anime Diagnose. All rights reserved.</span>
          </p>
          <p className="flex items-center mt-2 sm:mt-0">
            Made with <Heart className="h-3 w-3 text-rose-500 mx-1 animate-pulse" /> using Gemini AI & AniList
          </p>
        </div>
      </div>
    </footer>
  );
}
