import { searchAnime } from "@/app/lib/api";
import AnimeCard from "@/app/components/AnimeCard";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ keyword?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props) {
  const { keyword } = await searchParams;
  return { title: keyword ? `Search: ${keyword} - Zoro.tv` : "Search - Zoro.tv" };
}

export default async function SearchPage({ searchParams }: Props) {
  const { keyword = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  if (!keyword.trim()) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <div className="text-center space-y-4">
          <svg className="mx-auto text-[#27273a]" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <h2 className="text-xl font-semibold text-[#e4e4e7]">Search for Anime</h2>
          <p className="text-sm text-[#71717a]">Enter a title in the search bar above to find anime</p>
        </div>
      </div>
    );
  }

  let data;
  try {
    const res = await searchAnime(keyword, page);
    data = res.data;
  } catch {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-[#e4e4e7]">Search failed</h2>
        <p className="text-sm text-[#71717a] mt-2">Could not connect to the API. Please try again.</p>
      </div>
    );
  }

  const animes = data.animes ?? [];

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">
          Search results for <span className="text-[#6c5ce7]">&ldquo;{keyword}&rdquo;</span>
        </h1>
        <p className="text-sm text-[#71717a] mt-1">Page {page} of {data.totalPages || 1}</p>
      </div>

      {/* Results */}
      {animes.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-lg text-[#a1a1aa]">No results found</h2>
          <p className="text-sm text-[#71717a] mt-2">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {animes.map((anime) => (
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
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <Link
              href={`/search?keyword=${encodeURIComponent(keyword)}&page=${page - 1}`}
              className="px-4 py-2 text-sm rounded-lg bg-[#1a1a2e] text-[#a1a1aa] hover:bg-[#6c5ce7] hover:text-white transition-colors"
            >
              Previous
            </Link>
          )}

          {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => {
            let p: number;
            if (data.totalPages <= 7) {
              p = i + 1;
            } else if (page <= 4) {
              p = i + 1;
            } else if (page >= data.totalPages - 3) {
              p = data.totalPages - 6 + i;
            } else {
              p = page - 3 + i;
            }
            return (
              <Link
                key={p}
                href={`/search?keyword=${encodeURIComponent(keyword)}&page=${p}`}
                className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors ${
                  p === page
                    ? "bg-[#6c5ce7] text-white"
                    : "bg-[#1a1a2e] text-[#a1a1aa] hover:bg-[#27273a] hover:text-white"
                }`}
              >
                {p}
              </Link>
            );
          })}

          {data.hasNextPage && (
            <Link
              href={`/search?keyword=${encodeURIComponent(keyword)}&page=${page + 1}`}
              className="px-4 py-2 text-sm rounded-lg bg-[#1a1a2e] text-[#a1a1aa] hover:bg-[#6c5ce7] hover:text-white transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
