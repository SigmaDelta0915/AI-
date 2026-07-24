import React, { useState } from "react";
import { Sparkles, ArrowLeft, ArrowRight, Loader, Cpu, ShieldAlert, BadgeInfo } from "lucide-react";
import { DiagnosisResult } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { runDiagnosis } from "../services/animeService";
import { useLanguage } from "../context/LanguageContext";

interface DiagnoseViewProps {
  setView: (view: string) => void;
  setDiagnosisResult: (result: DiagnosisResult) => void;
  saveDiagnosisToHistory: (result: DiagnosisResult, answers: { [key: number]: string }) => void;
}

export default function DiagnoseView({ setView, setDiagnosisResult, saveDiagnosisToHistory }: DiagnoseViewProps) {
  const { lang, questions, ui } = useLanguage();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [categoryScores, setCategoryScores] = useState<{ [key: string]: number }>({
    action: 0,
    romance: 0,
    tear: 0,
    sliceOfLife: 0,
    mystery: 0,
    sciFi: 0,
    isekai: 0,
    sports: 0,
    comedy: 0,
    drama: 0,
    depressive: 0,
  });

  const [diagnosing, setDiagnosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [diagnoseStep, setDiagnoseStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const currentQuestion = questions[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);

  const handleOptionSelect = (optionId: string, scores: { [key: string]: number }, optionText: string) => {
    if (isTransitioning || diagnosing) return;
    if (!currentQuestion) return;

    setIsTransitioning(true);

    // Record answer
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionText }));

    // Accumulate scores
    setCategoryScores((prev) => {
      const updated = { ...prev };
      Object.entries(scores).forEach(([category, value]) => {
        updated[category] = (updated[category] || 0) + value;
      });
      return updated;
    });

    // Proceed to next or analyze
    if (currentIdx < questions.length - 1) {
      setTimeout(() => {
        setCurrentIdx((prev) => {
          if (prev < questions.length - 1) {
            return prev + 1;
          }
          return prev;
        });
        setIsTransitioning(false);
      }, 260);
    } else {
      setTimeout(() => {
        triggerAIDiagnosis();
      }, 300);
    }
  };

  const handlePrev = () => {
    if (isTransitioning || diagnosing) return;
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const triggerAIDiagnosis = async () => {
    setDiagnosing(true);
    setErrorMsg("");

    // Simulate multi-phase load text
    const interval = setInterval(() => {
      setDiagnoseStep((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 1800);

    try {
      const result = await runDiagnosis(answers, categoryScores, lang);
      clearInterval(interval);

      if (!result || !result.typeName) {
        throw new Error(lang === "ja" ? "診断結果の生成に失敗しました。もう一度お試しください。" : "Failed to generate result. Please try again.");
      }

      setDiagnosisResult(result);
      saveDiagnosisToHistory(result, answers);
      setView("result");
    } catch (error: any) {
      clearInterval(interval);
      console.error("Diagnosis error:", error);
      setErrorMsg(error?.message || (lang === "ja" ? "AI診断処理中にエラーが発生しました。もう一度お試しください。" : "An error occurred during AI diagnosis. Please try again."));
      setDiagnosing(false);
    }
  };

  // Loading Screen Phases
  const loadingSteps = lang === "ja" ? [
    { text: "回答された深層性格パラメーターを抽出中...", desc: "あなたの休日の行動パターン、理想像を10個の指標に数値化しています。" },
    { text: "Gemini AI が好みのアニメパターンをマッチング中...", desc: "あなたにぴったりのテーマ・テンポ・世界観を持つアニメ群を解析中。" },
    { text: "パーソナル推薦理由＆性格コメントを編纂中...", desc: "AIがあなたの回答に基づいてオリジナルの推薦文章を作成しています。" },
    { text: "AniList API から作品データベースを同期中...", desc: "おすすめのアニメメタデータ（放送年・スコア・PV情報など）を収集しています。" },
  ] : [
    { text: "Extracting your deep personality parameters...", desc: "Converting your choices and ideal scenarios into 10 metric indicators." },
    { text: "Gemini AI is matching anime patterns...", desc: "Analyzing titles with the perfect theme, pacing, and worldview for you." },
    { text: "Compiling personalized rationale & personality profile...", desc: "AI is creating custom recommendation text based on your answers." },
    { text: "Synchronizing anime database with AniList API...", desc: "Fetching latest metadata (air dates, scores, trailer information)." },
  ];

  if (diagnosing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center font-sans min-h-[500px] flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl backdrop-blur-xl w-full"
        >
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-6 animate-bounce">
            <Cpu className="h-8 w-8 animate-spin" />
            <span className="absolute inset-0 rounded-2xl bg-rose-400/25 animate-ping"></span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {ui.diagnose.analyzingTitle}
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {ui.diagnose.analyzingSub}
          </p>

          <div className="space-y-4 mb-8 text-left bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
            {loadingSteps.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  idx <= diagnoseStep ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-400"
                }`}>
                  {idx <= diagnoseStep ? "✓" : idx + 1}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${idx === diagnoseStep ? "text-rose-600 animate-pulse" : "text-gray-700"}`}>
                    {step.text}
                  </p>
                  <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, (diagnoseStep + 1) * 25)}%` }}
            ></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 font-sans">
      {/* Header Progress */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold mb-3 border border-rose-100">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{ui.diagnose.title}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-2 px-1">
          <span>{lang === "ja" ? `質問 ${currentIdx + 1} / ${questions.length}` : `Question ${currentIdx + 1} of ${questions.length}`}</span>
          <span className="text-rose-600 font-bold">{progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/60">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-10 shadow-xl shadow-gray-100/50"
        >
          {/* Question Text */}
          <div className="mb-8">
            <span className="text-xs font-bold tracking-wider text-rose-500 uppercase block mb-1">
              Q{currentQuestion.id}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
              {currentQuestion.question[lang]}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 sm:space-y-4">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.text[lang];

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id, option.scores, option.text[lang])}
                  disabled={isTransitioning}
                  className={`group relative flex w-full items-center justify-between rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 border ${
                    isSelected
                      ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 shadow-md"
                      : "border-gray-150 bg-gray-50/50 hover:border-rose-300 hover:bg-rose-50/20 text-gray-800"
                  }`}
                >
                  <div className="flex items-center space-x-3.5 pr-4">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-colors ${
                      isSelected ? "bg-rose-500 text-white" : "bg-white text-gray-500 border border-gray-200 group-hover:border-rose-300 group-hover:text-rose-600"
                    }`}>
                      {option.id}
                    </span>
                    <span className="text-sm sm:text-base font-medium leading-relaxed">
                      {option.text[lang]}
                    </span>
                  </div>
                  <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-rose-500 translate-x-1" : "text-gray-300 group-hover:text-rose-400 group-hover:translate-x-1"}`} />
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0 || isTransitioning}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentIdx === 0 ? "opacity-0 cursor-default" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{ui.diagnose.prevQuestion}</span>
            </button>

            <span className="text-xs text-gray-400">
              {lang === "ja" ? "直感でお選びください" : "Please answer intuitively"}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
