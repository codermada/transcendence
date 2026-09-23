"use client";

interface CommentsHeaderProps {
  onClose: () => void;
}

export function CommentsHeader({ onClose }: CommentsHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <h2
        id="comments-title"
        className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
      >
        Comments
      </h2>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close comments"
        className="
          rounded-full
          p-2
          text-zinc-500
          transition
          hover:bg-zinc-100
          hover:text-zinc-900
          dark:hover:bg-zinc-800
          dark:hover:text-white
        "
      >
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
