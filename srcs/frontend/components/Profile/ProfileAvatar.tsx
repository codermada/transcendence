// components/Profile/ProfileAvatar.tsx
"use client";

import Image from "next/image";
import { Camera } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl?: string;
  displayName: string;
  isOwner: boolean;
}

export function ProfileAvatar({
  avatarUrl,
  displayName,
  isOwner,
}: ProfileAvatarProps) {
  const imageUrl = avatarUrl || "/profile/default-avatar.jpg";

  return (
    <div
      className="
        relative
        -mt-12
        h-28
        w-28
        shrink-0
        sm:-mt-16
        sm:h-36
        sm:w-36
        lg:-mt-20
        lg:h-40
        lg:w-40
      "
    >
      {/* Avatar */}
      <div
        className="
          relative
          h-full
          w-full
          overflow-hidden
          rounded-full
          border-4
          border-surface
          bg-surface
          shadow-md
          sm:border-[5px]
        "
      >
        <Image
          src={imageUrl}
          alt={displayName}
          fill
          sizes="
            (max-width: 640px) 112px,
            (max-width: 1024px) 144px,
            160px
          "
          className="
            object-cover
            object-center
          "
        />
      </div>

      {/* Bouton modifier */}
      {isOwner && (
        <button
          type="button"
          aria-label="Changer la photo de profil"
          className="
            absolute
            bottom-0
            right-0
            z-10

            flex
            h-9
            w-9
            items-center
            justify-center

            rounded-full
            border-2
            border-surface
            bg-surface
            text-foreground
            shadow-md

            transition-all
            duration-200

            hover:bg-muted
            hover:scale-105

            focus:outline-none
            focus:ring-2
            focus:ring-primary
            focus:ring-offset-2
            focus:ring-offset-surface

            sm:h-10
            sm:w-10
            sm:border-[3px]
          "
        >
          <Camera className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </button>
      )}
    </div>
  );
}
