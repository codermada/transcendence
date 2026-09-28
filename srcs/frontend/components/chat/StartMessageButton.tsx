"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { MessageSquare } from "@/components/icons";
import { NewMessageModal, type ReceiverUser } from "@/components/chat/NewMessageModal";

type StartMessageButtonProps = {
  user: (ReceiverUser & { id: string }) | null;
  disabled?: boolean;
  className?: string;
  variant?: "button" | "icon";
  "aria-label"?: string;
  conversationId?: string | null;
};

export function StartMessageButton({
  user,
  disabled = false,
  className,
  variant = "button",
  "aria-label": ariaLabel,
  conversationId,
}: StartMessageButtonProps) {
  const tChat = useTranslations("Chat");
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleClick() {
    // Known conversation → go straight there.
    if (typeof conversationId === "string") {
      router.push(`/chat/${conversationId}`);
      return;
    }

    // Otherwise → just open the modal. No fetch.
    setIsModalOpen(true);
  }

  const label = tChat("message");
  const isIconOnly = variant === "icon";

  const baseClasses =
    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";

  const variantClasses = isIconOnly ? "h-9 w-9 p-0" : "px-4 py-2";
  const iconClasses = isIconOnly ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={isIconOnly ? (ariaLabel ?? label) : undefined}
        title={isIconOnly ? (ariaLabel ?? label) : undefined}
        className={
          className
            ? `${baseClasses} ${variantClasses} ${className}`
            : `${baseClasses} ${variantClasses}`
        }
      >
        <MessageSquare className={iconClasses} />
        {!isIconOnly && label}
      </button>

      <NewMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        receiver={user}
      />
    </>
  );
}