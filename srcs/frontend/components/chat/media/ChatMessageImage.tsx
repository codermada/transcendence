export function ChatMessageImage({ url }: { url: string }) {
	return (
    <div
        key={url}
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
    >
      <img
        src={url}
        alt={url}
        loading="lazy"
        className="max-h-72 w-full max-w-sm rounded-xl object-cover transition-transform duration-200 group-hover:scale-[1.02]"
      />
    </div>
  );
}
