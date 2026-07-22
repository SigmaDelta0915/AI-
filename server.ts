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

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
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
    res.json(result.data?.Page?.media || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
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
    res.json(result.data?.Page?.media || []);
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
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const translated = response.text?.trim();
    if (translated) {
      translationCache[animeId] = translated;
      return translated;
    }
  } catch (error) {
    console.error(`Failed to translate description for anime ID ${animeId} using Gemini:`, error);
  }

  // Fallback to stripped english description if translation fails
  return englishDescription.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "");
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
