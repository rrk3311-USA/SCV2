"use client";

import { useState, useRef } from "react";

export function HomeVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  const toggleMute = () => setMuted((m) => !m);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        poster="/images/home/BannerTOP.jpg"
        loop
        playsInline
        muted={muted}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/videos/0124.mov" type="video/quicktime" />
        <source src="/videos/0124.mp4" type="video/mp4" />
        <source src="/videos/0124.webm" type="video/webm" />
      </video>
      <button
        type="button"
        onClick={togglePlay}
        className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-black/50 text-2xl text-white transition hover:bg-black/60"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3">
        <button
          type="button"
          onClick={toggleMute}
          className="rounded bg-white/20 px-2 py-1.5 text-sm text-white hover:bg-white/30"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </div>
  );
}
