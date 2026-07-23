import { AnimeMedia, DiagnosisResult, RecommendedAnime } from "../types";
import { FALLBACK_POPULAR_ANIME, translateGenreToJapanese } from "../data/fallbackAnime";

// AniList GraphQL Direct Fetcher (Fallback for static hosting / Vercel without Express proxy)
const ANILIST_GRAPHQL_URL = "https://graphql.anilist.co";

async function fetchAniListDirect(query: string, variables: any = {}) {
  try {
    const res = await fetch(ANILIST_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch (err) {
    console.error("Direct AniList Fetch Error:", err);
    return null;
  }
}

// Safely parse JSON from fetch response without throwing SyntaxError on HTML responses
export async function safeJsonResponse<T = any>(res: Response): Promise<{ ok: boolean; data: T | null; errorMsg: string | null }> {
  const contentType = res.headers.get("content-type") || "";
  
  if (!res.ok) {
    if (contentType.includes("application/json")) {
      try {
        const errJson = await res.json();
        return { ok: false, data: null, errorMsg: errJson.error || errJson.message || `HTTP ${res.status}` };
      } catch {
        // Fallback below
      }
    }
    const text = await res.text();
    if (text.includes("The page") || text.includes("<!DOCTYPE") || res.status === 404) {
      return { 
        ok: false, 
        data: null, 
        errorMsg: "Vercelなどの静的ホスティング環境で /api サーバーが存在しないか、404エラーを返しました。" 
      };
    }
    return { ok: false, data: null, errorMsg: `サーバーエラー (ステータス ${res.status})` };
  }

  if (!contentType.includes("application/json")) {
    return { 
      ok: false, 
      data: null, 
      errorMsg: "サーバーからの応答がJSONフォーマットではありませんでした。" 
    };
  }

  try {
    const data = await res.json();
    return { ok: true, data, errorMsg: null };
  } catch (e: any) {
    return { ok: false, data: null, errorMsg: "JSONデータの解析に失敗しました。" };
  }
}

// --------------------------------------------------------------------------
// Popular Anime API (Proxy -> Direct Fallback -> Static Backup)
// --------------------------------------------------------------------------
export function ensureJapaneseAnimeData(anime: AnimeMedia): AnimeMedia {
  if (!anime) return anime;

  const copy: AnimeMedia = JSON.parse(JSON.stringify(anime));

  // Translate genres to Japanese
  if (Array.isArray(copy.genres)) {
    copy.genres = copy.genres.map(g => translateGenreToJapanese(g));
  }

  const jpTitle = copy.title?.native || copy.title?.userPreferred;
  const englishTitle = copy.title?.english || copy.title?.romaji || "作品";
  const displayTitle = jpTitle || englishTitle;

  const desc = copy.description || "";
  const hasJapaneseChar = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(desc);

  // Normalize titles for robust matching
  const cleanJp = (jpTitle || "").replace(/[\s\t\n・！!★☆ー〜-]/g, "").toLowerCase();
  const cleanDisplay = (displayTitle || "").replace(/[\s\t\n・！!★☆ー〜-]/g, "").toLowerCase();

  const knownFallback = FALLBACK_POPULAR_ANIME.find(f => {
    if (f.id === copy.id) return true;
    const fNative = (f.title.native || "").replace(/[\s\t\n・！!★☆ー〜-]/g, "").toLowerCase();
    const fEnglish = (f.title.english || "").toLowerCase();
    
    if (fNative && (cleanJp.includes(fNative) || fNative.includes(cleanJp))) return true;
    if (fNative && (cleanDisplay.includes(fNative) || fNative.includes(cleanDisplay))) return true;
    if (fEnglish && copy.title?.english && copy.title.english.toLowerCase().includes(fEnglish)) return true;
    return false;
  });

  if (knownFallback && knownFallback.description) {
    copy.description = knownFallback.description;
  } else if (!hasJapaneseChar || desc.length < 90) {
    const genreText = copy.genres && copy.genres.length > 0 ? copy.genres.slice(0, 3).join("・") : "バトル・ファンタジー・ドラマ";
    const studioText = copy.studios?.nodes?.[0]?.name ? `【アニメーション制作】${copy.studios.nodes[0].name}\n` : "";
    const scoreText = copy.averageScore ? `満足度スコア ${(copy.averageScore / 10).toFixed(1)}/10` : "診断ユーザー高評価";
    
    copy.description = `【ストーリー概要】
『${displayTitle}』は、${genreText}の世界観を舞台に繰り広げられる大人気アニメーション作品です。

綿密に組み上げられたストーリーテリングと魅力溢れるキャラクターたちが織りなすドラマが大きな反響を呼んでおり、物語の核心へ向かうにつれて深まる謎や数々のクライマックスシーン、心揺さぶるエピソードが見どころとなっています。

【作品のみどころ・特徴】
・【${genreText}】ジャンルを象徴する圧倒的なクオリティの作画と臨場感溢れるバトル＆ドラマ演出
・主人公をはじめとする個性豊かなキャラクター同士の人間模様と胸を打つ成長ストーリー
・${studioText}・アニメ診断利用者から${scoreText}を獲得している名作アニメ作品`;
  } else {
    const cleaned = desc.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").trim();
    if (!cleaned.includes("【ストーリー概要】")) {
      const genreText = copy.genres && copy.genres.length > 0 ? copy.genres.slice(0, 3).join("・") : "アニメ";
      copy.description = `【ストーリー概要】
${cleaned}

【作品のみどころ・特徴】
・【${genreText}】ジャンルならではのハイクオリティな映像美と疾走感あふれる演出
・キャラクターたちの葛藤や成長、仲間との熱い絆を繊細かつ重厚に描いたストーリー
・劇中を彩るサウンドトラックと豪華キャスト陣による魂のこもった熱演`;
    } else {
      copy.description = cleaned;
    }
  }

  return copy;
}

export async function getPopularAnime(perPage: number = 12): Promise<AnimeMedia[]> {
  try {
    const res = await fetch(`/api/anime/popular?perPage=${perPage}`);
    const parsed = await safeJsonResponse<AnimeMedia[]>(res);
    if (parsed.ok && Array.isArray(parsed.data) && parsed.data.length > 0) {
      return parsed.data.map(ensureJapaneseAnimeData);
    }
  } catch (err) {
    console.warn("API proxy failed, attempting direct AniList fetch...", err);
  }

  // Fallback to direct AniList GraphQL
  try {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page (page: 1, perPage: $perPage) {
          media (sort: [POPULARITY_DESC, SCORE_DESC], type: ANIME, isAdult: false) {
            id
            title { romaji english native userPreferred }
            description
            coverImage { extraLarge large medium color }
            bannerImage
            startDate { year }
            episodes
            genres
            averageScore
            studios(isMain: true) { nodes { name } }
            trailer { id site }
          }
        }
      }
    `;
    const data = await fetchAniListDirect(query, { perPage });
    if (data?.Page?.media && data.Page.media.length > 0) {
      return data.Page.media.map(ensureJapaneseAnimeData);
    }
  } catch (e) {
    console.warn("Direct AniList fetch error, utilizing fallback static dataset.", e);
  }

  // Guaranteed non-empty static dataset
  return FALLBACK_POPULAR_ANIME.slice(0, perPage).map(ensureJapaneseAnimeData);
}

// --------------------------------------------------------------------------
// Search Anime API (Proxy -> Direct Fallback -> Filtered Backup)
// --------------------------------------------------------------------------
export async function searchAnime(params: {
  search?: string;
  genre?: string;
  year?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}): Promise<AnimeMedia[]> {
  try {
    const res = await fetch("/api/anime/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const parsed = await safeJsonResponse<AnimeMedia[]>(res);
    if (parsed.ok && Array.isArray(parsed.data) && parsed.data.length > 0) {
      return parsed.data;
    }
  } catch (err) {
    console.warn("Search proxy failed, attempting direct AniList fetch...", err);
  }

  // Fallback to direct AniList GraphQL
  try {
    let sortValue = "POPULARITY_DESC";
    if (params.sort === "score") sortValue = "SCORE_DESC";
    if (params.sort === "newest") sortValue = "START_DATE_DESC";

    const queryParams: string[] = ["$page: Int", "$perPage: Int"];
    const mediaArgs: string[] = ["type: ANIME", "isAdult: false"];
    const variables: any = { page: params.page || 1, perPage: params.perPage || 24 };

    if (params.search) {
      queryParams.push("$search: String");
      mediaArgs.push("search: $search");
      variables.search = params.search;
    }
    if (params.genre) {
      queryParams.push("$genre: String");
      mediaArgs.push("genre: $genre");
      variables.genre = params.genre;
    }
    if (params.year) {
      queryParams.push("$year: Int");
      mediaArgs.push("seasonYear: $year");
      variables.year = parseInt(params.year, 10);
    }
    mediaArgs.push(`sort: [${sortValue}]`);

    const query = `
      query (${queryParams.join(", ")}) {
        Page (page: $page, perPage: $perPage) {
          media (${mediaArgs.join(", ")}) {
            id
            title { romaji english native userPreferred }
            description
            coverImage { extraLarge large medium color }
            bannerImage
            startDate { year }
            episodes
            genres
            averageScore
            studios(isMain: true) { nodes { name } }
            trailer { id site }
          }
        }
      }
    `;
    const data = await fetchAniListDirect(query, variables);
    if (data?.Page?.media && data.Page.media.length > 0) {
      return data.Page.media.map(ensureJapaneseAnimeData);
    }
  } catch (e) {
    console.warn("Direct search fetch failed, using client backup filtering", e);
  }

  // Backup filtering over static popular dataset if external API returns empty or fails
  let filtered = [...FALLBACK_POPULAR_ANIME];
  if (params.genre) {
    filtered = filtered.filter(a => a.genres?.some(g => g.toLowerCase() === params.genre?.toLowerCase()));
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(a => 
      a.title?.native?.toLowerCase().includes(q) || 
      a.title?.romaji?.toLowerCase().includes(q) || 
      a.title?.english?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q)
    );
  }
  return (filtered.length > 0 ? filtered : FALLBACK_POPULAR_ANIME).map(ensureJapaneseAnimeData);
}

// --------------------------------------------------------------------------
// Anime Detail API (Proxy -> Direct Fallback -> Static Backup)
// --------------------------------------------------------------------------
export async function getAnimeDetail(id: number): Promise<AnimeMedia | null> {
  try {
    const res = await fetch(`/api/anime/${id}`);
    const parsed = await safeJsonResponse<AnimeMedia>(res);
    if (parsed.ok && parsed.data && parsed.data.id) {
      return ensureJapaneseAnimeData(parsed.data);
    }
  } catch (err) {
    console.warn("Detail proxy failed, attempting direct AniList fetch...", err);
  }

  // Fallback to direct AniList GraphQL
  try {
    const query = `
      query ($id: Int) {
        Media (id: $id, type: ANIME) {
          id
          title { romaji english native userPreferred }
          description
          coverImage { extraLarge large medium color }
          bannerImage
          startDate { year month day }
          episodes
          genres
          averageScore
          studios(isMain: true) { nodes { name } }
          trailer { id site }
          siteUrl
        }
      }
    `;
    const data = await fetchAniListDirect(query, { id });
    if (data?.Media) {
      return ensureJapaneseAnimeData(data.Media);
    }
  } catch (e) {
    console.warn("Direct detail fetch failed", e);
  }

  // Backup lookup from static list
  const fallback = FALLBACK_POPULAR_ANIME.find(a => a.id === id) || FALLBACK_POPULAR_ANIME[0];
  return ensureJapaneseAnimeData(fallback);
}

// --------------------------------------------------------------------------
// AI Diagnosis API (Express Gemini Proxy -> Smart Client Fallback)
// --------------------------------------------------------------------------
export async function runDiagnosis(answers: { [key: number]: string }, categoryScores: { [key: string]: number }): Promise<DiagnosisResult> {
  try {
    const res = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, categoryScores }),
    });

    const parsed = await safeJsonResponse<DiagnosisResult>(res);
    if (parsed.ok && parsed.data && parsed.data.typeName) {
      if (Array.isArray(parsed.data.recommendations)) {
        parsed.data.recommendations = parsed.data.recommendations.map(rec => ({
          ...rec,
          media: rec.media ? ensureJapaneseAnimeData(rec.media) : null
        }));
      }
      return parsed.data;
    }
  } catch (err) {
    console.warn("Backend /api/diagnose unreachable, running client-side diagnosis fallback engine...", err);
  }

  // CLIENT-SIDE FALLBACK DIAGNOSIS GENERATOR (Runs seamlessly on Vercel / Static Hosting)
  return generateClientFallbackDiagnosis(categoryScores);
}

// Helper: Smart Rule-Based Diagnosis Engine for static environments (Vercel/GitHub Pages)
async function generateClientFallbackDiagnosis(categoryScores: { [key: string]: number }): Promise<DiagnosisResult> {
  // Sort categories by score
  const sorted = Object.entries(categoryScores || {}).sort((a, b) => b[1] - a[1]);
  const topCategory = sorted[0]?.[0] || "action";
  const secondCategory = sorted[1]?.[0] || "sliceOfLife";

  interface CategoryConfig {
    typeName: string;
    typeDescription: string;
    keyTraits: string[];
    candidates: Array<{ title: string; reason: string }>;
  }

  const PRESETS: Record<string, CategoryConfig> = {
    action: {
      typeName: "熱血バトル＆激闘スペシャリスト",
      typeDescription: "圧倒的な作画クオリティと、登場人物たちの熱き信念が衝突する戦闘劇に強く惹かれるタイプです。難局を乗り越えて成長する熱い絆や胸躍るアクションに深い感動を覚えます。",
      keyTraits: ["#作画神回好き", "#熱いバトル", "#圧倒的スケール", "#信念の激突"],
      candidates: [
        { title: "進撃の巨人", reason: "圧倒的なスケールと緊張感あふれるアクション。あなたの求める熱量と興奮を最高峰のクオリティで叶えます。" },
        { title: "鬼滅の刃", reason: "家族を守る熱い意志と美しい剣戟アニメーション。息をのむ戦闘シーンに心が震えます。" },
        { title: "呪術廻戦", reason: "スピーディーかつスタイリッシュな洗練された呪術バトル。個性的で魅力あふれるキャラクターに惹かれます。" },
        { title: "チェンソーマン", reason: "クレイジーで生々しい躍動感と独特のダークアクション。これまでの概念を覆す刺激に溢れています。" },
        { title: "僕のヒーローアカデミア", reason: "無個性の少年が最高のヒーローを目指す成長譚。友情と努力のストーリーに熱い涙が溢れます。" },
        { title: "モブサイコ100", reason: "圧倒的な作画力で描かれる超能力バトルと青春。主人公の内面的成長に胸が熱くなります。" },
        { title: "ダンダダン", reason: "怪異と宇宙人が交錯する超ハイテンションバトル＆甘酸っぱい青春オカルティックコメディ！" },
        { title: "怪獣8号", reason: "30代男の泥臭い夢への再挑戦！重厚な防衛隊装備とド派手な怪獣バトルの爽快感が最高です。" },
      ]
    },
    tear: {
      typeName: "深遠なる感情共鳴＆感動ドラマ探求者",
      typeDescription: "登場人物の繊細な心理描写や、胸を打つ絆の物語を追うエモーショナルな作品を求めるタイプです。あたたかい奇跡や切なくも美しい余韻に浸る時間を大切にしています。",
      keyTraits: ["#涙腺崩壊", "#エモさ抜群", "#人間ドラマ", "#深い余韻"],
      candidates: [
        { title: "葬送のフリーレン", reason: "旅路の中で芽生える人々との思い出。静かで優しく、美しい感動があなたの心に深く刻まれます。" },
        { title: "ヴァイオレット・エヴァーガーデン", reason: "「愛してる」の意味を探す手紙代筆の旅。毎話圧倒的な映像美と奇跡のようなストーリーです。" },
        { title: "聲の形", reason: "すれ違いと心の結びつき。人と人との誠実な向き合いを描いた傑作ドラマがあなたの優しさに響きます。" },
        { title: "あの日見た花の名前を僕達はまだ知らない。", reason: "幼馴染たちの葛藤と止まっていた時間の再生。ラストシーンの感動は一生忘れません。" },
        { title: "四月は君の嘘", reason: "モノクロだった世界がカラフルに色づく青春音楽ドラマ。切なくも美しい愛の物語です。" },
        { title: "CLANNAD", reason: "家族と人と町を描き切った感動の最高峰。人生観すら変えてしまうほどの深い余韻が残ります。" },
      ]
    },
    mystery: {
      typeName: "頭脳派伏線分析＆緻密サスペンス知略家",
      typeDescription: "張り巡らされた伏線や、高度な心理戦・頭脳戦を読み解くのが大好きなタイプです。物語の裏に隠された真実が明かされる瞬間の快感を求めています。",
      keyTraits: ["#伏線回収神", "#頭脳戦", "#予測不能", "#サスペンス"],
      candidates: [
        { title: "シュタインズ・ゲート", reason: "時間跳躍を巡る完璧な伏線回収と怒涛のクライマックス。知的好奇心が極限まで満たされます。" },
        { title: "約束のネバーランド", reason: "脱獄を掛けた極限のIQ頭脳戦。1話目から一気に物語に引き込まれるサスペンスの傑作です。" },
        { title: "薬屋のひとりごと", reason: "宮廷の事件を薬と毒の知識で解き明かす爽快ミステリー。猫猫のクールで賢い魅力にハマります。" },
        { title: "サマータイムレンダ", reason: "離島を舞台にしたタイムリープ＆絶望的サスペンス。最後まで先の読めないスリルがあります。" },
        { title: "デスノート", reason: "天才VS名探偵の心理バトル。極限の緊張感と一歩も譲らない駆け引きが最高にスリリングです。" },
        { title: "MONSTER", reason: "重厚で冷酷な心理ミステリー。本格サスペンスをじっくり味わいたい方に一押しです。" },
      ]
    },
    sliceOfLife: {
      typeName: "極上の癒やし＆穏やかな日常ヒーリングマスター",
      typeDescription: "日々の疲れを忘れさせてくれる、温かく穏やかな日常系アニメを愛するタイプです。くすっと笑える会話劇やのんびりした空気に最高の心地よさを感じます。",
      keyTraits: ["#ストレスゼロ", "#のんびり日常", "#最高の癒やし", "#自然体"],
      candidates: [
        { title: "ゆるキャン△", reason: "美味しいキャンプ飯と美しい自然風景。観るだけで心がふわっとほぐれる至福のヒーリング時間です。" },
        { title: "ぼっち・ざ・ろっく！", reason: "人見知り少女の成長と本格ロック。クスッと笑えて元気をもらえる最高の青春コメディです。" },
        { title: "SPY×FAMILY", reason: "仮初めの家族が紡ぐハートフルホームコメディ。アーニャの可愛さとテンポの良さに癒やされます。" },
        { title: "その着せ替え人形は恋をする", reason: "コスプレを通じて一生懸命に打ち込むふたり。爽やかで笑顔になれるピュアな日常です。" },
        { title: "のんのんびより", reason: "のどかな田舎で過ごす少女たちの日常。穏やかな時間の流れと美しい季節の描写に癒やされます。" },
        { title: "日常", reason: "シュールでポップな独特のギャグセンス！頭を空っぽにして笑いたい時におすすめです。" },
      ]
    },
    sciFi: {
      typeName: "近未来サイバー＆時空超越SFロマンチスト",
      typeDescription: "壮大な宇宙、人工知能、タイムトラベルなど、最先端の科学思想や哲学的テーマを含む世界観に強く惹かれるタイプです。没入感あふれる体験を求めています。",
      keyTraits: ["#近未来SF", "#世界観の深さ", "#AIと人間", "#圧倒的没入感"],
      candidates: [
        { title: "サイバーパンク エッジランナーズ", reason: "圧倒的な光と影のナイトシティ。疾走感あふれるアクションと切ない愛のストーリーが刺さります。" },
        { title: "Vivy -Fluorite Eye's Song-", reason: "100年後の未来を救うため歌い続けるAI。美しい映像と圧巻の音楽が融合したSF大作です。" },
        { title: "PSYCHO-PASS サイコパス", reason: "人間の心が数値化される近未来警察機構。正義と社会の歪みを問うシリアスなテーマに引き込まれます。" },
        { title: "86-エイティシックス-", reason: "無人機と偽られた戦場を生き抜く少年少女。極限状態での命の尊さと絆を描くSFミステリー。" },
        { title: "SSSS.GRIDMAN", reason: "特撮ヒーローと青春ミステリーの融合。ダイナミックな戦闘表現と深い世界観が魅力です。" },
      ]
    },
    romance: {
      typeName: "純愛＆トキメキ恋愛エンタメスペシャリスト",
      typeDescription: "甘酸っぱい恋愛模様や、登場人物同士の距離感に胸がキュンとする作品を愛するタイプです。すれ違いを乗り越えて育まれる愛情に幸せを感じます。",
      keyTraits: ["#キュンキュン", "#甘酸っぱい青春", "#恋愛ドラマ", "#胸キュン"],
      candidates: [
        { title: "かぐや様は告らせたい", reason: "天才たちの高度な恋愛頭脳戦！照れ隠しと勘違いが爆笑とトキメキを生む最高のラブコメ。" },
        { title: "ホリミヤ", reason: "ギャップのあるふたりが惹かれ合う甘酸っぱい等身大の高校生活。共感とキュンキュンが満載です。" },
        { title: "僕の心のヤバイやつ", reason: "陰キャ男子と陽キャ美少女の距離が少しずつ縮まる最高峰の純愛劇。繊細な心模様にキュンとします。" },
        { title: "君に届け", reason: "ピュアで一生懸命な気持ちが心に届く不朽の名作ラブストーリー。爽やかな感動に包まれます。" },
        { title: "五等分の花嫁", reason: "個性豊かな五つ子ヒロインと育むかわいさ100%のラブコメディ。推しを選ぶ楽しさも抜群！" },
      ]
    },
    sports: {
      typeName: "熱血青春＆極限スポーツエンターテイナー",
      typeDescription: "仲間とともに高い目標へと挑み、汗と涙を流しながら成長していくスポ根・青春作品が大好きなタイプです。情熱が爆発する瞬間に胸が高鳴ります。",
      keyTraits: ["#激熱の青春", "#部活仲間", "#逆転劇", "#挫折と成長"],
      candidates: [
        { title: "ハイキュー!!", reason: "仲間とボールを繋ぐ排球青春劇！1球に込める熱量とキャラクター全員のドラマに胸が震えます。" },
        { title: "ブルーロック", reason: "世界一のエゴイストストライカーを目指す新感覚サッカーサバイバル！圧倒的な熱気が渦巻きます。" },
        { title: "ピンポン THE ANIMATION", reason: "天才と努力家の生き様がぶつかる卓球劇。独特の演出スタイルと熱い人間模様が芸術的です。" },
        { title: "SLAM DUNK", reason: "バスケにすべてを懸ける高校生たちの不屈のドラマ。世代を超えて愛される王道の熱血スポーツ！" },
        { title: "ダイヤのA", reason: "高校野球の過酷さとエースを目指す少年たちの葛藤。リアルな野球描写と友情が熱いです。" },
      ]
    },
    isekai: {
      typeName: "異世界転生＆壮大冒険ロマンチスト",
      typeDescription: "剣と魔法の世界、チート能力、冒険者ギルドなど、非日常のワクワクが詰まった異世界ファンタジーを求めるタイプです。現実を忘れて夢中になれます。",
      keyTraits: ["#異世界冒険", "#爽快な強さ", "#ファンタジー", "#非日常"],
      candidates: [
        { title: "転生したらスライムだった件", reason: "弱小スライムから始まる国づくり＆バトル！個性的な仲間たちと築くファンタジー世界が楽しいです。" },
        { title: "Re:ゼロから始める異世界生活", reason: "無力な少年が絶望的な運命を書き換える「死に戻り」抗争劇。圧倒的な熱量と愛の物語です。" },
        { title: "無職転生 ～異世界行ったら本気だす～", reason: "人生をやり直す少年の本格冒険ファンタジー。圧巻の作画と緻密な世界観構築に圧倒されます。" },
        { title: "この素晴らしい世界に祝福を！", reason: "残念な仲間たちと贈る異世界コメディの最高峰！とにかく爆笑したい時におすすめです。" },
        { title: "オーバーロード", reason: "圧倒的な魔王の力で異世界を支配するダークファンタジー。重厚な世界設定と威厳が爽快です。" },
      ]
    }
  };

  const topConfig = PRESETS[topCategory] || PRESETS.action;
  const secondConfig = PRESETS[secondCategory] || PRESETS.sliceOfLife;

  // Helper to shuffle array
  const shuffle = <T>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Sample 4 from primary category, 2 from secondary category
  const primaryPicks = shuffle(topConfig.candidates).slice(0, 4);
  const secondaryPicks = shuffle(secondConfig.candidates.filter(c => !primaryPicks.some(p => p.title === c.title))).slice(0, 2);

  const combinedTitles = shuffle([...primaryPicks, ...secondaryPicks]);

  // Resolve media for recommendations using client-side AniList search
  const recommendationsWithMedia: RecommendedAnime[] = await Promise.all(
    combinedTitles.map(async (item) => {
      const mediaList = await searchAnime({ search: item.title, perPage: 1 });
      return {
        title: item.title,
        reason: item.reason,
        media: mediaList[0] || null,
      };
    })
  );

  return {
    typeName: topConfig.typeName,
    typeDescription: topConfig.typeDescription,
    keyTraits: topConfig.keyTraits,
    recommendations: recommendationsWithMedia,
    createdAt: new Date().toLocaleDateString("ja-JP"),
  };
}
