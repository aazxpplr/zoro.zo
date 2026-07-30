"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?keyword=${encodeURIComponent(trimmed)}`);
      setQuery("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search anime..."
        className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#1a1a2e] border border-[#27273a] text-sm text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] transition-all"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </form>
  );
}
