import React, { useState } from "react";
import { Sparkles, ArrowLeft, ArrowRight, Loader, Cpu, ShieldAlert, BadgeInfo } from "lucide-react";
import { DiagnosisQuestion, DiagnosisResult } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DiagnoseViewProps {
  setView: (view: string) => void;
  setDiagnosisResult: (result: DiagnosisResult) => void;
  saveDiagnosisToHistory: (result: DiagnosisResult, answers: { [key: number]: string }) => void;
}

const QUESTIONS: DiagnosisQuestion[] = [
  {
    id: 1,
    question: "休日の理想的な過ごし方は？",
    options: [
      { id: "A", text: "部屋で好きなだけゴロゴロしながらだらだら過ごす", scores: { sliceOfLife: 3, comedy: 2 } },
      { id: "B", text: "カフェ巡りをしたり、お洒落な街へショッピングに出かける", scores: { romance: 3, drama: 2 } },
      { id: "C", text: "時間を忘れてガッツリとゲームをプレイし続ける", scores: { isekai: 3, sciFi: 2 } },
      { id: "D", text: "映画館で最新作を見たり、静かな美術館を散策する", scores: { mystery: 3, drama: 2 } },
    ],
  },
  {
    id: 2,
    question: "あなたがアニメに最も求めている「感覚」は？",
    options: [
      { id: "A", text: "鳥肌が立つような、ゾクゾクするアクションや熱い闘志", scores: { action: 3, sports: 2 } },
      { id: "B", text: "涙腺が崩壊するような、胸が締め付けられる深い感動", scores: { tear: 3, drama: 2 } },
      { id: "C", text: "張り巡らされた伏線や、謎が解き明かされる知の快感", scores: { mystery: 3, sciFi: 2 } },
      { id: "D", text: "クスッと笑えて肩の力が抜ける、日々の癒やしとリラックス", scores: { sliceOfLife: 3, comedy: 2 } },
    ],
  },
  {
    id: 3,
    question: "もしファンタジーの世界に生まれ変わるなら、どの職業が良い？",
    options: [
      { id: "A", text: "最前線で魔王に立ち向かう、伝説の熱きロマン剣士", scores: { action: 3, sports: 1 } },
      { id: "B", text: "森羅万象の真理を極める、冷静沈着な大賢者", scores: { isekai: 2, sciFi: 3 } },
      { id: "C", text: "王宮の難事件を影から解決する、頭脳派の宮廷探偵", scores: { mystery: 3 } },
      { id: "D", text: "宿場町で美味しい料理を振る舞う、のんびり食堂のオーナー", scores: { sliceOfLife: 3, comedy: 1 } },
    ],
  },
  {
    id: 4,
    question: "惹かれる主人公はどんなタイプ？",
    options: [
      { id: "A", text: "不器用でも熱いハートを持ち、仲間と共に成長する努力家", scores: { sports: 3, action: 2 } },
      { id: "B", text: "常に沈着冷静、誰とも群れずに最善手を選ぶ一匹狼", scores: { mystery: 2, sciFi: 3 } },
      { id: "C", text: "凡人だけど優しさに溢れ、誰かのためにボロボロになれる人", scores: { tear: 3, romance: 2 } },
      { id: "D", text: "一見すると冴えないが、実は規格外の最強パワーを隠す実力者", scores: { isekai: 3, action: 2 } },
    ],
  },
  {
    id: 5,
    question: "物語に最も求める「ストーリー展開のテンポ」は？",
    options: [
      { id: "A", text: "無駄な引き延ばしを削ぎ落とした、スピーディでスリリングな展開", scores: { action: 3, sciFi: 1 } },
      { id: "B", text: "登場人物の揺れ動く感情を、丁寧に丁寧に重ねて描く人間ドラマ", scores: { tear: 3, drama: 2 } },
      { id: "C", text: "特に重い出来事は起きず、のんびりとした時間が流れる空気感", scores: { sliceOfLife: 3 } },
      { id: "D", text: "何気ない会話がすべて後々の伏線になっているような緻密な構成", scores: { mystery: 3, sciFi: 2 } },
    ],
  },
  {
    id: 6,
    question: "好きな「恋愛要素」の描き方は？",
    options: [
      { id: "A", text: "見ていて恥ずかしくなるほど、お互い一途で甘酸っぱい純愛", scores: { romance: 3 } },
      { id: "B", text: "すれ違いや試練を乗り越える、運命的で少し切ないラブストーリー", scores: { tear: 2, romance: 3 } },
      { id: "C", text: "つかず離れずの関係に、ついヤキモキしてしまうドタバタコメディ", scores: { comedy: 2, romance: 2 } },
      { id: "D", text: "恋愛要素は無し、またはストーリーを邪魔しない程度の隠し味で十分", scores: { action: 2, mystery: 2 } },
    ],
  },
  {
    id: 7,
    question: "アニメを見る際、どのような「ビジュアル（作画）」に惹かれる？",
    options: [
      { id: "A", text: "激しい動きやハイクオリティなカメラワークが炸裂するバトル描写", scores: { action: 3 } },
      { id: "B", text: "背景美術や光の差し込みが、まるで実写映画のように美しい描写", scores: { tear: 2, drama: 2 } },
      { id: "C", text: "丸みがあって柔らかく、見ているだけで安心するようなタッチ", scores: { sliceOfLife: 3 } },
      { id: "D", text: "どこか退廃的でダーク、影が多めのシリアスで引き締まったタッチ", scores: { mystery: 2, sciFi: 3 } },
    ],
  },
  {
    id: 8,
    question: "あなたが最も納得できる「物語の結末（エンディング）」は？",
    options: [
      { id: "A", text: "すべての敵を倒し、全員が笑顔で救われる王道のハッピーエンド", scores: { action: 2, sports: 2 } },
      { id: "B", text: "切なくも温かい余韻が残り、思わず深くため息をついてしまう結末", scores: { tear: 3, drama: 2 } },
      { id: "C", text: "度肝を抜かれる大どんでん返し。最後まで予測がつかない結末", scores: { mystery: 3, sciFi: 2 } },
      { id: "D", text: "特別な劇的変化はなく、これからも穏やかな毎日が続いていく結末", scores: { sliceOfLife: 3 } },
    ],
  },
  {
    id: 9,
    question: "アニメの「世界観・舞台」で最も興味を惹かれるのは？",
    options: [
      { id: "A", text: "異形の怪物や魔法、ギルドなどが存在する壮大なファンタジー", scores: { isekai: 3, action: 2 } },
      { id: "B", text: "アンドロイド、電脳世界、未来の宇宙船などが登場するSF世界", scores: { sciFi: 3 } },
      { id: "C", text: "私たちが暮らす現代の、どこにでもある学校やのどかな田舎町", scores: { sliceOfLife: 2, romance: 2 } },
      { id: "D", text: "史実をベースにしていたり、重厚な軍事・政治劇が繰り広げられる世界", scores: { drama: 3, mystery: 1 } },
    ],
  },
  {
    id: 10,
    question: "キャラクター同士の関係性で、最も「エモい」と感じるのは？",
    options: [
      { id: "A", text: "背中を預け合い、固い絆で生死を共にする最強のライバル・バディ", scores: { action: 2, sports: 3 } },
      { id: "B", text: "すれ違いや立場の違いで戦わねばならない、哀しき宿命のライバル", scores: { tear: 3, drama: 2 } },
      { id: "C", text: "部室やシェアハウスでみんなが楽しくくだらない話を交わす居場所", scores: { sliceOfLife: 3, comedy: 2 } },
      { id: "D", text: "言葉にしなくても行動で分かり合う、一見冷たいが絶対的な信頼", scores: { mystery: 2, sciFi: 2 } },
    ],
  },
  {
    id: 11,
    question: "「謎解きやサスペンス、マインドゲーム」は好き？",
    options: [
      { id: "A", text: "大好物。散りばめられた伏線を頭の中で整理しながら推理したい", scores: { mystery: 3 } },
      { id: "B", text: "程よい謎解きやスパイスとしてシリアスなサスペンスがあるのは好き", scores: { sciFi: 2, mystery: 1 } },
      { id: "C", text: "頭を使うより、ストレートで純粋に熱くなれる展開の方が好き", scores: { action: 2, isekai: 2 } },
      { id: "D", text: "争い事や謎は不要。終始ピースフルで平和であってほしい", scores: { sliceOfLife: 3 } },
    ],
  },
  {
    id: 12,
    question: "物語の中で、主人公が乗り越えるべき「壁や試練」はどのようなものが良い？",
    options: [
      { id: "A", text: "世界や人類の平和を脅かす、絶対的な強さを持った巨悪やモンスター", scores: { action: 3, isekai: 2 } },
      { id: "B", text: "大切な仲間の喪失や、自分自身の弱さと向き合うといった内面の苦悩", scores: { tear: 3, drama: 2 } },
      { id: "C", text: "同じ夢を追うライバルと、お互いのプライドを懸けた極限の勝負", scores: { sports: 3 } },
      { id: "D", text: "ちょっとした勘違いや試験勉強、日常のごく些細なすれ違いトラブル", scores: { sliceOfLife: 2, comedy: 2 } },
    ],
  },
  {
    id: 13,
    question: "あなたにとってアニメの「音楽（主題歌やBGM）」はどのくらい大事？",
    options: [
      { id: "A", text: "超重要。聴くだけでテンションがMAXになる激しいアニソンやロック", scores: { action: 2, sports: 2 } },
      { id: "B", text: "超重要。涙腺を極限まで刺激する、哀愁を帯びたストリングスや名曲", scores: { tear: 3, drama: 1 } },
      { id: "C", text: "重要。シーンに寄り添う、穏やかで心地よいLo-Fiやアコースティック", scores: { sliceOfLife: 3 } },
      { id: "D", text: "重要。不穏さや退廃的な近未来感を完璧に演出するインダストリアル調", scores: { mystery: 1, sciFi: 3 } },
    ],
  },
  {
    id: 14,
    question: "アニメを鑑賞する時に最も多い「シチュエーション」は？",
    options: [
      { id: "A", text: "深夜、誰にも邪魔されない時間に部屋を暗くして画面に完全没頭", scores: { mystery: 2, sciFi: 2 } },
      { id: "B", text: "週末の午前中や晴れた午後、温かい飲み物を片手にリフレッシュ鑑賞", scores: { sliceOfLife: 3, romance: 2 } },
      { id: "C", text: "ご飯を食べながら、または作業用として適度なテンションでサクッと視聴", scores: { comedy: 2, isekai: 2 } },
      { id: "D", text: "とにかく泣きたい、熱くなりたいなど『感情を揺さぶられたい』時に一気見", scores: { tear: 3, drama: 2 } },
    ],
  },
  {
    id: 15,
    question: "あなたが好むアニメの全体的な「年齢層・雰囲気」は？",
    options: [
      { id: "A", text: "爽やかで希望に満ちており、誰もが真っ直ぐに楽しめる雰囲気", scores: { sports: 2, action: 2 } },
      { id: "B", text: "哲学的で、現実の厳しさや人間の二面性などを描く大人向けの重厚な雰囲気", scores: { mystery: 2, sciFi: 3 } },
      { id: "C", text: "とにかくエモーショナル。登場人物の生きた証に深く感動できる雰囲気", scores: { tear: 3, drama: 2 } },
      { id: "D", text: "キャラクターたちが可愛らしく穏やかで、一切ストレスのない雰囲気", scores: { sliceOfLife: 3, comedy: 1 } },
    ],
  },
];

export default function DiagnoseView({ setView, setDiagnosisResult, saveDiagnosisToHistory }: DiagnoseViewProps) {
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
  });

  const [diagnosing, setDiagnosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [diagnoseStep, setDiagnoseStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const currentQuestion = QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / QUESTIONS.length) * 100);

  const handleOptionSelect = (optionId: string, scores: { [key: string]: number }) => {
    if (isTransitioning || diagnosing) return;
    if (!currentQuestion) return;

    setIsTransitioning(true);

    // Record answer
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));

    // Accumulate scores
    setCategoryScores((prev) => {
      const updated = { ...prev };
      Object.entries(scores).forEach(([category, value]) => {
        updated[category] = (updated[category] || 0) + value;
      });
      return updated;
    });

    // Proceed to next or analyze
    if (currentIdx < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentIdx((prev) => {
          if (prev < QUESTIONS.length - 1) {
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

    // Simulate multi-phase high quality load text
    const interval = setInterval(() => {
      setDiagnoseStep((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 1800);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          categoryScores,
        }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "診断中に不具合が発生しました。");
      }

      const result: DiagnosisResult = await res.json();
      setDiagnosisResult(result);
      saveDiagnosisToHistory(result, answers);
      setView("result");
    } catch (error: any) {
      clearInterval(interval);
      console.error(error);
      setErrorMsg(error.message || "Gemini AIの接続エラーです。もう一度お試しください。");
      setDiagnosing(false);
    }
  };

  // Loading Screen Phases
  const loadingSteps = [
    { text: "回答された深層性格パラメーターを抽出中...", desc: "あなたの休日の行動パターン、理想像を10個の指標に数値化しています。" },
    { text: "Gemini AI が好みのアニメパターンをマッチング中...", desc: "あなたにぴったりのテーマ・テンポ・世界観を持つアニメ群を解析中。" },
    { text: "パーソナル推薦理由＆性格コメントを編纂中...", desc: "AIがあなたの回答に基づいてオリジナルの推薦文章を作成しています。" },
    { text: "AniList API から作品データベースを同期中...", desc: "おすすめのアニメメタデータ（放送年・スコア・PV情報など）を収集しています。" },
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

          <h3 className="text-xl font-bold text-gray-900 transition-all duration-500">
            {loadingSteps[diagnoseStep].text}
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            {loadingSteps[diagnoseStep].desc}
          </p>

          <div className="mt-8 space-y-2">
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${(diagnoseStep + 1) * 25}%` }}
                transition={{ duration: 1.5 }}
                className="h-full bg-gradient-to-r from-rose-500 to-violet-500"
              ></motion.div>
            </div>
            <div className="flex justify-between text-xs font-mono text-gray-400">
              <span>ANIME DIAGNOSTIC ENGINE v2.5</span>
              <span>{(diagnoseStep + 1) * 25}%</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
        <p className="text-sm text-gray-400 font-medium">ロード中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 font-sans">
      
      {/* Upper Status Panel */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="flex items-center space-x-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          id="diagnose-back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>前に戻る</span>
        </button>

        <span className="text-xs font-bold text-rose-500 font-mono tracking-wider bg-rose-50 px-3 py-1 rounded-full">
          QUESTION {currentIdx + 1} / {QUESTIONS.length}
        </span>
      </div>

      {/* Sleek Progress Indicator */}
      <div className="mb-10 space-y-1.5">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 transition-all duration-300 rounded-full"
          ></div>
        </div>
        <div className="flex justify-between text-[11px] text-gray-400">
          <span>診断開始</span>
          <span>完了 & AI解析</span>
        </div>
      </div>

      {/* Error Boundary Notice */}
      {errorMsg && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 flex items-start space-x-2.5">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">診断エラー</p>
            <p>{errorMsg}</p>
            <button
              onClick={triggerAIDiagnosis}
              className="mt-2 inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors"
            >
              再試行する
            </button>
          </div>
        </div>
      )}

      {/* Main Question Card with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-10 shadow-xl backdrop-blur-xl space-y-8"
        >
          <div>
            <span className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text font-mono">
              Q{currentQuestion.id}.
            </span>
            <h2 className="mt-2 text-xl font-extrabold text-gray-900 sm:text-2xl tracking-tight leading-snug">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id, option.scores)}
                  className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 outline-none flex items-center justify-between ${
                    isSelected
                      ? "border-rose-500 bg-rose-50/40 text-rose-900 shadow-md ring-1 ring-rose-500"
                      : "border-gray-200/80 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                  id={`option-${currentQuestion.id}-${option.id}`}
                >
                  <span className="text-sm font-semibold sm:text-base leading-relaxed">
                    {option.text}
                  </span>
                  
                  {/* Circle check/id indicator */}
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ml-4 font-bold text-xs font-mono transition-colors ${
                    isSelected 
                      ? "bg-rose-500 text-white" 
                      : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                  }`}>
                    {option.id}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center space-x-2 justify-center text-xs text-gray-400">
        <BadgeInfo className="h-4 w-4 shrink-0 text-gray-300" />
        <span>すべての質問に回答すると、即座にAIエンジンが性格傾向を構築します。</span>
      </div>
    </div>
  );
}
