"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  sources: { url: string; type: string }[];
  tracks?: { file: string; label?: string; kind?: string; default?: boolean }[];
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

export default function VideoPlayer({ sources, tracks, intro, outro }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hlsLoaded, setHlsLoaded] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);

  const hlsSource = sources.find((s) => s.type === "hls" || s.url.includes(".m3u8"));
  const mp4Source = sources.find((s) => s.type === "mp4" || s.url.includes(".mp4"));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsSource) return;

    let hls: unknown;

    async function initHls() {
      try {
        const HlsModule = await import("hls.js");
        const Hls = HlsModule.default;
        if (Hls.isSupported() && video) {
          const instance = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            xhrSetup: (xhr: XMLHttpRequest) => {
              xhr.withCredentials = false;
            },
          });
          instance.loadSource(hlsSource!.url);
          instance.attachMedia(video);
          instance.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          instance.on(Hls.Events.ERROR, (_e: unknown, data: { fatal: boolean; type: string; details: string }) => {
            console.error("HLS error:", data.type, data.details, data.fatal);
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                instance.startLoad();
              } else {
                instance.destroy();
              }
            }
          });
          hls = instance;
          setHlsLoaded(true);
        } else if (video!.canPlayType("application/vnd.apple.mpegurl")) {
          video!.src = hlsSource!.url;
          video!.addEventListener("loadedmetadata", () => video!.play().catch(() => {}));
          setHlsLoaded(true);
        }
      } catch (err) {
        console.error("HLS init failed:", err);
        if (mp4Source && video) {
          video.src = mp4Source.url;
        }
      }
    }

    initHls();

    return () => {
      if (hls && typeof (hls as { destroy: () => void }).destroy === "function") {
        (hls as { destroy: () => void }).destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hlsSource?.url]);

  // Skip intro/outro buttons
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function onTimeUpdate() {
      if (!video) return;
      const t = video.currentTime;
      if (intro) setShowSkipIntro(t >= intro.start && t < intro.end);
      if (outro) setShowSkipOutro(t >= outro.start && t < outro.end);
    }

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [intro, outro]);

  const embedSource = sources.find((s) => s.type === "embed");
  const iframeSrc = embedSource?.url || (!hlsSource && !mp4Source && sources.length > 0 ? sources[0].url : null);

  if (iframeSrc) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={iframeSrc}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline

        src={!hlsSource && mp4Source ? mp4Source.url : undefined}
      >
        {tracks?.map((track, i) => (
          <track
            key={i}
            src={track.file}
            label={track.label || "Unknown"}
            kind={(track.kind as TextTrackKind) || "subtitles"}
            default={track.default}
          />
        ))}
      </video>

      {/* Skip Intro */}
      {showSkipIntro && intro && (
        <button
          onClick={() => {
            if (videoRef.current) videoRef.current.currentTime = intro.end;
          }}
          className="absolute bottom-20 right-4 px-5 py-2.5 bg-[#6c5ce7] hover:bg-[#7f70f0] text-white text-sm font-semibold rounded-lg shadow-lg transition-all animate-pulse"
        >
          Skip Intro
        </button>
      )}

      {/* Skip Outro */}
      {showSkipOutro && outro && (
        <button
          onClick={() => {
            if (videoRef.current) videoRef.current.currentTime = outro.end;
          }}
          className="absolute bottom-20 right-4 px-5 py-2.5 bg-[#6c5ce7] hover:bg-[#7f70f0] text-white text-sm font-semibold rounded-lg shadow-lg transition-all"
        >
          Skip Outro
        </button>
      )}

      {/* Loading state */}
      {!hlsLoaded && hlsSource && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-10 h-10 border-4 border-[#6c5ce7] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
