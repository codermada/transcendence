"use client";

import { ChangeEvent, FormEvent } from "react";

interface CommentComposerProps {
  content: string;
  setContent: (value: string) => void;
  selectedImage: File | null;
  previewUrl: string | null;
  isSubmitting: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function CommentComposer({
  content,
  setContent,
  selectedImage,
  previewUrl,
  isSubmitting,
  inputRef,
  onImageChange,
  onRemoveImage,
  onSubmit,
}: CommentComposerProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="
        shrink-0
        border-t
        border-zinc-200
        bg-white
        p-3
        dark:border-zinc-800
        dark:bg-zinc-950
      "
    >
      {previewUrl && (
        <div className="relative mb-3 inline-block">
          <img
            src={previewUrl}
            alt="Selected image preview"
            className="h-24 w-24 rounded-xl object-cover"
          />

          <button
            type="button"
            onClick={onRemoveImage}
            aria-label="Remove selected image"
            className="
              absolute
              -right-2
              -top-2
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              bg-zinc-900
              text-xs
              text-white
              shadow
            "
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* TEXTAREA */}
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a comment..."
          rows={1}
          disabled={isSubmitting}
          className="
            max-h-32
            min-h-10
            flex-1
            resize-none
            rounded-xl
            border
            border-zinc-200
            bg-zinc-50
            px-3
            py-2.5
            text-sm
            outline-none
            transition
            focus:border-violet-500
            focus:ring-2
            focus:ring-violet-500/20
            dark:border-zinc-700
            dark:bg-zinc-900
          "
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageChange}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isSubmitting || !!selectedImage}
          aria-label="Attach image"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            text-zinc-500
            transition
            hover:bg-zinc-100
            hover:text-violet-600
            disabled:cursor-not-allowed
            disabled:opacity-40
            dark:hover:bg-zinc-800
          "
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </button>

        <button
          type="submit"
          disabled={isSubmitting || (!content.trim() && !selectedImage)}
          aria-label="Send comment"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-violet-600
            text-white
            transition
            hover:bg-violet-700
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 2L11 13"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 2l-7 20-4-9-9-4 20-7z"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
