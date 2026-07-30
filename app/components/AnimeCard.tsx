import Link from "next/link";
import Image from "next/image";

interface AnimeCardProps {
  id: string;
  name: string;
  poster: string;
  type?: string;
  duration?: string;
  episodes?: { sub?: number; dub?: number };
  rating?: string;
}

export default function AnimeCard({ id, name, poster, type, duration, episodes, rating }: AnimeCardProps) {
  return (
    <Link
      href={`/anime/${id}`}
      className="group relative flex flex-col rounded-lg overflow-hidden bg-[#16213e] hover:bg-[#1e2d4f] transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-[#6c5ce7]/10"
    >
      {/* Poster */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={poster}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#16213e] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Type badge */}
        {type && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-[#6c5ce7] text-white shadow-lg">
            {type}
          </span>
        )}

        {/* Rating */}
        {rating && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-black/60 text-yellow-400 backdrop-blur-sm">
            ★ {rating}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="text-sm font-medium text-[#e4e4e7] line-clamp-2 leading-tight group-hover:text-[#6c5ce7] transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-2 mt-auto">
          {episodes?.sub != null && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#6c5ce7]/20 text-[#6c5ce7] font-medium">
              SUB: {episodes.sub}
            </span>
          )}
          {episodes?.dub != null && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
              DUB: {episodes.dub}
            </span>
          )}
          {duration && (
            <span className="text-[10px] text-[#71717a] ml-auto">{duration}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
