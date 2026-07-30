"use client";

import Link from "next/link";
import { useState } from "react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0d0d1a]/95 backdrop-blur-md border-b border-[#27273a]">
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#6c5ce7] flex items-center justify-center font-bold text-white text-sm">
            Z
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Zoro<span className="text-[#6c5ce7]">.zo</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 ml-8">
          <Link href="/" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/search?keyword=" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
            Browse
          </Link>
        </div>

        {/* Search */}
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <SearchBar />
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#a1a1aa] hover:text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#27273a] bg-[#0d0d1a] px-4 py-4 space-y-4">
          <SearchBar />
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-[#a1a1aa] hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/search?keyword="
              onClick={() => setMobileOpen(false)}
              className="text-sm text-[#a1a1aa] hover:text-white transition-colors"
            >
              Browse
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
