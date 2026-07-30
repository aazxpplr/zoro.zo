const API_BASE = process.env.ANIME_API_URL || "http://212.147.244.203";

async function apiFetch(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

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

export interface AnimeInfo {
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
    };
    moreInfo: Record<string, string>;
  };
  seasons?: { id: string; name: string; title: string; poster: string; isCurrent: boolean }[];
  mostPopularAnimes?: Anime[];
  recommendedAnimes?: Anime[];
  relatedAnimes?: Anime[];
}

export interface Episode {
  title: string;
  episodeId: string;
  number: number;
  isFiller: boolean;
}

export interface EpisodesData {
  totalEpisodes: number;
  episodes: Episode[];
}

export interface StreamSource {
  sources: { url: string; type: string }[];
  tracks?: { file: string; label?: string; kind?: string; default?: boolean }[];
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
  anilistID?: number;
  malID?: number;
}

export interface SearchResult {
  animes: Anime[];
  mostPopularAnimes?: Anime[];
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractId(raw: string): string {
  if (!raw) return "";
  const match = raw.match(/\/anime\/([^/]+)/);
  if (match) return match[1];
  return raw.replace(/^https?:\/\/[^/]+\//, "").replace(/\/$/, "");
}

function normalizeAnime(item: any): Anime {
  return {
    id: extractId(item.id || item.data_id || ""),
    name: item.name || item.title || "",
    jname: item.jname || item.japanese_title || "",
    poster: item.poster || "",
    duration: item.duration || item.stats?.duration || "",
    type: item.type || item.stats?.type || "",
    rating: item.rating || item.stats?.rating || "",
    episodes: item.episodes || item.stats?.episodes,
    description: item.description || "",
  };
}

export async function getHome() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await apiFetch("/api/home");
  return {
    spotlightAnimes: (data.spotlightAnimes || []).map(normalizeAnime),
    trendingAnimes: (data.trendingAnimes || []).map(normalizeAnime),
    latestEpisodeAnimes: (data.latestEpisodeAnimes || []).map(normalizeAnime),
    topUpcomingAnimes: (data.topUpcomingAnimes || []).map(normalizeAnime),
    top10Animes: {
      today: (data.top10Animes?.today || []).map(normalizeAnime),
      week: (data.top10Animes?.week || []).map(normalizeAnime),
      month: (data.top10Animes?.month || []).map(normalizeAnime),
    },
    topAiringAnimes: (data.topAiringAnimes || []).map(normalizeAnime),
    mostPopularAnimes: (data.mostPopularAnimes || []).map(normalizeAnime),
    mostFavoriteAnimes: (data.mostFavoriteAnimes || []).map(normalizeAnime),
    latestCompletedAnimes: (data.latestCompletedAnimes || []).map(normalizeAnime),
    genres: data.genres || [],
  };
}

export async function getAnimeInfo(id: string): Promise<AnimeInfo> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await apiFetch(`/api/info/${id}`);
  const info = data.anime?.info || {};
  const moreInfo = data.anime?.moreInfo || {};
  return {
    anime: {
      info: {
        id: info.id || id,
        anilistId: info.anilistId,
        malId: info.malId,
        name: info.name || "",
        poster: info.poster || "",
        description: info.description || "",
        stats: info.stats || {},
        promotionalVideos: info.promotionalVideos || [],
      },
      moreInfo,
    },
    seasons: data.seasons || [],
    mostPopularAnimes: (data.mostPopularAnimes || []).map(normalizeAnime),
    recommendedAnimes: (data.recommendedAnimes || []).map(normalizeAnime),
    relatedAnimes: (data.relatedAnimes || []).map(normalizeAnime),
  };
}

export async function getEpisodes(id: string): Promise<EpisodesData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await apiFetch(`/api/episodes/${id}`);
  return {
    totalEpisodes: data.totalEpisodes || data.episodes?.length || 0,
    episodes: (data.episodes || []).map((ep: Episode) => ({
      title: ep.title || "",
      episodeId: ep.episodeId || "",
      number: ep.number || 0,
      isFiller: ep.isFiller || false,
    })),
  };
}

export async function searchAnime(query: string, page = 1): Promise<SearchResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await apiFetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);
  return {
    animes: (data.animes || []).map(normalizeAnime),
    mostPopularAnimes: (data.mostPopularAnimes || []).map(normalizeAnime),
    currentPage: data.currentPage || page,
    hasNextPage: data.hasNextPage ?? false,
    totalPages: data.totalPages || 1,
  };
}

export async function getStreamSources(
  episodeId: string,
  server?: string,
  category?: string
): Promise<StreamSource> {
  const params = new URLSearchParams();
  if (server) params.set("server", server);
  if (category) params.set("category", category);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await apiFetch(`/api/sources/${episodeId}?${params}`);
  return {
    sources: data.sources || [],
    tracks: data.tracks || [],
    intro: data.intro,
    outro: data.outro,
    anilistID: data.anilistID,
    malID: data.malID,
  };
}
