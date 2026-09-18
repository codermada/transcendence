import { FriendRequestItem } from "./FriendRequestItem";

export function FriendRequestsCard() {
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Demandes d'amis
      </h3>
      <div className="space-y-2.5">
        <span className="text-[11px] font-medium text-violet-600 dark:text-violet-400">
          Reçues
        </span>
        <ul className="space-y-3">
          <FriendRequestItem type="received" name="Emily Mark" initials="EM" />
        </ul>
      </div>
      <div className="space-y-2.5 border-t border-zinc-100 pt-2 dark:border-zinc-800">
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          Envoyées
        </span>
        <ul className="space-y-2">
          <FriendRequestItem type="sent" name="Lucas Ness" initials="LN" />
        </ul>
      </div>
    </div>
  );
}