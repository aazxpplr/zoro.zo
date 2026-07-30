import { HiAnime } from "aniwatch";
import { NextRequest, NextResponse } from "next/server";

const scraper = new HiAnime.Scraper();

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get("action") || "home";

  try {
    switch (action) {
      case "home": {
        const data = await scraper.getHomePage();
        return NextResponse.json({ success: true, data });
      }
      case "info": {
        const id = searchParams.get("id") || "";
        const data = await scraper.getInfo(id);
        return NextResponse.json({ success: true, data });
      }
      case "episodes": {
        const id = searchParams.get("id") || "";
        const data = await scraper.getEpisodes(id);
        return NextResponse.json({ success: true, data });
      }
      case "sources": {
        const episodeId = searchParams.get("episodeId") || "";
        const server = searchParams.get("server") || "vidstreaming";
        const category = (searchParams.get("category") || "sub") as "sub" | "dub" | "raw";
        const data = await scraper.getEpisodeSources(episodeId, server as "vidstreaming", category);
        return NextResponse.json({ success: true, data });
      }
      case "search": {
        const q = searchParams.get("q") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const data = await scraper.search(q, page);
        return NextResponse.json({ success: true, data });
      }
      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
