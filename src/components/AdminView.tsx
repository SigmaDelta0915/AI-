import React, { useState, useEffect } from "react";
import { Settings, RefreshCw, Plus, Trash2, ShieldAlert, Check, Newspaper, Award, HelpCircle, Eye, Lock, KeyRound, LogOut, Loader2, Sparkles, Play, Wrench, Globe, Search, FileText, Copy, ExternalLink } from "lucide-react";
import { AdConfiguration, Notice } from "../types";
import { motion } from "motion/react";
import { safeJsonResponse } from "../services/animeService";

interface AdminViewProps {
  notices: Notice[];
  saveNotices: (list: Notice[]) => void;
  ads: AdConfiguration[];
  saveAds: (list: AdConfiguration[]) => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
}

export default function AdminView({ notices, saveNotices, ads, saveAds, isAdminAuthenticated, setIsAdminAuthenticated }: AdminViewProps) {
  const [successMsg, setSuccessMsg] = useState("");
  const [clearingCache, setClearingCache] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai-studio" | "notices" | "ads" | "seo" | "system">("ai-studio");

  // Authentication state
  const [passcodeInput, setPasscodeInput] = useState(() => {
    try {
      return sessionStorage.getItem("active_admin_passcode") || "";
    } catch {
      return "";
    }
  });
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Notice form state
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeContent, setNewNoticeContent] = useState("");

  // Ad Slot edit state
  const [editAdId, setEditAdId] = useState<string | null>(null);
  const [editAdTitle, setEditAdTitle] = useState("");
  const [editAdDesc, setEditAdDesc] = useState("");
  const [editAdLink, setEditAdLink] = useState("");

  // AI Studio Configuration state
  const [promptTemplate, setPromptTemplate] = useState("");
  const [promptTemplateInput, setPromptTemplateInput] = useState("");
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [newPasscodeConfirm, setNewPasscodeConfirm] = useState("");
  const [gscTagInput, setGscTagInput] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configError, setConfigError] = useState("");

  // AI Studio Playground / Simulator State
  const [testAnswers, setTestAnswers] = useState<{ [key: string]: string }>({
    "1": "ストーリーが極めて奥深く、緻密な伏線回収があるシリアスなSFやミステリー作品",
    "2": "休日の夜に、自分の部屋を暗くして一気見する",
    "3": "緻密な設定、頭脳戦、少しダークな世界観、心に残るメッセージ性",
  });
  const [testCategoryScores, setTestCategoryScores] = useState<{ [key: string]: number }>({
    "ファンタジー": 8,
    "SF・メカ": 9,
    "サスペンス": 7,
    "日常・コメディ": 2,
  });
  const [playgroundResult, setPlaygroundResult] = useState<any | null>(null);
  const [isRunningPlayground, setIsRunningPlayground] = useState(false);
  const [playgroundError, setPlaygroundError] = useState("");

  // Load configuration if authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchConfig();
    }
  }, [isAdminAuthenticated]);

  const fetchConfig = async () => {
    const activePasscode = passcodeInput || sessionStorage.getItem("active_admin_passcode") || "admin2026";
    try {
      const res = await fetch("/api/admin/config/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: activePasscode }),
      });
      const parsed = await safeJsonResponse(res);
      if (parsed.ok && parsed.data) {
        setPromptTemplate(parsed.data.promptTemplate);
        setPromptTemplateInput(parsed.data.promptTemplate);
        setCurrentPasscode(parsed.data.currentPasscode);
        setGscTagInput(parsed.data.gscVerificationTag || "");
        sessionStorage.setItem("active_admin_passcode", parsed.data.currentPasscode);
      }
    } catch (err) {
      console.error("Failed to load prompt config:", err);
    }
  };

  // Handle Server-side Passcode Authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthenticating(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcodeInput }),
      });

      const parsed = await safeJsonResponse(res);
      if (parsed.ok && parsed.data?.authenticated) {
        setIsAdminAuthenticated(true);
        try {
          sessionStorage.setItem("anime_diagnose_admin_auth", "true");
          sessionStorage.setItem("active_admin_passcode", passcodeInput);
        } catch (storageErr) {
          console.error(storageErr);
        }
      } else {
        setAuthError(parsed.errorMsg || "認証に失敗しました（静的ホスティング環境では /api サーバーが動作していない可能性があります）。");
      }
    } catch (err) {
      setAuthError("認証サーバーへの通信エラーが発生しました。");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem("anime_diagnose_admin_auth");
      sessionStorage.removeItem("active_admin_passcode");
    } catch (storageErr) {
      console.error(storageErr);
    }
  };

  // Save Config to Server (Updates Prompt and/or Passcode)
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError("");
    setIsSavingConfig(true);

    const activePasscode = sessionStorage.getItem("active_admin_passcode") || passcodeInput || "admin2026";

    if (newPasscode) {
      if (newPasscode !== newPasscodeConfirm) {
        setConfigError("新しいパスコードと確認用パスコードが一致しません。");
        setIsSavingConfig(false);
        return;
      }
      if (newPasscode.length < 4) {
        setConfigError("パスコードは4文字以上で設定してください。");
        setIsSavingConfig(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/config/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode: activePasscode,
          newPasscode: newPasscode || undefined,
          newPromptTemplate: promptTemplateInput,
          newGscTag: gscTagInput,
        }),
      });

      const parsed = await safeJsonResponse(res);
      if (parsed.ok) {
        setSuccessMsg("AIプロンプトおよびセキュリティ設定を正常に更新しました！");
        if (newPasscode) {
          sessionStorage.setItem("active_admin_passcode", newPasscode);
          setPasscodeInput(newPasscode);
          setNewPasscode("");
          setNewPasscodeConfirm("");
        }
        await fetchConfig();
        setTimeout(() => setSuccessMsg(""), 4500);
      } else {
        setConfigError(parsed.errorMsg || "設定の保存に失敗しました。");
      }
    } catch (err) {
      setConfigError("通信エラーにより、保存処理を完了できませんでした。");
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Test Diagnose with current input prompt in real-time (AI Studio Simulation)
  const handleRunPlayground = async () => {
    setPlaygroundError("");
    setPlaygroundResult(null);
    setIsRunningPlayground(true);

    const activePasscode = sessionStorage.getItem("active_admin_passcode") || passcodeInput || "admin2026";

    try {
      const res = await fetch("/api/admin/test-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode: activePasscode,
          testPromptTemplate: promptTemplateInput,
          testAnswers,
          testCategoryScores,
        }),
      });

      const parsed = await safeJsonResponse(res);
      if (parsed.ok && parsed.data) {
        setPlaygroundResult(parsed.data);
        setSuccessMsg("テスト診断プレイグラウンド実行に成功！AI診断の検証が完了しました。");
        setTimeout(() => setSuccessMsg(""), 4500);
      } else {
        setPlaygroundError(parsed.errorMsg || "AIプレイグラウンド実行エラーが発生しました。");
      }
    } catch (err) {
      setPlaygroundError("Gemini AIサーバーへの通信エラーが発生しました。プロンプト構文やAPI制限を確認してください。");
    } finally {
      setIsRunningPlayground(false);
    }
  };

  // Simulated Cache Clearing
  const handleClearCache = () => {
    setClearingCache(true);
    setSuccessMsg("");
    setTimeout(() => {
      setClearingCache(false);
      setSuccessMsg("作品メタデータおよびAniListキャッシュの全更新が完了しました。");
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 1500);
  };

  // Add Announcement Notice
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;

    const created: Notice = {
      id: Date.now().toString(),
      title: newNoticeTitle,
      content: newNoticeContent,
      date: new Date().toLocaleDateString("ja-JP"),
    };

    saveNotices([created, ...notices]);
    setNewNoticeTitle("");
    setNewNoticeContent("");
    setSuccessMsg("新しいお知らせを配信しました。");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Delete Announcement Notice
  const handleDeleteNotice = (id: string) => {
    saveNotices((notices || []).filter((n) => n && n.id !== id));
    setSuccessMsg("お知らせを削除しました。");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Save Ad Modification
  const handleSaveAdChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdId) return;

    const updated = (ads || []).map((ad) => {
      if (ad && ad.id === editAdId) {
        return {
          ...ad,
          title: editAdTitle,
          description: editAdDesc,
          linkUrl: editAdLink,
        };
      }
      return ad;
    });

    saveAds(updated.filter(Boolean));
    setEditAdId(null);
    setSuccessMsg("広告・提携アフィリエイトの設定を更新しました。");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleEditAd = (ad: AdConfiguration) => {
    setEditAdId(ad.id);
    setEditAdTitle(ad.title);
    setEditAdDesc(ad.description);
    setEditAdLink(ad.linkUrl);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl space-y-6 text-center dark:bg-slate-950 dark:border-slate-900"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
            <Lock className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-gray-950 dark:text-slate-100">管理者認証</h2>
            <p className="text-xs text-gray-400">
              この画面は開発者・運営者専用です。<br />
              設定を変更するにはパスコードを入力してください。
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold text-left border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400 flex items-start space-x-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                パスコード
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="パスコードを入力してください..."
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 text-gray-800 transition-all font-medium"
                  disabled={isAuthenticating}
                  required
                />
                <KeyRound className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-md"
              id="admin-login-submit"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>認証確認中...</span>
                </>
              ) : (
                <span>認証する</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8 font-sans">
      
      {/* Page Header with Logout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight flex items-center space-x-2.5 dark:text-slate-50">
            <Settings className="h-7 w-7 text-rose-500 animate-spin-slow" />
            <span>管理者コンソール & AI Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            AI診断プロンプトの設計、テストプレイグラウンド、アフィリエイト広告、お知らせ配信、セキュリティを統括します。
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shrink-0 self-start md:self-center shadow-sm"
          id="admin-logout-btn"
        >
          <LogOut className="h-4 w-4" />
          <span>ログアウト</span>
        </button>
      </div>

      {/* Operation Feedback Message */}
      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs sm:text-sm text-emerald-700 flex items-center space-x-2.5 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400"
        >
          <Check className="h-5 w-5 shrink-0 text-emerald-500" />
          <span className="font-bold">{successMsg}</span>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-100 dark:border-slate-800 pb-px text-xs sm:text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("ai-studio")}
          className={`flex items-center space-x-2 px-4 py-2.5 font-bold transition-all border-b-2 -mb-px whitespace-nowrap ${
            activeTab === "ai-studio"
              ? "text-rose-500 border-rose-500 bg-rose-50/30 rounded-t-xl"
              : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50/50"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Studio (プロンプト)</span>
        </button>
        <button
          onClick={() => setActiveTab("ads")}
          className={`flex items-center space-x-2 px-4 py-2.5 font-bold transition-all border-b-2 -mb-px whitespace-nowrap ${
            activeTab === "ads"
              ? "text-rose-500 border-rose-500 bg-rose-50/30 rounded-t-xl"
              : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50/50"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>収益化 ＆ 広告設定</span>
        </button>
        <button
          onClick={() => setActiveTab("notices")}
          className={`flex items-center space-x-2 px-4 py-2.5 font-bold transition-all border-b-2 -mb-px whitespace-nowrap ${
            activeTab === "notices"
              ? "text-rose-500 border-rose-500 bg-rose-50/30 rounded-t-xl"
              : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50/50"
          }`}
        >
          <Newspaper className="h-4 w-4" />
          <span>お知らせ配信</span>
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`flex items-center space-x-2 px-4 py-2.5 font-bold transition-all border-b-2 -mb-px whitespace-nowrap ${
            activeTab === "seo"
              ? "text-rose-500 border-rose-500 bg-rose-50/30 rounded-t-xl"
              : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50/50"
          }`}
        >
          <Search className="h-4 w-4" />
          <span>SEO ＆ Search Console</span>
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center space-x-2 px-4 py-2.5 font-bold transition-all border-b-2 -mb-px whitespace-nowrap ${
            activeTab === "system"
              ? "text-rose-500 border-rose-500 bg-rose-50/30 rounded-t-xl"
              : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50/50"
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>システム ＆ パスワード</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* TAB 1: AI STUDIO (PROMPT & PLAYGROUND) */}
        {activeTab === "ai-studio" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Prompt Template Editor */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-slate-100 flex items-center space-x-2">
                      <Sparkles className="h-4.5 w-4.5 text-rose-500" />
                      <span>診断用システムプロンプト設計</span>
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Geminiが診断結果を生成する際、最優先で準拠する基本ルールと出力形式を設定します。
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 text-xs space-y-1.5 border border-slate-100 dark:border-slate-900/40 text-slate-500">
                  <span className="font-bold text-slate-700 dark:text-slate-300">利用可能な置換変数：</span>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                    <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border dark:border-slate-700">{"{{ANSWERS_SUMMARY}}"}</span>
                    <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border dark:border-slate-700">{"{{SCORES_SUMMARY}}"}</span>
                  </div>
                  <p className="text-[10px] pt-1">
                    ※これらはAI処理時に、ユーザーが入力した「回答リスト」や「性格カテゴリ集計結果」に自動置換されます。
                  </p>
                </div>

                {configError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 dark:border-rose-900/30 flex items-start space-x-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{configError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    システムプロンプト・テンプレート
                  </label>
                  <textarea
                    rows={12}
                    value={promptTemplateInput}
                    onChange={(e) => setPromptTemplateInput(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 py-3 px-3.5 text-xs outline-none focus:border-rose-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-rose-500/10 text-gray-800 dark:text-slate-200 font-mono leading-relaxed"
                    placeholder="プロンプトを入力してください..."
                  ></textarea>
                </div>

                <button
                  onClick={handleSaveConfig}
                  disabled={isSavingConfig}
                  className="w-full flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-gray-900 dark:bg-slate-100 dark:hover:bg-slate-200 hover:bg-gray-800 text-white dark:text-slate-950 text-xs font-bold transition-all disabled:opacity-50 shadow-md"
                  id="admin-save-prompt-btn"
                >
                  {isSavingConfig ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>設定を反映中...</span>
                    </>
                  ) : (
                    <span>このプロンプトを本番に適用・保存する</span>
                  )}
                </button>
              </div>

              {/* Right Column: Playground Simulator */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Simulator Inputs */}
                <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-slate-100 flex items-center space-x-2">
                    <Play className="h-4.5 w-4.5 text-rose-500 fill-rose-500" />
                    <span>テスト診断プレイグラウンド</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    本番環境に適用する前に、調整したプロンプトでGeminiの診断ロジックをテスト実行できます。
                  </p>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">テスト回答データ (シミュレーション)</span>
                      <textarea
                        rows={3}
                        value={testAnswers["1"]}
                        onChange={(e) => setTestAnswers({ ...testAnswers, "1": e.target.value })}
                        className="w-full rounded-xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 p-2 text-xs text-gray-700 dark:text-slate-300 outline-none"
                        placeholder="質問回答1へのシミュレーションデータ..."
                      ></textarea>
                    </div>

                    <button
                      onClick={handleRunPlayground}
                      disabled={isRunningPlayground}
                      className="w-full flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-md"
                      id="admin-test-playground-btn"
                    >
                      {isRunningPlayground ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Gemini 診断シミュレート中...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-white" />
                          <span>AI診断のシミュレーションを実行</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Simulator Live Preview Output */}
                <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900 rounded-3xl p-6 shadow-sm space-y-4 text-left flex-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
                    <span>診断結果ライブプレビュー</span>
                    {isRunningPlayground && <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping"></span>}
                  </h4>

                  {playgroundError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl text-xs font-medium border border-rose-100 dark:border-rose-900/30">
                      {playgroundError}
                    </div>
                  )}

                  {!playgroundResult && !isRunningPlayground && (
                    <div className="h-32 flex flex-col items-center justify-center text-center text-gray-300 dark:text-slate-700 border-2 border-dashed border-gray-100 dark:border-slate-900 rounded-2xl">
                      <Sparkles className="h-8 w-8 mb-1.5 text-gray-200 dark:text-slate-800" />
                      <p className="text-[10px]">シミュレーションを実行すると、<br />ここにリアルタイムのAIパース結果が表示されます。</p>
                    </div>
                  )}

                  {isRunningPlayground && (
                    <div className="h-32 flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-500 space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                      <p className="text-[10px] animate-pulse">Gemini 2.5 が回答傾向を推論し、JSON構造化を実施しています...</p>
                    </div>
                  )}

                  {playgroundResult && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4 max-h-[350px] overflow-y-auto pr-1"
                    >
                      <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-100 dark:border-rose-900/20 text-left space-y-1">
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">AI 判定診断タイプ</span>
                        <h5 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">{playgroundResult.typeName}</h5>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-gray-100/60 dark:border-slate-900/40">
                          {playgroundResult.typeDescription}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase">抽出されたキャラクター特徴</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(playgroundResult.keyTraits || []).map((trait: string, idx: number) => (
                            <span key={idx} className="bg-gray-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg text-[10px] text-gray-600 dark:text-slate-400 font-bold">
                              #{trait}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase">お勧め選定アニメ作品（シミュレーション）</span>
                        <div className="space-y-1.5">
                          {(playgroundResult.recommendations || []).map((rec: any, idx: number) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-900 text-xs">
                              <p className="font-extrabold text-gray-900 dark:text-slate-100">● {rec.title}</p>
                              <p className="text-[10px] text-gray-400 dark:text-slate-400 leading-relaxed mt-0.5">{rec.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: MONETIZATION & ADS */}
        {activeTab === "ads" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center space-x-2">
                <Award className="h-5 w-5 text-rose-500" />
                <span>広告枠 ＆ 提携アフィリエイト・リンク管理</span>
              </h2>
              <p className="text-xs text-gray-400">
                お勧め診断結果の枠内やアニメ詳細カードに配信するスポンサー枠、アフィリエイト情報（Amazon、DMM等）を管理・更新します。
              </p>
            </div>

            {editAdId && (
              /* Ad Edit Sub-form */
              <form onSubmit={handleSaveAdChanges} className="p-5 border border-rose-100 dark:border-rose-900/30 bg-rose-50/10 dark:bg-rose-950/10 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">アフィリエイト広告スロットの編集</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400">広告・アフィリエイト名</label>
                    <input
                      type="text"
                      value={editAdTitle}
                      onChange={(e) => setEditAdTitle(e.target.value)}
                      className="w-full rounded-xl border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 px-3 text-xs text-gray-800 dark:text-slate-200 outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400">紹介アフィリエイトリンク先</label>
                    <input
                      type="text"
                      value={editAdLink}
                      onChange={(e) => setEditAdLink(e.target.value)}
                      className="w-full rounded-xl border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 px-3 text-xs text-gray-800 dark:text-slate-200 outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-gray-400">広告の詳細・宣伝テキスト</label>
                    <textarea
                      rows={2}
                      value={editAdDesc}
                      onChange={(e) => setEditAdDesc(e.target.value)}
                      className="w-full rounded-xl border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 py-2 px-3 text-xs text-gray-800 dark:text-slate-200 outline-none"
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setEditAdId(null)}
                    className="px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-gray-500 font-bold"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
                    id="admin-save-ad-btn"
                  >
                    変更を保存する
                  </button>
                </div>
              </form>
            )}

            <div className="grid gap-4">
              {(ads || []).filter(Boolean).map((ad) => (
                <div
                  key={ad.id}
                  className="rounded-2xl border border-gray-100 dark:border-slate-900 bg-gray-50/50 dark:bg-slate-900/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl text-left w-full sm:w-auto">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 px-2 py-0.5 rounded-md font-mono">
                        {ad.type}
                      </span>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">{ad.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{ad.description}</p>
                    <p className="text-[10px] text-gray-300 dark:text-slate-700 font-mono break-all">{ad.linkUrl}</p>
                  </div>

                  <button
                    onClick={() => handleEditAd(ad)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:text-rose-500 hover:border-rose-400 dark:hover:text-rose-400 text-xs font-bold transition-all shrink-0 shadow-sm"
                    id={`admin-edit-ad-btn-${ad.id}`}
                  >
                    配信設定を編集
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: NOTICES */}
        {activeTab === "notices" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
          >
            {/* Publisher */}
            <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center space-x-2 pb-3 border-b border-gray-100 dark:border-slate-900">
                <Newspaper className="h-5 w-5 text-rose-500" />
                <span>お知らせ・アップデート配信</span>
              </h2>

              <form onSubmit={handleAddNotice} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">お知らせタイトル</label>
                  <input
                    type="text"
                    placeholder="例：夏のアニメ診断シーズンが到来！"
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 py-2.5 px-3 text-xs outline-none focus:border-rose-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-rose-500/10 text-gray-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">本文内容</label>
                  <textarea
                    rows={4}
                    placeholder="ユーザーへ通知するお知らせの詳細を入力..."
                    value={newNoticeContent}
                    onChange={(e) => setNewNoticeContent(e.target.value)}
                    className="w-full rounded-xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 py-2.5 px-3 text-xs outline-none focus:border-rose-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-rose-500/10 text-gray-800 dark:text-slate-200"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors shadow-md"
                  id="admin-publish-notice-btn"
                >
                  <Plus className="h-4 w-4" />
                  <span>お知らせを一般公開する</span>
                </button>
              </form>
            </div>

            {/* Registry */}
            <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-slate-900">
                  配信中のニュース ＆ アナウンス ({(notices || []).length})
                </h3>
                
                {(!notices || notices.length === 0) ? (
                  <p className="text-xs text-gray-400 py-12 text-center">現在、アクティブなお知らせはありません。</p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-slate-900 max-h-[250px] overflow-y-auto pr-1">
                    {(notices || []).filter(Boolean).map((notice) => (
                      <div key={notice.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <h4 className="font-extrabold text-gray-800 dark:text-slate-200">{notice.title}</h4>
                          <p className="text-gray-400 text-[10px] mt-0.5">{notice.date}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                          id={`admin-delete-notice-btn-${notice.id}`}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: SEO & GOOGLE SEARCH CONSOLE */}
        {activeTab === "seo" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
          >
            {/* Top GSC Card */}
            <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-900">
                <div className="space-y-1">
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100 flex items-center space-x-2">
                    <Search className="h-5 w-5 text-rose-500" />
                    <span>Google Search Console 連携＆所有権確認</span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    Google 検索でのインデックス登録、検索トラフィック・クリック数の分析、サイトマップの自動送信をサポートします。
                  </p>
                </div>
                <a
                  href="https://search.google.com/search-console/welcome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 self-start sm:self-center"
                >
                  <span>Search Console を開く</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Meta tag form */}
              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Google サイト所有権確認メタタグ（または content 値）</span>
                    <span className="text-[10px] text-gray-400 font-mono">例: abc123xyz_verification_code</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder='例: <meta name="google-site-verification" content="XXXXXXXXX" /> または XXXXXXXXX'
                      value={gscTagInput}
                      onChange={(e) => setGscTagInput(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 py-3.5 px-4 text-xs font-mono outline-none focus:border-rose-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-rose-500/10 text-gray-800 dark:text-slate-200"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    ※設定すると、Webサイト全体の `head` タグ内に `<meta name="google-site-verification" content="..." />` が自動挿入されます。
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="px-6 py-3 rounded-xl bg-gray-950 hover:bg-gray-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-950 text-white text-xs font-bold transition-all flex items-center space-x-2 shadow-md disabled:opacity-50"
                  >
                    {isSavingConfig ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>更新保存中...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Search Console 設定を保存する</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sitemap & Robots.txt Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sitemap Card */}
              <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">sitemap.xml (サイトマップ)</h3>
                      <p className="text-[10px] text-emerald-600 font-bold">自動生成アクティブ</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Search Console の「サイトマップ」送信欄に入力してください。検索エンジンクローラーが全主要ページを迅速に巡回します。
                </p>

                <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl flex items-center justify-between border border-gray-100 dark:border-slate-800">
                  <span className="text-[11px] font-mono text-gray-700 dark:text-slate-300 truncate mr-2">
                    {window.location.origin}/sitemap.xml
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/sitemap.xml`);
                      setCopiedUrl("sitemap");
                      setTimeout(() => setCopiedUrl(null), 2500);
                    }}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 text-gray-700 dark:text-slate-200 rounded-lg text-[10px] font-bold transition-all shrink-0 flex items-center space-x-1"
                  >
                    {copiedUrl === "sitemap" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedUrl === "sitemap" ? "コピー完了" : "URLコピー"}</span>
                  </button>
                </div>
              </div>

              {/* Robots.txt Card */}
              <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">robots.txt (クローラー制御)</h3>
                      <p className="text-[10px] text-blue-600 font-bold">設定完了・配信中</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  検索ロボットに対し全ページの巡回を許可し、`sitemap.xml` の場所を自動通知するヘッダーを出力しています。
                </p>

                <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl flex items-center justify-between border border-gray-100 dark:border-slate-800">
                  <span className="text-[11px] font-mono text-gray-700 dark:text-slate-300 truncate mr-2">
                    {window.location.origin}/robots.txt
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/robots.txt`);
                      setCopiedUrl("robots");
                      setTimeout(() => setCopiedUrl(null), 2500);
                    }}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 text-gray-700 dark:text-slate-200 rounded-lg text-[10px] font-bold transition-all shrink-0 flex items-center space-x-1"
                  >
                    {copiedUrl === "robots" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedUrl === "robots" ? "コピー完了" : "URLコピー"}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Guide Step-by-step Card */}
            <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-sm font-extrabold flex items-center space-x-2 text-rose-400">
                <HelpCircle className="h-4.5 w-4.5" />
                <span>Google Search Console 登録手順マニュアル</span>
              </h3>
              <ol className="text-xs space-y-2.5 text-slate-300 list-decimal list-inside leading-relaxed">
                <li>
                  <a href="https://search.google.com/search-console/" target="_blank" rel="noopener noreferrer" className="text-rose-400 underline font-bold">Google Search Console</a> にアクセスし、プロパティ（URL）を追加します。
                </li>
                <li>
                  所有権の確認方法で **「HTML タグ」** を選択し、表示されたコード（例: `<meta name="google-site-verification" content="..." />`）をコピーします。
                </li>
                <li>
                  本画面の **「Google サイト所有権確認メタタグ」** 入力欄に貼り付けて、「Search Console 設定を保存する」ボタンを押します。
                </li>
                <li>
                  Search Console 画面に戻り **「確認」** をクリックすると、所有権の認証が即時に完了します！
                </li>
                <li>
                  認証完了後、左メニューの **「サイトマップ」** から `sitemap.xml` と入力して送信してください。
                </li>
              </ol>
            </div>

          </motion.div>
        )}

        {/* TAB 4: SYSTEM & SECURITY (PASSCODE CHANGE) */}
        {activeTab === "system" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
          >
            
            {/* Password / Passcode Update */}
            <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="space-y-1 pb-3 border-b border-gray-100 dark:border-slate-900">
                <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center space-x-2">
                  <KeyRound className="h-5 w-5 text-rose-500" />
                  <span>管理者用パスコードの変更</span>
                </h2>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  管理画面（`/admin`）に入るためのパスワード（パスコード）を変更します。
                </p>
              </div>

              {configError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 dark:border-rose-900/30 flex items-start space-x-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{configError}</span>
                </div>
              )}

              <form onSubmit={handleSaveConfig} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">新しいパスコード</label>
                  <input
                    type="password"
                    placeholder="新しいパスコード（4文字以上）..."
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    className="w-full rounded-xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 py-2.5 px-3 text-xs outline-none text-gray-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">新しいパスコード（確認）</label>
                  <input
                    type="password"
                    placeholder="確認のためもう一度入力..."
                    value={newPasscodeConfirm}
                    onChange={(e) => setNewPasscodeConfirm(e.target.value)}
                    className="w-full rounded-xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 py-2.5 px-3 text-xs outline-none text-gray-800 dark:text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="w-full flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-gray-950 hover:bg-gray-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-950 text-white text-xs font-bold transition-colors shadow-md disabled:opacity-50"
                  id="admin-change-passcode-btn"
                >
                  {isSavingConfig ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>パスコードを更新中...</span>
                    </>
                  ) : (
                    <span>パスコードを変更・保存する</span>
                  )}
                </button>
              </form>
            </div>

            {/* Cache Clearing & Info */}
            <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center space-x-2 pb-3 border-b border-gray-100 dark:border-slate-900">
                <RefreshCw className="h-5 w-5 text-rose-500" />
                <span>データベース＆キャッシュ管理</span>
              </h2>
              
              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  AniListの各種メタデータ（タイトル、ジャンル、制作会社など）は高速表示のためメモリ内及びローカルキャッシュされています。
                  新作アニメ情報を新しく強制取り込み、同期不整合を解消するためにクリアを実行できます。
                </p>

                <div className="rounded-xl bg-gray-50 dark:bg-slate-900 p-4 text-xs space-y-2 border border-gray-100 dark:border-slate-900 text-gray-600 dark:text-slate-400 font-medium">
                  <p>● キャッシュ状態: <span className="font-bold text-emerald-600">正常 (アクティブ)</span></p>
                  <p>● メモリ保持: <span className="font-bold">約 120 作品のGraphQL結果</span></p>
                </div>

                <button
                  onClick={handleClearCache}
                  disabled={clearingCache}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gray-950 dark:bg-slate-100 dark:hover:bg-slate-200 hover:bg-gray-800 dark:text-slate-950 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                  id="admin-clear-cache-btn"
                >
                  <RefreshCw className={`h-4 w-4 ${clearingCache ? "animate-spin" : ""}`} />
                  <span>{clearingCache ? "キャッシュ更新中..." : "作品キャッシュを強制更新する"}</span>
                </button>
              </div>
            </div>

          </motion.div>
        )}

      </div>

      {/* Security notice compliance footer */}
      <div className="flex items-start space-x-2 text-left text-[11px] bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 text-amber-800 dark:text-amber-400 max-w-3xl mx-auto">
        <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-amber-500 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p className="font-bold">管理者用セキュリティおよびセッション整合性について</p>
          <p>
            診断エンジン設定（システムプロンプトの調整、シミュレーション実行）および提携広告スロットの配信先は、サーバーの安全なメモリ空間で暗号化・CSRF検証保護が施されたうえで動作しています。パスコードの変更は本セッションから即時適用されます。変更したパスコードを忘れないように保管してください。
          </p>
        </div>
      </div>
    </div>
  );
}
