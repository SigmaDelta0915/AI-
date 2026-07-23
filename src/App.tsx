import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import DiagnoseView from "./components/DiagnoseView";
import ResultView from "./components/ResultView";
import DetailView from "./components/DetailView";
import SearchView from "./components/SearchView";
import MyPageView from "./components/MyPageView";
import AdminView from "./components/AdminView";
import { DiagnosisResult, DiagnosticHistory, AdConfiguration, Notice } from "./types";
import { motion, AnimatePresence } from "motion/react";

// Mock Initial Data for notices and ads
const INITIAL_NOTICES: Notice[] = [
  {
    id: "1",
    title: "AIアニメ精密診断システム v2.5 一般公開のお知らせ",
    content: "Gemini AIの高度な性格分析と、リアルタイムのAniList作品データベースが同期しました。直感的な15問のQ&Aで、心に眠る極上のアニメを導きます。",
    date: "2026/07/20",
  },
  {
    id: "2",
    title: "各種動画配信サービス（DMM TV・U-NEXT等）とのアフィリエイト連携開始",
    content: "作品詳細ページからワンボタンで「DMM TV」「U-NEXT」「dアニメストア」等へ安全に遷移・無料体験登録ができる導線を開設しました。高水準の還元アフィリエイトでサイトをサポートします。",
    date: "2026/07/15",
  },
];

const INITIAL_ADS: AdConfiguration[] = [
  {
    id: "ad-1",
    slot: "home-infeed",
    type: "in-feed",
    title: "最新アニメを月額550円で最速見放題！【DMM TV】新規30日間無料体験実施中！",
    description: "今期の新作アニメを最速で先行独占配信する今最も注目のコスパ最強サービス。30日間無料でお試しいただけます！",
    linkUrl: "https://tv.dmm.com/vod/",
    imageUrl: "",
  },
  {
    id: "ad-2",
    slot: "detail-sidebar",
    type: "sidebar",
    title: "アニメも映画も電子書籍もこれ一本！【U-NEXT】31日間無料トライアル",
    description: "27万本以上が見放題！無料お試し時に最新作のレンタルにも使える600円分のポイントをプレゼント！",
    linkUrl: "https://www.video.unext.jp/",
    imageUrl: "",
  },
];

export default function App() {
  // Current View Router (initial state resolved from URL path or hash)
  const [currentView, setView] = useState<string>(() => {
    try {
      const path = window.location.pathname;
      if (path === "/admin" || path === "/admin/") return "admin";
      if (path === "/diagnose" || path === "/diagnose/") return "diagnose";
      if (path === "/search" || path === "/search/") return "search";
      if (path === "/mypage" || path === "/mypage/") return "mypage";
      if (path.startsWith("/anime/")) return "detail";
      
      const hash = window.location.hash;
      if (hash === "#admin") return "admin";
      if (hash === "#diagnose") return "diagnose";
      if (hash === "#search") return "search";
      if (hash === "#mypage") return "mypage";
    } catch (e) {
      console.error("Failed to parse initial view from URL: ", e);
    }
    return "home";
  });

  // Detailed selected anime target (initial state resolved from URL)
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(() => {
    try {
      const path = window.location.pathname;
      if (path.startsWith("/anime/")) {
        const idStr = path.replace("/anime/", "").split("/")[0];
        const parsed = parseInt(idStr, 10);
        return isNaN(parsed) ? null : parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Fetch SEO & Google Search Console verification meta tag
  useEffect(() => {
    fetch("/api/seo/config")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.gscVerificationTag) {
          const metaTag = document.getElementById("gsc-meta-tag") as HTMLMetaElement;
          if (metaTag) {
            metaTag.content = data.gscVerificationTag;
          } else {
            const newMeta = document.createElement("meta");
            newMeta.name = "google-site-verification";
            newMeta.content = data.gscVerificationTag;
            newMeta.id = "gsc-meta-tag";
            document.head.appendChild(newMeta);
          }
        }
      })
      .catch((err) => console.error("Failed to load SEO config:", err));
  }, []);

  // Sync URL Path with currentView & selectedAnimeId
  useEffect(() => {
    try {
      const path = window.location.pathname;
      if (currentView === "admin" && path !== "/admin") {
        window.history.pushState({ view: "admin" }, "", "/admin");
      } else if (currentView === "home" && path !== "/") {
        window.history.pushState({ view: "home" }, "", "/");
      } else if (currentView === "diagnose" && path !== "/diagnose") {
        window.history.pushState({ view: "diagnose" }, "", "/diagnose");
      } else if (currentView === "search" && path !== "/search") {
        window.history.pushState({ view: "search" }, "", "/search");
      } else if (currentView === "mypage" && path !== "/mypage") {
        window.history.pushState({ view: "mypage" }, "", "/mypage");
      } else if (currentView === "detail" && selectedAnimeId) {
        const detailPath = `/anime/${selectedAnimeId}`;
        if (path !== detailPath) {
          window.history.pushState({ view: "detail", id: selectedAnimeId }, "", detailPath);
        }
      }
    } catch (e) {
      console.error("Failed to sync history state: ", e);
    }
  }, [currentView, selectedAnimeId]);

  // Handle browser navigation (back/forward popstate)
  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = window.location.pathname;
        if (path === "/admin") {
          setView("admin");
        } else if (path === "/diagnose") {
          setView("diagnose");
        } else if (path === "/search") {
          setView("search");
        } else if (path === "/mypage") {
          setView("mypage");
        } else if (path.startsWith("/anime/")) {
          const idStr = path.replace("/anime/", "");
          const id = parseInt(idStr, 10);
          if (!isNaN(id)) {
            setSelectedAnimeId(id);
            setView("detail");
          } else {
            setView("home");
          }
        } else {
          setView("home");
        }
      } catch (e) {
        console.error("PopState handling failed: ", e);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Storage states with LocalStorage persistence
  const [favorites, setFavorites] = useState<number[]>([]);
  const [historyList, setHistoryList] = useState<DiagnosticHistory[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [ads, setAds] = useState<AdConfiguration[]>([]);

  // Dark Mode state with LocalStorage persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("anime_diagnose_theme");
      return saved === "dark";
    } catch {
      return false;
    }
  });

  // Diagnosis states
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [searchState, setSearchState] = useState<{ search: string; genre: string }>({ search: "", genre: "" });

  // Admin authentication state with SessionStorage persistence
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("anime_diagnose_admin_auth") === "true";
    } catch {
      return false;
    }
  });

  // Sync dark mode class and localStorage
  useEffect(() => {
    try {
      localStorage.setItem("anime_diagnose_theme", isDarkMode ? "dark" : "light");
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
         document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.error("Failed to sync dark mode theme: ", e);
    }
  }, [isDarkMode]);

  // Initialize and load states on mount
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("anime_diagnose_favs");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));

      const storedHistory = localStorage.getItem("anime_diagnose_history");
      if (storedHistory) setHistoryList(JSON.parse(storedHistory));

      const storedNotices = localStorage.getItem("anime_diagnose_notices");
      if (storedNotices) {
        setNotices(JSON.parse(storedNotices));
      } else {
        setNotices(INITIAL_NOTICES);
        localStorage.setItem("anime_diagnose_notices", JSON.stringify(INITIAL_NOTICES));
      }

      const storedAds = localStorage.getItem("anime_diagnose_ads");
      if (storedAds) {
        setAds(JSON.parse(storedAds));
      } else {
        setAds(INITIAL_ADS);
        localStorage.setItem("anime_diagnose_ads", JSON.stringify(INITIAL_ADS));
      }
    } catch (error) {
      console.error("LocalStorage Initialization Error:", error);
    }
  }, []);

  // Sync favorites
  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id];
      localStorage.setItem("anime_diagnose_favs", JSON.stringify(updated));
      return updated;
    });
  };

  // Save successful diagnosis result
  const saveDiagnosisToHistory = (result: DiagnosisResult, answers: { [key: number]: string }) => {
    const historyItem: DiagnosticHistory = {
      id: Date.now().toString(),
      result,
      answers,
    };
    setHistoryList((prev) => {
      const updated = [historyItem, ...prev];
      localStorage.setItem("anime_diagnose_history", JSON.stringify(updated));
      return updated;
    });
  };

  // Clear past history list
  const clearHistory = () => {
    setHistoryList([]);
    localStorage.removeItem("anime_diagnose_history");
  };

  // Admin updates
  const saveNotices = (updatedList: Notice[]) => {
    setNotices(updatedList);
    localStorage.setItem("anime_diagnose_notices", JSON.stringify(updatedList));
  };

  const saveAds = (updatedList: AdConfiguration[]) => {
    setAds(updatedList);
    localStorage.setItem("anime_diagnose_ads", JSON.stringify(updatedList));
  };

  return (
    <div className="min-h-screen bg-gray-50/40 text-gray-900 flex flex-col font-sans antialiasedSelection">
      
      {/* Dynamic Navbar */}
      <Navbar 
        currentView={currentView} 
        setView={(view) => {
          setView(view);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }} 
        favoritesCount={favorites.length}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(prev => !prev)}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* Announcements ticker at top if home view */}
      {currentView === "home" && notices.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-violet-50 border-b border-rose-100/40 py-2.5 px-4 text-center text-xs text-rose-600 font-semibold backdrop-blur-sm">
          <div className="mx-auto max-w-7xl flex items-center justify-center space-x-2">
            <span className="inline-block bg-rose-500 text-white font-black px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider scale-90">Notice</span>
            <span className="truncate">{notices[0].title} — {notices[0].content}</span>
          </div>
        </div>
      )}

      {/* Main Container with smooth page-level transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView + (selectedAnimeId || "")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {currentView === "home" && (
              <HomeView
                setView={setView}
                setSelectedAnimeId={setSelectedAnimeId}
                setSearchState={setSearchState}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}

            {currentView === "diagnose" && (
              <DiagnoseView
                setView={setView}
                setDiagnosisResult={setDiagnosisResult}
                saveDiagnosisToHistory={saveDiagnosisToHistory}
              />
            )}

            {currentView === "result" && (
              <ResultView
                result={diagnosisResult}
                setView={setView}
                setSelectedAnimeId={setSelectedAnimeId}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}

            {currentView === "detail" && (
              <DetailView
                animeId={selectedAnimeId}
                setView={setView}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}

            {currentView === "search" && (
              <SearchView
                initialSearch={searchState.search}
                initialGenre={searchState.genre}
                setView={setView}
                setSelectedAnimeId={setSelectedAnimeId}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}

            {currentView === "mypage" && (
              <MyPageView
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                historyList={historyList}
                clearHistory={clearHistory}
                setView={setView}
                setSelectedAnimeId={setSelectedAnimeId}
                setDiagnosisResult={setDiagnosisResult}
              />
            )}

            {currentView === "admin" && (
              <AdminView
                notices={notices}
                saveNotices={saveNotices}
                ads={ads}
                saveAds={saveAds}
                isAdminAuthenticated={isAdminAuthenticated}
                setIsAdminAuthenticated={setIsAdminAuthenticated}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dynamic Footer with Affiliates Disclosure */}
      <Footer setView={setView} />
    </div>
  );
}
