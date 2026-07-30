"use client";

interface AdBannerProps {
  slot: string;
  size?: "banner" | "rectangle" | "leaderboard" | "skyscraper";
  className?: string;
}

export default function AdBanner({ slot, size = "banner", className = "" }: AdBannerProps) {
  const sizeClasses = {
    banner: "h-[90px]",
    rectangle: "h-[250px]",
    leaderboard: "h-[90px]",
    skyscraper: "h-[600px] w-[160px]",
  };

  return (
    <div
      className={`w-full flex items-center justify-center bg-[#16213e]/50 rounded-lg border border-[#27273a]/50 overflow-hidden ${sizeClasses[size]} ${className}`}
      data-ad-slot={slot}
    >
      {/*
        Replace this div with your ad network script.

        For A-Ads (crypto-friendly):
        <iframe data-aa="YOUR_AD_UNIT_ID" src="//ad.a-ads.com/YOUR_AD_UNIT_ID?size=728x90" style={{width:"728px", height:"90px", border:"0px", padding:0, overflow:"hidden", backgroundColor:"transparent"}} />

        For HilltopAds:
        Paste their script tag here

        For Coinzilla:
        Paste their script tag here
      */}
      <span className="text-[10px] text-[#71717a]/50 select-none">AD</span>
    </div>
  );
}
