"use client";

import { useRef, useState, ChangeEvent } from "react";
import type { MediaPreview } from "./feed-section.types";

export function CreatePostCard() {
  const [selectedMedia, setSelectedMedia] = useState<MediaPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newMedia: MediaPreview[] = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setSelectedMedia((prev) => [...prev, ...newMedia]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveMedia = (idToRemove: string) => {
    setSelectedMedia((prev) => {
      const filtered = prev.filter((item) => item.id !== idToRemove);
      const itemToRemove = prev.find((item) => item.id === idToRemove);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.url);
      }
      return filtered;
    });
  };

  return (
    <div className="shadow-2xs rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20 font-medium text-violet-600 dark:text-violet-400">
          U
        </div>
        <textarea
          rows={2}
          placeholder="Quoi de neuf aujourd'hui ?"
          className="w-full resize-none bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {selectedMedia.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {selectedMedia.map((media) => (
            <div key={media.id} className="group relative aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
              {media.type === "image" ? (
                <img src={media.url} alt={media.file.name} className="h-full w-full object-cover" />
              ) : (
                <video src={media.url} className="h-full w-full object-cover" controls={false} muted />
              )}
              {media.type === "video" && (
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                  Vidéo
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveMedia(media.id)}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80"
                title="Supprimer"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />

      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span>
            {selectedMedia.length > 0
              ? `Photos / Vidéos (${selectedMedia.length})`
              : "Photo / Vidéo"}
          </span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 active:scale-95"
        >
          <span>Publier</span>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}