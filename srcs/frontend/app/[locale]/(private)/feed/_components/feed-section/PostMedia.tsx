"use client";

import { useState } from "react";
import { MediaModal } from "./MediaModal";

interface PostMediaProps {
  mediaUrls?: string[];
}

function MediaItem({
  url,
  isVid,
  className,
  onLoaded,
}: {
  url: string;
  isVid: boolean;
  className?: string;
  onLoaded?: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleMediaLoad = () => {
    setIsLoaded(true);
    if (onLoaded) onLoaded();
  };

  return (
    <div className={`relative h-full w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 ${className || ""}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 animate-pulse">
          <div className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
            {isVid ? (
              <svg className="h-8 w-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            <span className="text-[10px] font-medium uppercase tracking-wider">Chargement...</span>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
          <span className="text-xs">Média indisponible</span>
        </div>
      )}

      {isVid ? (
        <video
          src={url}
          preload="metadata"
          crossOrigin="anonymous"
          onLoadedData={handleMediaLoad}
          onError={() => setHasError(true)}
          className={`h-full max-h-[400px] w-full object-cover pointer-events-none transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <img
          src={url}
          alt="Média"
          loading="lazy"
          onLoad={handleMediaLoad}
          onError={() => setHasError(true)}
          className={`h-full max-h-[400px] w-full object-cover transition-all duration-300 group-hover:scale-105 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

export function PostMedia({ mediaUrls }: PostMediaProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const visibleMedia = mediaUrls.slice(0, 3);
  const remainingCount = mediaUrls.length - 3;

  const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);

  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    return "grid-cols-2";
  };

  return (
    <>
      <div
        className={`grid gap-2 overflow-hidden rounded-xl ${getGridClass(
          visibleMedia.length
        )}`}
      >
        {visibleMedia.map((url, index) => {
          const isVid = isVideo(url);
          const isThirdItem = index === 2;
          const hasMore = remainingCount > 0;

          return (
            <div
              key={url + index}
              onClick={() => setSelectedIndex(index)}
              className={`group relative cursor-pointer overflow-hidden bg-zinc-100 dark:bg-zinc-800 min-h-[200px] ${
                visibleMedia.length === 3 && index === 0 ? "col-span-2 min-h-[260px]" : ""
              }`}
            >
              <MediaItem url={url} isVid={isVid} />
              {isVid && (!isThirdItem || !hasMore) && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 opacity-80 transition-opacity group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm shadow-md">
                    <svg className="h-6 w-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
              {isThirdItem && hasMore && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 font-bold text-white text-2xl backdrop-blur-xs transition-bg group-hover:bg-black/70">
                  +{remainingCount}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedIndex !== null && (
        <MediaModal
          mediaUrls={mediaUrls}
          currentIndex={selectedIndex}
          isOpen={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          onNavigate={(newIndex) => setSelectedIndex(newIndex)}
        />
      )}
    </>
  );
}