"use client";

import { useState } from "react";
import { MediaModal } from "./MediaModal";

interface PostMediaProps {
  mediaUrls?: string[];
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
              className={`group relative cursor-pointer overflow-hidden bg-zinc-100 dark:bg-zinc-800 ${
                visibleMedia.length === 3 && index === 0 ? "col-span-2" : ""
              }`}
            >
              {isVid ? (
                <div className="relative">
                  <video
                    src={url}
                    className="h-full max-h-[400px] w-full object-cover pointer-events-none"
                  />
                  {!isThirdItem || !hasMore ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-80 transition-opacity group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                        <svg className="h-6 w-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <img
                  src={url}
                  alt={`Média ${index + 1}`}
                  className="h-full max-h-[400px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              )}

              {isThirdItem && hasMore && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-bold text-white text-2xl backdrop-blur-xs transition-bg group-hover:bg-black/70">
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