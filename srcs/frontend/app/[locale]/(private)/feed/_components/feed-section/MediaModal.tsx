"use client";

import { useCallback, useEffect } from "react";

interface MediaModalProps {
  mediaUrls: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function MediaModal({
  mediaUrls,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: MediaModalProps) {
  const currentUrl = mediaUrls[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < mediaUrls.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, mediaUrls.length, onNavigate]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !currentUrl) return null;

  const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80 text-white transition-colors hover:bg-zinc-700"
        aria-label="Fermer la modale"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {mediaUrls.length > 1 && currentIndex > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80 text-white transition-colors hover:bg-zinc-700"
          aria-label="Média précédent"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo(currentUrl) ? (
          <video
            src={currentUrl}
            controls
            autoPlay
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
          />
        ) : (
          <img
            src={currentUrl}
            alt="Média en grand"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
          />
        )}
      </div>

      {mediaUrls.length > 1 && currentIndex < mediaUrls.length - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80 text-white transition-colors hover:bg-zinc-700"
          aria-label="Média suivant"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}