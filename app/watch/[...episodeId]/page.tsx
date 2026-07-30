import { getStreamSources, getAnimeInfo, getEpisodes } from "@/app/lib/api";
import VideoPlayer from "@/app/components/VideoPlayer";
import EpisodeList from "@/app/components/EpisodeList";
import AdBanner from "@/app/components/AdBanner";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ episodeId: string[] }>;
  searchParams: Promise<{ server?: string; category?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { episodeId } = await params;
  return { title: `Watching - ${episodeId.join("/")} - Zoro.zo` };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { episodeId: segments } = await params;
  const episodeId = segments.join("/");
  const { server, category = "sub" } = await searchParams;

  const animeId = episodeId.split("/")[0];
  const seasonMatch = episodeId.match(/staffel-(\d+)/);
  const season = seasonMatch ? seasonMatch[1] : "1";

  let sources;
  let animeData;
  let episodesData;

  try {
    [sources, animeData, episodesData] = await Promise.all([
      getStreamSources(episodeId, server, category),
      getAnimeInfo(animeId).catch(() => null),
      getEpisodes(animeId, season).catch(() => null),
    ]);
  } catch {
    notFound();
  }

  const episodes = episodesData?.episodes ?? [];
  const currentIdx = episodes.findIndex((e) => e.episodeId === episodeId);
  const prevEp = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const nextEp = currentIdx >= 0 && currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;
  const currentEp = currentIdx >= 0 ? episodes[currentIdx] : null;
  const animeInfo = animeData?.anime.info;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      {animeInfo && (
        <div className="flex items-center gap-2 text-sm text-[#71717a]">
          <Link href="/" className="hover:text-[#6c5ce7] transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/anime/${animeInfo.id}`} className="hover:text-[#6c5ce7] transition-colors line-clamp-1">{animeInfo.name}</Link>
          <span>/</span>
          <span className="text-[#a1a1aa]">Episode {currentEp?.number ?? "?"}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <VideoPlayer
            sources={sources.sources}
            tracks={sources.tracks}
            intro={sources.intro}
            outro={sources.outro}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#16213e] rounded-lg p-3">
            <div className="flex gap-2">
              {prevEp ? (
                <Link
                  href={`/watch/${prevEp.episodeId}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a1a2e] text-[#a1a1aa] hover:bg-[#6c5ce7] hover:text-white text-sm font-medium transition-colors"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                  Prev
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-lg bg-[#1a1a2e]/50 text-[#71717a] text-sm cursor-not-allowed">Prev</span>
              )}

              {nextEp ? (
                <Link
                  href={`/watch/${nextEp.episodeId}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a1a2e] text-[#a1a1aa] hover:bg-[#6c5ce7] hover:text-white text-sm font-medium transition-colors"
                >
                  Next
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-lg bg-[#1a1a2e]/50 text-[#71717a] text-sm cursor-not-allowed">Next</span>
              )}
            </div>

            <div className="flex gap-1.5">
              {["sub", "dub", "raw"].map((cat) => (
                <Link
                  key={cat}
                  href={`/watch/${episodeId}?category=${cat}`}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-md transition-colors ${
                    category === cat
                      ? "bg-[#6c5ce7] text-white"
                      : "bg-[#1a1a2e] text-[#a1a1aa] hover:bg-[#27273a] hover:text-white"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <AdBanner slot="watch-below-player" size="leaderboard" />

          {currentEp && (
            <div className="bg-[#16213e] rounded-lg p-4">
              <p className="text-sm text-[#71717a]">
                Episode {currentEp.number}
                {currentEp.isFiller && (
                  <span className="ml-2 px-2 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-400 font-medium">FILLER</span>
                )}
              </p>
              <h2 className="text-lg font-semibold text-white mt-1">{currentEp.title || `Episode ${currentEp.number}`}</h2>
            </div>
          )}

          {episodes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">Episodes</h3>
              <EpisodeList episodes={episodes} currentEpisodeId={episodeId} />
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <AdBanner slot="watch-sidebar-top" size="rectangle" />
          {animeInfo && (
            <div className="bg-[#16213e] rounded-lg overflow-hidden">
              <div className="relative aspect-[3/4] w-full">
                <Image src={animeInfo.poster} alt={animeInfo.name} fill sizes="300px" className="object-cover" />
              </div>
              <div className="p-4 space-y-3">
                <Link href={`/anime/${animeInfo.id}`} className="text-base font-semibold text-white hover:text-[#6c5ce7] transition-colors line-clamp-2">
                  {animeInfo.name}
                </Link>
                <div className="flex flex-wrap gap-1.5">
                  {animeInfo.stats.type && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#6c5ce7]/20 text-[#6c5ce7]">{animeInfo.stats.type}</span>
                  )}
                  {animeInfo.stats.rating && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-yellow-500/20 text-yellow-400">★ {animeInfo.stats.rating}</span>
                  )}
                </div>
                {animeInfo.description && (
                  <p className="text-xs text-[#71717a] line-clamp-6 leading-relaxed">{animeInfo.description}</p>
                )}
              </div>
            </div>
          )}
          <AdBanner slot="watch-sidebar-bottom" size="rectangle" />
        </aside>
      </div>
    </div>
  );
}
