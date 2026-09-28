"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { FriendRequestItemProps } from "./network-sidebar.types";

export function FriendRequestItem(props: FriendRequestItemProps) {
  const t = useTranslations("Feed.network-sidebar.FriendRequestItem");
  const [isRemoved, setIsRemoved] = useState(false);
  const [isPending, setIsPending] = useState(false);

  if (isRemoved) return null;

  if (props.type === "received") {
    const handleAccept = async () => {
      setIsPending(true);
      try {
        await props.onAccept?.(props.requestId);
        setIsRemoved(true);
      } catch {
        setIsPending(false);
      }
    };

    const handleDecline = async () => {
      setIsPending(true);
      try {
        await props.onDecline?.(props.requestId);
        setIsRemoved(true);
      } catch {
        setIsPending(false);
      }
    };

    return (
      <li className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/40">
        <div className="flex items-center gap-2.5">
          <img
            src={props.image ?? "/nest/uploads/default-avatar.png"}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {props.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            disabled={isPending}
            onClick={handleAccept}
            className="flex-1 rounded-lg bg-violet-600 py-1 text-[11px] font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
          >
            {t("acceptButton")}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDecline}
            className="flex-1 rounded-lg bg-zinc-200/80 py-1 text-[11px] font-medium text-zinc-700 transition-colors hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
          >
            {t("declineButton")}
          </button>
        </div>
      </li>
    );
  }

  const handleCancel = async () => {
    setIsPending(true);
    try {
      await props.onCancel?.(props.requestId);
      setIsRemoved(true);
    } catch {
      setIsPending(false);
    }
  };

  return (
    <li className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50/60 p-2 dark:bg-zinc-800/20">
      <div className="flex min-w-0 items-center gap-2">
        <img
          src={props.image ?? "/nest/uploads/default-avatar.png"}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
        <span className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
          {props.name}
        </span>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleCancel}
        className="shrink-0 rounded-lg border border-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-500 transition-colors hover:border-red-500/30 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
      >
        {t("cancelButton")}
      </button>
    </li>
  );
}