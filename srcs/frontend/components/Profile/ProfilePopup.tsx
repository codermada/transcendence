"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useClickOutside } from "@/hooks/useClickOutside";
import { signOut } from "@/lib/auth/sign-out";

type User = {
  username: string;
  name: string;
  avatarUrl: string;
};

export function ProfilePopup({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useClickOutside(anchorRef, () => setOpen(false));

  return (
    <div ref={anchorRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="relative flex h-[34px] w-[34px] shrink-0">
          <Image
            src={user.avatarUrl}
            alt=""
            width={34}
            height={34}
            className="h-[34px] w-[34px] rounded-full object-cover"
          />
            <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
        </span>

        {/* <span className="text-sm font-medium text-gray-900">
          {user.name}
        </span> */}
      </button>

      {open && (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
          role="dialog"
          aria-label="Profil"
        >
          <div className="p-4">
            <div className="border-b border-gray-100 pb-4">
              <div className="text-sm font-semibold text-gray-900">
                {user.name}
              </div>

              <div className="mt-0.5 text-sm text-gray-500">
                @{user.username}
              </div>
            </div>

            <div className="mt-2 flex flex-col">
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                onClick={() => {
                  setOpen(false);
                  router.push(`/profile/${user.username}`);
                }}
              >
                Voir mon profil
              </button>

              <button
                type="button"
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
