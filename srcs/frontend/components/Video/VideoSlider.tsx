"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VideoSlide = {
  src: string;
  poster?: string;
  caption?: string;
};

type VideoSliderProps = {
  slides: VideoSlide[];
  /**
   * Fallback autoplay interval in ms.
   * Used only if `advanceOnEnd` is false, OR as a safety net if a video
   * fails to fire `ended` (e.g. broken source). Set to 0 to disable entirely.
   */
  autoplayMs?: number;
  /** Advance to the next slide when the current video ends. */
  advanceOnEnd?: boolean;
  aspect?: string;
  objectFit?: "cover" | "contain";
  objectPosition?: string;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
};

export default function VideoSlider({
  slides,
  autoplayMs = 0,
  advanceOnEnd = true,
  aspect = "9 / 16",
  objectFit = "cover",
  objectPosition = "center",
  showArrows = true,
  showDots = true,
  className = "",
}: VideoSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const count = slides.length;
  const goTo = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Interval-based autoplay — only when NOT using advanceOnEnd
  useEffect(() => {
    if (advanceOnEnd) return;
    if (!autoplayMs || paused || count <= 1) return;
    const id = setInterval(next, autoplayMs);
    return () => clearInterval(id);
  }, [advanceOnEnd, autoplayMs, paused, count, next]);

  // Keyboard navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Pause when tab is hidden
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (count === 0) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    touchStartX.current = null;
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Video slider"
      className={`relative mx-auto w-full max-w-sm select-none outline-none ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="relative w-full overflow-hidden rounded-3xl bg-black shadow-2xl ring-1 ring-black/10 dark:ring-white/10"
        style={{ aspectRatio: aspect }}
      >
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              className="relative h-full w-full shrink-0"
              aria-hidden={i !== index}
            >
              <VideoSlideItem
                slide={slide}
                active={i === index}
                paused={paused}
                objectFit={objectFit}
                objectPosition={objectPosition}
                onEnded={advanceOnEnd ? next : undefined}
              />
            </div>
          ))}
        </div>

        {showArrows && count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous video"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next video"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight />
            </button>
          </>
        )}

        {showDots && count > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to video ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {slides[index]?.caption && (
        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {slides[index].caption}
        </p>
      )}
    </div>
  );
}

function VideoSlideItem({
  slide,
  active,
  paused,
  objectFit,
  objectPosition,
  onEnded,
}: {
  slide: VideoSlide;
  active: boolean;
  paused: boolean;
  objectFit: "cover" | "contain";
  objectPosition: string;
  onEnded?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  // Play / pause based on active + paused state
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && !paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active, paused]);

  // Reset to start when becoming active
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) v.currentTime = 0;
  }, [active]);

  return (
    <video
      ref={ref}
      src={slide.src}
      poster={slide.poster}
      className="h-full w-full"
      style={{ objectFit, objectPosition }}
      muted
      // NOT looping — we want `ended` to fire so the slider advances
      playsInline
      preload={active ? "auto" : "metadata"}
      onEnded={onEnded}
    />
  );
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}