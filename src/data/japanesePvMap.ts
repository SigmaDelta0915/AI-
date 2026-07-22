export interface JapaneseTrailerInfo {
  id: string; // YouTube Video ID
  title: string; // Title or channel note
}

// Map of anime ID or title keywords to verified official Japanese YouTube PVs
export const JAPANESE_PV_DICTIONARY: Record<number, JapaneseTrailerInfo> = {
  // 葬送のフリーレン
  154587: { id: "qgQunxD0qmo", title: "『葬送のフリーレン』本PV（TOHO animation）" },
  // 【推しの子】
  150672: { id: "gY1P19M6dJ8", title: "『【推しの子】』本予告（KADOKAWAanime）" },
  // 薬屋のひとりごと
  161645: { id: "m2I_P9I-QGg", title: "『薬屋のひとりごと』本PV（TOHO animation）" },
  // 鬼滅の刃
  101922: { id: "VQGCKyvzIM4", title: "アニメ『鬼滅の刃』本PV（アニプレックス）" },
  // 呪術廻戦
  113415: { id: "pkneV11394k", title: "TVアニメ『呪術廻戦』PV第1弾（TOHO animation）" },
  // ぼっち・ざ・ろっく！
  130003: { id: "bJ3jPAt3R-k", title: "TVアニメ『ぼっち・ざ・ろっく！』本PV（アニプレックス）" },
  // SPY×FAMILY
  140960: { id: "_OKAwz22I_s", title: "TVアニメ『SPY×FAMILY』本予告（TOHO animation）" },
  // 進撃の巨人
  16498: { id: "In041_i_I5Q", title: "TVアニメ『進撃の巨人』PV第1弾（ポニーキャニオン）" },
  // チェンソーマン
  127230: { id: "q15CRdE5Bv0", title: "TVアニメ『チェンソーマン』本PV（MAPPA）" },
  // ハイキュー!!
  20464: { id: "_n6j8kO9sCo", title: "TVアニメ『ハイキュー!!』PV（TOHO animation）" },
  // 僕のヒーローアカデミア
  21459: { id: "wPt8o9iLpE8", title: "TVアニメ『僕のヒーローアカデミア』PV（TOHO animation）" },
  // その着せ替え人形は恋をする
  132405: { id: "bLqA1cE8bM4", title: "TVアニメ『その着せ替え人形は恋をする』本PV（アニプレックス）" },
  // 怪獣8号
  153288: { id: "a3I0aQ0W9k8", title: "TVアニメ『怪獣8号』メインPV（TOHO animation）" },
  // ダンジョン飯
  153518: { id: "mE1b99s94r0", title: "TVアニメ『ダンジョン飯』PV第1弾（KADOKAWAanime）" },
  // 俺だけレベルアップな件 (Solo Leveling)
  151807: { id: "S25-5k74oT4", title: "TVアニメ『俺だけレベルアップな件』PV（アニプレックス）" },
  // 君の名は。
  32281: { id: "k4xGqY5IDBE", title: "『君の名は。』予告（東宝MOVIEチャンネル）" },
  // 天気の子
  106286: { id: "g4B_05G0iU4", title: "『天気の子』予告（東宝MOVIEチャンネル）" },
  // すずめの戸締まり
  142293: { id: "6s4_M3X9gT4", title: "『すずめの戸締まり』予告（東宝MOVIEチャンネル）" },
  // 転生したらスライムだった件
  21685: { id: "4_3d8J7KqMo", title: "TVアニメ『転生したらスライムだった件』PV（バンダイナムコ）" },
  // Re:ゼロから始める異世界生活
  21355: { id: "tB-Y1Q4365s", title: "TVアニメ『Re:ゼロから始める異世界生活』PV（KADOKAWAanime）" },
  // ヴァイオレット・エヴァーガーデン
  21827: { id: "0CJeDetA45Q", title: "『ヴァイオレット・エヴァーガーデン』PV（京都アニメーション）" },
  // 機動戦士ガンダム 水星の魔女
  143270: { id: "3M-L4_kG3b4", title: "『機動戦士ガンダム 水星の魔女』予告（ガンダムチャンネル）" },
  // ウマ娘 プリティーダービー
  98514: { id: "k5pB_0G34eA", title: "TVアニメ『ウマ娘 プリティーダービー』PV（ぱかちゃんねる）" },
};

// Title-based fuzzy keyword mapping for Japanese PVs
const KEYWORD_PV_MAP: { keywords: string[]; info: JapaneseTrailerInfo }[] = [
  { keywords: ["フリーレン", "Frieren"], info: { id: "qgQunxD0qmo", title: "『葬送のフリーレン』本PV（TOHO animation）" } },
  { keywords: ["推しの子", "Oshi no Ko"], info: { id: "gY1P19M6dJ8", title: "『【推しの子】』本予告（KADOKAWAanime）" } },
  { keywords: ["薬屋のひとりごと", "Apothecary"], info: { id: "m2I_P9I-QGg", title: "『薬屋のひとりごと』本PV（TOHO animation）" } },
  { keywords: ["鬼滅の刃", "Demon Slayer", "Kimetsu"], info: { id: "VQGCKyvzIM4", title: "アニメ『鬼滅の刃』本PV（アニプレックス）" } },
  { keywords: ["呪術廻戦", "Jujutsu Kaisen"], info: { id: "pkneV11394k", title: "TVアニメ『呪術廻戦』PV第1弾（TOHO animation）" } },
  { keywords: ["ぼっち・ざ・ろっく", "Bocchi"], info: { id: "bJ3jPAt3R-k", title: "TVアニメ『ぼっち・ざ・ろっく！』本PV（アニプレックス）" } },
  { keywords: ["SPY×FAMILY", "スパイファミリー", "Spy x Family"], info: { id: "_OKAwz22I_s", title: "TVアニメ『SPY×FAMILY』本予告（TOHO animation）" } },
  { keywords: ["進撃の巨人", "Attack on Titan", "Shingeki"], info: { id: "In041_i_I5Q", title: "TVアニメ『進撃の巨人』PV第1弾（ポニーキャニオン）" } },
  { keywords: ["チェンソーマン", "Chainsaw Man"], info: { id: "q15CRdE5Bv0", title: "TVアニメ『チェンソーマン』本PV（MAPPA）" } },
  { keywords: ["ハイキュー", "Haikyu"], info: { id: "_n6j8kO9sCo", title: "TVアニメ『ハイキュー!!』PV（TOHO animation）" } },
  { keywords: ["僕のヒーローアカデミア", "ヒロアカ", "My Hero Academia"], info: { id: "wPt8o9iLpE8", title: "TVアニメ『僕のヒーローアカデミア』PV（TOHO animation）" } },
  { keywords: ["着せ替え人形", "Bisque Doll", "Dress-Up Darling"], info: { id: "bLqA1cE8bM4", title: "TVアニメ『その着せ替え人形は恋をする』本PV（アニプレックス）" } },
  { keywords: ["怪獣8号", "Kaiju No. 8"], info: { id: "a3I0aQ0W9k8", title: "TVアニメ『怪獣8号』メインPV（TOHO animation）" } },
  { keywords: ["ダンジョン飯", "Delicious in Dungeon"], info: { id: "mE1b99s94r0", title: "TVアニメ『ダンジョン飯』PV第1弾（KADOKAWAanime）" } },
  { keywords: ["俺だけレベルアップな件", "ソロレベリング", "Solo Leveling"], info: { id: "S25-5k74oT4", title: "TVアニメ『俺だけレベルアップな件』PV（アニプレックス）" } },
  { keywords: ["君の名は", "Your Name"], info: { id: "k4xGqY5IDBE", title: "『君の名は。』予告（東宝MOVIEチャンネル）" } },
  { keywords: ["天気の子", "Weathering"], info: { id: "g4B_05G0iU4", title: "『天気の子』予告（東宝MOVIEチャンネル）" } },
  { keywords: ["すずめの戸締まり", "Suzume"], info: { id: "6s4_M3X9gT4", title: "『すずめの戸締まり』予告（東宝MOVIEチャンネル）" } },
  { keywords: ["転生したらスライム", "転スラ", "Slime"], info: { id: "4_3d8J7KqMo", title: "TVアニメ『転生したらスライムだった件』PV（バンダイナムコ）" } },
  { keywords: ["Re:ゼロ", "リゼロ", "Re:ZERO"], info: { id: "tB-Y1Q4365s", title: "TVアニメ『Re:ゼロから始める異世界生活』PV（KADOKAWAanime）" } },
  { keywords: ["ヴァイオレット", "Violet Evergarden"], info: { id: "0CJeDetA45Q", title: "『ヴァイオレット・エヴァーガーデン』PV（京都アニメーション）" } },
  { keywords: ["水星の魔女", "Witch from Mercury"], info: { id: "3M-L4_kG3b4", title: "『機動戦士ガンダム 水星の魔女』予告（ガンダムチャンネル）" } },
  { keywords: ["ウマ娘", "Uma Musume"], info: { id: "k5pB_0G34eA", title: "TVアニメ『ウマ娘 プリティーダービー』PV（ぱかちゃんねる）" } },
];

/**
 * Returns the best Japanese official trailer info for an anime media object
 */
export function getOfficialJapaneseTrailer(anime: {
  id: number;
  title?: { native?: string; romaji?: string; english?: string; userPreferred?: string };
  trailer?: { id?: string; site?: string };
}): { id: string; site: "youtube"; title: string; isJapaneseOfficial: boolean } | null {
  // 1. Direct ID match
  if (JAPANESE_PV_DICTIONARY[anime.id]) {
    const item = JAPANESE_PV_DICTIONARY[anime.id];
    return { id: item.id, site: "youtube", title: item.title, isJapaneseOfficial: true };
  }

  // 2. Keyword match on titles
  const titlesToSearch = [
    anime.title?.native,
    anime.title?.userPreferred,
    anime.title?.romaji,
    anime.title?.english,
  ].filter(Boolean) as string[];

  for (const item of KEYWORD_PV_MAP) {
    for (const kw of item.keywords) {
      if (titlesToSearch.some(t => t.toLowerCase().includes(kw.toLowerCase()))) {
        return { id: item.info.id, site: "youtube", title: item.info.title, isJapaneseOfficial: true };
      }
    }
  }

  // 3. Fallback to default trailer from AniList if site is youtube
  if (anime.trailer?.id && anime.trailer.site === "youtube") {
    const nativeName = anime.title?.native || anime.title?.userPreferred || "アニメ";
    return {
      id: anime.trailer.id,
      site: "youtube",
      title: `『${nativeName}』公式プロモーションPV`,
      isJapaneseOfficial: false,
    };
  }

  return null;
}
