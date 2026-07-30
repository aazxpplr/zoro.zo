const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://your-hianime-api.vercel.app";

export interface Anime {
  id: string;
  name: string;
  jname?: string;
  poster: string;
  duration?: string;
  type?: string;
  rating?: string;
  episodes?: { sub?: number; dub?: number };
  description?: string;
}

export interface HomeData {
  success: boolean;
  data: {
    spotlightAnimes?: Anime[];
    trendingAnimes?: Anime[];
    latestEpisodeAnimes?: Anime[];
    topUpcomingAnimes?: Anime[];
    top10Animes?: {
      today?: Anime[];
      week?: Anime[];
      month?: Anime[];
    };
    topAiringAnimes?: Anime[];
    mostPopularAnimes?: Anime[];
    mostFavoriteAnimes?: Anime[];
    latestCompletedAnimes?: Anime[];
    genres?: string[];
  };
}

export interface AnimeInfo {
  success: boolean;
  data: {
    anime: {
      info: {
        id: string;
        anilistId?: number;
        malId?: number;
        name: string;
        poster: string;
        description: string;
        stats: {
          rating?: string;
          quality?: string;
          episodes?: { sub?: number; dub?: number };
          type?: string;
          duration?: string;
        };
        promotionalVideos?: { title?: string; source?: string; thumbnail?: string }[];
        characterVoiceActor?: { character?: { id?: string; poster?: string; name?: string; cast?: string } }[];
      };
      moreInfo: Record<string, string>;
    };
    seasons?: { id: string; name: string; title: string; poster: string; isCurrent: boolean }[];
    mostPopularAnimes?: Anime[];
    recommendedAnimes?: Anime[];
    relatedAnimes?: Anime[];
  };
}

export interface Episode {
  title: string;
  episodeId: string;
  number: number;
  isFiller: boolean;
}

export interface EpisodesData {
  success: boolean;
  data: {
    totalEpisodes: number;
    episodes: Episode[];
  };
}

export interface StreamSource {
  success: boolean;
  data: {
    sources: { url: string; type: string }[];
    tracks?: { file: string; label?: string; kind?: string; default?: boolean }[];
    intro?: { start: number; end: number };
    outro?: { start: number; end: number };
    anilistID?: number;
    malID?: number;
  };
}

export interface SearchResult {
  success: boolean;
  data: {
    animes: Anime[];
    mostPopularAnimes?: Anime[];
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
    searchQuery?: string;
    searchFilters?: Record<string, unknown>;
  };
}

async function fetcher<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getHome(): Promise<HomeData> {
  return fetcher<HomeData>("/api/v2/hianime/home");
}

export async function getAnimeInfo(id: string): Promise<AnimeInfo> {
  return fetcher<AnimeInfo>(`/api/v2/hianime/anime/${encodeURIComponent(id)}`);
}

export async function getEpisodes(id: string): Promise<EpisodesData> {
  return fetcher<EpisodesData>(`/api/v2/hianime/anime/${encodeURIComponent(id)}/episodes`);
}

export async function searchAnime(query: string, page = 1): Promise<SearchResult> {
  return fetcher<SearchResult>(
    `/api/v2/hianime/search?q=${encodeURIComponent(query)}&page=${page}`
  );
}

export async function getStreamSources(
  episodeId: string,
  server = "vidstreaming",
  category = "sub"
): Promise<StreamSource> {
  return fetcher<StreamSource>(
    `/api/v2/hianime/episode/sources?animeEpisodeId=${encodeURIComponent(episodeId)}&server=${server}&category=${category}`
  );
}
