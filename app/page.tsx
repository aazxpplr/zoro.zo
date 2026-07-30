import Image from "next/image";
import Link from "next/link";
import { getHome } from "./lib/api";
import AnimeCard from "./components/AnimeCard";

export const revalidate = 300;

export default async function HomePage() {
  let data;
  try {
    const res = await getHome();
    data = res.data;
  } catch {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl">📡</div>
          <h2 className="text-xl font-semibold text-[#e4e4e7]">Unable to connect to API</h2>
          <p className="text-sm text-[#71717a]">
            Set <code className="px-1.5 py-0.5 rounded bg-[#1a1a2e] text-[#6c5ce7]">NEXT_PUBLIC_API_URL</code> in your .env file
          </p>
        </div>
      </div>
    );
  }

  const spotlight = data.spotlightAnimes ?? data.trendingAnimes ?? [];
  const recent = data.latestEpisodeAnimes ?? [];
  const popular = data.mostPopularAnimes ?? data.topAiringAnimes ?? [];
  const trending = data.trendingAnimes ?? [];
  const top10Today = data.top10Animes?.today ?? [];

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Slider */}
      {spotlight.length > 0 && <HeroSection animes={spotlight.slice(0, 5)} />}

      {/* Trending */}
      {trending.length > 0 && (
        <Section title="Trending Now">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {trending.slice(0, 10).map((anime, i) => (
              <Link
                key={anime.id}
                href={`/anime/${anime.id}`}
                className="relative shrink-0 w-48 group"
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <Image
                    src={anime.poster}
                    alt={anime.name}
                    fill
                    sizes="192px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#6c5ce7] text-white text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-sm font-medium text-white line-clamp-2">{anime.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Recent Releases */}
      {recent.length > 0 && (
        <Section title="Recent Releases">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recent.slice(0, 18).map((anime) => (
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
        </Section>
      )}

      {/* Top 10 Today */}
      {top10Today.length > 0 && (
        <Section title="Top 10 Today">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {top10Today.slice(0, 10).map((anime) => (
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
        </Section>
      )}

      {/* Most Popular */}
      {popular.length > 0 && (
        <Section title="Most Popular">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {popular.slice(0, 18).map((anime) => (
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
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="max-w-[1400px] mx-auto px-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full bg-[#6c5ce7]" />
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function HeroSection({ animes }: { animes: { id: string; name: string; poster: string; description?: string; episodes?: { sub?: number; dub?: number }; type?: string; rating?: string }[] }) {
  const hero = animes[0];
  if (!hero) return null;

  return (
    <section className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={hero.poster}
          alt={hero.name}
          fill
          priority
          sizes="100vw"
          className="object-cover blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d1a] via-[#0d0d1a]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent to-[#0d0d1a]/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 h-full flex items-center">
        <div className="flex gap-6 items-end max-w-3xl">
          {/* Poster */}
          <div className="hidden sm:block shrink-0 w-44 rounded-lg overflow-hidden shadow-2xl shadow-black/50">
            <Image
              src={hero.poster}
              alt={hero.name}
              width={176}
              height={250}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Info */}
          <div className="space-y-4 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {hero.type && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded bg-[#6c5ce7] text-white">
                  {hero.type}
                </span>
              )}
              {hero.rating && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded bg-yellow-500/20 text-yellow-400">
                  ★ {hero.rating}
                </span>
              )}
              {hero.episodes?.sub != null && (
                <span className="px-2.5 py-1 text-xs font-medium rounded bg-white/10 text-white/80">
                  EP {hero.episodes.sub}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight line-clamp-2">
              {hero.name}
            </h1>

            {hero.description && (
              <p className="text-sm text-[#a1a1aa] line-clamp-3 leading-relaxed max-w-xl">
                {hero.description}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <Link
                href={`/anime/${hero.id}`}
                className="px-6 py-2.5 rounded-lg bg-[#6c5ce7] hover:bg-[#7f70f0] text-white text-sm font-semibold transition-colors shadow-lg shadow-[#6c5ce7]/30"
              >
                Watch Now
              </Link>
              <Link
                href={`/anime/${hero.id}`}
                className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors backdrop-blur-sm"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom thumbnails */}
      <div className="absolute bottom-4 right-4 hidden lg:flex gap-2 z-10">
        {animes.slice(1, 5).map((a) => (
          <Link key={a.id} href={`/anime/${a.id}`} className="shrink-0 w-20 rounded overflow-hidden opacity-70 hover:opacity-100 transition-opacity ring-1 ring-white/10 hover:ring-[#6c5ce7]">
            <Image src={a.poster} alt={a.name} width={80} height={112} className="w-full h-auto object-cover" />
          </Link>
        ))}
      </div>
    </section>
  );
}
