import React from "react";
import { Sparkles, Search, Heart, User, Settings, HelpCircle, Sun, Moon } from "lucide-react";

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  favoritesCount: number;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  isAdminAuthenticated?: boolean;
}

export default function Navbar({ currentView, setView, favoritesCount, isDarkMode, toggleDarkMode, isAdminAuthenticated }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          onClick={() => setView("home")} 
          className="flex cursor-pointer items-center space-x-2 group"
          id="nav-logo"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-violet-500 shadow-md shadow-rose-500/10 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold tracking-tight text-transparent font-sans">
              アニメ診断 <span className="text-rose-500 text-sm font-medium tracking-normal ml-0.5">Diagnose</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              国内公式API連動
            </span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => setView("home")}
            className={`text-sm font-medium transition-colors ${
              currentView === "home" ? "text-rose-600 font-semibold" : "text-gray-600 hover:text-gray-950"
            }`}
            id="nav-btn-home"
          >
            ホーム
          </button>
          <button
            onClick={() => setView("diagnose")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-medium bg-rose-50 hover:bg-rose-100 transition-colors ${
              currentView === "diagnose" ? "text-rose-600 ring-1 ring-rose-200" : "text-rose-600"
            }`}
            id="nav-btn-diagnose"
          >
            <Sparkles className="h-4 w-4" />
            <span>診断を始める</span>
          </button>
          <button
            onClick={() => setView("search")}
            className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
              currentView === "search" ? "text-rose-600 font-semibold" : "text-gray-600 hover:text-gray-950"
            }`}
            id="nav-btn-search"
          >
            <Search className="h-4 w-4 mr-0.5" />
            作品検索
          </button>
          <button
            onClick={() => setView("mypage")}
            className={`flex items-center space-x-1 text-sm font-medium transition-colors relative ${
              currentView === "mypage" ? "text-rose-600 font-semibold" : "text-gray-600 hover:text-gray-950"
            }`}
            id="nav-btn-mypage"
          >
            <User className="h-4 w-4 mr-0.5" />
            マイページ
            {favoritesCount > 0 && (
              <span className="absolute -top-2 -right-3.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {favoritesCount}
              </span>
            )}
          </button>
          {toggleDarkMode && (
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-950 transition-colors flex items-center justify-center"
              id="theme-toggle-desktop"
              title={isDarkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"}
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-slate-600" />}
            </button>
          )}
          {isAdminAuthenticated && (
            <button
              onClick={() => setView("admin")}
              className={`text-sm font-medium transition-colors ${
                currentView === "admin" ? "text-rose-600 font-semibold" : "text-gray-400 hover:text-gray-700"
              }`}
              id="nav-btn-admin"
              title="管理画面（シミュレーター）"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile quick access */}
        <div className="flex md:hidden items-center space-x-3">
          {toggleDarkMode && (
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 transition-colors hover:bg-gray-100 flex items-center justify-center"
              id="theme-toggle-mobile"
              title={isDarkMode ? "ライトモード" : "ダークモード"}
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>
          )}
          <button
            onClick={() => setView("search")}
            className={`p-2 rounded-lg transition-colors ${currentView === "search" ? "text-rose-500 bg-rose-50" : "text-gray-500"}`}
            id="mobile-nav-search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={() => setView("diagnose")}
            className={`p-2 rounded-lg transition-colors ${currentView === "diagnose" ? "text-rose-500 bg-rose-50" : "text-gray-500"}`}
            id="mobile-nav-diagnose"
          >
            <Sparkles className="h-5 w-5" />
          </button>
          <button
            onClick={() => setView("mypage")}
            className={`p-2 rounded-lg transition-colors relative ${currentView === "mypage" ? "text-rose-500 bg-rose-50" : "text-gray-500"}`}
            id="mobile-nav-mypage"
          >
            <User className="h-5 w-5" />
            {favoritesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500 ring-1 ring-white"></span>
            )}
          </button>
          {isAdminAuthenticated && (
            <button
              onClick={() => setView("admin")}
              className={`p-2 rounded-lg transition-colors ${currentView === "admin" ? "text-rose-500 bg-rose-50" : "text-gray-500"}`}
              id="mobile-nav-admin"
              title="管理画面"
            >
              <Settings className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
