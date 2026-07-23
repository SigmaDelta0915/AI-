export interface AnimeMedia {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  description?: string;
  coverImage?: {
    extraLarge?: string;
    large?: string;
    medium?: string;
    color?: string;
  };
  bannerImage?: string;
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  episodes?: number;
  genres?: string[];
  averageScore?: number;
  studios?: {
    nodes?: Array<{ name: string }>;
  };
  trailer?: {
    id?: string;
    site?: string;
    thumbnail?: string;
  };
  siteUrl?: string;
}

export interface DiagnosisOption {
  id: string;
  text: string;
  scores: {
    action?: number;
    romance?: number;
    tear?: number; // emotional/sad
    sliceOfLife?: number;
    mystery?: number;
    sciFi?: number;
    isekai?: number;
    sports?: number;
    comedy?: number;
    drama?: number;
    depressive?: number; // dark/depressive/psychological anime
  };
}

export interface DiagnosisQuestion {
  id: number;
  question: string;
  options: DiagnosisOption[];
}

export interface RecommendedAnime {
  title: string;
  reason: string;
  media?: AnimeMedia | null; // Filled by AniList query
}

export interface DiagnosisResult {
  typeName: string;
  typeDescription: string;
  keyTraits: string[];
  recommendations: RecommendedAnime[];
  createdAt: string;
}

export interface DiagnosticHistory {
  id: string;
  result: DiagnosisResult;
  answers: { [questionId: number]: string };
}

export interface AdConfiguration {
  id: string;
  slot: string;
  type: "banner" | "sidebar" | "in-feed";
  title: string;
  description: string;
  linkUrl: string;
  imageUrl: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
}
