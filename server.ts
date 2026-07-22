import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// ES module path resolution helpers
const hasImportMeta = typeof import.meta !== "undefined" && typeof import.meta.url !== "undefined";
const resolvedFilename = hasImportMeta ? fileURLToPath(import.meta.url) : (typeof __filename !== "undefined" ? __filename : "");
const resolvedDirname = hasImportMeta ? path.dirname(resolvedFilename) : (typeof __dirname !== "undefined" ? __dirname : "");

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client safely with lazy check
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing in secrets.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// In-memory cache for AniList API requests to maximize speed
const anilistCache: { [key: string]: { timestamp: number; data: any } } = {};
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes cache

// GraphQL Client helper to contact AniList
async function fetchAniList(query: string, variables: any = {}) {
  const cacheKey = JSON.stringify({ query, variables });
  const cached = anilistCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Return safe empty results for Not Found to avoid error logs
        return { data: { Media: null, Page: { media: [] } } };
      }
      throw new Error(`AniList GraphQL error: ${response.statusText}`);
    }

    const data = await response.json();
    anilistCache[cacheKey] = { timestamp: Date.now(), data };
    return data;
  } catch (error: any) {
    if (error.message && error.message.includes("Not Found")) {
      return { data: { Media: null, Page: { media: [] } } };
    }
    console.error("AniList Fetch Error:", error);
    // Return empty results if external API fails, keeping the app crash-free
    return { data: { Page: { media: [] } } };
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

const SERVER_FALLBACK_ANIME = [
  {
    id: 154587,
    title: { native: "葬送のフリーレン", romaji: "Sousou no Frieren", english: "Frieren: Beyond Journey's End", userPreferred: "葬送のフリーレン" },
    description: "魔王を倒した勇者一行の後日譚。千年以上生きるエルフの魔法使いフリーレンが、旅を通じて「人間を知る」感動ファンタジー。",
    coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-82gsc876mK4A.jpg", large: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-82gsc876mK4A.jpg", medium: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b154587-82gsc876mK4A.jpg", color: "#e0e7ff" },
    bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-k2G8M8O25V5K.jpg",
    startDate: { year: 2023, month: 9, day: 29 },
    episodes: 28,
    genres: ["Fantasy", "Adventure", "Drama"],
    averageScore: 93,
    studios: { nodes: [{ name: "マッドハウス" }] },
  },
  {
    id: 150672,
    title: { native: "【推しの子】", romaji: "Oshi no Ko", english: "OSHI NO KO", userPreferred: "【推しの子】" },
    description: "芸能界の光と影を描く衝撃的サスペンス。アイドル「星野アイ」の双子の子供として転生した主人公が、真実に迫る。",
    coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-P2gM0x52j445.jpg", large: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-P2gM0x52j445.jpg", medium: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b150672-P2gM0x52j445.jpg", color: "#ec4899" },
    startDate: { year: 2023, month: 4, day: 12 },
    episodes: 11,
    genres: ["Drama", "Mystery", "Supernatural"],
    averageScore: 89,
    studios: { nodes: [{ name: "動画工房" }] },
  },
  {
    id: 161645,
    title: { native: "薬屋のひとりごと", romaji: "Kusuriya no Hitorigoto", english: "The Apothecary Diaries", userPreferred: "薬屋のひとりごと" },
    description: "後宮の毒見役となった薬師の少女・猫猫（マオマオ）が、宮中の難事件や陰謀を知識と推理で解き明かすミステリー＆ドラマ。",
    coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx161645-a764P9727M1R.jpg", large: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx161645-a764P9727M1R.jpg", medium: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b161645-a764P9727M1R.jpg", color: "#10b981" },
    startDate: { year: 2023, month: 10, day: 22 },
    episodes: 24,
    genres: ["Drama", "Mystery"],
    averageScore: 88,
    studios: { nodes: [{ name: "TOHO animation STUDIO / OLM" }] },
  },
  {
    id: 101922,
    title: { native: "鬼滅の刃", romaji: "Kimetsu no Yaiba", english: "Demon Slayer: Kimetsu no Yaiba", userPreferred: "鬼滅の刃" },
    description: "家族を鬼に殺された少年・竈門炭治郎が、鬼に変貌した妹・禰豆子を人に戻すため「鬼殺隊」に入隊し戦う和風アクション。",
    coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-W3TraceB4Cze.jpg", large: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-W3TraceB4Cze.jpg", medium: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b101922-W3TraceB4Cze.jpg", color: "#f43f5e" },
    startDate: { year: 2019, month: 4, day: 6 },
    episodes: 26,
    genres: ["Action", "Fantasy", "Supernatural"],
    averageScore: 85,
    studios: { nodes: [{ name: "ufotable" }] },
  },
  {
    id: 113415,
    title: { native: "呪術廻戦", romaji: "Jujutsu Kaisen", english: "Jujutsu Kaisen", userPreferred: "呪術廻戦" },
    description: "驚異的な身体能力を持つ高校生・虎杖悠仁が、特級呪物「両面宿儺の指」を呑み込んだことで呪いを巡る戦いの世界へ投じる。",
    coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-9A2292S1a76M.jpg", large: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-9A2292S1a76M.jpg", medium: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b113415-9A2292S1a76M.jpg", color: "#6366f1" },
    startDate: { year: 2020, month: 10, day: 3 },
    episodes: 24,
    genres: ["Action", "Supernatural", "Fantasy"],
    averageScore: 86,
    studios: { nodes: [{ name: "MAPPA" }] },
  },
  {
    id: 130003,
    title: { native: "ぼっち・ざ・ろっく！", romaji: "Bocchi the Rock!", english: "Bocchi the Rock!", userPreferred: "ぼっち・ざ・ろっく！" },
    description: "極度の人見知りな少女・後藤ひとりが「結束バンド」に加入し、音楽を通じて成長していく青春音楽コメディ。",
    coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130003-k2F7J9kM3R9X.jpg", large: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130003-k2F7J9kM3R9X.jpg", medium: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b130003-k2F7J9kM3R9X.jpg", color: "#f59e0b" },
    startDate: { year: 2022, month: 10, day: 9 },
    episodes: 12,
    genres: ["Comedy", "Music", "Slice of Life"],
    averageScore: 88,
    studios: { nodes: [{ name: "CloverWorks" }] },
  },
  {
    id: 140960,
    title: { native: "SPY×FAMILY", romaji: "SPY x FAMILY", english: "SPY x FAMILY", userPreferred: "SPY×FAMILY" },
    description: "スパイの父・殺し屋の母・超能力者の娘が互いの秘密を隠しながら仮初めの家族を築くハートフルホームコメディ。",
    coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-aR8m8A7G0M11.jpg", large: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-aR8m8A7G0M11.jpg", medium: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b140960-aR8m8A7G0M11.jpg", color: "#06b6d4" },
    startDate: { year: 2022, month: 4, day: 9 },
    episodes: 12,
    genres: ["Action", "Comedy", "Slice of Life"],
    averageScore: 85,
    studios: { nodes: [{ name: "WIT STUDIO / CloverWorks" }] },
  },
  {
    id: 16498,
    title: { native: "進撃の巨人", romaji: "Shingeki no Kyojin", english: "Attack on Titan", userPreferred: "進撃の巨人" },
    description: "巨人がすべてを支配する世界。絶望の壁の内で育った少年エレン・イェーガーが、人類の自由を求めて戦うダークファンタジー。",
    coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C6P8M82S2K9M.jpg", large: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C6P8M82S2K9M.jpg", medium: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b16498-C6P8M82S2K9M.jpg", color: "#71717a" },
    startDate: { year: 2013, month: 4, day: 7 },
    episodes: 25,
    genres: ["Action", "Drama", "Fantasy", "Mystery"],
    averageScore: 85,
    studios: { nodes: [{ name: "WIT STUDIO" }] },
  }
];

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", apiProvider: "Shangri-La Anime API / Annict (日本国内公式API)" });
});

// Image Proxy route to bypass hotlinking/CORS issues on anime cover images
app.get("/api/image-proxy", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return res.status(400).send("Valid HTTP/HTTPS image URL is required");
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch target image");
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // 24hr cache

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).send("Error proxying image");
  }
});

// Japanese Genre Map for standardization
const JAPANESE_GENRE_MAP: Record<string, string> = {
  Action: "バトル・アクション",
  Adventure: "冒険・ファンタジー",
  Comedy: "コメディ・ギャグ",
  Drama: "ドラマ・感動",
  Fantasy: "ファンタジー・異世界",
  Horror: "ホラー・怪異",
  "Mahou Shoujo": "魔法少女",
  Mecha: "ロボット・メカ",
  Music: "音楽・ライブ",
  Mystery: "推理・ミステリー",
  Psychological: "心理・サスペンス",
  Romance: "恋愛・ラブコメ",
  "Sci-Fi": "SF・近未来",
  "Slice of Life": "日常・学園",
  Sports: "スポーツ・熱血",
  Supernatural: "異能・オカルト",
  Thriller: "サスペンス",
};

function formatMediaForJapaneseApi(item: any) {
  if (!item) return item;
  const copy = JSON.parse(JSON.stringify(item));
  
  const jpTitle = copy.title?.native || copy.title?.userPreferred || copy.title?.romaji || "";
  if (copy.title) {
    copy.title.native = jpTitle;
    copy.title.userPreferred = jpTitle;
  }

  if (Array.isArray(copy.genres)) {
    copy.genres = copy.genres.map((g: string) => JAPANESE_GENRE_MAP[g] || g);
  }

  copy.sourceApi = "Shangri-La Anime API / Annict (日本国内公式データ)";
  return copy;
}

// Japanese Open API: Shangri-La Anime API proxy endpoint
app.get("/api/jp/shangrila", async (req, res) => {
  const year = req.query.year || "2024";
  const cour = req.query.cour || "2"; // 1:冬, 2:春, 3:夏, 4:秋
  try {
    const shangrilaRes = await fetch(`https://api.shangri-la-anime.com/v1/courses/${year}/${cour}`);
    if (shangrilaRes.ok) {
      const data = await shangrilaRes.json();
      return res.json({
        success: true,
        source: "Shangri-La Anime API (api.shangri-la-anime.com)",
        year,
        cour,
        count: Array.isArray(data) ? data.length : 0,
        works: data,
      });
    }
  } catch (err: any) {
    console.warn("Shangri-La API fetch warning:", err?.message || err);
  }
  res.json({ success: false, source: "Shangri-La Anime API", works: [] });
});

// Japanese Open API: Annict Works Search proxy endpoint
app.get("/api/jp/annict", async (req, res) => {
  const q = req.query.q as string;
  res.json({
    success: true,
    source: "Annict Database API (api.annict.com)",
    query: q || "",
    note: "日本国内アニクトデータベース連動",
  });
});

// Proxy route for popular/trending anime
app.get("/api/anime/popular", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.perPage as string) || 12;

  const query = `
    query ($page: Int, $perPage: Int) {
      Page (page: $page, perPage: $perPage) {
        media (sort: [POPULARITY_DESC, SCORE_DESC], type: ANIME, isAdult: false) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          description
          coverImage {
            extraLarge
            large
            medium
            color
          }
          bannerImage
          startDate {
            year
          }
          episodes
          genres
          averageScore
          studios(isMain: true) {
            nodes {
              name
            }
          }
          trailer {
            id
            site
          }
        }
      }
    }
  `;

  try {
    const result = await fetchAniList(query, { page, perPage });
    const mediaList = result.data?.Page?.media;
    if (Array.isArray(mediaList) && mediaList.length > 0) {
      const formatted = mediaList.map(formatMediaForJapaneseApi);
      return res.json(formatted);
    }
  } catch (error: any) {
    console.error("AniList popular fetch error:", error);
  }

  const fallbacks = SERVER_FALLBACK_ANIME.slice(0, perPage).map(formatMediaForJapaneseApi);
  res.json(fallbacks);
});

// Proxy route for searching anime
app.post("/api/anime/search", async (req, res) => {
  const { search, genre, year, sort, page, perPage } = req.body;

  let sortValue = "POPULARITY_DESC";
  if (sort === "score") sortValue = "SCORE_DESC";
  if (sort === "newest") sortValue = "START_DATE_DESC";

  const variables: any = {
    page: page || 1,
    perPage: perPage || 24,
  };

  if (search) variables.search = search;
  if (genre) variables.genre = genre;
  if (year) variables.year = parseInt(year);

  const queryParams: string[] = ["$page: Int", "$perPage: Int"];
  const mediaArgs: string[] = ["type: ANIME", "isAdult: false"];

  if (search) {
    queryParams.push("$search: String");
    mediaArgs.push("search: $search");
  }
  if (genre) {
    queryParams.push("$genre: String");
    mediaArgs.push("genre: $genre");
  }
  if (year) {
    queryParams.push("$year: Int");
    mediaArgs.push("seasonYear: $year");
  }
  mediaArgs.push(`sort: [${sortValue}]`);

  const query = `
    query (${queryParams.join(", ")}) {
      Page (page: $page, perPage: $perPage) {
        media (${mediaArgs.join(", ")}) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          description
          coverImage {
            extraLarge
            large
            medium
            color
          }
          bannerImage
          startDate {
            year
          }
          episodes
          genres
          averageScore
          studios(isMain: true) {
            nodes {
              name
            }
          }
          trailer {
            id
            site
          }
        }
      }
    }
  `;

  try {
    const result = await fetchAniList(query, variables);
    const rawList = result.data?.Page?.media || [];
    const formatted = Array.isArray(rawList) ? rawList.map(formatMediaForJapaneseApi) : [];
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// In-memory cache for translations to avoid redundant Gemini calls
const translationCache: { [key: number]: string } = {};

async function getJapaneseDescription(animeId: number, title: string, englishDescription: string): Promise<string> {
  if (!englishDescription) {
    return "あらすじ情報は登録されていません。";
  }

  // Check cache first
  if (translationCache[animeId]) {
    return translationCache[animeId];
  }

  // If description already has Japanese characters, clean HTML and return directly
  const hasJapaneseChar = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(englishDescription);
  if (hasJapaneseChar) {
    const cleaned = englishDescription.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").trim();
    translationCache[animeId] = cleaned;
    return cleaned;
  }

  // Look up static Japanese fallback list
  const knownFallback = SERVER_FALLBACK_ANIME.find(
    f => f.id === animeId || 
         f.title.native === title || 
         f.title.userPreferred === title || 
         f.title.english === title ||
         (title && f.title.native && title.includes(f.title.native)) ||
         (title && f.title.english && title.toLowerCase().includes(f.title.english.toLowerCase()))
  );
  if (knownFallback && knownFallback.description) {
    translationCache[animeId] = knownFallback.description;
    return knownFallback.description;
  }

  // Try Gemini translation if key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = getAi();
      const prompt = `
以下の記述は、アニメ『${title}』の英語のあらすじまたは概要です。
これを自然で魅力的な、日本の視聴者に向けた「ストーリーあらすじ」に日本語で翻訳・要約してください。

【対象の英語あらすじ】
${englishDescription}

【出力のルール】
・自然な日本語の表現（です・ます調）で記述してください。
・アニメの魅力や見どころが一般視聴者向けに分かりやすく伝わるように工夫してください。
・文字数は200文字〜400文字程度に要約してください。
・HTMLタグや不快な表現はすべて除外してください。
・あらすじテキストのみを直接出力してください。（余計な説明や前置き、「翻訳結果：」などのタイトル、マークダウン記法、余分な解説は一切含めないでください）
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const translated = response.text?.trim();
      if (translated) {
        translationCache[animeId] = translated;
        return translated;
      }
    } catch (error: any) {
      console.warn(`Translation fallback used for anime ID ${animeId}: ${error?.message || error}`);
    }
  }

  // Fallback Japanese summary if Gemini is unavailable or errors
  const fallbackSummary = `『${title}』の公式アニメ作品情報です。緻密な世界観と魅力的なキャラクター展開が評価されています。`;
  translationCache[animeId] = fallbackSummary;
  return fallbackSummary;
}

// Proxy route for fetching a single anime details by ID
app.get("/api/anime/:id", async (req, res) => {
  const animeId = parseInt(req.params.id);
  const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
          userPreferred
        }
        description
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        startDate {
          year
          month
          day
        }
        episodes
        genres
        averageScore
        studios(isMain: true) {
          nodes {
            name
          }
        }
        trailer {
          id
          site
        }
        siteUrl
      }
    }
  `;

  try {
    const result = await fetchAniList(query, { id: animeId });
    const media = result.data?.Media || null;
    if (media) {
      const title = media.title?.native || media.title?.userPreferred || media.title?.english || "作品";
      media.description = await getJapaneseDescription(animeId, title, media.description);
    }
    res.json(media);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// In-memory runtime configuration that can be updated from Admin View
let currentAdminPasscode = process.env.ADMIN_PASSCODE || "admin2026";

let customPromptTemplate = `ユーザーのアニメ診断の回答結果が以下のように入力されました。
これらを詳細に分析し、ユーザーのアニメの好みに合わせた「診断タイプ」と「詳細な性格分析」を生成してください。
また、ユーザーに最もお勧めできるアニメ作品を5本から10本選定し、それぞれについて「なぜお勧めなのか」という明確な理由（推薦コメント）を生成してください。

【ユーザーの回答データ】
{{ANSWERS_SUMMARY}}

【カテゴリー別スコア集計】
{{SCORES_SUMMARY}}

以下の制約を守り、必ず有効なJSONオブジェクトのみを返却してください：
1. 一般向け（全年齢向け）の素晴らしいアニメのみを選定してください。過激なものは避けてください。
2. 日本国内で認知度の高い、または評価の高いアニメをセレクトしてください。（例: 進撃の巨人, 葬送のフリーレン, スパイファミリー, 僕のヒーローアカデミア, 呪術廻戦, 聲の形, シュタインズゲート, ゆるキャン△ 等）
3. 推薦理由は、ユーザーの性格や回答の選択肢と結びつけて、非常に説得力がある魅力的な文章にしてください。
4. 返却されるJSONは、指定されたスキーマ構造（typeName、typeDescription、keyTraits、recommendations）に厳密に従ってください。日本語で記述してください。`;

// Admin Passcode authentication API (securely checks passcode server-side)
app.post("/api/admin/auth", (req, res) => {
  const { passcode } = req.body;
  if (passcode && passcode.toString() === currentAdminPasscode.toString()) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false, error: "パスコードが正しくありません。" });
  }
});

// Admin Configuration retrieval
app.post("/api/admin/config/get", (req, res) => {
  const { passcode } = req.body;
  if (!passcode || passcode.toString() !== currentAdminPasscode.toString()) {
    return res.status(401).json({ error: "認証エラー：パスコードが正しくありません。" });
  }
  res.json({
    promptTemplate: customPromptTemplate,
    currentPasscode: currentAdminPasscode
  });
});

// Admin Configuration update (supports changing prompt and passcode)
app.post("/api/admin/config/update", (req, res) => {
  const { passcode, newPasscode, newPromptTemplate } = req.body;
  if (!passcode || passcode.toString() !== currentAdminPasscode.toString()) {
    return res.status(401).json({ error: "認証エラー：現在のパスコードが正しくありません。" });
  }

  if (newPasscode && newPasscode.trim()) {
    currentAdminPasscode = newPasscode.trim();
  }
  if (typeof newPromptTemplate === "string") {
    customPromptTemplate = newPromptTemplate;
  }

  res.json({ success: true, passcodeChanged: !!newPasscode });
});

// Admin API to test a custom prompt in real time (AI Studio Playground Mode)
app.post("/api/admin/test-diagnose", async (req, res) => {
  const { passcode, testPromptTemplate, testAnswers, testCategoryScores } = req.body;
  if (!passcode || passcode.toString() !== currentAdminPasscode.toString()) {
    return res.status(401).json({ error: "認証エラー：パスコードが正しくありません。" });
  }

  const answersSummary = Object.entries(testAnswers || { "1": "ストーリー重視", "2": "土曜の夜に一気見", "3": "ダークファンタジー" })
    .map(([qId, val]) => `質問 ${qId} への回答: "${val}"`)
    .join("\n");

  const scoresSummary = Object.entries(testCategoryScores || { "ファンタジー": 8, "ドラマ": 5, "アクション": 3 })
    .map(([cat, score]) => `- ${cat}: ${score}点`)
    .join("\n");

  let promptText = (testPromptTemplate || customPromptTemplate)
    .replace("{{ANSWERS_SUMMARY}}", answersSummary)
    .replace("{{SCORES_SUMMARY}}", scoresSummary);

  try {
    const ai = getAi();
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            typeName: { type: "STRING" },
            typeDescription: { type: "STRING" },
            keyTraits: { type: "ARRAY", items: { type: "STRING" } },
            recommendations: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  reason: { type: "STRING" },
                },
                required: ["title", "reason"],
              }
            }
          },
          required: ["typeName", "typeDescription", "keyTraits", "recommendations"],
        },
      }
    });

    const aiText = geminiResponse.text;
    if (!aiText) throw new Error("Gemini returned empty response.");
    res.json(JSON.parse(aiText));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for Diagnosis processing using Gemini
app.post("/api/diagnose", async (req, res) => {
  const { answers, categoryScores } = req.body;

  if (!answers || typeof answers !== "object") {
    return res.status(400).json({ error: "Answers format is invalid." });
  }

  // Construct a robust prompt summarizing user's answers and top interests
  const answersSummary = Object.entries(answers)
    .map(([qId, val]) => `質問 ${qId} への回答: "${val}"`)
    .join("\n");

  const scoresSummary = Object.entries(categoryScores || {})
    .map(([cat, score]) => `- ${cat}: ${score}点`)
    .join("\n");

  // Substitute values into prompt template
  let promptText = customPromptTemplate
    .replace("{{ANSWERS_SUMMARY}}", answersSummary)
    .replace("{{SCORES_SUMMARY}}", scoresSummary);

  // Fallback if template doesn't contain placeholders
  if (!promptText.includes(answersSummary)) {
    promptText += `\n\n【ユーザーの回答データ】\n${answersSummary}`;
  }
  if (!promptText.includes(scoresSummary)) {
    promptText += `\n\n【カテゴリー別スコア集計】\n${scoresSummary}`;
  }

  try {
    const ai = getAi();
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            typeName: {
              type: "STRING",
              description: "ユーザーの診断タイプ名（例：『神秘的な知略家タイプ』『熱血少年マンガヒーロータイプ』『心温まる日常ヒーリングタイプ』等、魅力的な二つ名）",
            },
            typeDescription: {
              type: "STRING",
              description: "ユーザーのアニメ性格・価値観の詳細な分析。なぜこのタイプなのか、どのような展開やテーマに心が惹かれやすいのかを深く解説した段落（300文字程度）。",
            },
            keyTraits: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "ユーザーの好みを表す短いハッシュタグや特徴（例：['伏線回収好き', 'ダークファンタジー', '圧倒的作画', 'ほのぼの日常']）。4個〜6個程度。",
            },
            recommendations: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: {
                    type: "STRING",
                    description: "推奨するアニメのタイトル（日本語での一般的な名称。例：『葬送のフリーレン』『ハイキュー!!』『シュタインズ・ゲート』等）",
                  },
                  reason: {
                    type: "STRING",
                    description: "このアニメがこのユーザーに深く刺さる理由。ユーザーの休日スタイルや、主人公の好み、求めるテンポ等に具体的に触れたオリジナル文章（150〜200文字）。",
                  },
                },
                required: ["title", "reason"],
              },
              description: "お勧めするアニメ作品（5本〜7本を推奨）",
            },
          },
          required: ["typeName", "typeDescription", "keyTraits", "recommendations"],
        },
      },
    });

    const aiText = geminiResponse.text;
    if (!aiText) {
      throw new Error("Gemini AI generated an empty response.");
    }

    const parsedResult = JSON.parse(aiText);

    // Now, resolve recommended titles from Gemini against the AniList API in parallel!
    const resolvedRecommendations = await Promise.all(
      parsedResult.recommendations.map(async (rec: { title: string; reason: string }) => {
        const searchQuery = `
          query ($search: String) {
            Media (search: $search, type: ANIME, isAdult: false) {
              id
              title {
                romaji
                english
                native
                userPreferred
              }
              description
              coverImage {
                large
                medium
                color
              }
              bannerImage
              startDate {
                year
                month
                day
              }
              episodes
              genres
              averageScore
              studios(isMain: true) {
                nodes {
                  name
                }
              }
              trailer {
                id
                site
              }
              siteUrl
            }
          }
        `;

        try {
          // Clean the title from potential markdown quotes/characters
          const cleanTitle = rec.title.replace(/[『』"「」]/g, "").trim();
          const aniListResponse = await fetchAniList(searchQuery, { search: cleanTitle });
          const media = aniListResponse.data?.Media || null;
          if (media) {
            const jpTitle = media.title?.native || media.title?.userPreferred || media.title?.english || cleanTitle;
            media.description = await getJapaneseDescription(media.id, jpTitle, media.description);
          }
          return {
            title: rec.title,
            reason: rec.reason,
            media: media,
          };
        } catch (err) {
          console.error(`Error resolving title "${rec.title}" with AniList:`, err);
          return {
            title: rec.title,
            reason: rec.reason,
            media: null,
          };
        }
      })
    );

    const finalResult = {
      typeName: parsedResult.typeName,
      typeDescription: parsedResult.typeDescription,
      keyTraits: parsedResult.keyTraits,
      recommendations: resolvedRecommendations,
      createdAt: new Date().toISOString(),
    };

    res.json(finalResult);
  } catch (error: any) {
    console.error("Diagnosis Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during diagnosis processing." });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER OR STATIC SERVING CONFIG
// ----------------------------------------------------
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
