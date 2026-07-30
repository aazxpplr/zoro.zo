import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#27273a] bg-[#0d0d1a] mt-16">
      <div className="max-w-[1400px] mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#6c5ce7] flex items-center justify-center font-bold text-white text-xs">
              Z
            </div>
            <span className="text-lg font-bold text-white">
              Zoro<span className="text-[#6c5ce7]">.tv</span>
            </span>
          </Link>
          <p className="text-xs text-[#71717a] text-center">
            This site does not store any files on its server. All contents are provided by non-affiliated third parties.
          </p>
        </div>
      </div>
    </footer>
  );
}
