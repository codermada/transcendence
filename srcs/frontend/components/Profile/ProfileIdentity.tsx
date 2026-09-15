// components/Profile/ProfileIdentity.tsx
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileIdentityProps {
  displayName: string;
  username: string;
  followerCount: number;
  location?: string;
  className?: string;
}

export function ProfileIdentity({
  displayName,
  username,
  followerCount,
  location,
  className,
}: ProfileIdentityProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <h1 className="text-2xl font-semibold text-foreground">{displayName}</h1>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground sm:justify-start">
        <span>
          <strong className="font-semibold text-foreground">{followerCount}</strong>{" "}
          ami(e)s
        </span>

      </div>
    </div>
  );
}