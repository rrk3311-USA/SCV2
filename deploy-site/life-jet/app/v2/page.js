'use client'

import { useState, useRef } from 'react'

// Media paths – assume served from same origin as main site (/public/...)
const IMG = (path) => path

export default function HomeV2() {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setPlaying(!playing)
  }

  const toggleMute = () => setMuted((m) => !m)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Contained layout – shadcn-style max-width + padding */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ─── Hero (banner + blended image) ───────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm min-h-[320px] sm:min-h-[350px] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ backgroundImage: "url('/public/images/home/BannerTOP.jpg')" }}
          />
          <div className="absolute inset-0 bg-slate-900/30" />
          <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center justify-center text-center">
            <img
              src={IMG('/public/images/BlendedHomeheader.png')}
              alt="Success Chemistry"
              className="w-full max-w-3xl h-auto object-contain opacity-90 drop-shadow-lg"
            />
            <div className="mt-6 rounded-xl border border-white/20 bg-white/15 px-4 py-4 backdrop-blur-md sm:px-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl lg:text-4xl">
                FROM EARTH TO FORMULA
              </h1>
              <p className="mt-2 text-base text-white/95 drop-shadow sm:text-lg">
                Formulated With The Freshest Nutrients
              </p>
            </div>
          </div>
        </section>

        {/* ─── Top Sellers (section title only – no carousel code) ─────────── */}
        <section className="mt-12 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Top Sellers</h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Our best-selling supplements. Visit the shop to explore.
          </p>
        </section>

        {/* ─── Why People Trust Us (facility image) ───────────────────────── */}
        <section className="mt-12">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Why People Trust Us</h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              3rd party safety testing with Eurofins and NSF ensuring reliability and high industry standards.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="relative aspect-[16/9] min-h-[240px] sm:min-h-[300px]">
              <img
                src={IMG('/public/images/real-factory-images/new-building-full.png')}
                alt="New Manufacturing Facility"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-5">
                <p className="font-semibold text-white text-sm sm:text-base">State-of-the-Art Facility</p>
                <p className="text-white/90 text-xs sm:text-sm">195,000 sq ft designed for optimal supplement manufacturing</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Video + LLE image (media only) ─────────────────────────────── */}
        <section className="mt-12 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
          <div className="relative aspect-video max-h-[400px] w-full overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              poster="/public/images/home/BannerTOP.jpg"
              loop
              playsInline
              muted={muted}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            >
              <source src="/public/videos/0124.mov" type="video/quicktime" />
              <source src="/public/videos/0124.mp4" type="video/mp4" />
              <source src="/public/videos/0124.webm" type="video/webm" />
            </video>
            <button
              type="button"
              onClick={togglePlay}
              className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-black/50 text-2xl text-white shadow-lg transition hover:scale-105 hover:bg-black/60"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3">
              <button
                type="button"
                onClick={toggleMute}
                className="rounded-lg bg-white/20 px-2 py-1.5 text-white text-sm hover:bg-white/30"
              >
                {muted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>
          <img
            src={IMG('/public/images/home/LLEand2x.png')}
            alt="LLE Extraction, 2x Fine Grind, Made to Order Fresh"
            className="mt-5 w-full rounded-xl object-cover shadow-sm"
          />
        </section>

        {/* ─── Factory collage (media only) ───────────────────────────────── */}
        <section className="mt-12 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="relative aspect-[2.2/1] min-h-[160px] sm:min-h-[190px]">
              <img
                src={IMG('/public/images/real-factory-images/manufacturing-cleanroom-large.png')}
                alt="Advanced Manufacturing Cleanroom"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4">
                <p className="font-semibold text-white text-sm">Precision Manufacturing</p>
                <p className="text-white/90 text-xs">State-of-the-art cleanroom facilities</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 shadow-sm aspect-[4/3] min-h-[120px] sm:min-h-[140px]">
              <img
                src={IMG('/public/images/real-factory-images/Screenshot-2024-07-17-at-8.48.51-PM.png')}
                alt="Manufacturing"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 shadow-sm aspect-[4/3] min-h-[120px] sm:min-h-[140px]">
              <img
                src={IMG('/public/images/real-factory-images/AAAAIMG_2367.jpg')}
                alt="Factory"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="relative aspect-[2.5/1] min-h-[160px] sm:min-h-[200px]">
              <img
                src={IMG('/public/images/real-factory-images/Screenshot-2024-07-17-at-8.48.34-PM-full.png')}
                alt="Quality Control Process"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4">
                <p className="font-semibold text-white text-sm">Advanced Quality Control</p>
                <p className="text-white/90 text-xs">Precision manufacturing with automated QA</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features module (image + copy) ─────────────────────────────── */}
        <section className="mt-12 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm sm:flex sm:items-center sm:gap-8 sm:p-8">
          <div className="shrink-0 sm:w-80 lg:w-96">
            <img
              src={IMG('/public/images/features-module.png')}
              alt="Quality Features"
              className="w-full rounded-xl object-cover shadow-md"
            />
          </div>
          <div className="mt-6 space-y-5 sm:mt-0 sm:flex-1">
            <div className="flex gap-4">
              <span className="text-2xl text-slate-400">🧪</span>
              <div>
                <p className="font-semibold text-slate-900">Quality-First Formulation</p>
                <p className="text-slate-600 text-sm">Purpose-built blends combining botanicals with targeted nutrients.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl text-slate-400">🏭</span>
              <div>
                <p className="font-semibold text-slate-900">USA Manufacturing</p>
                <p className="text-slate-600 text-sm">Manufactured in the USA with clean, consistent standards.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl text-slate-400">🌿</span>
              <div>
                <p className="font-semibold text-slate-900">Clean Ingredients</p>
                <p className="text-slate-600 text-sm">Non-GMO friendly ingredients for everyday use.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── New Release (product image + text) ──────────────────────────── */}
        <section className="mt-12 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-50/80 to-white p-6 shadow-sm sm:flex sm:items-center sm:gap-10 sm:p-8">
          <div className="flex flex-col items-center sm:w-72 sm:shrink-0">
            <img
              src={IMG('/images/products/52274-401/01.png')}
              alt="Women's Balance Supplement"
              className="w-48 h-auto object-contain drop-shadow-md sm:w-56"
            />
            <span className="mt-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">New Release</span>
          </div>
          <div className="mt-6 sm:mt-0">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Women's Balance — Now Available</h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              Our newest formula supports feminine wellness with L-Arginine, Maca, Ashwagandha & Ginseng. Clean ingredients, made in the USA.
            </p>
          </div>
        </section>

        {/* ─── Chat CTA (media only – banner image) ────────────────────────── */}
        <section className="mt-12 overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm min-h-[280px] sm:min-h-[350px] flex items-center justify-center relative">
          <img
            src={IMG('/public/images/CTA_chatbot image.png')}
            alt="Chat with us"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-blue-900/70" />
          <div className="relative z-10 px-6 py-8 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">Chat with us</h2>
            <p className="mt-2 text-white/95 text-sm sm:text-base">Questions about products or orders? We're here to help.</p>
          </div>
        </section>

      </div>
    </div>
  )
}
