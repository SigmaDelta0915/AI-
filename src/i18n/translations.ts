export type Language = "ja" | "en";

export interface QuestionOption {
  id: "A" | "B" | "C" | "D" | "E";
  text: { ja: string; en: string };
  scores: Record<string, number>;
}

export interface Question {
  id: number;
  question: { ja: string; en: string };
  options: QuestionOption[];
}

export const QUESTIONS_I18N: Question[] = [
  {
    id: 1,
    question: {
      ja: "週末や休日の理想的な過ごし方は？",
      en: "How do you ideally like to spend your weekends or free time?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "仲間とワイワイ大騒ぎしたり、スポーツやアウトドアで汗を流す",
          en: "Hanging out noisily with friends, or sweating it out with sports and outdoors",
        },
        scores: { action: 3, sports: 2 },
      },
      {
        id: "B",
        text: {
          ja: "カフェ巡りをしたり、お洒落な街へショッピングに出かける",
          en: "Cafe hopping, or going shopping in trendy fashion districts",
        },
        scores: { romance: 3, drama: 2 },
      },
      {
        id: "C",
        text: {
          ja: "時間を忘れてガッツリとゲームをプレイし続ける",
          en: "Losing track of time playing video games deeply all day",
        },
        scores: { isekai: 3, sciFi: 2 },
      },
      {
        id: "D",
        text: {
          ja: "映画館で最新作を見たり、静かな美術館を散策する",
          en: "Watching new movies at the cinema, or strolling in quiet museums",
        },
        scores: { mystery: 3, drama: 2 },
      },
      {
        id: "E",
        text: {
          ja: "部屋を真っ暗にして重厚で鬱々とした濃密なアニメ世界に一人で没入する",
          en: "Darkening the room and immersing alone in a dark, heavy, dark anime world",
        },
        scores: { depressive: 3, sciFi: 1 },
      },
    ],
  },
  {
    id: 2,
    question: {
      ja: "アニメに一番求めている「読後感・鑑賞後の感情」は？",
      en: "What emotional impact or lingering feeling do you seek most after watching anime?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "アドレナリンが溢れ出すような激しい興奮と爽快感",
          en: "Adrenaline-pumping intense excitement and pure exhilaration",
        },
        scores: { action: 3, sports: 2 },
      },
      {
        id: "B",
        text: {
          ja: "涙腺が崩壊するような、胸が締め付けられる深い感動",
          en: "Deep, heart-wrenching emotional tears and profound catharsis",
        },
        scores: { tear: 3, drama: 2 },
      },
      {
        id: "C",
        text: {
          ja: "張り巡らされた伏線や、謎が解き明かされる知の快感",
          en: "Intellectual thrill of intricate foreshadowing and unsolved mysteries revealed",
        },
        scores: { mystery: 3, sciFi: 2 },
      },
      {
        id: "D",
        text: {
          ja: "クスッと笑えて肩の力が抜ける、日々の癒やしとリラックス",
          en: "Heartwarming chuckles, daily relaxation, and soothing chill vibes",
        },
        scores: { sliceOfLife: 3, comedy: 2 },
      },
      {
        id: "E",
        text: {
          ja: "心がヒリヒリと沈み込むような、鬱展開・狂気・絶望感の揺さぶり",
          en: "Haunting psychological despair, dark depression, madness, and emotional turmoil",
        },
        scores: { depressive: 3, drama: 2 },
      },
    ],
  },
  {
    id: 3,
    question: {
      ja: "異世界転生や特殊世界に入り込むなら、どんな立ち位置になりたい？",
      en: "If you were transported to an isekai/fantasy world, what position would you want?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "伝説の聖剣を掲げ、魔王を倒す冒険者のリーダー",
          en: "Leader of an adventurer party wielding legendary swords to slay the demon lord",
        },
        scores: { action: 3, isekai: 2 },
      },
      {
        id: "B",
        text: {
          ja: "森羅万象の真理を極める、冷静沈着な大賢者",
          en: "Calm and composed archmage mastering all truth and magic in the universe",
        },
        scores: { isekai: 2, sciFi: 3 },
      },
      {
        id: "C",
        text: {
          ja: "王宮の難事件を影から解決する、頭脳派の宮廷探偵",
          en: "Intellectual court detective solving royal mysteries from behind the scenes",
        },
        scores: { mystery: 3 },
      },
      {
        id: "D",
        text: {
          ja: "宿場町で美味しい料理を振る舞う、のんびり食堂のオーナー",
          en: "Laid-back diner owner serving delicious comfort food in a peaceful town",
        },
        scores: { sliceOfLife: 3, comedy: 1 },
      },
      {
        id: "E",
        text: {
          ja: "世界の残酷な理（ことわり）や理不尽な死に翻弄される孤独な観測者",
          en: "Lonely observer toyed with by the cruel fate, death, and dark laws of the world",
        },
        scores: { depressive: 3, mystery: 1 },
      },
    ],
  },
  {
    id: 4,
    question: {
      ja: "主人公に惹かれる属性・タイプは？",
      en: "What type of protagonist appeals to you most?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "どんな逆境にも折れない、熱血で真っ直ぐな努力家",
          en: "Passionate, straightforward, and hard-working hero who never breaks under adversity",
        },
        scores: { action: 3, sports: 2 },
      },
      {
        id: "B",
        text: {
          ja: "常に沈着冷静、誰とも群れずに最善手を選ぶ一匹狼",
          en: "Always cool and calculated lone wolf who chooses the best path without crowds",
        },
        scores: { mystery: 2, sciFi: 3 },
      },
      {
        id: "C",
        text: {
          ja: "凡人だけど優しさに溢れ、誰かのためにボロボロになれる人",
          en: "Ordinary person full of kindness who endures suffering to protect others",
        },
        scores: { tear: 3, romance: 2 },
      },
      {
        id: "D",
        text: {
          ja: "一見すると冴えないが、実は規格外の最強パワーを隠す実力者",
          en: "Seemingly average character hiding overpowered cosmic abilities",
        },
        scores: { isekai: 3, action: 2 },
      },
      {
        id: "E",
        text: {
          ja: "絶望的な運命や理不尽な鬱展開の中で、葛藤し狂いそうになりながら耐える主人公",
          en: "Protagonist enduring cruel fate, psychological despair, and borderline madness",
        },
        scores: { depressive: 3, tear: 1 },
      },
    ],
  },
  {
    id: 5,
    question: {
      ja: "作品の「展開スピード・テンポ感」の好みは？",
      en: "What story pacing and narrative speed do you prefer?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "毎話クライマックス！退屈する暇のないジェットコースター展開",
          en: "Rollercoaster pacing with non-stop high-stakes climaxes in every episode",
        },
        scores: { action: 3, isekai: 2 },
      },
      {
        id: "B",
        text: {
          ja: "登場人物の揺れ動く感情を、丁寧に丁寧に重ねて描く人間ドラマ",
          en: "Rich human drama carefully layering shifting emotions character by character",
        },
        scores: { tear: 3, drama: 2 },
      },
      {
        id: "C",
        text: {
          ja: "特に重い出来事は起きず、のんびりとした時間が流れる空気感",
          en: "Relaxed atmosphere where time flows peacefully without heavy crises",
        },
        scores: { sliceOfLife: 3 },
      },
      {
        id: "D",
        text: {
          ja: "何気ない会話がすべて後々の伏線になっているような緻密な構成",
          en: "Meticulous construction where subtle dialogues hide clever foreshadowing",
        },
        scores: { mystery: 3, sciFi: 2 },
      },
      {
        id: "E",
        text: {
          ja: "平和に見えていた日常が徐々に狂いだし、一気に鬱展開へと転落していく怒濤のサスペンス",
          en: "Peaceful daily life gradually twisting into terrifying psychological despair and darkness",
        },
        scores: { depressive: 3, mystery: 2 },
      },
    ],
  },
  {
    id: 6,
    question: {
      ja: "好きな「恋愛要素」の描き方は？",
      en: "How do you prefer romance elements to be portrayed?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "見ていて恥ずかしくなるほど、お顔が赤くなる甘酸っぱい純愛",
          en: "Blushing, sweet, and wholesome innocent pure love stories",
        },
        scores: { romance: 3 },
      },
      {
        id: "B",
        text: {
          ja: "すれ違いや試練を乗り越える、運命的で少し切ないラブストーリー",
          en: "Bittersweet romantic destiny overcoming misunderstandings and heartbreaking trials",
        },
        scores: { tear: 2, romance: 3 },
      },
      {
        id: "C",
        text: {
          ja: "つかず離れずの関係に、ついヤキモキしてしまうドタバタコメディ",
          en: "Slapstick romantic comedy with charming back-and-forth tension",
        },
        scores: { comedy: 2, romance: 2 },
      },
      {
        id: "D",
        text: {
          ja: "恋愛要素は無し、またはストーリーを邪魔しない程度の隠し味で十分",
          en: "No heavy romance needed, or just a subtle background flavor",
        },
        scores: { action: 2, mystery: 2 },
      },
      {
        id: "E",
        text: {
          ja: "愛ゆえの狂気や執着、死別や生々しい愛憎が渦巻くダークで重い人間模様",
          en: "Dark, intense human relations with obsessive love, loss, and psychological obsession",
        },
        scores: { depressive: 3, drama: 2 },
      },
    ],
  },
  {
    id: 7,
    question: {
      ja: "作画（作画密度やビジュアルスタイル）で最もグッとくるのは？",
      en: "Which animation and art style captivates you the most?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "動きまくる殺陣やバトル。画面から熱が伝わる迫力の作画",
          en: "Dynamic high-octane battle animation bursting with energy",
        },
        scores: { action: 3, sports: 2 },
      },
      {
        id: "B",
        text: {
          ja: "背景美術や光の差し込みが、まるで実写映画のように美しい描写",
          en: "Cinematic background art with realistic lighting and breathtaking beauty",
        },
        scores: { tear: 2, drama: 2 },
      },
      {
        id: "C",
        text: {
          ja: "丸みがあって柔らかく、見ているだけで安心するようなタッチ",
          en: "Soft, cute, and gentle art style that feels comforting to look at",
        },
        scores: { sliceOfLife: 3 },
      },
      {
        id: "D",
        text: {
          ja: "どこか退廃的でダーク、影が多めのシリアスで引き締まったタッチ",
          en: "Sleek, dark, cybernetic, or noir aesthetics with high contrast shadows",
        },
        scores: { mystery: 2, sciFi: 3 },
      },
      {
        id: "E",
        text: {
          ja: "歪んだ空間美や精神世界、薄暗く鬱々とした陰惨で独特な世界観タッチ",
          en: "Surreal mindscapes, eerie dark atmosphere, and hauntingly unique artistic visuals",
        },
        scores: { depressive: 3, mystery: 1 },
      },
    ],
  },
  {
    id: 8,
    question: {
      ja: "観終わった後に残ってほしい「結末（ラスト）」は？",
      en: "What kind of ending do you want to linger in your mind afterwards?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "大勝利！すべての敵を倒してスカッとハッピーエンド",
          en: "Triumphant victory! Defeating all foes for a refreshing happy ending",
        },
        scores: { action: 3, isekai: 2 },
      },
      {
        id: "B",
        text: {
          ja: "切なくも温かい余韻が残り、思わず深くため息をついてしまう結末",
          en: "Bittersweet and warm resonance leaving a deep emotional sigh",
        },
        scores: { tear: 3, drama: 2 },
      },
      {
        id: "C",
        text: {
          ja: "度肝を抜かれる大どんでん返し。最後まで予測がつかない結末",
          en: "Mind-blowing plot twists with unpredictable ending revelations",
        },
        scores: { mystery: 3, sciFi: 2 },
      },
      {
        id: "D",
        text: {
          ja: "特別な劇的変化はなく、これからも穏やかな毎日が続いていく結末",
          en: "Peaceful continuation of daily life without forced dramatic changes",
        },
        scores: { sliceOfLife: 3 },
      },
      {
        id: "E",
        text: {
          ja: "心に大きな傷や重い課題を遺すような、救いのない完全ビター/鬱エンド",
          en: "Unforgiving bitter or tragic ending leaving a lasting psychological scar and weight",
        },
        scores: { depressive: 3, drama: 1 },
      },
    ],
  },
  {
    id: 9,
    question: {
      ja: "物語の舞台として最も惹かれるのは？",
      en: "Which story setting appeals to you the most?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "剣と魔法、ドラゴンが蠢く幻想的な中世ファンタジー世界",
          en: "Medieval fantasy world filled with swords, magic, and dragons",
        },
        scores: { isekai: 3, action: 2 },
      },
      {
        id: "B",
        text: {
          ja: "アンドロイド、電脳世界、未来の宇宙船などが登場するSF世界",
          en: "Futuristic sci-fi realm with cybernetics, AI, and interstellar ships",
        },
        scores: { sciFi: 3 },
      },
      {
        id: "C",
        text: {
          ja: "私たちが暮らす現代の、どこにでもある学校やのどかな田舎町",
          en: "Modern everyday setting like high schools or idyllic countryside towns",
        },
        scores: { sliceOfLife: 2, romance: 2 },
      },
      {
        id: "D",
        text: {
          ja: "史実をベースにしていたり、重厚な軍事・政治劇が繰り広げられる世界",
          en: "Historical or political military world with deep strategic drama",
        },
        scores: { drama: 3, mystery: 1 },
      },
      {
        id: "E",
        text: {
          ja: "死と隣り合わせのディストピアや、人間の尊厳が踏みにじられる鬱々とした世界",
          en: "Dystopian wasteland or dark society where human dignity is stripped away",
        },
        scores: { depressive: 3, sciFi: 2 },
      },
    ],
  },
  {
    id: 10,
    question: {
      ja: "キャラクター同士の関係性で一番燃える・滾るシチュエーションは？",
      en: "What relationship dynamic between characters excites you the most?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "背中を預け合い、命を賭して難敵に挑む最高の相棒（バディ）",
          en: "Inseparable buddies trusting each other's backs in life-or-death fights",
        },
        scores: { action: 3, sports: 2 },
      },
      {
        id: "B",
        text: {
          ja: "すれ違いや立場の違いで戦わねばならない、哀しき宿命のライバル",
          en: "Tragic rivals forced to battle due to destiny and conflicting beliefs",
        },
        scores: { tear: 3, drama: 2 },
      },
      {
        id: "C",
        text: {
          ja: "部室やシェアハウスでみんなが楽しくくだらない話を交わす居場所",
          en: "Cozy group of friends bantering in clubrooms or sharehouses",
        },
        scores: { sliceOfLife: 3, comedy: 2 },
      },
      {
        id: "D",
        text: {
          ja: "言葉にしなくても行動で分かり合う、一見冷たいが絶対的な信頼",
          en: "Silent unspoken trust between stoic characters who understand each other",
        },
        scores: { mystery: 2, sciFi: 2 },
      },
      {
        id: "E",
        text: {
          ja: "共倒れや依存、共依存や狂気に満ちた背徳感のあるダークな人間関係",
          en: "Dark, codependent, or toxic bonds filled with madness and taboo affection",
        },
        scores: { depressive: 3, drama: 1 },
      },
    ],
  },
  {
    id: 11,
    question: {
      ja: "「ミステリー・サスペンス要素」の好みは？",
      en: "How do you like mystery and suspense elements in anime?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "複雑な謎解きよりも、ストレートなアクションで解決してほしい",
          en: "Prefer straight action resolutions over overly complicated riddles",
        },
        scores: { action: 3 },
      },
      {
        id: "B",
        text: {
          ja: "程よい謎解きやスパイスとしてシリアスなサスペンスがあるのは好き",
          en: "Enjoy moderate mystery and suspense as a thrilling narrative spice",
        },
        scores: { sciFi: 2, mystery: 1 },
      },
      {
        id: "C",
        text: {
          ja: "頭を使うより、ストレートで純粋に熱くなれる展開の方が好き",
          en: "Prefer hot-blooded emotional hype rather than heavy mental analysis",
        },
        scores: { action: 2, isekai: 2 },
      },
      {
        id: "D",
        text: {
          ja: "争い事や謎は不要。終始ピースフルで平和であってほしい",
          en: "No conflicts or mysteries needed — prefer 100% peaceful vibes",
        },
        scores: { sliceOfLife: 3 },
      },
      {
        id: "E",
        text: {
          ja: "精神的に追い詰められる心理戦や、狂気が迫り来る心理ホラーサスペンスが好き",
          en: "Psychological thrillers, mind games, and creeping horror/madness",
        },
        scores: { depressive: 3, mystery: 2 },
      },
    ],
  },
  {
    id: 12,
    question: {
      ja: "登場人物たちが直面する「試練・葛藤」の好みは？",
      en: "What type of ordeal or conflict faced by characters grips you?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "圧倒的な力を持つ敵組織や、世界の崩壊を懸けた決戦",
          en: "Final showdowns against overwhelming villain syndicates to save the world",
        },
        scores: { action: 3, isekai: 2 },
      },
      {
        id: "B",
        text: {
          ja: "大切な仲間の喪失や、自分自身の弱さと向き合うといった内面の苦悩",
          en: "Inner anguish over loss of loved ones or confronting one's own weakness",
        },
        scores: { tear: 3, drama: 2 },
      },
      {
        id: "C",
        text: {
          ja: "同じ夢を追うライバルと、お互いのプライドを懸けた極限の勝負",
          en: "High-stakes sports or competitive showdowns against passionate rivals",
        },
        scores: { sports: 3 },
      },
      {
        id: "D",
        text: {
          ja: "ちょっとした勘違いや試験勉強、日常のごく些細なすれ違いトラブル",
          en: "Minor misunderstandings, studying for exams, or funny everyday troubles",
        },
        scores: { sliceOfLife: 2, comedy: 2 },
      },
      {
        id: "E",
        text: {
          ja: "いくら抗っても逃れられない理不尽な死や惨劇、希望が打ち砕かれる残酷な鬱状況",
          en: "Inevitable tragedies, despairing deaths, and cruel inescapable fates",
        },
        scores: { depressive: 3, drama: 2 },
      },
    ],
  },
  {
    id: 13,
    question: {
      ja: "作品における「劇伴音楽（BGM・劇中歌）」の重視度は？",
      en: "How important is soundtrack music (BGM & insert songs) to your experience?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "超重要。バトルのテンションを爆上げするロックやオーケストラ",
          en: "Crucial! Epic rock and orchestral scores that inflate battle hype",
        },
        scores: { action: 3, sports: 1 },
      },
      {
        id: "B",
        text: {
          ja: "超重要。涙腺を極限まで刺激する、哀愁を帯びたストリングスや名曲",
          en: "Crucial! Heartbreaking strings and melancholic melodies triggering tears",
        },
        scores: { tear: 3, drama: 1 },
      },
      {
        id: "C",
        text: {
          ja: "重要。シーンに寄り添う、穏やかで心地よいLo-Fiやアコースティック",
          en: "Important. Gentle Lo-Fi and acoustic tunes complementing cozy scenes",
        },
        scores: { sliceOfLife: 3 },
      },
      {
        id: "D",
        text: {
          ja: "重要。不穏さや退廃的な近未来感を完璧に演出するインダストリアル調",
          en: "Important. Industrial synth and ambient sounds conveying dark cyberpunk moods",
        },
        scores: { mystery: 1, sciFi: 3 },
      },
      {
        id: "E",
        text: {
          ja: "重要。不安や不気味さ、狂気と美しさが同居する独創的な劇伴・ダークソング",
          en: "Important. Uncanny, dark, and eerie soundtrack intertwining beauty and madness",
        },
        scores: { depressive: 3, mystery: 1 },
      },
    ],
  },
  {
    id: 14,
    question: {
      ja: "どんなシチュエーション（時間帯や気分）でアニメを観ることが多い？",
      en: "In what setting or mood do you usually watch anime?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "休日の夜、部屋の電気を消して大画面で世界観にどっぷり浸かる",
          en: "Holiday nights, lights off, fully immersed in front of a big screen",
        },
        scores: { action: 2, sciFi: 2 },
      },
      {
        id: "B",
        text: {
          ja: "週末の午前中や晴れた午後、温かい飲み物を片手にリフレッシュ鑑賞",
          en: "Weekend mornings or sunny afternoons enjoying warm drinks and relaxing",
        },
        scores: { sliceOfLife: 3, romance: 2 },
      },
      {
        id: "C",
        text: {
          ja: "ご飯を食べながら、または作業用として適度なテンションでサクッと視聴",
          en: "Casual viewing while eating meal or working in the background",
        },
        scores: { comedy: 2, isekai: 2 },
      },
      {
        id: "D",
        text: {
          ja: "とにかく泣きたい、熱くなりたいなど『感情を揺さぶられたい』時に一気見",
          en: "Binge-watching when you crave deep emotional turbulence or teary release",
        },
        scores: { tear: 3, drama: 2 },
      },
      {
        id: "E",
        text: {
          ja: "気分が鬱々としている時・沈んでいる時、共鳴できるダークな世界に深く浸りたい時",
          en: "When feeling gloomy or depressed, seeking resonance in deep dark worlds",
        },
        scores: { depressive: 3, drama: 1 },
      },
    ],
  },
  {
    id: 15,
    question: {
      ja: "全体的な「世界観・空気感」の最終的な好みは？",
      en: "What overall atmosphere or tone do you ultimately prefer?",
    },
    options: [
      {
        id: "A",
        text: {
          ja: "王道・明朗快活。見る人に希望や元気を届けてくれる爽快な雰囲気",
          en: "Classic & uplifting. Inspiring hope, energy, and positive vibes",
        },
        scores: { action: 2, sports: 2, isekai: 1 },
      },
      {
        id: "B",
        text: {
          ja: "哲学的で、現実の厳しさや人間の二面性などを描く大人向けの重厚な雰囲気",
          en: "Philosophical & mature, exploring harsh reality and complex human nature",
        },
        scores: { mystery: 2, sciFi: 3 },
      },
      {
        id: "C",
        text: {
          ja: "とにかくエモーショナル。登場人物の生きた証に深く感動できる雰囲気",
          en: "Purely emotional & touching, celebrating the beauty of living and connection",
        },
        scores: { tear: 3, drama: 2 },
      },
      {
        id: "D",
        text: {
          ja: "キャラクターたちが可愛らしく穏やかで、一切ストレスのない雰囲気",
          en: "Stress-free, cute, and gentle healing vibes from start to finish",
        },
        scores: { sliceOfLife: 3, comedy: 1 },
      },
      {
        id: "E",
        text: {
          ja: "鬱展開やトラウマ描写、人間の闇や不都合な真実を直視する衝撃的な雰囲気",
          en: "Shocking psychological darkness, trauma, and confronting unfiltered truth",
        },
        scores: { depressive: 3, drama: 2 },
      },
    ],
  },
];

export const UI_TRANSLATIONS = {
  ja: {
    appName: "AIアニメ診断",
    appSubtitle: "AI Diagnosis & Anime Matcher",
    nav: {
      home: "ホーム",
      diagnose: "AI診断スタート",
      search: "アニメを探す",
      mypage: "マイページ",
      admin: "管理画面",
    },
    home: {
      heroTitle: "AIがあなたの感性を分析し、今見るべき最高のアニメを導きます",
      heroSub: "15問の直感的な心理テストで、最新のGemini AIとAniListデータベースがあなたの潜在的な好みと作品をマッチング。",
      startDiagnosis: "無料のAI診断を始める（約1分）",
      browseCatalog: "作品カタログを見る",
      featuresTitle: "AIアニメ診断の特長",
      feat1Title: "Gemini AIによる超精密分析",
      feat1Desc: "最新の生成AIが単なるジャンル検索を超え、あなたの深層心理や鑑賞気分にフィットする作品を導出。",
      feat2Title: "100作品以上の厳選データベース",
      feat2Desc: "AniListと連動し、リアルタイムで正確な評価・あらすじ・視聴サービス情報を取得します。",
      feat3Title: "直接見れるストリーミング連携",
      feat3Desc: "DMM TV、U-NEXT、dアニメストア等の配信情報を一目で比較できます。",
      recentNotices: "お知らせ・アップデート",
      catalogTitle: "登録アニメ作品データベースの一部",
      viewAllCatalog: "すべての作品を検索・比較する →",
    },
    diagnose: {
      title: "AIアニメ感性診断",
      progress: "質問 {current} / {total}",
      prevQuestion: "前の質問へ",
      analyzingTitle: "AIがあなたの回答結果を精密分析中...",
      analyzingSub: "Gemini AIが嗜好プロファイルを計算し、最適なアニメを選定しています。",
    },
    result: {
      title: "あなたのAIアニメ診断結果",
      yourType: "あなたの診断タイプ",
      aiRecommendation: "AIが導き出したオススメアニメ",
      scoreMatch: "マッチ度",
      whyThisAnime: "AIによる推薦理由",
      watchNow: "今すぐ公式配信で観る",
      viewDetail: "詳細情報・あらすじを見る",
      shareTitle: "診断結果をシェア",
      shareCopy: "結果リンクをコピー",
      shareCopied: "コピーしました！",
      retry: "もう一度診断する",
      savedToHistory: "マイページに結果を保存しました",
      otherRecommendations: "他のおすすめ候補作品",
    },
    detail: {
      back: "戻る",
      synopsis: "あらすじ・作品概要",
      score: "評価スコア",
      episodes: "話数",
      genres: "ジャンル",
      watchOn: "公式配信サービス（無料体験あり）",
      reviews: "みんなのレビュー・感想",
      aiSummary: "AIによるこの作品のポイント",
    },
    search: {
      title: "アニメデータベース検索",
      placeholder: "タイトル、キーワード、あらすじで検索...",
      allGenres: "すべてのジャンル",
      sortByScore: "評価が高い順",
      sortByTitle: "タイトル順",
      noResults: "該当するアニメが見つかりませんでした。",
    },
    mypage: {
      title: "マイページ・診断履歴",
      savedDiagnoses: "保存済みの診断結果",
      favorites: "お気に入りアニメ",
      noHistory: "診断履歴がまだありません。「AI診断スタート」から診断してみましょう！",
      noFavorites: "お気に入り登録されたアニメはありません。",
      clearHistory: "履歴を削除",
    },
    footer: {
      copy: "© 2026 AI Anime Diagnosis. All rights reserved.",
      disclaimer: "当サイトで紹介しているアニメ作品および配信サービス情報は各公式サイトを参照しています。",
    },
  },
  en: {
    appName: "AI Anime Match",
    appSubtitle: "AI Diagnosis & Anime Finder",
    nav: {
      home: "Home",
      diagnose: "Start Diagnosis",
      search: "Browse Anime",
      mypage: "My Page",
      admin: "Admin",
    },
    home: {
      heroTitle: "AI Analyzes Your Tastes to Discover Your Next Favorite Anime",
      heroSub: "Answer 15 intuitive questions. Powered by Gemini AI & AniList database for personalized anime recommendations.",
      startDiagnosis: "Start Free AI Diagnosis (~1 min)",
      browseCatalog: "Browse Anime Catalog",
      featuresTitle: "Why Use AI Anime Match?",
      feat1Title: "Precision Analysis by Gemini AI",
      feat1Desc: "Beyond basic genre tags — our AI decodes your deep mood and emotional preferences to match perfect titles.",
      feat2Title: "100+ Curated Anime Database",
      feat2Desc: "Synchronized with AniList for real-time ratings, synopses, and streaming availability.",
      feat3Title: "Direct Streaming Platform Links",
      feat3Desc: "Compare streaming options like DMM TV, U-NEXT, Crunchroll, and Netflix with one click.",
      recentNotices: "News & Updates",
      catalogTitle: "Featured Anime Database",
      viewAllCatalog: "Search and compare all titles →",
    },
    diagnose: {
      title: "AI Anime Taste Diagnosis",
      progress: "Question {current} of {total}",
      prevQuestion: "Previous Question",
      analyzingTitle: "AI is analyzing your answers...",
      analyzingSub: "Gemini AI is calculating your personality profile and matching ideal anime.",
    },
    result: {
      title: "Your AI Anime Match Result",
      yourType: "Your Diagnosis Profile",
      aiRecommendation: "Top Recommended Anime",
      scoreMatch: "Match Score",
      whyThisAnime: "AI Recommendation Reason",
      watchNow: "Watch Now on Official Streaming",
      viewDetail: "View Details & Synopsis",
      shareTitle: "Share Your Result",
      shareCopy: "Copy Result Link",
      shareCopied: "Copied to clipboard!",
      retry: "Take Diagnosis Again",
      savedToHistory: "Saved result to My Page history",
      otherRecommendations: "Other Recommended Matches",
    },
    detail: {
      back: "Back",
      synopsis: "Synopsis & Overview",
      score: "Rating Score",
      episodes: "Episodes",
      genres: "Genres",
      watchOn: "Official Streaming Platforms",
      reviews: "Community Reviews & Impressions",
      aiSummary: "AI Highlights for this Title",
    },
    search: {
      title: "Anime Database Search",
      placeholder: "Search by title, keyword, or plot...",
      allGenres: "All Genres",
      sortByScore: "Highest Rated",
      sortByTitle: "Title A-Z",
      noResults: "No matching anime found.",
    },
    mypage: {
      title: "My Page & History",
      savedDiagnoses: "Saved Diagnosis History",
      favorites: "Favorite Anime Titles",
      noHistory: "No diagnosis history yet. Tap 'Start Diagnosis' to get your first result!",
      noFavorites: "No favorited anime yet.",
      clearHistory: "Clear History",
    },
    footer: {
      copy: "© 2026 AI Anime Match. All rights reserved.",
      disclaimer: "All anime information and streaming references are sourced from official platforms and AniList API.",
    },
  },
};
