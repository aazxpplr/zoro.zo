"use client";

import Link from "next/link";
import { useState } from "react";
import type { Episode } from "@/app/lib/api";

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeId?: string;
}

const CHUNK = 100;

export default function EpisodeList({ episodes, currentEpisodeId }: EpisodeListProps) {
  const totalChunks = Math.ceil(episodes.length / CHUNK);
  const [activeChunk, setActiveChunk] = useState(() => {
    if (currentEpisodeId) {
      const idx = episodes.findIndex((e) => e.episodeId === currentEpisodeId);
      return idx >= 0 ? Math.floor(idx / CHUNK) : 0;
    }
    return 0;
  });

  const visible = episodes.slice(activeChunk * CHUNK, (activeChunk + 1) * CHUNK);

  return (
    <div className="space-y-4">
      {/* Range selector */}
      {totalChunks > 1 && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalChunks }, (_, i) => {
            const start = i * CHUNK + 1;
            const end = Math.min((i + 1) * CHUNK, episodes.length);
            return (
              <button
                key={i}
                onClick={() => setActiveChunk(i)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  activeChunk === i
                    ? "bg-[#6c5ce7] text-white"
                    : "bg-[#1a1a2e] text-[#a1a1aa] hover:bg-[#27273a] hover:text-white"
                }`}
              >
                {start}-{end}
              </button>
            );
          })}
        </div>
      )}

      {/* Episode grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {visible.map((ep) => {
          const isCurrent = ep.episodeId === currentEpisodeId;
          return (
            <Link
              key={ep.episodeId}
              href={`/watch/${ep.episodeId}`}
              title={ep.title || `Episode ${ep.number}`}
              className={`flex items-center justify-center h-10 rounded text-sm font-medium transition-all ${
                isCurrent
                  ? "bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/30"
                  : ep.isFiller
                  ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                  : "bg-[#1a1a2e] text-[#a1a1aa] hover:bg-[#6c5ce7]/30 hover:text-white"
              }`}
            >
              {ep.number}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
