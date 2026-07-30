import { NextRequest, NextResponse } from "next/server";

const VPS = process.env.ANIME_API_URL || "http://212.147.244.203";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    const target = `${VPS}/api/proxy?url=${encodeURIComponent(url)}`;
    const resp = await fetch(target);

    if (!resp.ok) {
      return new NextResponse(`Upstream ${resp.status}`, { status: resp.status });
    }

    const ct = resp.headers.get("content-type") || "application/octet-stream";
    const body = await resp.arrayBuffer();

    if (ct.includes("mpegurl") || ct.includes("m3u8")) {
      let text = new TextDecoder().decode(body);
      // Rewrite VPS proxy URLs to go through this Next.js route instead
      text = text.replace(
        /http:\/\/212\.147\.244\.203\/api\/proxy\?url=([^\s\n"]*)/g,
        (_match, encoded) => `/api/proxy?url=${encoded}`
      );
      return new NextResponse(text, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new NextResponse(body, {
      headers: {
        "Content-Type": ct,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
