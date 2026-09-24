"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Loader2, MessageSquare } from "@/components/icons";
import { NewMessageModal, type ReceiverUser } from "@/components/chat/NewMessageModal";

type StartMessageButtonProps = {
  user: ReceiverUser & { id: string };
  disabled?: boolean;
  className?: string;
  /** "button" = icon + label (default), "icon" = icon only */
  variant?: "button" | "icon";
  /** Accessible label; falls back to the translated "message" string. */
  "aria-label"?: string;
};

export function StartMessageButton({
  user,
  disabled = false,
  className,
  variant = "button",
  "aria-label": ariaLabel,
}: StartMessageButtonProps) {
  const tChat = useTranslations("Chat");
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleClick() {
    setChecking(true);

    try {
      const res = await fetch(`/nest/chat/conversation/${user.id}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          router.push(`/chat/${data.id}`);
          return;
        }
      }

      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to check conversation:", err);
      setIsModalOpen(true);
    } finally {
      setChecking(false);
    }
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
        disabled={disabled || checking}
        aria-label={isIconOnly ? ariaLabel ?? label : undefined}
        title={isIconOnly ? ariaLabel ?? label : undefined}
        className={className ?? `${baseClasses} ${variantClasses}`}
      >
        {checking ? (
          <Loader2 className={`${iconClasses} animate-spin`} />
        ) : (
          <MessageSquare className={iconClasses} />
        )}
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

export function UserX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 19.5a6.5 6.5 0 0 1 13 0M17 8l5 5M22 8l-5 5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function UserCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.5 19a6 6 0 0 1 11 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Heart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ThumbsUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7 22V11l5-9a2.5 2.5 0 0 1 2.5 2.5V9h4a2 2 0 0 1 2 2.3l-1.3 8a2 2 0 0 1-2 1.7H7ZM2 11h5v11H2z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Filter2(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3 6h18M6 12h12M10 18h4"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Save(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 21v-8H7v8M7 3v5h8"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function X(props: SVGProps<SVGSVGElement>) {
  // You have Close — this is just a reminder that X = Close. Skip unless you want the alias.
  return <Close {...props} />;
}

export function Link(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BellOff(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M8.7 3A6 6 0 0 1 18 9c0 2.2.4 3.8 1 4.9M6 9c0 5-2 6-2 6h14M10 20a2 2 0 0 0 4 0M2 2l20 20"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Circle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function Palette(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 21a9 9 0 1 1 0-18c4.97 0 9 3.58 9 8 0 2.2-1.8 4-4 4h-2.2a2 2 0 0 0-1.4 3.4 2 2 0 0 1-1.4 3.4Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="11" r="1" fill="currentColor" />
      <circle cx="10" cy="7" r="1" fill="currentColor" />
      <circle cx="15" cy="7" r="1" fill="currentColor" />
      <circle cx="17.5" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

export function Volume2(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M11 5 6 9H2v6h4l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VolumeX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M11 5 6 9H2v6h4l5 4V5ZM22 9l-5 6M17 9l5 6"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Star(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Bookmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Zap(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Compass(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}