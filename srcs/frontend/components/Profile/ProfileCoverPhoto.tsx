// components/Profile/ProfileCoverPhoto.tsx
"use client";

import Image from "next/image";
import { Camera } from "lucide-react";

interface ProfileCoverPhotoProps {
  coverUrl?: string;
  isOwner: boolean;
}

export function ProfileCoverPhoto({
  coverUrl,
  isOwner,
}: ProfileCoverPhotoProps) {
  const imageUrl = coverUrl || "/profile/default-cover.jpg";

  return (
    <div className="group relative mx-auto w-full max-w-6xl overflow-hidden rounded-b-xl bg-muted sm:rounded-xl">
      {/* Cover */}
      <div
        className="
          relative
          aspect-[2.7/1]
          min-h-[180px]
          max-h-[405px]
          w-full
          overflow-hidden
          bg-gradient-to-br
          from-primary/20
          to-accent/20
          sm:aspect-[2.7/1]
        "
      >
        <Image
          src={imageUrl}
          alt="Photo de couverture"
          fill
          priority
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1280px) 100vw,
            1200px
          "
          className="
            object-cover
            object-center
            transition-transform
            duration-500
            group-hover:scale-[1.01]
          "
        />

        {/* Overlay au hover */}
        {isOwner && (
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-black/0
              transition-colors
              duration-200
              group-hover:bg-black/10
            "
          />
        )}

        {/* Bouton changer la cover */}
        {isOwner && (
          <button
            type="button"
            aria-label="Changer la photo de couverture"
            className="
              absolute
              bottom-3
              right-3
              z-10
              flex
              items-center
              gap-2
              rounded-lg
              bg-white
              px-3
              py-2
              text-sm
              font-semibold
              text-gray-900
              shadow-md
              transition
              duration-200

              hover:bg-gray-100
              hover:shadow-lg

              focus:outline-none
              focus:ring-2
              focus:ring-white
              focus:ring-offset-2
              focus:ring-offset-black/20

              sm:bottom-4
              sm:right-4
            "
          >
            <Camera className="h-4 w-4 shrink-0" />

            <span className="hidden sm:inline">
              Modifier la photo de couverture
            </span>
          </button>
        )}
      </div>
    </div>
  );
}


