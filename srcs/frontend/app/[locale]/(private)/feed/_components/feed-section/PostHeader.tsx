import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { PostHeaderProps } from "./feed-section.types";

export function PostHeader({ author, initials, createdAt }: PostHeaderProps) {
  const t = useTranslations("Feed.feed-section.PostHeader");
  const [createdAtTimestamp, setCreatedAtTimestamp] = useState({ 
    time: 'minute',
    value: 0 
  });

useEffect(() => {
  if (!createdAt) return;
  const secondes = Math.floor((Date.now() - (new Date(createdAt)).getTime()) / 1000);

  if (secondes < 60) {
    setCreatedAtTimestamp({ time: 'minute', value: 0 });
  } else if (secondes < 3600) {
    setCreatedAtTimestamp({ time: 'minute', value: Math.floor(secondes / 60) });
  } else if (secondes < 86400) {
    setCreatedAtTimestamp({ time: 'hour', value: Math.floor(secondes / 3600) });
  } else {
    setCreatedAtTimestamp({ time: 'day', value: Math.floor(secondes / 86400) });
  }
}, [createdAt]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {initials}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {author}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('reported', { value: createdAtTimestamp.value, unit: createdAtTimestamp.time })}</p>
        </div>
      </div>
    </div>
  );
}