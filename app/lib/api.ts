const INTERNAL_API = "/api/anime";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  const url = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  return url;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAnime(item: any): Anime {
  return {
    id: item.id || item.data_id || "",
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

async function fetchApi(params: string) {
  const base = getBaseUrl();
  const res = await fetch(`${base}${INTERNAL_API}?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getHome() {
  const json = await fetchApi("action=home");
  const d = json.data || {};
  return {
    spotlightAnimes: (d.spotlightAnimes || []).map(normalizeAnime),
    trendingAnimes: (d.trendingAnimes || []).map(normalizeAnime),
    latestEpisodeAnimes: (d.latestEpisodeAnimes || []).map(normalizeAnime),
    topUpcomingAnimes: (d.topUpcomingAnimes || []).map(normalizeAnime),
    top10Animes: {
      today: (d.top10Animes?.today || []).map(normalizeAnime),
      week: (d.top10Animes?.week || []).map(normalizeAnime),
      month: (d.top10Animes?.month || []).map(normalizeAnime),
    },
    topAiringAnimes: (d.topAiringAnimes || []).map(normalizeAnime),
    mostPopularAnimes: (d.mostPopularAnimes || []).map(normalizeAnime),
    mostFavoriteAnimes: (d.mostFavoriteAnimes || []).map(normalizeAnime),
    latestCompletedAnimes: (d.latestCompletedAnimes || []).map(normalizeAnime),
    genres: d.genres || [],
  };
}

export async function getAnimeInfo(id: string): Promise<AnimeInfo> {
  const json = await fetchApi(`action=info&id=${encodeURIComponent(id)}`);
  const d = json.data || {};
  const info = d.anime?.info || d.info || {};
  const moreInfo = d.anime?.moreInfo || d.moreInfo || {};
  return {
    success: true,
    data: {
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
          characterVoiceActor: info.characterVoiceActor || [],
        },
        moreInfo,
      },
      seasons: d.seasons || [],
      mostPopularAnimes: (d.mostPopularAnimes || []).map(normalizeAnime),
      recommendedAnimes: (d.recommendedAnimes || []).map(normalizeAnime),
      relatedAnimes: (d.relatedAnimes || []).map(normalizeAnime),
    },
  };
}

export async function getEpisodes(id: string): Promise<EpisodesData> {
  const json = await fetchApi(`action=episodes&id=${encodeURIComponent(id)}`);
  const d = json.data || {};
  return {
    success: true,
    data: {
      totalEpisodes: d.totalEpisodes || d.episodes?.length || 0,
      episodes: (d.episodes || []).map((ep: Episode) => ({
        title: ep.title || "",
        episodeId: ep.episodeId || "",
        number: ep.number || 0,
        isFiller: ep.isFiller || false,
      })),
    },
  };
}

export async function searchAnime(query: string, page = 1): Promise<SearchResult> {
  const json = await fetchApi(`action=search&q=${encodeURIComponent(query)}&page=${page}`);
  const d = json.data || {};
  return {
    success: true,
    data: {
      animes: (d.animes || []).map(normalizeAnime),
      mostPopularAnimes: (d.mostPopularAnimes || []).map(normalizeAnime),
      currentPage: d.currentPage || page,
      hasNextPage: d.hasNextPage ?? false,
      totalPages: d.totalPages || 1,
    },
  };
}

export async function getStreamSources(
  episodeId: string,
  server = "vidstreaming",
  category = "sub"
): Promise<StreamSource> {
  const json = await fetchApi(
    `action=sources&episodeId=${encodeURIComponent(episodeId)}&server=${server}&category=${category}`
  );
  const d = json.data || {};
  return {
    success: true,
    data: {
      sources: d.sources || [],
      tracks: d.tracks || [],
      intro: d.intro,
      outro: d.outro,
      anilistID: d.anilistID,
      malID: d.malID,
    },
  };
}
