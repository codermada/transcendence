export function ChatMessageAudio({ url, isMe = false }: { url: string, isMe?: boolean }) {
	return (
    <div
      key={url}
      className={`rounded-xl p-2 border ${
        isMe
          ? "bg-violet-700/60 border-violet-500/30 text-white"
          : "bg-zinc-200/80 dark:bg-zinc-700/80 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white"
      }`}
    >
      <audio src={url} controls className="w-full min-w-60" />
    </div>
  );
}
