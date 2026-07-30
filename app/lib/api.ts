const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

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
  spotlightAnimes: Anime[];
  trendingAnimes: Anime[];
  latestEpisodeAnimes: Anime[];
  topUpcomingAnimes: Anime[];
  top10Animes: {
    today: Anime[];
    week: Anime[];
    month: Anime[];
  };
  topAiringAnimes: Anime[];
  mostPopularAnimes: Anime[];
  mostFavoriteAnimes: Anime[];
  latestCompletedAnimes: Anime[];
  genres: string[];
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
  const eps = item.episodes || item.episodeInfo || item.tvInfo?.episodeInfo;
  return {
    id: item.id || item.data_id || "",
    name: item.name || item.title || "",
    jname: item.jname || item.japanese_title || "",
    poster: item.poster || "",
    duration: item.duration || item.tvInfo?.duration || "",
    type: item.type || item.showType || item.tvInfo?.showType || "",
    rating: item.rating || "",
    episodes: eps ? { sub: eps.sub, dub: eps.dub } : undefined,
    description: item.description || "",
  };
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getHome(): Promise<HomeData> {
  // Try v2 format first, fall back to JustAnimeCore format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any;
  try {
    json = await fetchJson(`${API_BASE}/api/v2/hianime/home`);
    if (json.data) {
      const d = json.data;
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
  } catch {
    // fall through
  }

  json = await fetchJson(`${API_BASE}/api/`);
  const r = json.results || json.data || {};
  return {
    spotlightAnimes: (r.spotlights || r.spotlightAnimes || []).map(normalizeAnime),
    trendingAnimes: (r.trending || r.trendingAnimes || []).map(normalizeAnime),
    latestEpisodeAnimes: (r.latestEpisode || r.latestEpisodeAnimes || []).map(normalizeAnime),
    topUpcomingAnimes: (r.topUpcoming || r.topUpcomingAnimes || []).map(normalizeAnime),
    top10Animes: {
      today: (r.topTen?.today || r.top10Animes?.today || []).map(normalizeAnime),
      week: (r.topTen?.week || r.top10Animes?.week || []).map(normalizeAnime),
      month: (r.topTen?.month || r.top10Animes?.month || []).map(normalizeAnime),
    },
    topAiringAnimes: (r.topAiring || r.topAiringAnimes || []).map(normalizeAnime),
    mostPopularAnimes: (r.mostPopular || r.mostPopularAnimes || []).map(normalizeAnime),
    mostFavoriteAnimes: (r.mostFavorite || r.mostFavoriteAnimes || []).map(normalizeAnime),
    latestCompletedAnimes: (r.latestCompleted || r.latestCompletedAnimes || []).map(normalizeAnime),
    genres: r.genres || [],
  };
}

export async function getAnimeInfo(id: string): Promise<AnimeInfo> {
  try {
    const json = await fetchJson(`${API_BASE}/api/v2/hianime/anime/${encodeURIComponent(id)}`);
    if (json.data) return json;
  } catch {
    // fall through
  }
  const json = await fetchJson(`${API_BASE}/api/info?id=${encodeURIComponent(id)}`);
  const r = json.results || json.data || {};
  return {
    success: true,
    data: {
      anime: {
        info: {
          id: r.id || r.anime?.id || id,
          name: r.title || r.name || r.anime?.title || "",
          poster: r.poster || r.image || r.anime?.poster || "",
          description: r.description || r.synopsis || r.anime?.description || "",
          stats: {
            rating: r.rating || r.anime?.rating || "",
            quality: r.quality || "",
            episodes: r.episodes || r.anime?.episodes,
            type: r.type || r.showType || "",
            duration: r.duration || "",
          },
        },
        moreInfo: r.moreInfo || r.anime?.moreInfo || {},
      },
      seasons: r.seasons || [],
      mostPopularAnimes: (r.mostPopular || []).map(normalizeAnime),
      recommendedAnimes: (r.recommended || []).map(normalizeAnime),
      relatedAnimes: (r.related || []).map(normalizeAnime),
    },
  };
}

export async function getEpisodes(id: string): Promise<EpisodesData> {
  try {
    const json = await fetchJson(`${API_BASE}/api/v2/hianime/anime/${encodeURIComponent(id)}/episodes`);
    if (json.data) return json;
  } catch {
    // fall through
  }
  const json = await fetchJson(`${API_BASE}/api/episodes/${encodeURIComponent(id)}`);
  const r = json.results || json.data || {};
  return {
    success: true,
    data: {
      totalEpisodes: r.totalEpisodes || (r.episodes?.length ?? 0),
      episodes: (r.episodes || []).map((ep: { title?: string; episodeId?: string; episode_no?: number; id?: string; number?: number; isFiller?: boolean }) => ({
        title: ep.title || `Episode ${ep.episode_no || ep.number || ""}`,
        episodeId: ep.episodeId || ep.id || "",
        number: ep.episode_no || ep.number || 0,
        isFiller: ep.isFiller || false,
      })),
    },
  };
}

export async function searchAnime(query: string, page = 1): Promise<SearchResult> {
  try {
    const json = await fetchJson(`${API_BASE}/api/v2/hianime/search?q=${encodeURIComponent(query)}&page=${page}`);
    if (json.data) {
      json.data.animes = (json.data.animes || []).map(normalizeAnime);
      return json;
    }
  } catch {
    // fall through
  }
  const json = await fetchJson(`${API_BASE}/api/search?keyword=${encodeURIComponent(query)}&page=${page}`);
  const r = json.results || json.data || {};
  return {
    success: true,
    data: {
      animes: (r.animes || r.data || []).map(normalizeAnime),
      currentPage: r.currentPage || page,
      hasNextPage: r.hasNextPage ?? false,
      totalPages: r.totalPages || 1,
    },
  };
}

export async function getStreamSources(
  episodeId: string,
  server = "vidstreaming",
  category = "sub"
): Promise<StreamSource> {
  try {
    const json = await fetchJson(
      `${API_BASE}/api/v2/hianime/episode/sources?animeEpisodeId=${encodeURIComponent(episodeId)}&server=${server}&category=${category}`
    );
    if (json.data) return json;
  } catch {
    // fall through
  }
  const json = await fetchJson(
    `${API_BASE}/api/stream?id=${encodeURIComponent(episodeId)}&server=${server}&type=${category}`
  );
  const r = json.results || json.data || {};
  return {
    success: true,
    data: {
      sources: r.sources || r.streamingLink || [],
      tracks: r.tracks || r.subtitles || [],
      intro: r.intro,
      outro: r.outro,
    },
  };
}
