import { ProfileCoverPhoto } from "./ProfileCoverPhoto";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileIdentity } from "./ProfileIdentity";
import { ProfileActions } from "./ProfileActions";

interface ProfileHeaderProps {
  username: string;
  displayName: string;
  avatarUrl: string;
  coverUrl: string | null;
  followerCount: number;
  location?: string;
  isOwner: boolean;
  isFollowing?: boolean;
}

export function ProfileHeader(userData: ProfileHeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      {/* Cover */}
      <ProfileCoverPhoto
        coverUrl={userData.coverUrl ?? undefined}
        isOwner={userData.isOwner}
      />

      {/* Profile info */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">

          {/* Avatar + Identity */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-4">
            <ProfileAvatar
              avatarUrl={userData.avatarUrl}
              displayName={userData.displayName}
              isOwner={userData.isOwner}
            />

            <ProfileIdentity
              displayName={userData.displayName}
              username={userData.username}
              followerCount={userData.followerCount}
              location={userData.location}
              className="text-center sm:pb-1 sm:text-left"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-center sm:justify-end sm:pb-1">
            <ProfileActions
              username={userData.username}
              isOwner={userData.isOwner}
              isFollowing={userData.isFollowing}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
