export function ChatMessageVideo({ url }: { url: string }) {
	return (
    <div
      key={url}
      className="overflow-hidden rounded-xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
    >
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className="max-h-72 w-full max-w-sm rounded-xl"
      />
    </div>
  );
}