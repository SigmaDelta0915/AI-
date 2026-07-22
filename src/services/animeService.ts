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

  const knownFallback = FALLBACK_POPULAR_ANIME.find(
    f => f.id === copy.id || 
         (jpTitle && f.title.native && (jpTitle.includes(f.title.native) || f.title.native.includes(jpTitle))) || 
         (displayTitle && f.title.native && (displayTitle.includes(f.title.native) || f.title.native.includes(displayTitle))) ||
         (copy.title?.english && f.title.english && copy.title.english.toLowerCase().includes(f.title.english.toLowerCase()))
  );

  if (knownFallback && knownFallback.description) {
    copy.description = knownFallback.description;
  } else if (!hasJapaneseChar || desc.length < 10) {
    const genreText = copy.genres && copy.genres.length > 0 ? copy.genres.slice(0, 3).join("・") : "人気";
    copy.description = `『${displayTitle}』は、${genreText}ジャンルを中心に描かれる人気の高いアニメ作品です。魅力的なキャラクターとドラマチックなストーリー展開が大きな話題と高い評価を集めています。`;
  } else {
    copy.description = desc.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").trim();
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

  interface Presets {
    [key: string]: {
      typeName: string;
      typeDescription: string;
      keyTraits: string[];
      animeTitles: Array<{ title: string; reason: string }>;
    };
  }

  const PRESETS: Presets = {
    action: {
      typeName: "熱血バトル＆壮大世界観スペシャリスト",
      typeDescription: "圧倒的な作画クオリティと、キャラクターたちの熱き信念が激突するストーリーを心から愛するタイプです。危機を乗り越えて成長する友情や絶望からの逆転劇に強い感動を覚えます。",
      keyTraits: ["#作画神回好き", "#熱いバトル", "#圧倒的スケール", "#信念の激突"],
      animeTitles: [
        { title: "進撃の巨人", reason: "予測不能な伏線回収と圧倒的なバトルシーンの連続が、あなたの求める緊張感と熱量を100%満たします。" },
        { title: "鬼滅の刃", reason: "家族を守る熱い想いと美しい剣戟アニメーションが、あなたの心を震わせます。" },
        { title: "呪術廻戦", reason: "スピーディーかつスタイリッシュなアクションと、魅力的なキャラクターたちの戦闘センスが刺さります。" },
        { title: "僕のヒーローアカデミア", reason: "無個性の主人公が最高のヒーローを目指す成長譚。友情と努力のドラマに胸が熱くなります。" },
      ]
    },
    tear: {
      typeName: "深遠なる感情共鳴＆感動ドラマ探求者",
      typeDescription: "登場人物の揺れ動く繊細な心情や、生きた証を丁寧に追うエモーショナルな作品を求めるタイプです。涙腺を刺激される温かい奇跡や、切ない余韻に浸る時間を大切にしています。",
      keyTraits: ["#涙腺崩壊", "#エモさ抜群", "#人間ドラマ", "#深い余韻"],
      animeTitles: [
        { title: "葬送のフリーレン", reason: "長寿のエルフレベルの視点から描かれる旅路と人々の記憶。静かで美しい感動があなたの心に深く刻まれます。" },
        { title: "ヴァイオレット・エヴァーガーデン", reason: "「愛してる」の意味を知る手紙代筆の旅。毎話圧倒的な映像美と涙なしには見られない物語です。" },
        { title: "聲の形", reason: "人と人とのすれ違いと救い。誠実に向き合う人間関係の描写が、あなたの優しさに深く響きます。" },
        { title: "あの日見た花の名前を僕達はまだ知らない。", reason: "幼馴染たちの葛藤と友情の再生。最高のラストシーンに深い共感が生まれます。" },
      ]
    },
    mystery: {
      typeName: "頭脳派伏線分析＆緻密サスペンス知略家",
      typeDescription: "張り巡らされた伏線や、登場人物たちの高度な心理戦・頭脳戦を観るのが大好きなタイプです。物語の裏に隠された真実が解き明かされる瞬間の快感がたまりません。",
      keyTraits: ["#伏線回収神", "#頭脳戦", "#予測不能", "#濃密な設定"],
      animeTitles: [
        { title: "シュタインズ・ゲート", reason: "時間跳躍を巡る完璧な伏線回収と怒涛のクライマックス。知的好奇心が最も満たされる傑作です。" },
        { title: "約束のネバーランド", reason: "圧倒的IQの高さで繰り広げられる脱獄頭脳戦。1話目からの怒涛の展開に引き込まれます。" },
        { title: "薬屋のひとりごと", reason: "宮廷の謎を毒と薬の知識で解き明かす爽快ミステリー。主人公のクールで賢い魅力にハマります。" },
        { title: "デスノート", reason: "新世界の神を目指す天才と名探偵の究極の心理戦。1秒も目が離せない緊迫感があります。" },
      ]
    },
    sliceOfLife: {
      typeName: "極上の癒やし＆穏やかな日常ヒーリングマスター",
      typeDescription: "日々の疲れを忘れさせてくれる、温かく穏やかな日常アニメを愛するタイプです。キャラクターたちのクスッと笑える会話や、のんびりとした空気感に心地よい癒やしを感じます。",
      keyTraits: ["#ストレスゼロ", "#のんびり日常", "#最高の癒やし", "#自然体"],
      animeTitles: [
        { title: "ゆるキャン△", reason: "美味しいキャンプ飯と美しいソロキャン風景。観るだけで心がほっとほぐれる極上の癒やしです。" },
        { title: "ぼっち・ざ・ろっく！", reason: "陰キャ少女の青春と本格派バンド音楽。笑えて共感できて元気をもらえる傑作コメディです。" },
        { title: "SPY×FAMILY", reason: "仮初めの家族が織りなすハートフルコメディ。アーニャの可愛らしさと軽快なテンポに癒やされます。" },
        { title: "その着せ替え人形は恋をする", reason: "コスプレを通じて惹かれ合うピュアで一生懸命な日常。爽やかな笑顔になれる作品です。" },
      ]
    },
    sciFi: {
      typeName: "近未来サイバー＆時空超越SFロマンチスト",
      typeDescription: "壮大な宇宙世界、人工知能、タイムトラベルなど、最先端の科学思想や哲学的問いかけを含む作品に強く惹かれるタイプです。現実を超えた没入感を求めています。",
      keyTraits: ["#近未来SF", "#世界観の深さ", "#AIと人間", "#圧倒的没入感"],
      animeTitles: [
        { title: "サイバーパンク エッジランナーズ", reason: "ナイトシティの圧倒的な光と影。疾走感あふれるアクションと切ない愛のドラマが刺さります。" },
        { title: "Vivy -Fluorite Eye's Song-", reason: "AIが100年後の破滅を回避するために歌い続けるSF旅路。映像美と音楽の融合が至高です。" },
        { title: "SSSS.GRIDMAN", reason: "特撮ヒーローと青春ミステリーの融合。エモーショナルな世界観とダイナミックな戦闘が最高です。" },
        { title: "PSYCHO-PASS サイコパス", reason: "人間の心が数値化される近未来警察機構。正義と犯罪を巡る深遠なテーマに引き込まれます。" },
      ]
    }
  };

  const preset = PRESETS[topCategory] || PRESETS.action;

  // Resolve media for recommendations using client-side AniList search
  const recommendationsWithMedia: RecommendedAnime[] = await Promise.all(
    preset.animeTitles.map(async (item) => {
      const mediaList = await searchAnime({ search: item.title, perPage: 1 });
      return {
        title: item.title,
        reason: item.reason,
        media: mediaList[0] || null,
      };
    })
  );

  return {
    typeName: preset.typeName,
    typeDescription: preset.typeDescription,
    keyTraits: preset.keyTraits,
    recommendations: recommendationsWithMedia,
    createdAt: new Date().toLocaleDateString("ja-JP"),
  };
}
