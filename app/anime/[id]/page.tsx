import Image from "next/image";
import Link from "next/link";
import { getAnimeInfo, getEpisodes } from "@/app/lib/api";
import AnimeCard from "@/app/components/AnimeCard";
import EpisodeList from "@/app/components/EpisodeList";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const res = await getAnimeInfo(id);
    return { title: `${res.anime.info.name} - Zoro.tv` };
  } catch {
    return { title: "Anime - Zoro.tv" };
  }
}

export default async function AnimeDetailPage({ params }: Props) {
  const { id } = await params;

  let animeData;
  let episodesData;

  try {
    [animeData, episodesData] = await Promise.all([getAnimeInfo(id), getEpisodes(id)]);
  } catch {
    notFound();
  }

  const info = animeData.anime.info;
  const moreInfo = animeData.anime.moreInfo;
  const seasons = animeData.seasons ?? [];
  const recommended = animeData.recommendedAnimes ?? [];
  const episodes = episodesData.episodes;

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <section className="relative w-full h-[45vh] min-h-[350px] max-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image src={info.poster} alt={info.name} fill sizes="100vw" className="object-cover blur-md scale-110 opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex gap-6 items-end">
            {/* Poster */}
            <div className="hidden sm:block shrink-0 w-48 rounded-lg overflow-hidden shadow-2xl shadow-black/60 -mb-16 relative z-20">
              <Image src={info.poster} alt={info.name} width={192} height={272} className="w-full h-auto object-cover" />
            </div>

            {/* Title area */}
            <div className="space-y-3 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {info.stats.type && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded bg-[#6c5ce7] text-white">{info.stats.type}</span>
                )}
                {info.stats.rating && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded bg-yellow-500/20 text-yellow-400">★ {info.stats.rating}</span>
                )}
                {info.stats.quality && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded bg-white/10 text-white/80">{info.stats.quality}</span>
                )}
                {info.stats.episodes?.sub != null && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded bg-[#6c5ce7]/20 text-[#6c5ce7]">SUB: {info.stats.episodes.sub}</span>
                )}
                {info.stats.episodes?.dub != null && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-500/20 text-emerald-400">DUB: {info.stats.episodes.dub}</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{info.name}</h1>
              {info.stats.duration && <p className="text-sm text-[#71717a]">{info.stats.duration}</p>}

              {/* Watch button */}
              {episodes.length > 0 && (
                <Link
                  href={`/watch/${episodes[0].episodeId}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#6c5ce7] hover:bg-[#7f70f0] text-white text-sm font-semibold transition-colors shadow-lg shadow-[#6c5ce7]/30 mt-2"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  Watch Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:pl-56">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {info.description && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">Synopsis</h2>
                <p className="text-sm text-[#a1a1aa] leading-relaxed whitespace-pre-line">{info.description}</p>
              </div>
            )}

            {/* Seasons */}
            {seasons.length > 1 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white">Seasons</h2>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((s) => (
                    <Link
                      key={s.id}
                      href={`/anime/${s.id}`}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        s.isCurrent
                          ? "bg-[#6c5ce7] text-white"
                          : "bg-[#1a1a2e] text-[#a1a1aa] hover:bg-[#27273a] hover:text-white"
                      }`}
                    >
                      {s.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Episodes */}
            {episodes.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white">
                  Episodes <span className="text-[#71717a] font-normal text-sm ml-2">{episodes.length} total</span>
                </h2>
                <EpisodeList episodes={episodes} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-[#16213e] rounded-lg p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Information</h3>
              <div className="space-y-2.5">
                {Object.entries(moreInfo).map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-sm">
                    <span className="text-[#71717a] shrink-0 w-24">{key}:</span>
                    <span className="text-[#a1a1aa]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Recommended */}
        {recommended.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full bg-[#6c5ce7]" />
              <h2 className="text-xl font-bold text-white">Recommended</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recommended.slice(0, 12).map((anime) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  name={anime.name}
                  poster={anime.poster}
                  type={anime.type}
                  duration={anime.duration}
                  episodes={anime.episodes}
                  rating={anime.rating}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
