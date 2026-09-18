interface ReceivedRequestProps {
  type: "received";
  name: string;
  initials: string;
}

interface SentRequestProps {
  type: "sent";
  name: string;
  initials: string;
}

type FriendRequestItemProps = ReceivedRequestProps | SentRequestProps;

export function FriendRequestItem(props: FriendRequestItemProps) {
  if (props.type === "received") {
    return (
      <li className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-xs font-medium text-violet-600 dark:text-violet-400">
            {props.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {props.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            className="flex-1 rounded-lg bg-violet-600 py-1 text-[11px] font-medium text-white transition-colors hover:bg-violet-500"
          >
            Accepter
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg bg-zinc-200/80 py-1 text-[11px] font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
          >
            Refuser
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50/60 p-2 dark:bg-zinc-800/20">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
          {props.initials}
        </div>
        <span className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
          {props.name}
        </span>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-lg border border-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-500 transition-colors hover:border-red-500/30 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
      >
        Annuler
      </button>
    </li>
  );
}