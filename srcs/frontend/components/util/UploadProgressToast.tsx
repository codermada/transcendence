"use client";

interface UploadProgressToastProps {
  progress: number;
  fileName?: string;
  isCompleted?: boolean;
}

export function UploadProgressToast({
  progress,
  fileName,
  isCompleted,
}: UploadProgressToastProps) {
  return (
    <div className="flex w-80 flex-col gap-2 rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-lg dark:border-zinc-800/80 dark:bg-zinc-900">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-800 dark:text-zinc-200">
          {isCompleted
            ? "Publication envoyée !"
            : "Envoi des fichiers..."}
        </span>
        <span className="font-semibold text-violet-600 dark:text-violet-400">
          {Math.round(progress)}%
        </span>
      </div>
      {fileName && (
        <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
          {fileName}
        </p>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full bg-violet-600 transition-all duration-150 ease-out dark:bg-violet-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}